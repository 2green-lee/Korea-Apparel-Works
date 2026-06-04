import React, { useState, useEffect, useRef } from "react";
import { Camera, Mic, ArrowUp, RefreshCw, Search, Ruler, ChevronLeft, ChevronRight, Shirt, Award, Layers, Sparkles, Check, History, MessageSquare, FileText, Truck, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import QuoteModal from "./QuoteModal";
import tshirtIcon from "./free-icon-clothes-7640468.png";

interface HeroProps {
  onPreOrderClick: () => void;
  currentSlide: number;
  setCurrentSlide: React.Dispatch<React.SetStateAction<number>> | ((slide: number | ((prev: number) => number)) => void);
  messages: { role: "user" | "model"; text: string }[];
  setMessages: React.Dispatch<React.SetStateAction<{ role: "user" | "model"; text: string }[]>>;
  savedChats: { role: "user" | "model"; text: string }[][];
  onClearChat: () => void;
  onRestoreChat: (index: number) => void;
}

const SLIDES = [
  {
    image: "https://raw.githubusercontent.com/2green-lee/Korea-Apparel-Works/985e971f768279fbef9d02d7d6d295c01131f761/downtown-cityscape-night-seoul-south-korea.jpg",
    headline: "Get a manufacturing quote.",
    sub: "AI CONVERSATION PORTAL"
  },
  {
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1600",
    headline: "The philosophy of 30-year artisans, Our Story",
    sub: "KOREA APPAREL WORKS • PHILOSOPHY"
  },
  {
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1600",
    headline: "Flawless details and limitless lineup, Product Collection",
    sub: ""
  }
];

const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524295981966-265647c05315?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=2070&auto=format&fit=crop"
];

const getChatLabel = (chat: { role: "user" | "model"; text: string }[]) => {
  const firstUserMsg = chat.find(m => m.role === "user");
  if (firstUserMsg) {
    const text = firstUserMsg.text;
    if (text.length > 10) {
      return text.slice(0, 10).trim() + "...";
    }
    return text;
  }
  return "Saved Chat";
};

export default function Hero({ 
  onPreOrderClick, 
  currentSlide, 
  setCurrentSlide, 
  messages, 
  setMessages,
  savedChats,
  onClearChat,
  onRestoreChat
}: HeroProps) {
  // Master Sewing replacement Carousel State
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Chat States
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const generationIdRef = useRef(0);

  // Quote Intercept States
  const [isQuoteFormSubmitted, setIsQuoteFormSubmitted] = useState<boolean>(() => {
    return localStorage.getItem("kaw_quote_submitted") === "true";
  });
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Auto-scroll chat interactions
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  // Adjust textarea height dynamically based on user input content lines
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = textarea.scrollHeight;
      if (messages.length > 1) {
        // Enforce a sensible max height during active conversation to keep prompt layout balanced
        textarea.style.height = `${Math.min(Math.max(newHeight, 38), 180)}px`;
      } else {
        // Landing state allows more generous single-session space
        textarea.style.height = `${Math.min(Math.max(newHeight, 52), 300)}px`;
      }
    }
  }, [chatInput, messages.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isGenerating) return;

    const userMsg = chatInput.trim();
    setChatInput("");

    // Check if first real user message
    const isFirstConversationTurn = messages.length === 1;

    generationIdRef.current += 1;
    const currentId = generationIdRef.current;

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsGenerating(true);

    // If first turn and quota not submitted, popup the modal after a tiny delay
    if (isFirstConversationTurn && !isQuoteFormSubmitted) {
      setTimeout(() => {
        if (currentId === generationIdRef.current) {
          setIsQuoteModalOpen(true);
        }
      }, 1200);
    }

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
      if (currentId !== generationIdRef.current) return;

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
      if (currentId !== generationIdRef.current) return;
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Communication offline. Make sure the server is booted up and try again."
        }
      ]);
    } finally {
      if (currentId === generationIdRef.current) {
        setIsGenerating(false);
      }
    }
  };

  const handleQuoteSubmit = async (email: string, country: string) => {
    localStorage.setItem("kaw_quote_email", email);
    localStorage.setItem("kaw_quote_country", country);
    localStorage.setItem("kaw_quote_submitted", "true");
    setIsQuoteFormSubmitted(true);
    setIsQuoteModalOpen(false);

    try {
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "quote",
          email: email,
          country: country,
          createdAt: new Date().toISOString()
        })
      });
    } catch (e) {
      console.error("Failed to send quote request to persistent server:", e);
    }
  };

  const handleQuickCommand = async (promptText: string) => {
    if (isGenerating) return;

    const isFirstConversationTurn = messages.length === 1;

    generationIdRef.current += 1;
    const currentId = generationIdRef.current;

    setMessages((prev) => [...prev, { role: "user", text: promptText }]);
    setIsGenerating(true);

    if (isFirstConversationTurn && !isQuoteFormSubmitted) {
      setTimeout(() => {
        if (currentId === generationIdRef.current) {
          setIsQuoteModalOpen(true);
        }
      }, 1200);
    }

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
      if (currentId !== generationIdRef.current) return;

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
      if (currentId !== generationIdRef.current) return;
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Communication offline. Please check that the server is active."
        }
      ]);
    } finally {
      if (currentId === generationIdRef.current) {
        setIsGenerating(false);
      }
    }
  };

  const handleAnalyzeImage = () => {
    if (isGenerating) return;

    const isFirstConversationTurn = messages.length === 1;

    generationIdRef.current += 1;
    const currentId = generationIdRef.current;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: "[Upload Sketch] Analyzed custom apparel design." }
    ]);
    setIsGenerating(true);

    if (isFirstConversationTurn && !isQuoteFormSubmitted) {
      setTimeout(() => {
        if (currentId === generationIdRef.current) {
          setIsQuoteModalOpen(true);
        }
      }, 1200);
    }

    // Mock analysis response
    setTimeout(() => {
      if (currentId !== generationIdRef.current) return;
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "I have analyzed your garment sketch! Our Seoul-based veteran tailors can build an accurate digital production pattern for this item using high-grade sustainable cotton-combed jersey. Our minimum order quantity starts at just 30 pieces. Would you like to request physical sample swatches?" }
      ]);
      setIsGenerating(false);
    }, 1000);
   };

  return (
    <section className={`relative w-full flex flex-col justify-center items-center overflow-x-hidden overflow-y-visible z-10 px-4 md:px-8 transition-all duration-500 min-h-[100vh] py-20`}>
      
      {/* Background Solid Canvas with seamless transitions */}
      <div className="absolute inset-0 z-0 h-full w-full">
        {/* Night mode background (Slide 0) */}
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out bg-[#0A0A0C] ${
            currentSlide === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Subtle architectural grid lines evoking sewing pattern drafting paper */}
          <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>

        {/* Day mode background (Slide 1 and 2) */}
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out bg-white ${
            currentSlide > 0 ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />
      </div>
      
      {/* Floating Left and Right side buttons for desktop & tablet */}
      <button
        onClick={handlePrevSlide}
        className={`fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full active:scale-95 border flex items-center justify-center transition-all duration-300 backdrop-blur-xs cursor-pointer group shadow-sm ${
          currentSlide === 0
            ? "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-200 hover:text-white"
            : "bg-neutral-950/5 hover:bg-neutral-950/10 border-neutral-200 text-neutral-700 hover:text-neutral-950 shadow-xs"
        }`}
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={handleNextSlide}
        className={`fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full active:scale-95 border flex items-center justify-center transition-all duration-300 backdrop-blur-xs cursor-pointer group shadow-sm ${
          currentSlide === 0
            ? "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-200 hover:text-white"
            : "bg-neutral-950/5 hover:bg-neutral-950/10 border-neutral-200 text-neutral-700 hover:text-neutral-950 shadow-xs"
        }`}
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Main Responsive Layout Box */}
      <div className={`relative z-10 w-full flex flex-col items-center justify-center text-center px-4 select-none transition-all duration-500 ${
        (currentSlide === 0 && messages.length > 1) ? "max-w-[1400px] my-auto" : "max-w-[1100px] my-auto mt-24 lg:mt-32 mb-16"
      }`}>
        
        {/* Dynamic visual transition wrapper providing robust in-place crossfade (dissolve) feel */}
        <AnimatePresence mode="wait">
          {currentSlide === 0 && (
            <motion.div
              key="slide-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full flex flex-col items-center justify-center relative"
            >
              {/* Navigation Dot Indicators on top of conversation panel */}
              {messages.length === 1 && (
                <div className="flex space-x-2.5 mb-5 select-none">
                  {SLIDES.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                        index === currentSlide ? "w-6 bg-white" : "w-1.5 bg-white/20 hover:bg-white/40"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Minimalist Tech-Atelier drafting T-shirt Icon - Only rendered on primary home slide */}
              {messages.length === 1 && (
                <div 
                  id="tshirt-section" 
                  className="mb-6 flex items-center justify-center pointer-events-none transition-all duration-700 select-none animate-fadeIn"
                >
                  {/* T-Shirt Model (Right) */}
                  <div className="w-[120px] h-[120px] flex items-center justify-center">
                    <img 
                      src={tshirtIcon} 
                      alt="Atelier T-Shirt Model" 
                      className="w-full h-full object-contain filter invert opacity-100 drop-shadow-[0_8px_16px_rgba(255,255,255,0.1)]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}

              {/* Headline matching screenshot "How should we craft..." style */}
              {messages.length === 1 && (
                <div className="mb-8 select-none">
                  <h1 className="font-sans text-3xl md:text-[38px] font-medium text-white tracking-tight">
                    {SLIDES[0].headline}
                  </h1>
                  <p className="mt-3 text-neutral-400 font-sans text-sm md:text-base max-w-[540px] mx-auto font-light leading-relaxed">
                    Tell us what you'd like to make — fabric, quantity, style. We'll send a proposal within 24h.
                  </p>
                </div>
              )}

              {/* Dynamic Compact Panels */}
              <div className={`w-full bg-neutral-900/80 backdrop-blur-2xl rounded-[28px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 flex flex-col font-sans transition-all duration-500 overflow-hidden relative group/card select-text ${
                messages.length > 1 
                  ? "w-full max-w-[1400px] h-[80vh] min-h-[600px] xl:h-[800px]" 
                  : "w-full md:w-[700px] min-h-[160px] h-auto"
              }`}>
                {/* Active AI Chat History log drawer (only shows when user has started chatting) */}
                {messages.length > 1 && (
                  <div className="border-b border-white/5 pb-4 mb-4 select-text flex flex-col flex-1 min-h-0">
                    <div 
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto space-y-4 pr-1 text-[12px] text-left scrollbar-thin pb-2"
                    >
                      {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] sm:max-w-[75%] rounded-[18px] px-4 py-3 leading-relaxed font-light ${
                            msg.role === "user"
                              ? "bg-white text-black rounded-tr-none font-medium"
                              : "bg-white/10 text-neutral-200 shadow-3xs border border-white/5 rounded-tl-none whitespace-pre-wrap"
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}

                      {isGenerating && (
                        <div className="flex justify-start animate-pulse">
                          <div className="bg-white/5 text-neutral-400 max-w-[85%] rounded-[18px] px-4 py-3 shadow-3xs border border-white/5 rounded-tl-none flex items-center space-x-2">
                            <span className="flex space-x-1">
                              <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                              <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                              <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"></span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Form wrapper */}
                <form onSubmit={handleSendMessage} className={`w-full flex flex-col justify-between text-left ${messages.length > 1 ? "h-auto shrink-0 pt-2" : "flex-1 h-full"}`}>
                  <textarea
                    ref={textareaRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="We excel in crafting bespoke apparel and tops with premium-grade fabrics. Tell us what you want to make..."
                    className="w-full bg-transparent resize-none overflow-hidden border-0 outline-none focus:ring-0 text-sm md:text-base text-white placeholder-neutral-400/50 font-light leading-relaxed select-text min-h-[38px] pb-2"
                    disabled={isGenerating}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />

                  {/* Inner Dashboard Controls footer panel matching reference screenshot exactly */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center space-x-2.5">
                      {/* Analyze Image button on bottom left */}
                      <button
                        type="button"
                        onClick={handleAnalyzeImage}
                        className="inline-flex items-center space-x-2 bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 rounded-full px-4 py-2 transition duration-300 text-neutral-200 text-xs font-medium cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Upload</span>
                      </button>

                      {/* Clear conversation button */}
                      {messages.length > 1 && (
                        <button
                          onClick={onClearChat}
                          type="button"
                          className="inline-flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 hover:text-white active:scale-[0.98] border border-white/10 rounded-full px-4 py-2 transition duration-300 text-neutral-400 text-xs font-medium cursor-pointer"
                          title="Back home"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Back home</span>
                        </button>
                      )}

                      {/* Restore conversation buttons */}
                      {messages.length === 1 && savedChats && savedChats.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {savedChats.map((chat, idx) => {
                            const label = getChatLabel(chat);
                            const fullText = chat.find(m => m.role === "user")?.text || "Untitled Chat";
                            return (
                              <button
                                key={idx}
                                onClick={() => onRestoreChat(idx)}
                                type="button"
                                className="inline-flex items-center space-x-1 bg-neutral-900/60 hover:bg-neutral-800 border border-white/10 hover:border-white/20 rounded-full px-3 py-1.5 transition duration-300 text-neutral-300 hover:text-white text-xs font-normal cursor-pointer select-none max-w-[150px] shadow-[0_0_12px_rgba(255,255,255,0.02)]"
                                title={fullText}
                              >
                                <History className="w-3 h-3 text-neutral-500 shrink-0" />
                                <span className="truncate">{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Action utilities on bottom right */}

                    <div className="flex items-center space-x-2">
                      {/* Simulated Microphone voice clicker */}
                      <button
                        type="button"
                        onClick={() => setChatInput("Describe the fabrics for custom streetwear production.")}
                        className="p-2.5 rounded-full hover:bg-white/5 text-neutral-400 hover:text-white transition duration-300 cursor-pointer"
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
                            ? "bg-white text-black hover:bg-neutral-200 hover:scale-105"
                            : "bg-neutral-800 text-neutral-600 opacity-60 pointer-events-none"
                        }`}
                      >
                        <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {currentSlide === 1 && (
            <motion.div
              key="slide-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full flex flex-col items-center justify-center relative"
            >
              {/* Navigation Dot Indicators on top of conversation panel */}
              <div className="flex space-x-2.5 mb-5 md:-mt-8">
                {SLIDES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                      index === currentSlide ? "w-6 bg-neutral-950" : "w-1.5 bg-neutral-950/20 hover:bg-neutral-950/40"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <div className="w-full flex flex-col font-sans text-left relative select-text bg-transparent border border-transparent rounded-none overflow-hidden">
                {/* Hero Section */}
                <div className="pt-16 pb-12 px-8 md:px-12 border-b border-neutral-100/55 w-full bg-transparent flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                  <div className="flex-1 w-full lg:pr-4">
                    <div className="text-xs md:text-sm font-mono font-semibold tracking-[0.1em] text-neutral-400 mb-3 uppercase">
                      KOREA APPAREL WORKS • HERITAGE | ESTD 1994
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-neutral-950 leading-[1.2] tracking-tight mb-6">
                      The uncompromising space where Korea's finest luxury garments are born,<br className="hidden lg:block lg:mb-2" />
                      The Workshop
                    </h1>
                    <p className="text-[15px] text-neutral-600 leading-relaxed max-w-2xl font-light">
                      Korea Apparel Works is a premium apparel workshop that fuses Busan's historic garment district with an innovative micro-production smart chain. Korea's master tailors, who have honed their global fashion sensibilities and deep understanding of fabrics for over 30 years, exclusively design the silhouette of every garment.
                    </p>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="w-full aspect-[16/9] lg:aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200/60 relative group bg-neutral-100">
                      <img 
                        src="https://images.unsplash.com/photo-1556905200-279565513a2d?q=80&w=2070&auto=format&fit=crop" 
                        alt="Korea Apparel Works Sewing Facility" 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                        crossOrigin="anonymous" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 md:p-8 w-full border-b border-neutral-100/55 bg-transparent">
                  <div className="p-6 md:p-8 rounded-2xl bg-white border border-neutral-200/60 flex flex-col justify-center transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-50/50 hover:-translate-y-0.5 group shadow-xs">
                    <div className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-widest mb-2">Heritage</div>
                    <div className="text-3xl md:text-4xl font-bold text-neutral-950 tracking-tight mb-1 group-hover:text-black transition-colors">30+</div>
                    <div className="text-xs text-neutral-500 font-light">Years in production</div>
                  </div>
                  <div className="p-6 md:p-8 rounded-2xl bg-white border border-neutral-200/60 flex flex-col justify-center transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-50/50 hover:-translate-y-0.5 group shadow-xs">
                    <div className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-widest mb-2">Scale</div>
                    <div className="text-3xl md:text-4xl font-bold text-neutral-950 tracking-tight mb-1 group-hover:text-black transition-colors">50pc</div>
                    <div className="text-xs text-neutral-500 font-light">Min. order quantity</div>
                  </div>
                  <div className="p-6 md:p-8 rounded-2xl bg-white border border-neutral-200/60 flex flex-col justify-center transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-50/50 hover:-translate-y-0.5 group shadow-xs">
                    <div className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-widest mb-2">Speed</div>
                    <div className="text-3xl md:text-4xl font-bold text-neutral-950 tracking-tight mb-1 group-hover:text-black transition-colors">14 days</div>
                    <div className="text-xs text-neutral-500 font-light">Sample turnaround</div>
                  </div>
                  <div className="p-6 md:p-8 rounded-2xl bg-white border border-neutral-200/60 flex flex-col justify-center transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-50/50 hover:-translate-y-0.5 group shadow-xs">
                    <div className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-widest mb-2">Origin</div>
                    <div className="text-3xl md:text-4xl font-bold text-neutral-950 tracking-tight mb-1 group-hover:text-black transition-colors">100%</div>
                    <div className="text-xs text-neutral-500 font-light">Made in Korea</div>
                  </div>
                </div>

                {/* Split Grid */}
                <div className="w-full py-16 px-8 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start border-b border-neutral-100 bg-transparent">
                  {/* Story */}
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-neutral-950 mb-6 font-sans">From one factory floor to a global platform</h2>
                    <div className="space-y-4 text-sm md:text-base text-neutral-600 leading-relaxed font-light">
                      <p>It started with my father. For over 30 years, he ran a garment manufacturing facility in Korea — producing premium men's polo shirts, golf wear, and performance collar tees with the kind of precision that only comes from decades of hands-on craft.</p>
                      <p>The factory had deep expertise and a loyal client base, but like many traditional manufacturers, it had never been connected to the global market. Orders came through local networks. The technology stayed the same. The world moved on.</p>
                      <p>Watching this, I saw an opportunity — not to replace what my father had built, but to open it up. Korea Apparel Works is the bridge between that 30 years of manufacturing heritage and the brands worldwide who are looking for exactly what we make.</p>
                    </div>
                  </div>
                  {/* Right Column */}
                  <div className="flex flex-col gap-10">
                    <div className="w-full aspect-[16/9] md:aspect-[3/2] rounded-2xl overflow-hidden border border-neutral-200/80 relative group bg-neutral-100">
                      {/* Carousel image list with crossfade transition */}
                      <div className="absolute inset-0 w-full h-full">
                        {CAROUSEL_IMAGES.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                              idx === activeImageIdx ? "opacity-100 z-10" : "opacity-0 z-0"
                            }`}
                          >
                            <img 
                              src={imgUrl} 
                              alt={`Atelier scene ${idx + 1}`} 
                              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700" 
                              crossOrigin="anonymous" 
                              referrerPolicy="no-referrer" 
                            />
                          </div>
                        ))}
                      </div>

                      {/* Slider Navigation Arrows - Hidden by default, visible on hover */}
                      <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIdx((prev) => (prev === 0 ? CAROUSEL_IMAGES.length - 1 : prev - 1));
                          }}
                          className="w-9 h-9 rounded-full bg-white/80 hover:bg-white active:scale-95 border border-neutral-200 text-neutral-800 flex items-center justify-center transition-all pointer-events-auto cursor-pointer shadow-xs"
                          aria-label="Previous Atelier Image"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIdx((prev) => (prev === CAROUSEL_IMAGES.length - 1 ? 0 : prev + 1));
                          }}
                          className="w-9 h-9 rounded-full bg-white/80 hover:bg-white active:scale-95 border border-neutral-200 text-neutral-800 flex items-center justify-center transition-all pointer-events-auto cursor-pointer shadow-xs"
                          aria-label="Next Atelier Image"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Bottom dot indicators overlay */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {CAROUSEL_IMAGES.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIdx(idx);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              idx === activeImageIdx ? "w-4 bg-neutral-950" : "w-1.5 bg-neutral-400/50"
                            }`}
                            aria-label={`Go to atelier image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs md:text-sm font-mono font-semibold tracking-[0.1em] text-neutral-400 mb-6 uppercase">Our timeline</div>
                      <div className="flex flex-col">
                        <div className="grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr] gap-4 py-5 border-b border-neutral-100">
                          <div className="text-[13px] font-medium font-mono text-neutral-400 pt-1">1994</div>
                          <div>
                            <h3 className="text-sm md:text-base font-bold text-neutral-950 mb-1">Factory founded</h3>
                            <p className="text-xs md:text-sm text-neutral-600 leading-[1.6] font-light">Started as a domestic garment manufacturer specializing in men's polo and golf wear.</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr] gap-4 py-5 border-b border-neutral-100">
                          <div className="text-[13px] font-medium font-mono text-neutral-400 pt-1">2000s</div>
                          <div>
                            <h3 className="text-sm md:text-base font-bold text-neutral-950 mb-1">ODM expertise built</h3>
                            <p className="text-xs md:text-sm text-neutral-600 leading-[1.6] font-light">Expanded into full ODM — pattern development, fabric sourcing, and sampling in-house.</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-[60px_1fr] md:grid-cols-[80px_1fr] gap-4 py-5">
                          <div className="text-[13px] font-medium font-mono text-neutral-400 pt-1">2024</div>
                          <div>
                            <h3 className="text-sm md:text-base font-bold text-neutral-950 mb-1">KAW launched</h3>
                            <p className="text-xs md:text-sm text-neutral-600 leading-[1.6] font-light">Relaunched as Korea Apparel Works to serve international brands with AI-assisted ordering.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Removed AI Tech Section to move to Slide 2 */}
              </div>
            </motion.div>
          )}

          {currentSlide === 2 && (
            <motion.div
              key="slide-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full flex flex-col items-center justify-center relative"
            >
              {/* Navigation Dot Indicators on top of conversation panel */}
              <div className="flex space-x-2.5 mb-5 md:-mt-8">
                {SLIDES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                      index === currentSlide ? "w-6 bg-neutral-950" : "w-1.5 bg-neutral-950/20 hover:bg-neutral-950/40"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <div className="w-full flex flex-col font-sans text-left relative select-text bg-transparent border border-transparent rounded-none p-4 md:p-0 overflow-hidden">
                {/* Embedded Big Title for slide 3 inside the content card */}
                <div className="mb-8 pb-6 border-b border-neutral-100">
                  <h1 className="font-sans text-3xl md:text-4xl font-semibold text-neutral-950 tracking-tight leading-tight">
                    {SLIDES[2].headline}
                  </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Product 1 */}
                  <div className="bg-white hover:bg-neutral-50/50 rounded-2xl p-6 md:p-8 border border-neutral-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center mb-5 transition-colors group-hover:bg-neutral-950 group-hover:text-white">
                        <Shirt className="w-5.5 h-5.5" strokeWidth={1.5} />
                      </div>
                      <h4 className="text-base font-bold text-neutral-950 mb-2.5">Signature Workshop Hoodie</h4>
                      <p className="text-sm text-neutral-600 font-light leading-relaxed mb-4">
                        Uses 480gsm premium high-density cotton loopback French terry to guarantee a perfect drape, unique 3D silhouette, and excellent warmth.
                      </p>
                    </div>
                    <div className="border-t border-neutral-100 pt-4.5 mt-auto">
                      <div className="flex items-center justify-between text-xs md:text-sm font-mono text-neutral-500">
                        <span>MOQ: 30장</span>
                        <span className="text-neutral-950 font-semibold">M - XXL</span>
                      </div>
                    </div>
                  </div>

                  {/* Product 2 */}
                  <div className="bg-white hover:bg-neutral-50/50 rounded-2xl p-6 md:p-8 border border-neutral-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center mb-5 transition-colors group-hover:bg-neutral-950 group-hover:text-white">
                        <Shirt className="w-5.5 h-5.5" strokeWidth={1.2} />
                      </div>
                      <h4 className="text-base font-bold text-neutral-950 mb-2.5">Compact Flawless T-Shirt</h4>
                      <p className="text-sm text-neutral-600 font-light leading-relaxed mb-4">
                        Designed with 280gsm compact single cotton knit for wash shrinkage under 1%, featuring shoulder chain stitching and a dense double rib finish.
                      </p>
                    </div>
                    <div className="border-t border-neutral-100 pt-4.5 mt-auto">
                      <div className="flex items-center justify-between text-xs md:text-sm font-mono text-neutral-500">
                        <span>MOQ: 50장</span>
                        <span className="text-neutral-950 font-semibold">S - XL</span>
                      </div>
                    </div>
                  </div>

                  {/* Product 3 */}
                  <div className="bg-white hover:bg-neutral-50/50 rounded-2xl p-6 md:p-8 border border-neutral-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center mb-5 transition-colors group-hover:bg-neutral-950 group-hover:text-white">
                        <Layers className="w-5.5 h-5.5" strokeWidth={1.5} />
                      </div>
                      <h4 className="text-base font-bold text-neutral-950 mb-2.5">Technical City Shell Jacket</h4>
                      <p className="text-sm text-neutral-600 font-light leading-relaxed mb-4">
                        Constructed from wind and water-resistant memory recycled nylon yarn, standing out with an urban 3D sleeve structure and high-precision seam sealing stitches.
                      </p>
                    </div>
                    <div className="border-t border-neutral-100 pt-4.5 mt-auto">
                      <div className="flex items-center justify-between text-xs md:text-sm font-mono text-neutral-500">
                        <span>MOQ: 30장</span>
                        <span className="text-neutral-950 font-semibold">M - XL</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Tech Section */}
                <div className="w-full py-12 px-6 md:px-10 bg-neutral-50 border border-neutral-200/80 rounded-2xl mt-12">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-10 items-start mb-10">
                    <div>
                      <h2 className="text-xl md:text-2xl font-semibold text-neutral-950 mb-3 leading-snug">AI-powered from inquiry to delivery</h2>
                      <p className="text-sm md:text-base text-neutral-600 leading-relaxed font-light">We've integrated AI across the entire production workflow — so international buyers can place orders in any language, get accurate quotes instantly, and track every step of production without picking up the phone.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {/* cards */}
                      <div className="p-6 border border-neutral-200 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100/80 flex items-center justify-center text-neutral-800 mb-4">
                          <MessageSquare className="w-5 h-5 text-neutral-700" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-base font-bold text-neutral-950 mb-2">AI inquiry</h3>
                        <p className="text-xs md:text-sm text-neutral-600 leading-[1.6] font-light">Describe what you need in natural language. Our assistant extracts specs automatically.</p>
                      </div>
                      <div className="p-6 border border-neutral-200 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100/80 flex items-center justify-center text-neutral-800 mb-4">
                          <FileText className="w-5 h-5 text-neutral-700" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-base font-bold text-neutral-950 mb-2">Smart quoting</h3>
                        <p className="text-xs md:text-sm text-neutral-600 leading-[1.6] font-light">Receive a detailed proposal within 24 hours based on your exact requirements.</p>
                      </div>
                      <div className="p-5 border border-neutral-200 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100/80 flex items-center justify-center text-neutral-800 mb-4">
                          <Truck className="w-5 h-5 text-neutral-700" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-base font-bold text-neutral-950 mb-2">Production tracking</h3>
                        <p className="text-xs md:text-sm text-neutral-600 leading-[1.6] font-light">Real-time updates from sample approval through to shipment confirmation.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-stretch border border-neutral-200 bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex-1 w-full md:w-auto p-6 text-center border-b md:border-b-0 md:border-r border-neutral-100 flex flex-col items-center justify-center">
                      <div className="text-xs md:text-sm font-mono text-neutral-400 tracking-widest mb-2">01</div>
                      <div className="text-sm md:text-base font-bold text-neutral-950 mb-1">Inquiry</div>
                      <div className="text-xs md:text-sm text-neutral-500 mb-2.5 font-light">Chat with AI</div>
                      <div className="mt-auto inline-block text-[11px] font-semibold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full">AI</div>
                    </div>
                    <div className="flex-1 w-full md:w-auto p-6 text-center border-b md:border-b-0 md:border-r border-neutral-100 flex flex-col items-center justify-center">
                      <div className="text-xs md:text-sm font-mono text-neutral-400 tracking-widest mb-2">02</div>
                      <div className="text-sm md:text-base font-bold text-neutral-950 mb-1">Proposal</div>
                      <div className="text-xs md:text-sm text-neutral-500 mb-2.5 font-light">Within 24h</div>
                      <div className="mt-auto inline-block text-[11px] font-semibold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full">AI</div>
                    </div>
                    <div className="flex-1 w-full md:w-auto p-6 text-center border-b md:border-b-0 md:border-r border-neutral-100 flex flex-col items-center justify-center">
                      <div className="text-xs md:text-sm font-mono text-neutral-400 tracking-widest mb-2">03</div>
                      <div className="text-sm md:text-base font-bold text-neutral-950 mb-1">Sample</div>
                      <div className="text-xs md:text-sm text-neutral-500 mb-2.5 font-light">14 day turnaround</div>
                      <div className="mt-auto inline-block text-[11px] font-semibold tracking-wider uppercase bg-neutral-100 text-neutral-700 border border-neutral-200 px-2.5 py-0.5 rounded-full">Handcraft</div>
                    </div>
                    <div className="flex-1 w-full md:w-auto p-6 text-center border-b md:border-b-0 md:border-r border-neutral-100 flex flex-col items-center justify-center">
                      <div className="text-xs md:text-sm font-mono text-neutral-400 tracking-widest mb-2">04</div>
                      <div className="text-sm md:text-base font-bold text-neutral-950 mb-1">Production</div>
                      <div className="text-xs md:text-sm text-neutral-500 mb-2.5 font-light">Full QC inspection</div>
                      <div className="mt-auto inline-block text-[11px] font-semibold tracking-wider uppercase bg-neutral-100 text-neutral-700 border border-neutral-200 px-2.5 py-0.5 rounded-full">Handcraft</div>
                    </div>
                    <div className="flex-1 w-full md:w-auto p-6 text-center flex flex-col items-center justify-center">
                      <div className="text-xs md:text-sm font-mono text-neutral-400 tracking-widest mb-2">05</div>
                      <div className="text-sm md:text-base font-bold text-neutral-950 mb-1">Shipment</div>
                      <div className="text-xs md:text-sm text-neutral-500 mb-2.5 font-light">Tracked delivery</div>
                      <div className="mt-auto inline-block text-[11px] font-semibold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full">AI</div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-100">
                  <span className="text-xs md:text-sm text-neutral-500 font-normal font-mono text-center sm:text-left">
                    * Custom fabric sourcing, color dyeing, and creative direction consulting available for all products
                  </span>
                  <button
                    onClick={onPreOrderClick}
                    className="bg-neutral-950 hover:bg-neutral-900 active:scale-95 text-white text-sm uppercase tracking-wider px-7 py-3.5 rounded-full font-bold cursor-pointer transition-all duration-200 w-full sm:w-auto text-center shadow-[0_8px_16px_rgba(0,0,0,0.1)]"
                  >
                    샘플 조율 신청하기
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Acoustic bottom bar lines */}
      <div className="relative z-10 w-full max-w-4xl mt-12 flex justify-between items-center text-neutral-400 font-mono text-[9px] uppercase tracking-[0.15em] select-none" />

      {/* Quote request form intercept modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => {
          setIsQuoteModalOpen(false);
          if (!isQuoteFormSubmitted) {
            generationIdRef.current += 1;
            setIsGenerating(false);
            setMessages([
              {
                role: "model",
                text: "Hello! I am your Korea Apparel Works virtual manufacture coordinator. Ask me about our 30-year veteran Korean sewing ateliers, premium technical fabrics, design pattern drafting, or low-MOQ (30pcs) luxury apparel services."
              }
            ]);
          }
        }}
        onSubmit={handleQuoteSubmit}
      />

    </section>
  );
}

