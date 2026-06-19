import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Lock, Mail, User, ShieldAlert, X } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setErrorMsg("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
      // Note: Page will be redirected, so we don't call onSuccess() here
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!consent) {
          setErrorMsg("You must agree to the Privacy Policy and Terms of Service (GDPR/CCPA requirement).");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              consent_given: consent,
              consent_date: new Date().toISOString()
            }
          }
        });

        if (error) throw error;
        // Auto sign-in or check email verification
        onSuccess();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn text-left font-sans">
      <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-medium text-white tracking-tight">
            {isSignUp ? "Create Account" : "Sign In"}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 text-center">
            {isSignUp
              ? "Register to track your purchase orders and consult history."
              : "Access your account to manage your apparel orders."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-neutral-950/80 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950/80 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none transition-all"
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950/80 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {isSignUp && (
            <div className="flex items-start space-x-2 mt-4 pt-2 border-t border-white/5">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 bg-neutral-900 border border-white/20 rounded cursor-pointer accent-white"
              />
              <label htmlFor="consent" className="text-[10px] text-neutral-400 leading-relaxed cursor-pointer select-none">
                I agree to the collection and processing of my personal data for the purpose of communicating and providing apparel manufacturing services, in accordance with the Privacy Policy (GDPR / CCPA Compliant).
              </label>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-950/20 border border-red-500/20 text-red-400 text-[11px] rounded-xl py-2 px-3 flex items-center space-x-2">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-neutral-200 text-black text-xs font-semibold py-3 rounded-xl transition duration-200 mt-2 disabled:opacity-50"
          >
            {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="w-1/5 border-b border-white/10"></span>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">소셜 계정으로 로그인</span>
          <span className="w-1/5 border-b border-white/10"></span>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleOAuthLogin('google')}
            className="flex-1 flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium py-3 rounded-xl transition duration-200 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Google로 로그인</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleOAuthLogin('apple')}
            className="flex-1 flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium py-3 rounded-xl transition duration-200 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.365 1.43c0 0-2.404.144-4.846 2.502-2.316 2.235-2.33 4.976-2.33 4.976s2.348-.124 4.887-2.315c2.318-1.996 2.289-5.163 2.289-5.163zm-4.706 7.641c-2.483.056-4.593 1.674-6.02 1.674-1.428 0-4.072-1.637-6.096-1.602-2.585.044-4.966 1.503-6.286 3.811-2.671 4.636-.68 11.498 1.905 15.228 1.258 1.815 2.753 3.843 4.693 3.766 1.864-.078 2.593-1.21 4.851-1.21 2.243 0 2.915 1.21 4.866 1.171 2.015-.04 3.327-1.851 4.568-3.666 1.435-2.102 2.023-4.143 2.05-4.249-.046-.021-3.98-1.528-4.01-6.108-.027-3.83 3.123-5.672 3.266-5.761-1.802-2.634-4.582-2.991-5.59-3.054z" />
            </svg>
            <span>Apple로 로그인</span>
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-neutral-500">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg("");
            }}
            className="text-white font-medium hover:underline cursor-pointer"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
