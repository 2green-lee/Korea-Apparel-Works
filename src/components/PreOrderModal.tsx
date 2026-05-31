import React, { useState, useEffect } from "react";
import { X, Check, CreditCard, Sparkles, Loader2, ClipboardCheck, ArrowRight } from "lucide-react";
import { StreamColorFinish, PreOrderData } from "../types";

interface PreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFinish: StreamColorFinish;
  defaultSize: number;
}

export default function PreOrderModal({ isOpen, onClose, defaultFinish, defaultSize }: PreOrderModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [finish, setFinish] = useState<StreamColorFinish>(defaultFinish);
  const [size, setSize] = useState<number>(defaultSize);
  const [shippingOption, setShippingOption] = useState<"standard" | "priority">("standard");
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<PreOrderData | null>(null);

  // Synchronize options if they change from the main screen customizer
  useEffect(() => {
    if (isOpen) {
      setFinish(defaultFinish);
      setSize(defaultSize);
      setTicket(null); // Reset when reopening
    }
  }, [isOpen, defaultFinish, defaultSize]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.includes("@")) return;

    setLoading(true);
    setTimeout(() => {
      const newTicket: PreOrderData = {
        id: `KAW-2027-P${Math.floor(Math.random() * 90000) + 10000}`,
        email,
        fullName,
        finish,
        size,
        country: "South Korea / Seoul Global",
        shippingOption,
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        })
      };

      // Save locally
      const preorders = JSON.parse(localStorage.getItem("kaw_preorders") || "[]");
      preorders.push(newTicket);
      localStorage.setItem("kaw_preorders", JSON.stringify(preorders));

      setTicket(newTicket);
      setLoading(false);
    }, 1400);
  };

  const ringNames = {
    "titanium-silver": "Satin Aerospace Titanium",
    "matte-obsidian": "Onyx Matte Obsidian",
    "champagne-gold": "Champagne Yellow Gold Aura"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-fadeIn">
      {/* Outer Card */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#efecdf] shadow-2xl p-6 md:p-8 flex flex-col justify-between overflow-hidden">
        
        {/* Absolute top decorative lines */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-black"></div>

        {/* Close trigger */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-neutral-400 hover:text-black border border-neutral-100 hover:border-neutral-300 rounded-full p-1.5 transition-all cursor-pointer focus:outline-hidden"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {ticket ? (
          /* RESERVATION COMPLETED TICKET OUTPUT */
          <div className="space-y-6 animate-fadeIn py-4 select-text">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                <Check className="w-6 h-6 text-amber-400 font-bold" />
              </div>
              <span className="font-mono text-[9px] text-[#8a7256] tracking-widest uppercase font-bold block">
                RESERVATION COMPLETED // ENTRY SECURE
              </span>
              <h3 className="font-serif text-2xl font-light text-black">
                You are in the queue.
              </h3>
              <p className="text-xs text-neutral-500 font-light max-w-sm mx-auto font-sans leading-relaxed">
                Your priority reservation ticket has been logged into the Korea Apparel Works registry. A physical custom pattern sizing swatch package will be mailed to you ahead of production.
              </p>
            </div>

            {/* Structured Ticket Receipt */}
            <div className="bg-neutral-50 p-5 rounded-2xl border border-[#efecdf]/80 space-y-4 font-sans text-xs">
              
              <div className="flex justify-between items-center border-b border-[#efecdf] pb-3 text-[10px] font-mono uppercase text-[#8a7256] font-bold">
                <span>RESERVATION TICKET</span>
                <span className="text-black">{ticket.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-neutral-600">
                <div>
                  <span className="block text-[10px] font-mono uppercase text-neutral-400 mb-0.5">FULL NAME</span>
                  <span className="text-black font-medium">{ticket.fullName}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-neutral-400 mb-0.5">EMAIL</span>
                  <span className="text-black font-medium">{ticket.email}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-neutral-400 mb-0.5">HARDWARE STYLE</span>
                  <span className="text-black font-semibold uppercase text-[11px]">{ringNames[ticket.finish]}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-neutral-400 mb-0.5">ESTIMATED SIZE</span>
                  <span className="text-black font-mono font-bold">Size {ticket.size}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-neutral-400 mb-0.5">ESTIMATED DROP</span>
                  <span className="text-[#8a7256] font-bold">Q1 2027 (Priority Ship)</span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-neutral-400 mb-0.5">RESERVE DATE</span>
                  <span className="text-black font-mono">{ticket.createdAt}</span>
                </div>
              </div>

              <div className="border-t border-[#efecdf]/80 pt-3 flex justify-between items-center text-[10px] font-mono text-neutral-450 uppercase font-semibold">
                <span>CHARGE TOTAL</span>
                <span className="text-black text-sm font-sans font-bold">$349 USD (Post-size confirmation)</span>
              </div>

            </div>

            <p className="text-[10px] text-neutral-400 text-center font-mono leading-relaxed uppercase">
              🛡️ An authorization email has been dispatched. No funds will be drawn from your register until sizing molds are captured.
            </p>

            <button
              onClick={onClose}
              className="w-full bg-black hover:bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider py-3 px-6 rounded-full transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Return to Showcase</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        ) : (
          /* PREORDER INPUT FORM */
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-1.5 select-none">
              <span className="font-mono text-[9px] text-[#8a7256] tracking-widest uppercase font-bold block">
                PRIORITY RESERVATION FORM
              </span>
              <h3 className="font-serif text-2xl font-light text-black">
                Configure your reservation.
              </h3>
              <p className="text-xs text-neutral-500 font-light font-sans max-w-sm leading-relaxed">
                Provide your custom size preferences below backstopped with your email directory coordinates. We will lock in your introductory pricing launch slot.
              </p>
            </div>

            {/* Grid selectors */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Finish Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider font-bold text-[#8a7256] uppercase block">
                  Finishing Option
                </label>
                <select
                  value={finish}
                  onChange={(e) => setFinish(e.target.value as StreamColorFinish)}
                  className="w-full bg-neutral-50 border border-[#efecdf] rounded-xl py-2 px-3 text-xs text-black focus:outline-hidden focus:border-black font-sans uppercase font-medium"
                >
                  <option value="titanium-silver">Satin Titanium</option>
                  <option value="matte-obsidian">Onyx Obsidian</option>
                  <option value="champagne-gold">Champagne Gold</option>
                </select>
              </div>

              {/* Size Selector */}
              <div className="space-y-1.5 font-mono">
                <label className="text-[10px] font-mono tracking-wider font-bold text-[#8a7256] uppercase block">
                  Ring size estimate
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full bg-neutral-50 border border-[#efecdf] rounded-xl py-2 px-3 text-xs text-black focus:outline-hidden focus:border-black font-sans uppercase font-medium"
                >
                  {[6, 7, 8, 9, 10, 11, 12, 13].map((s) => (
                    <option key={s} value={s}>
                      Ring Size {s}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Personal Details text inputs */}
            <div className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider font-bold text-[#8a7256] uppercase block">
                  Full Name / Legal Identifier
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Alexander Vance"
                  className="w-full bg-neutral-50 border border-[#efecdf] rounded-xl py-3 px-4 text-xs text-black focus:outline-hidden focus:border-black tracking-wide font-sans font-light"
                />
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="text-[10px] font-mono tracking-wider font-bold text-[#8a7256] uppercase block">
                  Business / Personal Email Directory
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vance@apparelworks.com"
                  className="w-full bg-neutral-50 border border-[#efecdf] rounded-xl py-3 px-4 text-xs text-black focus:outline-hidden focus:border-black tracking-wide font-sans font-light"
                />
              </div>

            </div>

            {/* Shipping Preference */}
            <div className="space-y-2 select-none font-sans">
              <label className="text-[10px] font-mono tracking-wider font-bold text-[#8a7256] uppercase block">
                Shipping Pipeline Preference
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => setShippingOption("standard")}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer ${
                    shippingOption === "standard" ? "bg-neutral-50 border-black" : "bg-white border-[#efecdf]"
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingOption === "standard"}
                    onChange={() => {}}
                    className="mt-0.5 accent-black"
                  />
                  <div>
                    <span className="block text-[11px] font-semibold text-black">Standard Shipping</span>
                    <span className="block text-[9.5px] text-neutral-400 font-light mt-0.5">Pre-Sizing cradle included</span>
                  </div>
                </div>

                <div 
                  onClick={() => setShippingOption("priority")}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer ${
                    shippingOption === "priority" ? "bg-neutral-50 border-black" : "bg-white border-[#efecdf]"
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingOption === "priority"}
                    onChange={() => {}}
                    className="mt-0.5 accent-black"
                  />
                  <div>
                    <span className="block text-[11px] font-semibold text-black">Express Priority</span>
                    <span className="block text-[9.5px] text-amber-700 font-medium font-mono mt-0.5">Drop queue priority #01</span>
                  </div>
                </div>
              </div>

            </div>

            {/* CTAs */}
            <div className="pt-4 font-sans select-none border-t border-[#efecdf]/70 flex items-center justify-between gap-4">
              <span className="text-[11px] font-mono text-neutral-400 leading-tight">
                No credit card charged today. Cancel anytime without penalty boundaries.
              </span>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-black hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-sans text-xs font-semibold uppercase tracking-wider px-6 py-3.5 rounded-full transition-all duration-300 flex items-center justify-center space-x-2 shrink-0 cursor-pointer shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Transmitting Lock...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Launch Queue</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
