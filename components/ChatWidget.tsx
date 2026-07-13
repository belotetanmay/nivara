'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MessageSquare, X, Send, BrainCircuit, Activity, HelpCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

interface Message {
  role: 'user' | 'bot';
  content: string;
  isLink?: boolean;
  linkUrl?: string;
  isCheckin?: boolean;
}

export default function ChatWidget() {
  const { user, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stress Check-in Flow State
  const [checkinStep, setCheckinStep] = useState<number | null>(null); // null means inactive, 1-3 steps active
  const [checkinAnswers, setCheckinAnswers] = useState({
    stressLevel: 0,
    timeAvailable: 15,
    stressCause: ''
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Hydrate conversation from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = sessionStorage.getItem('nivara_chat_messages');
      const savedConvId = sessionStorage.getItem('nivara_chat_conv_id');
      
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (e) {
          console.error('Failed to parse cached chat messages:', e);
        }
      } else {
        // Seed default greeting message
        setMessages([
          {
            role: 'bot',
            content: 'Hello! I am your Nivara Wellness Assistant. How can I help you find calm today?'
          }
        ]);
      }

      if (savedConvId) {
        setConversationId(savedConvId);
      }
    }
  }, []);

  // Save conversation state to sessionStorage
  const saveChatToStorage = (updatedMsgs: Message[], convId: string | null) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('nivara_chat_messages', JSON.stringify(updatedMsgs));
      if (convId) {
        sessionStorage.setItem('nivara_chat_conv_id', convId);
      }
    }
  };

  // Scroll to bottom on updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen, checkinStep]);

  const handleSendMessage = async (textToSend: string, customHistory?: Message[]) => {
    if (!textToSend.trim()) return;

    const newMsgs = [...(customHistory || messages), { role: 'user', content: textToSend } as Message];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);
    setErrorMessage(null);

    // Save user message immediately to session
    saveChatToStorage(newMsgs, conversationId);

    try {
      // Map history payload
      const historyPayload = newMsgs.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationId,
          history: historyPayload
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const updatedConvId = data.conversationId;
        setConversationId(updatedConvId);
        
        const finalMsgs = [...newMsgs, { role: 'bot', content: data.reply } as Message];
        setMessages(finalMsgs);
        saveChatToStorage(finalMsgs, updatedConvId);
      } else {
        setErrorMessage(data.message || 'Failed to fetch response. Please try again shortly.');
      }
    } catch (e) {
      console.error('Chat API Error:', e);
      setErrorMessage('Communication error. The assistant is temporarily offline. Try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };

  // Stress Check-in Flow trigger
  const startStressCheckin = () => {
    setCheckinStep(1);
    setMessages(prev => [
      ...prev,
      { role: 'bot', content: 'Starting self-reported wellness stress check-in...', isCheckin: true }
    ]);
  };

  const handleCheckinAnswer = (step: number, answer: any) => {
    if (step === 1) {
      setCheckinAnswers(prev => ({ ...prev, stressLevel: answer }));
      setCheckinStep(2);
    } else if (step === 2) {
      setCheckinAnswers(prev => ({ ...prev, timeAvailable: answer }));
      setCheckinStep(3);
    } else if (step === 3) {
      const finalAnswers = { ...checkinAnswers, stressCause: answer };
      setCheckinAnswers(finalAnswers);
      setCheckinStep(null);

      // Perform check-in recommendation mapping
      let recommendedTier = 'Basic';
      let recommendedDuration = 15;
      let sessionDetails = '15-minute quick refresh session';

      if (finalAnswers.stressLevel >= 4 && finalAnswers.timeAvailable >= 45) {
        recommendedTier = 'Premium';
        recommendedDuration = 45;
        sessionDetails = '45-minute VIP sensory restoration experience with custom aromatherapies and warm herbal tea';
      } else if (finalAnswers.stressLevel >= 3 && finalAnswers.timeAvailable >= 30) {
        recommendedTier = 'Standard';
        recommendedDuration = 30;
        sessionDetails = '30-minute Standard recovery session containing gentle physical massage and binaural sound treatment';
      }

      // Display stress summary and ask LLM to find vans
      const prompt = `I completed my wellness check-in: My self-reported stress level is ${finalAnswers.stressLevel}/5, I have ${finalAnswers.timeAvailable} minutes, and I am most bothered by ${finalAnswers.stressCause} today. Tell me about my recommendation for the ${recommendedTier} tier and find me a nearby van to book it.`;
      
      handleSendMessage(prompt);
    }
  };

  const renderLinkOrText = (content: string) => {
    // Detect markdown style links like [link text](/path) or raw URL paths
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const startIndex = match.index;
      // Add text leading to link
      if (startIndex > lastIndex) {
        parts.push(content.substring(lastIndex, startIndex));
      }

      const text = match[1];
      const url = match[2];
      
      parts.push(
        <Link 
          key={startIndex} 
          href={url} 
          onClick={() => {
            if (url.startsWith('/')) setIsOpen(false); // Auto close panel on redirect transitions
          }}
          className="inline-block my-1 px-3 py-1.5 bg-[#7FD6B5]/15 border border-[#7FD6B5]/35 hover:bg-[#7FD6B5]/25 text-emerald-400 font-bold rounded-lg text-[10px] transition-all"
        >
          {text}
        </Link>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-xl hover:shadow-primary/20 hover:scale-105 transition-all cursor-pointer flex items-center justify-center border border-white/10"
        title="Nivara Calm Assistant"
      >
        {isOpen ? <X className="w-6 h-6 animate-in spin-in-180 duration-200" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[520px] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100 font-sans overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
          
          {/* Header Panel */}
          <div className="p-4 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/25 text-primary">
                <BrainCircuit className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-white tracking-wide">Calm Assistant</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#7FD6B5] animate-ping"></span>
                  <span className="text-[9px] text-[#7FD6B5] uppercase font-bold tracking-wider">Ready to assist</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Panel */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-900/60 custom-scrollbar">
            
            {/* Disclaimer info */}
            <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-[10px] text-slate-400 leading-normal flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span>
                Ask about pricing tiers, KYC needs, soundproofing, or search slots. This chatbot uses self-reported info and does not replace medical diagnostics.
              </span>
            </div>

            {/* Conversation Messages */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-none shadow-md shadow-primary/10'
                      : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {renderLinkOrText(msg.content)}
                </div>
              </div>
            ))}

            {/* Stress check-in Tap Interface */}
            {checkinStep !== null && (
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-primary/20 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stress check-in • Step {checkinStep} of 3</span>
                </div>

                {checkinStep === 1 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-white">How would you rate your stress level right now?</p>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          onClick={() => handleCheckinAnswer(1, val)}
                          className="py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-300 hover:border-emerald-400 hover:text-emerald-400 hover:bg-slate-950 transition-all cursor-pointer"
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                      <span>Calm (1)</span>
                      <span>Severe (5)</span>
                    </div>
                  </div>
                )}

                {checkinStep === 2 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-white">How much time do you have available today?</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[15, 30, 45].map(mins => (
                        <button
                          key={mins}
                          onClick={() => handleCheckinAnswer(2, mins)}
                          className="py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-300 hover:border-emerald-400 hover:text-emerald-400 hover:bg-slate-950 transition-all cursor-pointer"
                        >
                          {mins} Min
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {checkinStep === 3 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-white">What is bothering you the most today?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['Work stress', 'Commute fatigue', 'Personal matters', 'General overload'].map(cause => (
                        <button
                          key={cause}
                          onClick={() => handleCheckinAnswer(3, cause)}
                          className="py-2 rounded-xl border border-slate-800 bg-slate-900 text-[10px] font-bold text-slate-300 hover:border-emerald-400 hover:text-emerald-400 hover:bg-slate-950 transition-all cursor-pointer text-left px-3"
                        >
                          {cause}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setCheckinStep(null)}
                  className="w-full text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider hover:text-white pt-1"
                >
                  Cancel Check-in
                </button>
              </div>
            )}

            {/* Onboarding dynamic prompts */}
            {messages.length === 1 && !checkinStep && (
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Actions</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={startStressCheckin}
                    className="w-full flex items-center justify-between text-left px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:border-emerald-400 text-emerald-400 hover:bg-slate-950 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span>⚡ Stress Check-in Flow</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  {(!user || user.kycStatus !== 'VERIFIED') && (
                    <Link
                      href="/customer/kyc"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-between text-left px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:border-amber-400 text-amber-400 hover:bg-slate-950 text-xs font-semibold transition-all"
                    >
                      <span>📋 Guided KYC Onboarding</span>
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Waiting loader */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-950/80 border border-slate-800 text-slate-400 rounded-2xl rounded-bl-none p-3 text-xs flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin"></span>
                  <span>Finding calm response...</span>
                </div>
              </div>
            )}

            {/* Errors display */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 text-[10px] leading-relaxed flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Form input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || checkinStep !== null}
              placeholder={checkinStep !== null ? "Complete check-in..." : "Ask the assistant..."}
              className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-primary transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || checkinStep !== null}
              className="p-2 bg-primary text-white rounded-xl hover:bg-primary/95 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
