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
