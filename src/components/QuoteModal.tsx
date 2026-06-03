import React, { useState } from "react";
import { X, Mail, Globe, Check, ChevronLeft, ArrowRight, ShieldCheck } from "lucide-react";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, country: string) => void;
}

export default function QuoteModal({ isOpen, onClose, onSubmit }: QuoteModalProps) {
  // Form states
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [checked, setChecked] = useState(false);
  const [showPrivacyDetail, setShowPrivacyDetail] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !country.trim() || !checked) return;
    onSubmit(email, country);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-none pretendard-font animate-fadeIn">
      {/* Outer Card */}
      <div className="relative w-full max-w-lg bg-neutral-950 text-white rounded-3xl border border-white/15 shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 pretendard-font">
        
        {/* Header with Close option */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-full p-2 transition-all cursor-pointer focus:outline-none"
          title="Close Dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Body Container */}
        <div className="p-7 md:p-9">
          {!showPrivacyDetail ? (
            /* CORE QUOTE FORM VIEW */
            <form onSubmit={handleSubmit} className="space-y-6 select-text">
              <div className="space-y-2.5 text-center pb-2">
                <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-white leading-tight font-sans">
                  Get a Free Quote from Korea's Master Tailor ✂️
                </h3>
                <p className="text-neutral-400 text-xs font-normal leading-relaxed font-sans max-w-sm mx-auto">
                  Premium 'Made in Korea' manufacturing for your brand. Enter your email to start the consultation and receive our proprietary size charts.
                </p>
              </div>

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email input field */}
                <div className="space-y-1.5 font-sans text-center animate-fadeIn">
                  <label className="text-[10px] tracking-wider font-semibold text-neutral-400 uppercase block font-sans text-center">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., designer@brand.com"
                      className="w-full bg-neutral-900 border border-white/10 hover:border-white/20 rounded-xl py-3 px-4 text-xs text-center text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Country input field */}
                <div className="space-y-1.5 font-sans text-center animate-fadeIn">
                  <label className="text-[10px] tracking-wider font-semibold text-neutral-400 uppercase block font-sans text-center">
                    Country
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g., United States"
                      className="w-full bg-neutral-900 border border-white/10 hover:border-white/20 rounded-xl py-3 px-4 text-xs text-center text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20 transition-all font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Custom Checkbox Option */}
              <div className="bg-neutral-900/40 p-4 rounded-xl border border-white/5 space-y-2 select-none">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setChecked(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      checked 
                        ? "bg-amber-400 border-amber-400 text-black" 
                        : "border-white/20 group-hover:border-white/40 bg-transparent"
                    }`}>
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <span className="text-xs text-neutral-300 font-normal leading-snug font-sans">
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyDetail(true)}
                      className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                    {" "}<span className="text-neutral-500 text-[10px] italic">(Click to view full version)</span>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <span className="text-[10px] text-neutral-500 font-normal font-sans max-w-[240px] leading-relaxed">
                  Consenting initiates secure end-to-end atelier quotation stream.
                </span>
                
                <button
                  type="submit"
                  disabled={!email.trim() || !country.trim() || !checked}
                  className={`px-6 py-3 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center space-x-2 shrink-0 ${
                    email.trim() && country.trim() && checked
                      ? "bg-amber-400 text-black hover:bg-amber-300 cursor-pointer active:scale-95 hover:scale-[1.02]"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50"
                  }`}
                >
                  <span>Submit Request</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            /* DETAILED PRIVACY POLICY READER VIEW */
            <div className="space-y-4 animate-scaleIn select-text">
              <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
                <button
                  type="button"
                  onClick={() => setShowPrivacyDetail(false)}
                  className="p-1 rounded-full hover:bg-white/5 text-neutral-450 hover:text-white transition cursor-pointer"
                  title="Return to submission form"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center space-x-1.5 text-amber-400 text-[10px] font-mono tracking-wider font-bold uppercase">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Legal Document Frame</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">Privacy Policy</h3>
                </div>
              </div>

              {/* Detailed Document Content Scroll Container */}
              <div className="bg-neutral-950/85 p-4 rounded-xl border border-white/5 text-[11px] text-neutral-300 font-light leading-relaxed max-h-[300px] overflow-y-auto space-y-4 scrollbar-thin">
                <p className="font-semibold text-neutral-100 italic">
                  Last updated: June 3, 2026
                </p>

                <div>
                  <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider mb-1">
                    1. Who We Are
                  </h4>
                  <p>
                    Welcome to <strong>Korea Apparel Works</strong> ("we," "our," or "us"). We are a premium apparel manufacturing agency based in Busan, South Korea. We are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and use our AI chatbot consultation services.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider mb-1">
                    2. What Personal Data We Collect
                  </h4>
                  <p>
                    We only collect the absolute minimum data required to communicate with you and provide accurate manufacturing services:
                  </p>
                  <ul className="list-disc list-inside mt-1.5 space-y-1.5 pl-1.5">
                    <li>
                      <strong>Contact Information:</strong> Email address, provided voluntarily by you via our initial access form to receive quotes and communicate with our team.
                    </li>
                    <li>
                      <strong>Location Data:</strong> Your country, provided voluntarily by you to help us determine shipping feasibility and estimate delivery timelines.
                    </li>
                    <li>
                      <strong>Project Details (Optional):</strong> Brand/Project name, target delivery dates, sizing preferences, and design reference links provided by you during the AI chatbot consultation.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider mb-1">
                    3. How We Use Your Data
                  </h4>
                  <p>
                    We use your personal data strictly to:
                  </p>
                  <ul className="list-disc list-inside mt-1.5 space-y-1 pl-1.5">
                    <li>Provide customized manufacturing quotes, size charts, and feasibility reports.</li>
                    <li>Communicate with you regarding your production inquiries and project updates.</li>
                    <li>Operate and improve our website and AI chatbot user experience.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider mb-1">
                    4. Legal Basis for Processing (GDPR)
                  </h4>
                  <p>
                    Under the General Data Protection Regulation (GDPR), the lawful bases we rely on for processing this information are:
                  </p>
                  <ul className="list-disc list-inside mt-1.5 space-y-1.5 pl-1.5">
                    <li>
                      <strong>Your Consent:</strong> By checking the consent box and providing your email, you agree to our data processing. You are able to remove your consent at any time by contacting us.
                    </li>
                    <li>
                      <strong>Contractual Obligation:</strong> Processing is necessary to take steps at your request before entering into a manufacturing or sampling contract.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider mb-1">
                    5. Data Sharing & Third Parties
                  </h4>
                  <p>
                    We do not sell your personal data. We may share your data only with trusted third-party service providers (such as our secure website hosting platform and AI chatbot service provider) strictly for operating our business. These third parties are bound by strict confidentiality agreements and GDPR compliance.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider mb-1">
                    6. Data Retention
                  </h4>
                  <p>
                    We will keep your contact information and project details only for as long as necessary to fulfill the purposes we collected it for, or to satisfy any legal, accounting, or reporting requirements. Once the data is no longer required, it will be securely deleted.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider mb-1">
                    7. Your Data Protection Rights
                  </h4>
                  <p>
                    Under GDPR, you have the following rights regarding your personal data:
                  </p>
                  <ul className="list-disc list-inside mt-1.5 space-y-1 pl-1.5">
                    <li><strong>The right to access:</strong> You can ask us for copies of your personal data.</li>
                    <li><strong>The right to rectification:</strong> You can ask us to rectify inaccurate information or complete incomplete information.</li>
                    <li><strong>The right to erasure (Right to be forgotten):</strong> You can ask us to erase your personal data under certain conditions.</li>
                    <li><strong>The right to restrict processing:</strong> You have the right to ask us to restrict the processing of your data under certain conditions.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white uppercase text-[10px] tracking-wider mb-1">
                    8. Contact Us
                  </h4>
                  <p>
                    If you have any questions about this Privacy Policy or wish to exercise your data protection rights, please contact us at:
                  </p>
                  <ul className="list-disc list-inside mt-1.5 space-y-1 pl-1.5">
                    <li><strong>Email:</strong> <a href="mailto:hello@koreaapparelworks.com" className="text-amber-400 hover:underline">hello@koreaapparelworks.com</a></li>
                    <li><strong>Company Name:</strong> Korea Apparel Works</li>
                    <li><strong>Location:</strong> Busan, South Korea</li>
                  </ul>
                </div>
              </div>

              {/* Action back to form */}
              <button
                type="button"
                onClick={() => setShowPrivacyDetail(false)}
                className="w-full bg-white/5 hover:bg-white/10 text-white text-xs py-2 rounded-xl transition duration-200 text-center cursor-pointer select-none"
              >
                Go Back to Form
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
