'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Star, MessageSquare, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Booking {
  id: string;
  bookingCode: string;
  van: {
    title: string;
  };
}

export default function ReviewPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const router = useRouter();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const res = await fetch(`/api/customer/bookings/${bookingId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setBooking(data.booking);
        } else {
          setError(data.error || 'Failed to retrieve booking information.');
        }
      } catch (err) {
        setError('Error loading session.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }
    if (comment.trim().length < 20) {
      setError('Your feedback comment must be at least 20 characters long.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/customer/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to submit review.');
      }
    } catch (err: any) {
      setError('An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
        <Navbar />
        <div className="flex-grow max-w-3xl mx-auto w-full px-4 py-16 text-center space-y-4">
          <h1 className="font-serif text-2xl font-bold text-primary font-serif">Error Loading Review Form</h1>
          <p className="text-sm text-muted-foreground">{error || 'Session not found.'}</p>
          <div className="pt-2">
            <Link href="/customer/dashboard" className="text-secondary font-semibold hover:underline">
              Back to dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-grow max-w-xl mx-auto w-full px-4 py-12 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border border-[#E5E1D8] shadow-md w-full space-y-6">
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Link href="/customer/dashboard" className="hover:text-primary transition-colors flex items-center gap-1 text-xs font-semibold">
              <ArrowLeft className="w-4.5 h-4.5" /> Back to Sessions
            </Link>
          </div>

          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-secondary/15 text-secondary">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-primary">Review Submitted!</h2>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Thank you! Your feedback has been recorded and will be shown on the public listing to help other travelers find quiet cabins.
              </p>
              <div className="pt-2">
                <Link
                  href="/customer/dashboard"
                  className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-xs font-semibold rounded-md text-primary-foreground bg-primary hover:bg-primary/95 shadow transition-all"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <h1 className="font-serif text-2xl font-bold text-primary">Share Your Experience</h1>
                <p className="text-xs text-muted-foreground mt-1">Reviewing: <span className="font-bold text-primary">{booking.van.title}</span></p>
              </div>

              {error && (
                <div className="flex gap-2 items-start p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              {/* Star rating picker */}
              <div className="space-y-2 text-center sm:text-left">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Overall Rating
                </label>
                <div className="flex justify-center sm:justify-start gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-[#D4A373] fill-[#D4A373]'
                            : 'text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text box */}
              <div className="space-y-1">
                <label htmlFor="comment" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Your Written Feedback
                </label>
                <textarea
                  id="comment"
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe your session experience (comfort of the zero-gravity chair, noise levels, lights, aromatic atmosphere, etc.). Minimum 20 characters."
                  className="w-full px-3 py-2 border border-[#E5E1D8] rounded text-xs focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary resize-none bg-[#FCF9F6]/20 font-sans"
                />
                <span className="text-[10px] text-muted-foreground block text-right mt-1 font-medium">
                  {comment.length} / 20 characters minimum
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || comment.trim().length < 20}
                className="w-full py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-primary-foreground bg-primary hover:bg-primary/95 shadow transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" /> Submit Review
              </button>
            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
