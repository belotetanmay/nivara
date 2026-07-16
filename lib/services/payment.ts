import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const isMockStripe = !STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('Mock') || STRIPE_SECRET_KEY.startsWith('sk_test_mock');

let stripe: Stripe | null = null;
if (!isMockStripe) {
  try {
    stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27' as any, // standard api version for stable package
    });
  } catch (error) {
    console.error('Failed to initialize Stripe client:', error);
  }
}

export interface CheckoutSessionResult {
  id: string;
  url: string;
  isMock: boolean;
}

export async function createCheckoutSession(params: {
  bookingId: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}): Promise<CheckoutSessionResult> {
  if (isMockStripe || !stripe) {
    // Generate a mock session id
    const mockSessionId = `cs_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    // Point to a local mock payment checkout page
    const mockCheckoutUrl = `/payments/checkout?session_id=${mockSessionId}&booking_id=${params.bookingId}&amount=${params.amount}`;
    
    return {
      id: mockSessionId,
      url: mockCheckoutUrl,
      isMock: true,
    };
  }

  // Create real Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: params.currency.toLowerCase(),
          product_data: {
            name: 'Nivara Wellness Van Booking Slot',
            description: `Wellness Pod Session (Booking ID: ${params.bookingId})`,
          },
          unit_amount: Math.round(params.amount * 100), // Stripe uses cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: params.successUrl + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    metadata: {
      bookingId: params.bookingId,
    },
  });

  return {
    id: session.id,
    url: session.url || params.successUrl,
    isMock: false,
  };
}

export async function refundPayment(gatewayRef: string, amount?: number): Promise<{ success: boolean; error?: string }> {
  if (isMockStripe || !stripe || gatewayRef.startsWith('ch_mock') || gatewayRef.startsWith('cs_mock') || gatewayRef.startsWith('EXT-')) {
    console.log(`[Mock Stripe] Processed refund of ₹${amount !== undefined ? amount : 'full'} for reference: ${gatewayRef}`);
    return { success: true };
  }

  try {
    // Determine if reference is a charge ID or session ID
    // If it's a checkout session, retrieve it to get payment intent
    let chargeOrIntentId = gatewayRef;
    if (gatewayRef.startsWith('cs_')) {
      const session = await stripe.checkout.sessions.retrieve(gatewayRef);
      if (session.payment_intent) {
        chargeOrIntentId = typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : session.payment_intent.id;
      }
    }

    const refundParams: any = {
      payment_intent: chargeOrIntentId,
    };
    if (amount !== undefined) {
      refundParams.amount = Math.round(amount * 100);
    }

    await stripe.refunds.create(refundParams);
    return { success: true };
  } catch (error: any) {
    console.error('Stripe Refund error:', error);
    return { success: false, error: error.message || 'Refund failed' };
  }
}
