import React, { useState, useEffect, useRef } from "react";
import { Camera, Mic, ArrowUp, RefreshCw, Search, Ruler } from "lucide-react";

interface HeroProps {
  onPreOrderClick: () => void;
}

export default function Hero({ onPreOrderClick }: HeroProps) {
  // Chat States
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([
    {
      role: "model",
      text: "Hello! I am your Korea Apparel Works virtual manufacture coordinator. Ask me about our 30-year veteran Korean sewing ateliers, premium technical fabrics, design pattern drafting, or low-MOQ (30pcs) luxury apparel services."
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat interactions
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isGenerating) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: messages.slice(1) // skip fallback greeting
        })
      });

      const data = await response.json();
      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: `Query error: ${data.error}. Please ensure your Gemini API key is configured under Settings > Secrets.`
          }
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "model", text: data.text }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Communication offline. Make sure the server is booted up and try again."
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickCommand = async (promptText: string) => {
    if (isGenerating) return;
    setMessages((prev) => [...prev, { role: "user", text: promptText }]);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptText,
          history: messages.slice(1)
        })
      });

      const data = await response.json();
      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: `Query error: ${data.error}. Please configure your API key.`
          }
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "model", text: data.text }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Communication offline. Please check that the server is active."
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeImage = () => {
    if (isGenerating) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: "[Upload Sketch] Analyzed custom apparel design." },
      { role: "model", text: "I have analyzed your garment sketch! Our Seoul-based veteran tailors can build an accurate digital production pattern for this item using high-grade sustainable cotton-combed jersey. Our minimum order quantity starts at just 30 pieces. Would you like to request physical sample swatches?" }
    ]);
  };

  return (
    <section className="relative min-h-[92vh] w-full flex flex-col justify-center items-center overflow-hidden pt-28 pb-16 z-10 px-4 md:px-8">
      
      {/* Solid warm dark neutral Muji-style background */}
      <div className="absolute inset-0 z-0 bg-[#faf9f5]"></div>

      {/* Main Responsive Layout Box */}
      <div className="relative z-10 w-full max-w-[800px] flex flex-col items-center justify-center text-center px-4 select-none mt-[160px]">
        
        {/* Crafted T-Shirt Drafting & Cutting Pattern Logo Icon */}
        <div className="mb-[100px] -mt-[90px] flex items-center justify-center animate-fadeIn" style={{ animationDelay: "100ms" }}>
          <div className="relative transition-transform duration-300 hover:scale-[1.03]">
            <svg 
              className="w-[150px] h-[150px] text-neutral-800" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Vertical & Horizontal alignment/cutting guidelines */}
              <line x1="50" y1="4" x2="50" y2="96" stroke="rgba(0,0,0,0.08)" strokeWidth="0.7" strokeDasharray="4 4" />
              <line x1="4" y1="50" x2="96" y2="50" stroke="rgba(0,0,0,0.08)" strokeWidth="0.7" strokeDasharray="4 4" />
              
              {/* Bias corner cutting guidelines */}
              <line x1="16" y1="16" x2="84" y2="84" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" strokeDasharray="6 6" />
              <line x1="84" y1="16" x2="16" y2="84" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" strokeDasharray="6 6" />

              {/* T-Shirt Silhouette Outline with exquisite, thin craftsman line representation */}
              <path 
                d="M 36,25 C 42,28 58,28 64,25 L 78,30 L 82,42 L 72,46 L 70,44 L 70,75 L 30,75 L 30,44 L 28,46 L 18,42 L 22,30 Z" 
                stroke="#18181b" 
                strokeWidth="1.8" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* Seamless double knit lines along hem and neck */}
              {/* Hem Stitch */}
              <path d="M 30,71 L 70,71" stroke="#52525b" strokeWidth="0.8" strokeDasharray="2 2" />
              <path d="M 30,72.5 L 70,72.5" stroke="#52525b" strokeWidth="0.8" strokeDasharray="2 2" />
              
              {/* Neckline Stitch */}
              <path d="M 37.5,27.5 C 43,30 57,30 62.5,27.5" stroke="#71717a" strokeWidth="0.8" strokeDasharray="2 1.5" />

              {/* Sleeve Hem Stitch */}
              <path d="M 74.5,33 L 79,40.5" stroke="#71717a" strokeWidth="0.8" strokeDasharray="2 2" />
              <path d="M 25.5,33 L 21,40.5" stroke="#71717a" strokeWidth="0.8" strokeDasharray="2 2" />

              {/* Red Measurement callout indicating pattern precision */}
              <line x1="30" y1="56" x2="70" y2="56" stroke="#b91c1c" strokeWidth="0.8" strokeDasharray="2 1" />
              <circle cx="30" cy="56" r="1.5" fill="#b91c1c" />
              <circle cx="70" cy="56" r="1.5" fill="#b91c1c" />

              {/* Tailor Scissors trimming the pattern sleeve */}
              <g transform="translate(68, 12) scale(0.8)" stroke="#52525b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                {/* Sleek Minimalist Scissors representation */}
                {/* Left ring handle */}
                <circle cx="6" cy="8" r="2" />
                {/* Right ring handle */}
                <circle cx="6" cy="14" r="2" />
                {/* Pivoting pin */}
                <circle cx="10" cy="11" r="0.8" fill="#18181b" />
                {/* Top cutting blade */}
                <path d="M 8,9.5 L 20,13.5" />
                {/* Bottom cutting blade */}
                <path d="M 8,12.5 L 20,8.5" opacity="0.9" />
              </g>

              {/* Chalk Mark tracing indicators around neckline/shoulder */}
              <path d="M 35,21 C 41,18 45,18 49,21" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            </svg>
          </div>
        </div>

        {/* Headline matching screenshot "How are you feeling?" style */}
        <h1 className="font-sans text-3xl md:text-[38px] font-medium text-neutral-900 tracking-tight mb-8 animate-fadeIn">
          How should we craft your apparel?
        </h1>

        {/* Dynamic Compact Conversation Panel - Matching screenshot design exactly */}
        <div className="w-full bg-[#f4f3ef]/90 backdrop-blur-2xl rounded-[28px] border border-white/40 shadow-[0_24px_64px_rgba(0,0,0,0.22)] p-5 md:p-6 flex flex-col font-sans transition-all duration-300 overflow-hidden relative group/card select-text">
          
          {/* Active AI Chat History log drawer (only shows when user has started chatting) */}
          {messages.length > 1 && (
            <div className="border-b border-black/[0.06] pb-4 mb-4 select-text">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-semibold flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 bg-neutral-900 rounded-full animate-pulse"></span>
                  <span>Seoul Line Directory</span>
                </span>
                <button
                  onClick={() => setMessages([messages[0]])}
                  className="p-1 text-neutral-400 hover:text-neutral-900 rounded transition duration-200"
                  title="Clear conversation"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              <div 
                ref={scrollRef}
                className="max-h-[160px] overflow-y-auto space-y-3.5 pr-1 text-xs text-left scrollbar-thin md:max-h-[220px]"
              >
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-[18px] px-3.5 py-2.5 leading-relaxed font-light ${
                      msg.role === "user"
                        ? "bg-neutral-900 text-white rounded-tr-none"
                        : "bg-white/90 text-neutral-800 shadow-3xs border border-white/50 rounded-tl-none whitespace-pre-wrap"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-white/60 text-neutral-400 max-w-[85%] rounded-[18px] px-3.5 py-2.5 shadow-3xs border border-white/50 rounded-tl-none flex items-center space-x-2">
                      <span className="flex space-x-1">
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-wider">Seoul Atelier Advising...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form wrapper */}
          <form onSubmit={handleSendMessage} className="w-full flex flex-col text-left">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="I want to manufacture technical knit T-shirts with a 3D hub in Seoul..."
              className="w-full min-h-[50px] md:min-h-[64px] bg-transparent resize-none border-0 outline-none focus:ring-0 text-sm md:text-base text-neutral-800 placeholder-neutral-500/80 font-light leading-relaxed select-text"
              disabled={isGenerating}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            {/* Inner Dashboard Controls footer panel matching reference screenshot exactly */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-black/[0.04]">
              
              {/* Analyze Image button on bottom left */}
              <button
                type="button"
                onClick={handleAnalyzeImage}
                className="inline-flex items-center space-x-2 bg-neutral-950/5 hover:bg-neutral-950/10 active:scale-[0.98] border border-neutral-950/[0.06] rounded-full px-4 py-2 transition duration-300 text-neutral-800 text-xs font-medium cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-neutral-700" />
                <span>Analyze sketch</span>
              </button>

              {/* Action utilities on bottom right */}
              <div className="flex items-center space-x-2">
                
                {/* Simulated Microphone voice clicker */}
                <button
                  type="button"
                  onClick={() => setChatInput("Describe the fabrics for custom streetwear production.")}
                  className="p-2.5 rounded-full hover:bg-neutral-950/5 text-neutral-600 hover:text-neutral-900 transition duration-300 cursor-pointer"
                  title="Voice dictation prompt"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Main Send arrow circular button */}
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isGenerating}
                  className={`p-2.5 rounded-full aspect-square flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    chatInput.trim() && !isGenerating
                      ? "bg-neutral-800 text-white hover:bg-neutral-900 hover:scale-105"
                      : "bg-neutral-200 text-neutral-400 opacity-60 pointer-events-none"
                  }`}
                >
                  <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                </button>

              </div>

            </div>

          </form>

        </div>

        {/* Bottom Translucent Overlapping Sage/Slate Pill buttons exactly matching the references */}
        <div className="mt-8 flex flex-col items-center gap-3 w-full select-none">
          
          {/* Pill 1: "Connect with a clinician" style -> Click to communicate with Dongdaemun ateliers */}
          <button 
            onClick={() => handleQuickCommand("Let me connect with a master tailor in Dongdaemun.")}
            className="w-full max-w-[340px] inline-flex items-center justify-between bg-emerald-950/65 hover:bg-emerald-950/80 text-white/95 backdrop-blur-md rounded-full px-4 py-3 border border-white/10 transition duration-300 text-xs tracking-wide cursor-pointer text-left hover:scale-[1.01]"
          >
            <div className="flex items-center space-x-3">
              {/* Overlap active user avatar bubbles */}
              <div className="flex -space-x-2">
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=40&h=40" 
                  alt="Kim Seo-young"
                  className="w-5 h-5 rounded-full object-cover border border-emerald-900"
                  referrerPolicy="no-referrer"
                />
                <img 
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=40&h=40" 
                  alt="Park Master"
                  className="w-5 h-5 rounded-full object-cover border border-emerald-900"
                  referrerPolicy="no-referrer"
                />
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=40&h=40" 
                  alt="Chung Fabric Sourcing"
                  className="w-5 h-5 rounded-full object-cover border border-emerald-900"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-light">Connect with a seoul tailor</span>
            </div>
            <span className="text-[10px] font-mono opacity-60">ATELIER</span>
          </button>

          {/* Pill 2: "Explore common conditions" style -> Explore raw materials sourcing */}
          <button 
            onClick={() => handleQuickCommand("What premium organic bio-knit fabrics are available?")}
            className="w-full max-w-[340px] inline-flex items-center justify-between bg-zinc-900/60 hover:bg-zinc-800/75 text-white/90 backdrop-blur-md rounded-full px-5 py-3 border border-white/10 transition duration-300 text-xs tracking-wide cursor-pointer text-left hover:scale-[1.01]"
          >
            <div className="flex items-center space-x-2.5">
              <Search className="w-3.5 h-3.5 text-white/65" />
              <span className="font-light">Explore premium tech-fabrics</span>
            </div>
            <span className="text-[10px] font-mono opacity-60">FABRIC MAP</span>
          </button>

          {/* Pill 3: "Get prescriptions" look -> Sample swatch & order custom calipers sizing tool */}
          <button 
            onClick={onPreOrderClick}
            className="w-full max-w-[340px] inline-flex items-center justify-between bg-[#4a504a]/60 hover:bg-[#4a504a]/75 text-white/90 backdrop-blur-md rounded-full px-5 py-3 border border-white/10 transition duration-300 text-xs tracking-wide cursor-pointer text-left hover:scale-[1.01]"
          >
            <div className="flex items-center space-x-2.5">
              <span className="p-0.5 rounded-full bg-white/15">
                <Ruler className="w-3.5 h-3.5 text-white/80" />
              </span>
              <span className="font-light">Get custom size physical caliper</span>
            </div>
            <span className="text-[10px] font-mono opacity-60">ORDER SAMPLE</span>
          </button>

        </div>

      </div>

      {/* Acoustic bottom bar lines */}
      <div className="relative z-10 w-full max-w-[800px] mt-12 flex justify-between items-center text-neutral-900 font-mono text-[9px] uppercase tracking-[0.15em] select-none">
        <span>EST. SEW TIME: 4-6 DAYS</span>
        <span>SEOUL ATELIER DIRECT</span>
      </div>

    </section>
  );
}
