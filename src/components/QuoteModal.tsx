import React, { useState, useRef, useEffect } from "react";
import { X, Check, ChevronLeft, ArrowRight, ShieldCheck, Search, ChevronDown } from "lucide-react";
import { COUNTRIES, CountryOption } from "../data/countries";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, password: string, isLogin: boolean, country?: string) => void;
}

export default function QuoteModal({ isOpen, onClose, onSubmit }: QuoteModalProps) {
  // Form states
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showPrivacyDetail, setShowPrivacyDetail] = useState(false);

  // Combobox states
  const [isOpenCombobox, setIsOpenCombobox] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const comboboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipOnFocusRef = useRef(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpenCombobox(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectCountry = (c: CountryOption) => {
    const combined = `${c.code} - ${c.name}`;
    setCountry(combined);
    setSearchQuery(c.name);
    setIsOpenCombobox(false);
  };

  const handleFocus = () => {
    if (skipOnFocusRef.current) {
      skipOnFocusRef.current = false;
      return;
    }
    setIsOpenCombobox(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    const match = COUNTRIES.find(c => c.name.toLowerCase() === val.toLowerCase().trim());
    if (match) {
      setCountry(`${match.code} - ${match.name}`);
    } else {
      setCountry(val);
    }
    setIsOpenCombobox(true);
  };

  const filteredCountries = COUNTRIES.filter(c => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    if (query.includes(" - ")) {
      const parts = query.split(" - ");
      const maybeCode = parts[0].trim();
      const maybeName = parts.slice(1).join(" - ").trim();
      return (
        c.code.toLowerCase().includes(maybeCode) ||
        c.name.toLowerCase().includes(maybeName)
      );
    }
    return (
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query)
    );
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      if (!email.trim() || !password.trim()) return;
      onSubmit(email, password, true);
    } else {
      if (!email.trim() || !country.trim() || !password.trim() || !checked) return;
      onSubmit(email, password, false, country);
    }
  };

  const isFormValid = isLoginMode 
    ? (email.trim() && password.trim())
    : (email.trim() && country.trim() && password.trim() && checked);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pretendard-font animate-fadeIn">
      {/* Outer Card */}
      <div className="relative w-full max-w-lg bg-white border border-neutral-200/80 shadow-[0_24px_64px_rgba(0,0,0,0.08)] rounded-3xl overflow-hidden transition-all duration-300 pretendard-font">
        
        {/* Header & Description Block */}
        <div className="flex flex-col items-center bg-white rounded-t-3xl relative select-none pt-10 px-7 md:px-9 pb-6">
          <img 
            src="/logo1.png" 
            alt="Korea Apparel Works Logo" 
            className="h-10 md:h-12 object-contain pointer-events-none select-none mb-5" 
          />
          
          {/* Form Description Moved to Header */}
          <div className="text-center">
            <p className="text-neutral-500 text-sm md:text-[15px] font-light leading-relaxed max-w-sm mx-auto">
              {isLoginMode 
                ? "Welcome back. Log in to track your production quotes and orders."
                : "Premium 'Made in Korea' manufacturing for your brand. Enter your email to start the consultation and receive our proprietary size charts."}
            </p>
          </div>
          
          {/* Header Close Option */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-neutral-400 hover:text-neutral-900 transition-all cursor-pointer focus:outline-hidden p-1.5 rounded-full hover:bg-neutral-200/50"
            title="Close Dialog"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Body Container */}
        <div className="px-7 md:px-9 pb-7 md:pb-9 pt-2">
          {!showPrivacyDetail ? (
            /* CORE QUOTE FORM VIEW */
            <form onSubmit={handleSubmit} className="space-y-6 select-text">

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email input field */}
                <div className="space-y-1.5 font-sans text-center animate-fadeIn">
                  <label className="text-[12px] tracking-wider font-semibold text-neutral-400 uppercase block font-sans text-center">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., designer@brand.com"
                      className="w-full bg-neutral-50 border border-neutral-200/80 hover:border-neutral-300 rounded-xl py-3 px-4 text-xs text-center text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Password input field */}
                <div className="space-y-1.5 font-sans text-center animate-fadeIn">
                  <label className="text-[12px] tracking-wider font-semibold text-neutral-400 uppercase block font-sans text-center">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter secure password"
                      className="w-full bg-neutral-50 border border-neutral-200/80 hover:border-neutral-300 rounded-xl py-3 px-4 text-xs text-center text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Country input field (Searchable Combobox) - Full width - Only show in Sign Up mode */}
                {!isLoginMode && (
                  <div ref={comboboxRef} className="col-span-1 sm:col-span-2 space-y-1.5 font-sans text-center animate-fadeIn relative">
                    <label className="text-[12px] tracking-wider font-semibold text-neutral-400 uppercase block font-sans text-center">
                      Country
                    </label>
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        required={!isLoginMode}
                        value={searchQuery}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        placeholder="Search country..."
                        className="w-full bg-neutral-50 border border-neutral-200/80 hover:border-neutral-300 rounded-xl py-3 pl-4 pr-10 text-xs text-center text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 transition-all font-sans"
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-neutral-400">
                        <Search className="w-3.5 h-3.5" />
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Dropdown list */}
                    {isOpenCombobox && (
                      <div className="absolute z-50 left-0 right-0 mt-1 max-h-[250px] overflow-y-auto bg-white border border-neutral-200/80 rounded-xl shadow-2xl divide-y divide-neutral-100 scrollbar-thin text-left">
                        <div className="divide-y divide-neutral-100">
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => selectCountry(c)}
                                className="w-full px-4 py-2.5 text-xs text-left text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors font-sans focus:outline-hidden cursor-pointer"
                              >
                                <span>{c.name}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3.5 text-xs text-neutral-400 text-center font-sans">
                              No matching country found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Privacy Custom Checkbox Option - Only for Sign Up */}
              {!isLoginMode && (
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-2 select-none">
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
                          ? "bg-neutral-950 border-neutral-950 text-white" 
                          : "border-neutral-300 group-hover:border-neutral-450 bg-transparent"
                      }`}>
                        {checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <span className="text-xs text-neutral-600 font-normal leading-snug font-sans">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyDetail(true)}
                        className="text-neutral-950 hover:underline font-medium cursor-pointer"
                      >
                        Privacy Policy
                      </button>
                      {" "}<span className="text-neutral-400 text-[10px] italic">(Click to view full version)</span>
                    </span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <span className="text-[10px] text-neutral-400 font-normal font-sans max-w-[240px] leading-relaxed">
                  Consenting initiates secure end-to-end atelier quotation stream.
                </span>
                
                <button
                  id="auth-submit-button"
                  type="submit"
                  disabled={!isFormValid}
                  className={`gtm-auth-submit px-6 py-3 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center space-x-2 shrink-0 ${
                    isFormValid
                      ? "bg-neutral-950 text-white hover:bg-neutral-800 cursor-pointer active:scale-95 hover:scale-[1.02]"
                      : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  <span>{isLoginMode ? "Sign In" : "Submit Request"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Toggle Login/Signup */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-neutral-450 text-[11px] font-sans hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  {isLoginMode 
                    ? "Need a quote? Sign up here." 
                    : "Already have an account? Sign in."}
                </button>
              </div>
            </form>
          ) : (
            /* DETAILED PRIVACY POLICY READER VIEW */
            <div className="space-y-4 animate-scaleIn select-text">
              <div className="flex items-center space-x-2 border-b border-neutral-150 pb-3">
                <button
                  type="button"
                  onClick={() => setShowPrivacyDetail(false)}
                  className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition cursor-pointer"
                  title="Return to submission form"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center space-x-1.5 text-neutral-400 text-[10px] font-mono tracking-wider font-bold uppercase">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Legal Document Frame</span>
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900 font-sans">Privacy Policy</h3>
                </div>
              </div>

              {/* Detailed Document Content Scroll Container */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/60 text-[11px] text-neutral-600 font-light leading-relaxed max-h-[300px] overflow-y-auto space-y-4 scrollbar-thin">
                <p className="font-semibold text-neutral-700 italic">
                  Last updated: June 3, 2026
                </p>

                <div>
                  <h4 className="font-semibold text-neutral-800 uppercase text-[10px] tracking-wider mb-1">
                    1. Who We Are
                  </h4>
                  <p>
                    Welcome to <strong>Korea Apparel Works</strong> ("we," "our," or "us"). We are a premium apparel manufacturing agency based in Busan, South Korea. We are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and use our AI chatbot consultation services.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-800 uppercase text-[10px] tracking-wider mb-1">
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
                  <h4 className="font-semibold text-neutral-800 uppercase text-[10px] tracking-wider mb-1">
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
                  <h4 className="font-semibold text-neutral-800 uppercase text-[10px] tracking-wider mb-1">
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
                  <h4 className="font-semibold text-neutral-800 uppercase text-[10px] tracking-wider mb-1">
                    5. Data Sharing & Third Parties
                  </h4>
                  <p>
                    We do not sell your personal data. We may share your data only with trusted third-party service providers (such as our secure website hosting platform and AI chatbot service provider) strictly for operating our business. These third parties are bound by strict confidentiality agreements and GDPR compliance.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-800 uppercase text-[10px] tracking-wider mb-1">
                    6. Data Retention
                  </h4>
                  <p>
                    We will keep your contact information and project details only for as long as necessary to fulfill the purposes we collected it for, or to satisfy any legal, accounting, or reporting requirements. Once the data is no longer required, it will be securely deleted.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-800 uppercase text-[10px] tracking-wider mb-1">
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
                  <h4 className="font-semibold text-neutral-800 uppercase text-[10px] tracking-wider mb-1">
                    8. Contact Us
                  </h4>
                  <p>
                    If you have any questions about this Privacy Policy or wish to exercise your data protection rights, please contact us at:
                  </p>
                  <ul className="list-disc list-inside mt-1.5 space-y-1 pl-1.5">
                    <li><strong>Email:</strong> <a href="mailto:hello@koreaapparelworks.com" className="text-neutral-900 hover:underline">hello@koreaapparelworks.com</a></li>
                    <li><strong>Company Name:</strong> Korea Apparel Works</li>
                    <li><strong>Location:</strong> Busan, South Korea</li>
                  </ul>
                </div>
              </div>

              {/* Action back to form */}
              <button
                type="button"
                onClick={() => setShowPrivacyDetail(false)}
                className="w-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs py-3 rounded-xl transition duration-200 text-center cursor-pointer select-none font-semibold uppercase tracking-wider"
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
