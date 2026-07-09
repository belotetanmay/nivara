'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LogIn, UserPlus, ShieldAlert, ArrowRight, ShieldCheck, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

function LoginForm() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'VENDOR'>('CUSTOMER');
  
  // Vendor specific fields
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [payoutDetails, setPayoutDetails] = useState('');

  // UI state
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Read URL query params
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'vendor') {
      setRole('VENDOR');
      setActiveTab('register');
    } else if (roleParam === 'admin') {
      setEmail('admin@nivara.com');
      setActiveTab('login');
    }

    const unauthorized = searchParams.get('unauthorized');
    if (unauthorized) {
      setFormError('You are not authorized to view that page. Please sign in with an authorized account.');
    }

    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'google_config_missing') {
        setFormError('Google Client Credentials are not configured in the .env file. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to run real Google Auth.');
      } else if (errorParam === 'google_token_exchange_failed') {
        setFormError('Google login authentication failed: Token exchange failed.');
      } else if (errorParam === 'google_profile_fetch_failed') {
        setFormError('Google login authentication failed: Profile fetch failed.');
      } else if (errorParam === 'google_email_missing') {
        setFormError('Google account did not return a valid email address.');
      } else {
        const msg = searchParams.get('msg');
        setFormError(`Google Sign-In failed: ${msg || errorParam}`);
      }
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (user.role === 'VENDOR') {
        router.push('/vendor/dashboard');
      } else {
        router.push('/customer/dashboard');
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormError(null);
      setIsSubmitting(true);

      // Inline validation error checks (email format, password strength, empty fields)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setFormError('Invalid email format. Please check your address formatting.');
        setIsSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setFormError('Password security constraint: Must be at least 6 characters.');
        setIsSubmitting(false);
        return;
      }

      if (activeTab === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setFormError(res.error || 'Invalid email or password combination. Try again.');
        }
        setIsSubmitting(false);
      } else {
        // Validate register
        if (!name) {
          setFormError('Full name field is required.');
          setIsSubmitting(false);
          return;
        }

        if (role === 'VENDOR' && !businessName) {
          setFormError('Business name is required for wellness van hosts.');
          setIsSubmitting(false);
          return;
        }

        const payload = {
          name,
          email,
          phone,
          password,
          role,
          businessName: role === 'VENDOR' ? businessName : undefined,
          bio: role === 'VENDOR' ? bio : undefined,
          payoutDetails: role === 'VENDOR' ? payoutDetails : undefined,
        };

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setRegisterSuccess(true);
          // Wait 2 seconds and log in automatically
          setTimeout(async () => {
            await login(email, password);
          }, 1500);
        } else {
          setFormError(data.error || 'Failed to create account.');
        }
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error('LoginForm onSubmit error:', err);
      setFormError(err.message || 'An unexpected error occurred during submission.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-tr from-[#5B8DEF]/10 via-[#FAF8F5] to-[#C5B3FF]/10 relative overflow-hidden">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#5B8DEF]/10 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#C5B3FF]/10 rounded-full blur-3xl -z-10 pointer-events-none animate-pulse"></div>
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/60 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 duration-500">
          
          {/* Logo Heading */}
          <div className="text-center">
            <Image
              src="/nivara_logo_transparent.png"
              alt="Nivara Logo"
              width={160}
              height={56}
              className="mx-auto object-contain h-14 w-auto"
            />
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-primary">
              {activeTab === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
              {activeTab === 'login' 
                ? 'Sign in to access your wellness portal and bookings' 
                : 'Join Nivara and experience customized recovery pods'}
            </p>
          </div>

          {/* Tab Switcher */}
          {!registerSuccess && (
            <div className="flex border-b border-[#E5E1D8]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setFormError(null);
                }}
                className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-all ${
                  activeTab === 'login'
                    ? 'border-secondary text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:text-primary'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setFormError(null);
                }}
                className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-all ${
                  activeTab === 'register'
                    ? 'border-secondary text-primary font-bold'
                    : 'border-transparent text-muted-foreground hover:text-primary'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Form Content */}
          {registerSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-secondary/15 text-secondary">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <h3 className="font-serif text-xl font-bold text-primary">Registration Successful!</h3>
              <p className="text-sm text-muted-foreground">
                Your account is ready. Logging you in automatically to your dashboard...
              </p>
              <div className="flex justify-center items-center gap-2 text-secondary text-sm font-semibold">
                <span>Entering portal</span>
                <span className="animate-pulse">...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              
              {/* Errors Alert */}
              {formError && (
                <div className="flex gap-2.5 items-start p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                  <div>{formError}</div>
                </div>
              )}

              <div className="space-y-4">
                
                {/* Registration Only Fields */}
                {activeTab === 'register' && (
                  <>
                    {/* User Role Selection */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        I want to register as a:
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setRole('CUSTOMER');
                            setFormError(null);
                          }}
                          className={`py-2 px-4 text-sm font-semibold rounded-md border text-center transition-all ${
                            role === 'CUSTOMER'
                              ? 'bg-[#FCF9F6] border-secondary text-secondary shadow-sm ring-1 ring-secondary'
                              : 'bg-white border-[#E5E1D8] text-muted-foreground hover:text-primary'
                          }`}
                        >
                          Customer
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRole('VENDOR');
                            setFormError(null);
                          }}
                          className={`py-2 px-4 text-sm font-semibold rounded-md border text-center transition-all ${
                            role === 'VENDOR'
                              ? 'bg-[#FCF9F6] border-secondary text-secondary shadow-sm ring-1 ring-secondary'
                              : 'bg-white border-[#E5E1D8] text-muted-foreground hover:text-primary'
                          }`}
                        >
                          Van Operator (Host)
                        </button>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        <input
                          id="name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                    />
                  </div>
                </div>

                {/* Phone Number (Optional for login, recommended for signup) */}
                {activeTab === 'register' && (
                  <div>
                    <label htmlFor="phone" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 99999 99999"
                        className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Vendor Onboarding Info */}
                {activeTab === 'register' && role === 'VENDOR' && (
                  <div className="pt-4 border-t border-[#E5E1D8] space-y-4">
                    <h3 className="font-serif text-base font-bold text-primary">Business Profile Details</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      To comply with our vetting policy, hosts must provide their business name and payout info. Your listings will not go live until an administrator verifies these documents.
                    </p>

                    {/* Business Name */}
                    <div>
                      <label htmlFor="businessName" className="block text-sm font-semibold text-primary mb-1">
                        Business / Portfolio Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="businessName"
                        type="text"
                        required={role === 'VENDOR'}
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. ZenPods Bengaluru"
                        className="w-full px-3 py-2 border border-[#E5E1D8] rounded-md text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label htmlFor="bio" className="block text-sm font-semibold text-primary mb-1">
                        Short Biography
                      </label>
                      <textarea
                        id="bio"
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell travelers about your wellness background and vehicle fleet..."
                        className="w-full px-3 py-2 border border-[#E5E1D8] rounded-md text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all resize-none"
                      />
                    </div>

                    {/* Payout Details */}
                    <div>
                      <label htmlFor="payout" className="block text-sm font-semibold text-primary mb-1">
                        Payout Account (Bank Info / UPI) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="payout"
                        type="text"
                        required={role === 'VENDOR'}
                        value={payoutDetails}
                        onChange={(e) => setPayoutDetails(e.target.value)}
                        placeholder="e.g. UPI: host@okicici or Bank details"
                        className="w-full px-3 py-2 border border-[#E5E1D8] rounded-md text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-md text-primary-foreground bg-primary hover:bg-primary/95 shadow focus:outline-none transition-all disabled:opacity-55 items-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : activeTab === 'login' ? (
                    <>
                      <LogIn className="w-4 h-4" /> Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Create Account
                    </>
                  )}
                </button>
              </div>

              {/* Google OAuth Button */}
              <div className="space-y-4">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">or</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <a
                  href={`/api/auth/google/login?role=${role}`}
                  className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-350 shadow-sm focus:outline-none transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2.5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Continue with Google
                </a>
              </div>

              {/* Helper Links - environment gated for development only */}
              {process.env.NODE_ENV === 'development' && activeTab === 'login' && (
                <div className="text-center pt-2 text-xs text-muted-foreground bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                  <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400">Local Dev Presets</span>
                  <div className="flex flex-wrap justify-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('admin@nivara.com');
                        setPassword('adminpassword123');
                      }}
                      className="underline text-primary font-medium hover:text-secondary"
                    >
                      Admin
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('tanmay@gmail.com');
                        setPassword('password123');
                      }}
                      className="underline text-primary font-medium hover:text-secondary"
                    >
                      Customer
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('host@nivara.com');
                        setPassword('password123');
                      }}
                      className="underline text-primary font-medium hover:text-secondary"
                    >
                      Vendor
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#FAF8F5]"><span className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></span></div>}>
      <LoginForm />
    </Suspense>
  );
}
