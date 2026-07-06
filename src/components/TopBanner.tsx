import React, { useState } from "react";
import { Check, MailOpen } from "lucide-react";

export default function TopBanner() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setEmail("");
      
      // Save locally to simulate backend persistence
      const subscribers = JSON.parse(localStorage.getItem("kaw_subscribers") || "[]");
      subscribers.push(email);
      localStorage.setItem("kaw_subscribers", JSON.stringify(subscribers));
    }, 900);
  };

  return (
    <div className="w-full bg-[#f4f1e9] border-b border-[#efecdf] py-3 px-6 fixed top-0 left-0 right-0 z-50 overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        
        {/* Left copy text grouping */}
        <div className="flex flex-col sm:flex-row items-center sm:space-x-3 text-xs tracking-wide">
          <span className="font-semibold text-black uppercase text-[11px] mb-0.5 sm:mb-0">
            Stay Updated
          </span>
          <span className="text-black/50 font-light text-[11px] hidden lg:inline">
            |
          </span>
          <span className="text-black/60 font-light text-[11px]">
            Get early updates, exclusive drops, and shape what comes next.
          </span>
        </div>

        {/* Right newsletter field */}
        {success ? (
          <div className="flex items-center space-x-1.5 text-black font-medium text-xs font-mono animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-amber-600 font-bold" />
            <span className="text-[11px]">Subscribed into Priority Drop Circle</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center w-full sm:w-auto relative max-w-xs">
            <input
              type="email"
              required
              value={email}
              aria-label="Email address"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-[#faf9f6]/95 border border-[#efecdf] rounded-full pl-4 pr-10 py-1.5 text-xs text-black placeholder-black/35 focus:outline-hidden focus:border-black/50 tracking-wide font-sans font-light"
            />
            <button
              type="submit"
              disabled={loading}
              title="Subscribe"
              className="absolute right-1 top-1 bottom-1 w-7 h-7 bg-black hover:bg-neutral-800 disabled:bg-neutral-400 text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs"
            >
              {loading ? (
                <div className="w-2.5 h-2.5 border-1.5 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-xs">⌲</span>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
