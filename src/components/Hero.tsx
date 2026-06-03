import React, { useState, useEffect, useRef } from "react";
import { Camera, Mic, ArrowUp, RefreshCw, Search, Ruler, ChevronLeft, ChevronRight, Shirt, Award, Layers, Sparkles, Check, History } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import QuoteModal from "./QuoteModal";

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
    headline: "30년 마스터 장인의 봉제정신, 회사 소개",
    sub: "KOREA APPAREL WORKS • PHILOSOPHY"
  },
  {
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1600",
    headline: "완벽한 디테일과 한계 없는 라인업, 제품 소개",
    sub: "SIGNATURE ATELIER PRODUCT COLLECTION"
  }
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
  // Chat States
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
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

  const handleQuoteSubmit = (email: string, country: string) => {
    localStorage.setItem("kaw_quote_email", email);
    localStorage.setItem("kaw_quote_country", country);
    localStorage.setItem("kaw_quote_submitted", "true");
    setIsQuoteFormSubmitted(true);
    setIsQuoteModalOpen(false);
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
    <section className={`relative w-full flex flex-col justify-center items-center overflow-hidden z-10 px-4 md:px-8 transition-all duration-500 ${
      currentSlide === 0 
        ? (messages.length > 1 ? "min-h-[100vh] pt-24 pb-20" : "min-h-[128vh] pt-28 pb-[324px]") 
        : "min-h-[100vh] py-20"
    }`}>
      
      {/* Background Solid Canvas with seamless transitions */}
      <div className="absolute inset-0 z-0">
        {SLIDES.map((slide, index) => {
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out bg-[#0A0A0C] ${
                index === currentSlide ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Subtle architectural grid lines evoking sewing pattern drafting paper */}
              <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]"></div>
              
              {/* Elegant fine margin lines representing professional atelier templates */}
              <div className="absolute inset-x-12 top-0 bottom-0 border-x border-white/[0.06]" />
            </div>
          );
        })}
      </div>
      
      {/* Floating Left and Right side buttons for desktop & tablet */}
      <button
        onClick={handlePrevSlide}
        className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-neutral-200 flex items-center justify-center transition-all duration-300 backdrop-blur-xs cursor-pointer group shadow-xs"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={handleNextSlide}
        className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-neutral-200 flex items-center justify-center transition-all duration-300 backdrop-blur-xs cursor-pointer group shadow-xs"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Main Responsive Layout Box */}
      <div className={`relative z-10 w-full flex flex-col items-center justify-center text-center px-4 select-none transition-all duration-500 ${
        (currentSlide === 0 && messages.length > 1) ? "max-w-[1400px] my-auto" : "max-w-4xl mt-auto"
      }`}>
        
        {/* Dynamic visual transition wrapper providing robust in-place crossfade (dissolve) feel */}
        <AnimatePresence mode="wait">
          {currentSlide === 0 && (
            <motion.div
              key="slide-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
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
                  className="absolute -top-[260px] left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none transition-all duration-700 select-none animate-fadeIn"
                >
                  {/* T-Shirt Model (Right) */}
                  <div className="w-[120px] h-[120px] flex items-center justify-center">
                    <img 
                      src="https://raw.githubusercontent.com/2green-lee/Korea-Apparel-Works/f76783eb4d5cfc7d3530a1fedd7db576efa0d0ff/free-icon-clothes-7640468.png" 
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
                  : "w-full md:w-[700px] h-[160px]"
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
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="We excel in crafting bespoke apparel and tops with premium-grade fabrics. Tell us what you want to make..."
                    className={`w-full bg-transparent resize-none border-0 outline-none focus:ring-0 text-sm md:text-base text-white placeholder-neutral-400/50 font-light leading-relaxed select-text ${messages.length > 1 ? "h-[54px]" : "flex-1 pb-4"}`}
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
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full flex flex-col items-center justify-center md:-translate-y-20 relative"
            >
              {/* Navigation Dot Indicators on top of conversation panel */}
              <div className="flex space-x-2.5 mb-5">
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

              <div className="mb-8">
                <h1 className="font-sans text-3xl md:text-[38px] font-medium text-white tracking-tight">
                  {SLIDES[1].headline}
                </h1>
              </div>

              <div className="w-full flex flex-col font-sans text-left relative select-text">
                {/* Split Grid for Company Info (No heavy card, beautifully laid out directly over clean white canvas) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
                  {/* Left Column (Brand Mission Statement & Details) */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center space-x-2 border-b border-white/10 pb-1.5">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest font-bold">
                        KOREA APPAREL WORKS • HERITAGE
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">ESTD 1994</span>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-white leading-tight">
                      대한민국 최고 수준의 명품 의류가 탄생하는 고집스러운 공간, 아틀리에 에코시스템
                    </h3>

                    <p className="text-neutral-300 font-light leading-relaxed text-sm md:text-base">
                      Korea Apparel Works는 서울 동대문과 역사 깊은 창신동 봉제 단지를 혁신적인 마이크로 생산 스마트 체인으로 융합하는 프리미엄 어패럴 아틀리에입니다. 30년 넘게 세계적인 패션 감각과 원단의 호흡을 파고든 <strong className="font-semibold text-white">대한민국의 봉제 장인</strong>들이 모든 옷의 실루엣을 전담 설계합니다.
                    </p>

                    <p className="text-neutral-400 font-light leading-relaxed text-xs md:text-sm">
                      저희는 프리미엄 어깨 체인 스티치 보강부터, 뒤틀림을 원상 복구하는 특수 컴팩트 피니싱 저지까지, 가공 표준에 있어서 절대 타협하지 않는 정교함을 자랑합니다. 구상 단계의 아이디어 스케치나 3D 그래픽 Blueprint 전용 가공 설계팀을 통해 가장 이상적인 완제품 피트로 이끕니다.
                    </p>
                  </div>

                  {/* Right Column (Key highlights with clean minimalist cards) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col justify-between transition hover:border-white/10">
                      <div className="flex items-center space-x-2 text-neutral-200 font-medium text-xs mb-1.5">
                        <Award className="w-4 h-4 text-neutral-400" strokeWidth={1.8} />
                        <span>30년 장인 정신 (Master Sewing)</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 font-light leading-snug">
                        실형제작사 및 서울 동대문 명가로 인정받아 온 장인들이 가봉 과정부터 직접 바느질하며 미세 각도를 수동으로 보정합니다.
                      </p>
                    </div>

                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col justify-between transition hover:border-white/10">
                      <div className="flex items-center space-x-2 text-neutral-200 font-medium text-xs mb-1.5">
                        <Layers className="w-4 h-4 text-neutral-400" strokeWidth={1.8} />
                        <span>친환경 하이 테크 소재 (Premium Tech)</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 font-light leading-snug">
                        GOTS 유기농 최고인증 면사 및 보풀을 방지하는 특수 엔자임 소프트 하이브리드 편직 기술을 바탕으로 직조 원단을 가공해 공급합니다.
                      </p>
                    </div>

                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col justify-between transition hover:border-white/10">
                      <div className="flex items-center space-x-2 text-neutral-200 font-medium text-xs mb-1.5">
                        <Sparkles className="w-4 h-4 text-neutral-400" strokeWidth={1.8} />
                        <span>로컬 마이크로 팩토리 (HQ Seoul)</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 font-light leading-snug">
                        기존 대형 공장이 외면하는 최소 30개 단위의 Low MOQ 스페셜 생산을 완벽히 수용하여, 디자이너 브랜드의 낭비 없는 스케일업을 돕습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentSlide === 2 && (
            <motion.div
              key="slide-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full flex flex-col items-center justify-center md:-translate-y-20 relative"
            >
              {/* Navigation Dot Indicators on top of conversation panel */}
              <div className="flex space-x-2.5 mb-5">
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

              <div className="mb-8">
                <h1 className="font-sans text-3xl md:text-[38px] font-medium text-white tracking-tight">
                  {SLIDES[2].headline}
                </h1>
              </div>

              <div className="w-full flex flex-col font-sans text-left relative select-text">
                {/* Elegant grid catalog layout showing distinct high-end items on white canvas */}
                <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] font-mono text-neutral-300 uppercase tracking-widest font-bold flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    <span>Atelier Premium Line • 제품 소개</span>
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">MICRO SEWING BLUEPRINTS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Product 1 */}
                  <div className="bg-white/5 hover:bg-white/10 rounded-2xl p-5 border border-white/5 transition duration-300 flex flex-col justify-between shadow-2xs">
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-3 text-neutral-200">
                        <Shirt className="w-5 h-5 text-neutral-300" strokeWidth={1.5} />
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-1.5">시그니처 아틀리에 후디</h4>
                      <p className="text-xs text-neutral-400 font-light leading-relaxed mb-4">
                        480gsm 프리미엄 고밀도 코튼 루프백 프렌치테리를 사용하여 완벽하게 드롭되는 고유의 입체 실루엣과 보온성을 보장합니다.
                      </p>
                    </div>
                    <div className="border-t border-white/5 pt-3.5 mt-auto">
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                        <span>MOQ: 30장</span>
                        <span className="text-neutral-200 font-semibold">M - XXL</span>
                      </div>
                    </div>
                  </div>

                  {/* Product 2 */}
                  <div className="bg-white/5 hover:bg-white/10 rounded-2xl p-5 border border-white/5 transition duration-300 flex flex-col justify-between shadow-2xs">
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-3 text-neutral-200">
                        <Shirt className="w-5 h-5 text-neutral-300" strokeWidth={1.2} />
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-1.5">컴팩트 무결점 T-Shirt</h4>
                      <p className="text-xs text-neutral-400 font-light leading-relaxed mb-4">
                        280gsm 콤팩트 싱글 코튼 편직으로 세탁 변형률을 1% 미만으로 설계하고, 어깨 체인 스티치와 조밀한 이중 립 마감을 적용했습니다.
                      </p>
                    </div>
                    <div className="border-t border-white/5 pt-3.5 mt-auto">
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                        <span>MOQ: 50장</span>
                        <span className="text-neutral-200 font-semibold">S - XL</span>
                      </div>
                    </div>
                  </div>

                  {/* Product 3 */}
                  <div className="bg-white/5 hover:bg-white/10 rounded-2xl p-5 border border-white/5 transition duration-300 flex flex-col justify-between shadow-2xs">
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-3 text-neutral-200">
                        <Layers className="w-5 h-5 text-neutral-300" strokeWidth={1.5} />
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-1.5">테크니컬 시티쉘 재킷</h4>
                      <p className="text-xs text-neutral-400 font-light leading-relaxed mb-4">
                        방풍·방수가 적용된 메모리 리사이클 나일론 원사로, 도시적 입체 슬리브 구조와 고정밀 심 실링 스티치 처리가 돋보입니다.
                      </p>
                    </div>
                    <div className="border-t border-white/5 pt-3.5 mt-auto">
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                        <span>MOQ: 30장</span>
                        <span className="text-neutral-200 font-semibold">M - XL</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                  <span className="text-[10.5px] text-neutral-400 font-light font-mono text-center sm:text-left">
                    * 전 제품 맞춤 패브릭 선정, 컬러 다잉 가공 및 디렉션 컨설팅 지원 가능
                  </span>
                  <button
                    onClick={onPreOrderClick}
                    className="bg-white hover:bg-neutral-100 active:scale-95 text-neutral-950 text-xs uppercase tracking-wider px-5 py-2.5 rounded-full font-medium cursor-pointer transition duration-200 w-full sm:w-auto text-center animate-pulse"
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

