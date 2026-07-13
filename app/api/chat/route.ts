import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { GoogleGenerativeAI, SchemaType, FunctionDeclaration } from '@google/generative-ai';
import { geocodeAddress } from '@/lib/services/location';

// Simple in-memory rate limiter to prevent abuse (basic token-bucket)
const rateLimitMap = new Map<string, { tokens: number; lastRefill: number }>();
const LIMIT_TOKENS = 15;
const REFILL_RATE_MS = 60000; // Refill 15 tokens every minute

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  let record = rateLimitMap.get(identifier);

  if (!record) {
    record = { tokens: LIMIT_TOKENS, lastRefill: now };
    rateLimitMap.set(identifier, record);
    return false;
  }

  // Refill tokens based on time passed
  const timePassed = now - record.lastRefill;
  if (timePassed > REFILL_RATE_MS) {
    record.tokens = Math.min(LIMIT_TOKENS, record.tokens + Math.floor(timePassed / REFILL_RATE_MS) * LIMIT_TOKENS);
    record.lastRefill = now;
  }

  if (record.tokens <= 0) {
    return true;
  }

  record.tokens--;
  return false;
}

export async function POST(request: Request) {
  try {
    // 1. Identify user/session for rate limiting and database binding
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth_token');
    const token = tokenCookie?.value;
    const payload = token ? verifyToken(token) : null;
    const userId = payload?.userId;

    // Use userId or fallback to a session identifier / IP address
    const clientIp = request.headers.get('x-forwarded-for') || 'anonymous_chat_user';
    const rateLimitKey = userId || clientIp;

    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json({
        error: 'rate_limit_exceeded',
        message: 'The assistant is currently busy or receiving too many requests. Please wait a moment and try again shortly.'
      }, { status: 429 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { message, conversationId, history = [] } = body;

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Initialize/Lookup Chat Conversation in Database
    let activeConversationId = conversationId;
    let dbConversation;

    if (activeConversationId) {
      dbConversation = await db.chatConversation.findUnique({
        where: { id: activeConversationId },
      });
    }

    if (!dbConversation) {
      dbConversation = await db.chatConversation.create({
        data: {
          userId: userId || null,
        },
      });
      activeConversationId = dbConversation.id;
    } else if (userId && !dbConversation.userId) {
      // Bind anonymous conversation to newly logged-in user session
      await db.chatConversation.update({
        where: { id: activeConversationId },
        data: { userId },
      });
    }

    // Save user message to database
    await db.chatMessage.create({
      data: {
        conversationId: activeConversationId,
        sender: 'user',
        content: message,
      },
    });

    // 3. Initialize Google Gemini API
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey || apiKey === '') {
      console.error('GEMINI_API_KEY is not defined or is empty in environment variables.');
      return NextResponse.json({
        error: 'gemini_config_error',
        message: 'Google Gemini API key is missing. Please define GEMINI_API_KEY in your environment.'
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Tools Definitions for Gemini Function Calling
    const searchVansTool: FunctionDeclaration = {
      name: "search_vans",
      description: "Search for available wellness vans at a given location and return matching listings.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          location: { type: SchemaType.STRING, description: "The location/neighborhood to search (e.g. Indiranagar, Koramangala, Bandra)." },
          date: { type: SchemaType.STRING, description: "Optional date of reservation in YYYY-MM-DD format." }
        },
        required: ["location"]
      }
    };

    const getBookingStatusTool: FunctionDeclaration = {
      name: "get_booking_status",
      description: "Check the status and details of a specific booking using its code (e.g. NV-XXXX-XXXX).",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          booking_code: { type: SchemaType.STRING, description: "The booking code formatted as NV-XXXX-XXXX." }
        },
        required: ["booking_code"]
      }
    };

    const getKycStatusTool: FunctionDeclaration = {
      name: "get_kyc_status",
      description: "Retrieve the authenticated customer's identity verification (KYC) status.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {}
      }
    };

    const startBookingDraftTool: FunctionDeclaration = {
      name: "start_booking_draft",
      description: "Generate a checkout link pre-populated with a specific van, date, slot, and duration.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          van_id: { type: SchemaType.STRING, description: "The unique ID of the van." },
          date: { type: SchemaType.STRING, description: "The booking date in YYYY-MM-DD format." },
          slot_id: { type: SchemaType.STRING, description: "The unique ID of the selected slot." },
          session_length: { type: SchemaType.NUMBER, description: "Session length in minutes (15, 30, or 45)." }
        },
        required: ["van_id", "date", "slot_id", "session_length"]
      }
    };

    // System instruction to restrict prompt scopes
    const systemInstruction = `
You are the official Nivara Wellness AI assistant. Your goal is to guide customer inquiries, answer questions about our premium stress-relief vans, and assist in searching or drafting bookings.

RULES:
1. ONLY discuss topics relating to Nivara (wellness vans, booking flows, KYC verification, pricing, policies, contact info). Refuse general-purpose conversation.
2. Under no circumstances should you claim to process payments, deduct funds, or finalize bookings directly. You must explain that bookings are completed through our secure checkout page, and generate checkout deep links using your 'start_booking_draft' tool.
3. If the user is unverified or new, explain that Nivara requires identity verification (KYC) before any booking can be placed, and direct them to their KYC Upload screen (/customer/kyc).
4. Do not speculate or invent policies. Use the following FAQ facts:
   - Pricing tiers: Basic (15 min, ₹slot basic) / Standard (30 min, includes massage and binaural calm beats) / Premium (45 min, includes VIP custom details and warm herbal recovery teas).
   - KYC requirement: First-time users must upload a valid ID + selfie before placing their first booking. Access to booking is locked until KYC status is verified by admins.
   - Cancellation policy: Free cancellation is allowed up to 1 hour before the scheduled slot time. Late cancellations (within 1 hour) and no-shows are strictly non-refundable.
   - How it works: Open app -> pick nearby van & time slot -> checkout securely -> walk in.
   - Amenities: Soundproofing, zero-gravity reclining recovery chairs, customized ambient lighting, calming aromatherapy, temperature control.
   - Support contact: support.nivara@gmail.com
    `;

    // 4. Initialize Gemini Chat session with historic log (if provided)
    // Structure history into Google Content formats.
    // Google Gemini requires the first message in the chat history array to be from 'user'.
    const rawHistory = history || [];
    const firstUserIdx = rawHistory.findIndex((h: any) => h.role === 'user');
    const validHistory = firstUserIdx !== -1 ? rawHistory.slice(firstUserIdx) : [];

    const formattedHistory = validHistory.map((h: any) => ({
      role: h.role === 'bot' ? 'model' : 'user',
      parts: [{ text: h.content }]
    }));

    // List of model candidates in order of preference (newer stable versions to older stable versions)
    const MODEL_CANDIDATES = [
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash-lite-001",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-001",
      "gemini-2.5-pro",
      "gemini-1.5-flash",
      "gemini-2.5-flash-8b",
      "gemini-1.5-flash-8b",
      "gemini-1.5-pro"
    ];

    let model: any = null;
    let chat: any = null;
    let result: any = null;
    let responseText = '';
    let functionCalls: any = null;
    let lastError: any = null;
    let workingModelName = '';
    const errorsList: string[] = [];

    for (const modelName of MODEL_CANDIDATES) {
      try {
        console.log(`Checking backend compatibility for Gemini model: ${modelName}`);
        model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.1, // keep responses consistent and factual
          },
          systemInstruction,
          tools: [{ functionDeclarations: [searchVansTool, getBookingStatusTool, getKycStatusTool, startBookingDraftTool] }]
        });

        chat = model.startChat({
          history: formattedHistory,
        });

        // Test sending the message to verify if the model is active and found
        result = await chat.sendMessage(message);
        functionCalls = result.response.functionCalls();
        responseText = result.response.text();

        workingModelName = modelName;
        console.log(`Successfully verified and loaded active model: ${modelName}`);
        lastError = null;
        break; // Successfully handled message, exit loop!
      } catch (err: any) {
        console.warn(`Gemini model ${modelName} returned connection error:`, err.message);
        errorsList.push(`${modelName}: ${err.message || 'unknown'}`);
        lastError = err;
      }
    }

    if (lastError) {
      // Try to query Google REST API to retrieve list of active models for this key to diagnose
      let diagnosticError = null;
      const cleanErrors = errorsList.map(e => e.replace(/https:\/\/\S+/g, '')).join(' | ');
      try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const listData = await listRes.json();
        if (listData && listData.models) {
          const names = listData.models.map((m: any) => m.name.replace('models/', ''));
          diagnosticError = new Error(`All candidate models failed. Available models on your API key: ${names.slice(0, 10).join(', ')}. Candidate errors: ${cleanErrors}`);
        } else if (listData && listData.error) {
          diagnosticError = new Error(`API key authorization failed: ${listData.error.message}. Candidate errors: ${cleanErrors}`);
        }
      } catch (innerListErr: any) {
        console.error('Diagnostic model list fetch failed:', innerListErr);
      }
      
      if (diagnosticError) {
        throw diagnosticError;
      }
      throw lastError; // Re-throw if all models in our candidate list failed
    }

    // 6. Handle Function Calls
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      const name = call.name;
      const args = call.args as any;
      let functionResult: any = null;

      console.log(`Gemini Chat executed function call: ${name} with args`, args);

      try {
        if (name === 'search_vans') {
          const { location, date } = args;
          const coords = await geocodeAddress(location);
          
          if (coords.error) {
            functionResult = { error: 'Location geocode failed. Please specify a more descriptive location.' };
          } else {
            // Find active vans in 15km radius
            const vans = await db.van.findMany({
              where: { status: 'ACTIVE' },
              include: {
                availabilities: {
                  where: {
                    isBooked: false,
                    date: date ? {
                      gte: new Date(date + 'T00:00:00.000Z'),
                      lte: new Date(date + 'T23:59:59.999Z')
                    } : undefined
                  },
                  orderBy: { startTime: 'asc' },
                  take: 5
                }
              }
            });

            // Map distances
            const activeVans = vans.map(van => {
              const dx = (van.latitude - coords.lat) * 111.32; // ~km per degree lat
              const dy = (van.longitude - coords.lng) * 40075 * Math.cos(coords.lat * Math.PI / 180) / 360;
              const dist = Math.sqrt(dx * dx + dy * dy);
              return { ...van, distance: dist };
            })
            .filter(van => van.distance <= 15)
            .sort((a, b) => a.distance - b.distance);

            functionResult = {
              success: true,
              location: coords,
              vans: activeVans.map(v => ({
                id: v.id,
                title: v.title,
                address: v.address,
                price15: v.price15,
                price30: v.price30,
                price45: v.price45,
                distanceKm: parseFloat(v.distance.toFixed(1)),
                nextAvailableSlots: v.availabilities.map(a => ({
                  id: a.id,
                  date: a.date.toISOString().split('T')[0],
                  startTime: a.startTime.toISOString()
                }))
              }))
            };
          }

        } else if (name === 'get_booking_status') {
          const { booking_code } = args;
          if (!userId) {
            functionResult = { error: 'Please sign in to check your booking status.' };
          } else {
            const booking = await db.booking.findFirst({
              where: {
                bookingCode: booking_code,
                customerId: userId
              },
              include: {
                van: { select: { title: true } },
                availability: { select: { startTime: true } }
              }
            });

            if (!booking) {
              functionResult = { error: 'No booking was found matching that code under your account.' };
            } else {
              functionResult = {
                success: true,
                code: booking.bookingCode,
                status: booking.status,
                vanTitle: booking.van.title,
                startTime: booking.availability.startTime.toISOString(),
                sessionLength: booking.sessionLength
              };
            }
          }

        } else if (name === 'get_kyc_status') {
          if (!userId) {
            functionResult = { error: 'Please sign in to review your verification status.' };
          } else {
            const user = await db.user.findUnique({
              where: { id: userId },
              select: { kycStatus: true }
            });
            functionResult = {
              success: true,
              kycStatus: user?.kycStatus || 'UNVERIFIED'
            };
          }

        } else if (name === 'start_booking_draft') {
          const { van_id, date, slot_id, session_length } = args;
          // Build direct URL deep link
          const deepLink = `/customer/vans/${van_id}?date=${date}&slotId=${slot_id}&sessionLength=${session_length}`;
          functionResult = {
            success: true,
            checkoutUrl: deepLink,
            message: 'Draft booking prepared. Direct the user to click the link to continue checkout.'
          };
        }

        // Send function results back to model to get final text response
        const functionResponsePart = {
          functionResponse: {
            name,
            response: functionResult
          }
        };

        const responseResult = await chat.sendMessage([functionResponsePart]);
        responseText = responseResult.response.text();

      } catch (innerError: any) {
        console.error('Gemini tool execution call crashed:', innerError);
        responseText = "I encountered an issue processing that search request. Please use the manual listing tools in the portal navigation.";
      }
    } else {
      responseText = result.response.text();
    }

    // Save bot response to database
    await db.chatMessage.create({
      data: {
        conversationId: activeConversationId,
        sender: 'bot',
        content: responseText,
      },
    });

    return NextResponse.json({
      success: true,
      conversationId: activeConversationId,
      reply: responseText,
    });

  } catch (error: any) {
    console.error('AI Chat endpoint crashed:', error);
    
    // Check if error is caused by Google API rate limits
    if (error.message && (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('rate limit'))) {
      return NextResponse.json({
        error: 'gemini_api_busy',
        message: 'The wellness assistant is currently busy handling other requests. Please wait a moment and try again shortly.'
      }, { status: 429 });
    }

    // Expose descriptive API validation details to help users set correct keys
    const errMessage = error.message || 'Failed to process chat response. Try again in a few seconds.';
    return NextResponse.json({
      error: 'internal_error',
      message: `AI error: ${errMessage}`
    }, { status: 500 });
  }
}
