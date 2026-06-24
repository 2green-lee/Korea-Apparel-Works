import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Camera, Mic, ArrowUp, RefreshCw, Search, Ruler, ChevronLeft, ChevronRight, ChevronDown, Shirt, Award, Layers, Sparkles, Check, History, MessageSquare, FileText, Truck, User, Factory, Package, ShieldCheck, Zap, LineChart, Scissors, CheckCircle2, Plus, Minus } from "lucide-react";
import ExportMap from "./ExportMap";
import { AnimatePresence, motion } from "motion/react";
import tshirtIcon from "./free-icon-clothes-7640468.png";
import { supabase } from "../lib/supabase";

interface HeroProps {
  onPreOrderClick: () => void;
  currentSlide: number;
  setCurrentSlide: React.Dispatch<React.SetStateAction<number>> | ((slide: number | ((prev: number) => number)) => void);
  messages: { role: "user" | "model"; text: string; imageUrl?: string }[];
  setMessages: React.Dispatch<React.SetStateAction<{ role: "user" | "model"; text: string; imageUrl?: string }[]>>;
  savedChats: { role: "user" | "model"; text: string }[][];
  onClearChat: () => void;
  onRestoreChat: (index: number) => void;
  user: any;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenAccount: () => void;
}

import { useChat } from "../lib/useChat";

const SLIDES = [
  {
    image: "https://raw.githubusercontent.com/2green-lee/Korea-Apparel-Works/985e971f768279fbef9d02d7d6d295c01131f761/downtown-cityscape-night-seoul-south-korea.jpg",
    headline: "Smart apparel manufacturing from Korea",
    sub: "AI CONVERSATION PORTAL"
  },
  {
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1600",
    headline: "The philosophy of 30-year artisans, Our Story",
    sub: "KOREA APPAREL WORKS • PHILOSOPHY"
  },
  {
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1600",
    headline: "We make",
    sub: ""
  }
];

const CAROUSEL_IMAGES = [
  "/a3.jpg",
  "/a4.jpg",
  "/a5.jpg",
  "/a6.jpg",
  "/a7.jpg"
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

const PREMIUM_FABRICS = [
  {
    id: "mesh",
    category: "Performance",
    name: "MESH",
    engName: "MESH",
    weight: "160 gsm",
    composition: "92% Recycled Polyester, 8% Spandex",
    season: "Summer / Intense Workouts",
    thickness: 20,
    softness: 80,
    elasticity: 90,
    durability: 95,
    description: "An outstandingly fast sweat-wicking and refreshing mesh fabric featuring a hole structure that maximizes air circulation. It perfectly serves high-performance sports and daily casual outerwear in hot, humid climates.",
    colors: 12,
    tags: ["QUICK DRY", "GRS CERTIFIED", "BREATHABLE"],
    uses: ["Running Apparel", "Sporty Sleeveless", "Activewear"]
  },
  {
    id: "jersey",
    category: "Performance",
    name: "JERSEY",
    engName: "JERSEY",
    weight: "210 gsm",
    composition: "74% Cotton, 20% Polyester, 6% Polyurethane",
    season: "Spring / Summer / Autumn",
    thickness: 35,
    softness: 88,
    elasticity: 85,
    durability: 92,
    description: "A functional single jersey with excellent surface retention and firm bounce-back. Free from distortion along the stretch axis, it is ideal for high-class activewear and t-shirts to minimize sagging on necklines or elbows.",
    colors: 18,
    tags: ["MOISTURE-WICKING", "4-WAY STRETCH", "WASH RESISTANT"],
    uses: ["Performance T-Shirts", "Athleisure Tops", "Functional Base Layers"]
  },
  {
    id: "flat-back-rib",
    category: "Performance",
    name: "FLAT BACK RIB",
    engName: "FLAT BACK RIB",
    weight: "320 gsm",
    composition: "95% Cotton, 5% Polyurethane Elastomer",
    season: "All Seasons",
    thickness: 55,
    softness: 82,
    elasticity: 95,
    durability: 98,
    description: "A high-performance rib fabric with a dense ribbed structure that is flat-woven on the back for maximum security and excellent stretch. High pilling resistance makes it optimal for premium sportswear necks and cuffs.",
    colors: 14,
    tags: ["HIGH ELASTICITY", "ANTI-PILLING", "OPTIMAL COLLARS"],
    uses: ["Neck & Cuff Ribbing", "Sports Crewnecks", "Signature Tracking Tops"]
  },
  {
    id: "pique",
    category: "Classic",
    name: "PIQUE",
    engName: "PIQUE",
    weight: "240 gsm",
    composition: "100% Combed Cotton",
    season: "Spring / Summer",
    thickness: 45,
    softness: 75,
    elasticity: 50,
    durability: 90,
    description: "A heritage pique fabric with a sophisticated honeycomb texture. It stays clear of the skin to maintain dryness, standing as the primary choice for luxury polo shirts and casual tennis wear.",
    colors: 16,
    tags: ["HONEYCOMB TEXTURE", "MAX VENTILATION", "CLASSIC FINISH"],
    uses: ["Golf Polo Shirts", "Classic Tennis Tops", "Branded Collared Shirts"]
  },
  {
    id: "interlock",
    category: "Classic",
    name: "INTERLOCK",
    engName: "INTERLOCK",
    weight: "260 gsm",
    composition: "100% Super-Combed Long Cotton",
    season: "All Seasons",
    thickness: 50,
    softness: 92,
    elasticity: 68,
    durability: 88,
    description: "A double-sided interlock fabric offering an ultra-smooth touch and uniform weave with no distinction between front and back. Biowashed and silket-finished, it delivers a subtle silk-like luster perfect for premium loungewear and sweatshirts.",
    colors: 20,
    tags: ["DOUBLE-SIDED", "SILKY BIO-WASH", "SHAPE RETENTION"],
    uses: ["Luxury Sweatshirts", "Premium Hoodies", "Formal Casual Wear"]
  },
  {
    id: "jacquard",
    category: "Premium / Design",
    name: "JACQUARD",
    engName: "JACQUARD",
    weight: "340 gsm",
    composition: "80% Coarse Cotton, 20% Fancy Filament",
    season: "Autumn / Winter / Spring",
    thickness: 75,
    softness: 78,
    elasticity: 55,
    durability: 95,
    description: "A high-end jacquard fabric where patterns are physically woven into the structure rather than printed. The fabric itself carries deep silhouettes and volume, bringing a luxury collection mood with a single garment.",
    colors: 10,
    tags: ["3D JACQUARD WEAVE", "HAUTE COUTURE PATTERN", "PREMIUM VOLUME"],
    uses: ["Collection Hoodies", "Designer Brand Statements", "Luxury Sweatshirts"]
  },
  {
    id: "stripe",
    category: "Premium / Design",
    name: "STRIPE",
    engName: "STRIPE",
    weight: "220 gsm",
    composition: "100% Cotton-Filament Multi",
    season: "Spring / Summer / Autumn",
    thickness: 40,
    softness: 86,
    elasticity: 62,
    durability: 89,
    description: "A modern knit with stripes and colors precision-dyed before weaving for perfect line spacing and color fastness. Resistant to bleeding or fading after washes, it retains its timeless French marine aesthetic.",
    colors: 12,
    tags: ["BLEEDING-FREE YARN", "FRENCH MARINE STYLE", "PRECISE STRIPES"],
    uses: ["Marine Striped Tees", "Daily Boatneck shirts", "Heritage Casuals"]
  },
  {
    id: "others",
    category: "Premium / Design",
    name: "OTHERS",
    engName: "OTHERS",
    weight: "Custom gsm",
    composition: "Various Specs",
    season: "All Seasons",
    thickness: 50,
    softness: 85,
    elasticity: 70,
    durability: 90,
    description: "Various other specialty fabrics and customized weaves built to your direct design requirements and styling instructions.",
    colors: 50,
    tags: ["CUSTOM SPECIFICATION", "BESPOKE OPTIONS", "VARIOUS TEXTURES"],
    uses: ["Bespoke Orders", "Creative Collections", "Custom Developments"]
  }
];

const getFabricPatternSvg = (id: string, nameEng: string) => {
  switch (id) {
    case "mesh":
      return (
        <svg className="w-full h-full" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="mesh_pat" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.2" fill="#10b981" fillOpacity="0.4" />
              <rect x="0" y="0" width="8" height="8" fill="none" stroke="#e5e5e5" strokeWidth="0.5" strokeOpacity="0.5" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#mesh_pat)" />
          <text x="100" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="#047857" fontFamily="monospace" letterSpacing="0.15em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    case "jersey":
      return (
        <svg className="w-full h-full" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="jersey_pat" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
              <line x1="0" y1="3" x2="6" y2="3" stroke="#cbd5e1" strokeWidth="0.5" />
              <line x1="3" y1="0" x2="3" y2="6" stroke="#94a3b8" strokeWidth="0.3" strokeOpacity="0.5" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#jersey_pat)" />
          <text x="100" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155" fontFamily="monospace" letterSpacing="0.15em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    case "flat-back-rib":
      return (
        <svg className="w-full h-full" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="rib_pat" x="0" y="0" width="12" height="6" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="6" height="6" fill="#f8fafc" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="#94a3b8" strokeWidth="0.8" />
              <line x1="6" y1="0" x2="6" y2="6" stroke="#cbd5e1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#rib_pat)" />
          <text x="100" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b" fontFamily="monospace" letterSpacing="0.12em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    case "pique":
      return (
        <svg className="w-full h-full" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="pique_pat" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="5" height="5" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
              <rect x="5" y="5" width="5" height="5" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
              <circle cx="2.5" cy="2.5" r="1.2" fill="#64748b" />
              <circle cx="7.5" cy="7.5" r="1.2" fill="#64748b" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#pique_pat)" />
          <text x="100" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155" fontFamily="monospace" letterSpacing="0.15em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    case "interlock":
      return (
        <svg className="w-full h-full" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="interlock_pat" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <line x1="0" y1="5" x2="10" y2="5" stroke="#94a3b8" strokeWidth="0.5" />
              <line x1="5" y1="0" x2="5" y2="10" stroke="#cbd5e1" strokeWidth="0.5" />
              <circle cx="5" cy="5" r="1" fill="#475569" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#interlock_pat)" />
          <text x="100" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b" fontFamily="monospace" letterSpacing="0.15em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    case "jacquard":
      return (
        <svg className="w-full h-full" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="jacquard_pat" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M0 8 Q 4 12, 8 8 T 16 8" fill="none" stroke="#64748b" strokeWidth="0.5" />
              <path d="M0 16 Q 4 12, 8 16 T 16 16" fill="none" stroke="#94a3b8" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#jacquard_pat)" />
          <text x="100" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f172a" fontFamily="monospace" letterSpacing="0.15em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    case "stripe":
      return (
        <svg className="w-full h-full" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="stripe_pat" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="20" height="10" fill="#0f172a" fillOpacity="0.85" />
              <rect x="0" y="10" width="20" height="10" fill="#ffffff" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#stripe_pat)" />
          <rect x="35" y="28" width="130" height="24" rx="4" fill="#ffffff" fillOpacity="0.95" />
          <text x="100" y="44" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0f172a" fontFamily="monospace" letterSpacing="0.15em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    case "others":
      return (
        <svg className="w-full h-full" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="others_pat" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="8" r="1.5" fill="#475569" fillOpacity="0.3" />
              <rect x="0" y="0" width="16" height="16" fill="none" stroke="#e2e8f0" strokeWidth="0.5" strokeOpacity="0.5" />
            </pattern>
          </defs>
          <rect width="200" height="80" fill="url(#others_pat)" />
          <text x="100" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="#475569" fontFamily="monospace" letterSpacing="0.15em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    default:
      return null;
  }
};

export default function Hero({ 
  onPreOrderClick, 
  currentSlide, 
  setCurrentSlide, 
  messages, 
  setMessages,
  savedChats,
  onClearChat,
  onRestoreChat,
  user,
  onOpenLogin,
  onLogout,
  onOpenAccount
}: HeroProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeFabricCategory, setActiveFabricCategory] = useState("all");
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [openFabric, setOpenFabric] = useState<string | null>(null);
  const [isFabricOpen, setIsFabricOpen] = useState(false);
  const lastSlideRef = useRef(currentSlide);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (currentSlide > lastSlideRef.current) {
      setDirection(1);
    } else if (currentSlide < lastSlideRef.current) {
      setDirection(-1);
    }
    lastSlideRef.current = currentSlide;
  }, [currentSlide]);

  const slideVariants = useMemo(() => ({
    enter: (dir: number) => ({
      y: dir > 0 ? "100vh" : "-100vh",
      opacity: 0
    }),
    center: {
      y: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      y: dir > 0 ? "-100vh" : "100vh",
      opacity: 0
    })
  }), []);

  const slideTransition = useMemo(() => ({
    duration: 0.8,
    ease: [0.16, 1, 0.3, 1]
  }), []);

  const {
    chatInput,
    setChatInput,
    isGenerating,
    textareaRef,
    fileInputRef,
    scrollRef,
    isListening,
    toggleListening,
    handleSendMessage,
    handleQuickCommand,
    handleImageSelect,
    handleAnalyzeImage
  } = useChat({ messages, setMessages, user, onOpenLogin });

  const filteredFabrics = useMemo(() => {
    let filtered = [...PREMIUM_FABRICS];
    if (activeFabricCategory !== "all") {
      filtered = filtered.filter((f) => f.category === activeFabricCategory);
    }
    return filtered;
  }, [activeFabricCategory]);

  const handlePrevSlide = useCallback(() => {
    setCurrentSlide((prev: number) => (prev > 0 ? prev - 1 : SLIDES.length - 1));
  }, [setCurrentSlide]);

  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev: number) => (prev < SLIDES.length - 1 ? prev + 1 : 0));
  }, [setCurrentSlide]);

  return (
    <section className={`relative w-full flex flex-col justify-center items-center overflow-x-hidden overflow-y-visible z-10 px-0 md:px-8 transition-all duration-500 min-h-[100vh] pt-20 pb-0`}>
      


      <button
        onClick={handlePrevSlide}
        className="hidden md:flex fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 active:scale-95 items-center justify-center transition-all duration-300 cursor-pointer group text-neutral-700 hover:text-neutral-950"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-[28px] h-[28px] group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={handleNextSlide}
        className="hidden md:flex fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 active:scale-95 items-center justify-center transition-all duration-300 cursor-pointer group text-neutral-700 hover:text-neutral-950"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-[28px] h-[28px] group-hover:translate-x-0.5 transition-transform" />
      </button>

      <div className={`relative z-10 w-full flex flex-col items-center justify-center text-center px-0 md:px-4 select-none transition-all duration-500 ${
        (currentSlide === 0 && messages.length > 1) ? "max-w-[1400px] my-auto" : "max-w-[1100px] my-auto mt-24 lg:mt-32 mb-16"
      }`}>
        
        <AnimatePresence mode="popLayout" custom={direction}>
          {currentSlide === 0 && (
            <motion.div
              key="slide-0"
              id="ai-dialogue-portal-container"
              variants={slideVariants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="w-full flex flex-col items-center justify-center relative"
            >
              {messages.length === 1 && (
                <>
                  <img src="/logo1.png" alt="Korea Apparel Works Logo"  className="w-[clamp(50px,calc(35px+2.5vw),60px)] mb-[50px] select-none pointer-events-none transition-all duration-300" />
                  <div className="flex space-x-2.5 mb-5 select-none">
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
                </>
              )}

              {messages.length === 1 && (
                <div className="mb-10 select-none flex flex-col items-center w-full px-2">
                  <h1 className="font-dm-sans text-[clamp(23px,calc(-4px+4.5vw),41px)] font-[550] tracking-tight text-neutral-900 leading-tight text-center whitespace-nowrap transition-all duration-300">
                    Smart Apparel Manufacturing from Korea
                  </h1>
                  <p className="pretendard-font mt-4 text-neutral-600 text-[clamp(14px,calc(11px+0.5vw),16px)] max-w-lg mx-auto font-normal text-center transition-all duration-300">
                    Inquire about quotes from samples to mass production.
                    <br />
                    Available starting from just 1 piece.
                  </p>
                </div>
              )}

              <div className={`w-full bg-white/85 backdrop-blur-2xl rounded-[28px] border border-neutral-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 flex flex-col font-sans transition-all duration-500 overflow-hidden relative group/card select-text ${
                messages.length > 1 
                  ? "max-w-[1000px] h-[80vh] max-h-[800px]" 
                  : "max-w-[700px] h-[200px]"
              }`}>
                {messages.length > 1 && (
                  <div className="border-b border-neutral-100 pb-4 mb-4 select-text flex flex-col flex-1 min-h-0">
                    <div 
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto space-y-4 pr-1 text-[14px] text-left scrollbar-thin pb-2"
                    >
                      {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] sm:max-w-[75%] rounded-[18px] px-4 py-3 leading-relaxed font-light ${
                            msg.role === "user"
                              ? "bg-neutral-950 text-white rounded-tr-none font-light"
                              : "bg-neutral-100 text-neutral-800 shadow-3xs border border-neutral-200/60 rounded-tl-none whitespace-pre-wrap"
                          }`}>
                            {msg.imageUrl && (
                              <div className="mb-2">
                                {msg.imageUrl.endsWith('.pdf') ? (
                                  <div className="flex items-center space-x-2 bg-neutral-200/50 rounded-xl p-3">
                                    <FileText className="w-5 h-5 text-neutral-500 shrink-0" />
                                    <span className="text-xs truncate">{msg.text}</span>
                                  </div>
                                ) : (
                                  <img 
                                    src={msg.imageUrl} 
                                    alt="Uploaded" 
                                    
                                    className="rounded-xl max-h-[200px] w-auto object-cover border border-neutral-200/60"
                                  />
                                )}
                              </div>
                            )}
                            {!msg.imageUrl && msg.text}
                            {msg.imageUrl && !msg.imageUrl.endsWith('.pdf') && (
                              <span className="text-[11px] opacity-60">{msg.text}</span>
                            )}
                          </div>
                        </div>
                      ))}

                      {isGenerating && (
                        <div className="flex justify-start animate-pulse">
                          <div className="bg-neutral-100 text-neutral-500 max-w-[85%] rounded-[18px] px-4 py-3 shadow-3xs border border-neutral-200/60 rounded-tl-none flex items-center space-x-2">
                            <span className="flex space-x-1">
                              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className={`w-full flex flex-col justify-between text-left ${messages.length > 1 ? "h-auto shrink-0 pt-2" : "flex-1 h-full"}`}>
                  <textarea
                    id="chat-input-textarea"
                    ref={textareaRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    // onFocus 제거 (클릭 시 로그인 모달 뜨지 않게 변경)
                    placeholder="We excel in crafting bespoke apparel and tops with premium-grade fabrics. Tell us what you want to make..."
                    className="gtm-chat-open w-full bg-transparent resize-none overflow-hidden border-0 outline-none focus:ring-0 text-sm md:text-base text-neutral-900 placeholder-neutral-400 font-light leading-relaxed select-text min-h-[38px] pb-2"
                    disabled={isGenerating}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <div className="flex items-center space-x-2.5">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageSelect} 
                        accept="image/png, image/jpeg, image/webp, application/pdf" 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={handleAnalyzeImage}
                        className="inline-flex items-center space-x-2 bg-neutral-50 hover:bg-neutral-100 active:scale-[0.98] border border-neutral-200/80 rounded-full px-4 py-2 transition duration-300 text-neutral-700 text-[14px] font-medium cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Upload</span>
                      </button>

                      {messages.length > 1 && (
                        <button
                          onClick={onClearChat}
                          type="button"
                          className="inline-flex items-center space-x-1.5 bg-neutral-50 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.98] border border-neutral-200/80 rounded-full px-4 py-2 transition duration-300 text-neutral-500 text-xs font-medium cursor-pointer"
                          title="Back home"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Back home</span>
                        </button>
                      )}

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
                                className="inline-flex items-center space-x-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded-full px-3 py-1.5 transition duration-300 text-neutral-700 hover:text-neutral-900 text-xs font-normal cursor-pointer select-none max-w-[150px] shadow-[0_0_12px_rgba(0,0,0,0.01)]"
                                title={fullText}
                              >
                                <History className="w-3 h-3 text-neutral-400 shrink-0" />
                                <span className="truncate">{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-2.5 rounded-full transition duration-300 cursor-pointer ${
                          isListening 
                            ? "bg-red-50 text-red-500 animate-pulse hover:bg-red-100" 
                            : "hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"
                        }`}
                        title={isListening ? "녹음 중지" : "음성 인식 시작"}
                      >
                        <Mic className="w-4 h-4" />
                      </button>

                      <button
                        id="chat-send-button"
                        type="submit"
                        disabled={!chatInput.trim() || isGenerating}
                        className={`gtm-chat-send p-2.5 rounded-full aspect-square flex items-center justify-center transition-all duration-300 cursor-pointer ${
                          chatInput.trim() && !isGenerating
                            ? "bg-neutral-950 text-white hover:bg-neutral-800 hover:scale-105"
                            : "bg-neutral-100 text-neutral-400 opacity-60 pointer-events-none"
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
              variants={slideVariants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="w-full flex flex-col items-center justify-center relative mt-[-200px]"
            >
              <div className="hidden md:flex space-x-2.5 mb-5 mt-24">
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

              <div id="about-us-section" className="w-full flex flex-col font-sans text-left relative select-text bg-transparent border border-transparent rounded-none overflow-hidden scroll-mt-24 mt-16 md:mt-0">
                <div className="py-10 md:py-12 px-4 md:px-0 border-none w-full bg-transparent">
                  <div className="w-full flex flex-col gap-8 md:gap-10 rounded-2xl md:rounded-3xl bg-transparent md:bg-white border border-neutral-200/60 md:border-[#e9ecef]/80 p-6 md:p-10 lg:p-12 transition-all duration-300 md:hover:border-[#dee2e6] md:hover:shadow-md group">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-neutral-900 leading-[1.2] tracking-tight text-center md:text-left group-hover:text-black transition-colors w-full">
                      From one factory floor to a global platform
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full">
                      <div className="flex flex-col justify-start">
                        <div className="space-y-4 text-[15px] md:text-base text-neutral-600 leading-relaxed font-light text-center md:text-left">
                          <p>
                            Our story begins with my father.<br />
                            For over 30 years, he ran an apparel factory in Korea, manufacturing premium shirts, polos, sportswear, and golf wear.
                          </p>
                          <p>
                            Despite world-class production capabilities, the factory faced the limits of traditional manufacturing, relying entirely on local, network-based orders while the global market rapidly digitalized.
                          </p>
                          <p>
                            To bring my father’s lifelong expertise to the world, we now connect global brands with 30 years of manufacturing know-how and uncompromising quality.
                          </p>
                        </div>
                      </div>
                      <div className="hidden md:block w-full relative h-full min-h-[300px]">
                        <div className="w-full aspect-[16/9] md:aspect-auto md:absolute md:inset-0 rounded-2xl overflow-hidden border border-neutral-200/60 relative group/img bg-neutral-100">
                          <img 
                            src="/a2.jpg" 
                            alt="Korea Apparel Works Sewing Facility" 
                            
                            className="w-full h-full object-cover opacity-90 group-hover/img:opacity-100 group-hover/img:scale-105 transition-all duration-700" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full mt-10 md:mt-16 overflow-hidden relative">
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes scrollLeft {
                      0% { transform: translateX(0); }
                      100% { transform: translateX(-50%); }
                    }
                    .animate-marquee {
                      animation: scrollLeft 40s linear infinite;
                    }
                  `}} />
                  <div className="flex gap-4 w-max animate-marquee pb-8">
                    {[...Array(2)].map((_, groupIdx) => (
                      <React.Fragment key={groupIdx}>
                        {['b1.jpg', 'b2-2.jpg', 'b3.jpg', 'b4.jpg', 'b5.jpg', 'b6.jpg', 'b7.jpg', 'b8.jpg', 'b9.jpg'].map((imgName, idx) => {
                          const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://tznhtceeqozjndfllknm.supabase.co";
                          const optimizedUrl = `${supabaseUrl}/storage/v1/render/image/public/factory/${encodeURIComponent(imgName)}?format=webp&quality=80`;
                          return (
                          <div key={`${groupIdx}-${idx}`} className={`flex-none w-[50vw] sm:w-[320px] md:w-[400px] aspect-[4/3] rounded-xl overflow-hidden border border-neutral-200/80 bg-neutral-100 shadow-sm transition-all duration-300 ${idx === 3 ? 'hidden md:block' : ''}`}>
                            <img 
                              src={optimizedUrl} 
                              alt={`Atelier gallery ${idx + 1}`} 
                              loading="lazy"
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )})}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div id="core-capabilities-section" className="grid grid-cols-1 md:grid-cols-2 gap-[20px] w-full pt-12 scroll-mt-20 px-4 md:px-0">
                  <div className="p-8 md:p-10 rounded-2xl bg-[#f0f4f8] border border-[#e2e8f0]/60 flex flex-col transition-all duration-300 hover:border-[#cbd5e1] hover:shadow-md hover:-translate-y-1 group">
                    <div className="grid grid-cols-[1fr_auto_1fr] md:flex md:flex-col items-center md:items-start mb-4 md:mb-0 w-full">
                      <div className="flex justify-end pr-3 md:pr-0 md:mb-6 w-full">
                        <div className="flex w-12 h-12 md:w-12 md:h-12 rounded-full bg-white items-center justify-center shadow-sm text-blue-600 group-hover:scale-110 transition-transform duration-300 shrink-0">
                          <Factory className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                        </div>
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight text-center md:text-left md:mb-4 group-hover:text-black transition-colors whitespace-nowrap">30 Years of Expertise</div>
                      <div className="md:hidden w-full"></div>
                    </div>
                    <p className="text-[15px] md:text-base text-neutral-600 font-light leading-relaxed text-center md:text-left">
                      <span className="hidden md:inline">Family-owned factory with direct production and transparent processes.</span>
                      <span className="md:hidden">Family-owned factory with direct production and transparent processes.</span>
                    </p>
                  </div>

                  <div className="p-8 md:p-10 rounded-2xl bg-[#f8f5f2] border border-[#eee8e3]/60 flex flex-col transition-all duration-300 hover:border-[#dfd8d0] hover:shadow-md hover:-translate-y-1 group">
                    <div className="grid grid-cols-[1fr_auto_1fr] md:flex md:flex-col items-center md:items-start mb-4 md:mb-0 w-full">
                      <div className="flex justify-end pr-3 md:pr-0 md:mb-6 w-full">
                        <div className="flex w-12 h-12 md:w-12 md:h-12 rounded-full bg-white items-center justify-center shadow-sm text-orange-500 group-hover:scale-110 transition-transform duration-300 shrink-0">
                          <Package className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                        </div>
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight text-center md:text-left md:mb-4 group-hover:text-black transition-colors whitespace-nowrap">Full-Package OEM/ODM</div>
                      <div className="md:hidden w-full"></div>
                    </div>
                    <p className="text-[15px] md:text-base text-neutral-600 font-light leading-relaxed text-center md:text-left">
                      From design to finished product, we manage every production stage.
                    </p>
                  </div>

                  <div className="p-8 md:p-10 rounded-2xl bg-[#f3f6f4] border border-[#e2eae5]/60 flex flex-col transition-all duration-300 hover:border-[#c5d6cc] hover:shadow-md hover:-translate-y-1 group">
                    <div className="grid grid-cols-[1fr_auto_1fr] md:flex md:flex-col items-center md:items-start mb-4 md:mb-0 w-full">
                      <div className="flex justify-end pr-3 md:pr-0 md:mb-6 w-full">
                        <div className="flex w-12 h-12 md:w-12 md:h-12 rounded-full bg-white items-center justify-center shadow-sm text-emerald-600 group-hover:scale-110 transition-transform duration-300 shrink-0">
                          <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                        </div>
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight text-center md:text-left md:mb-4 group-hover:text-black transition-colors whitespace-nowrap">Premium QC</div>
                      <div className="md:hidden w-full"></div>
                    </div>
                    <p className="text-[15px] md:text-base text-neutral-600 font-light leading-relaxed text-center md:text-left">
                      Premium Quality Control and technical expertise for high-end performance apparel
                    </p>
                  </div>

                  <div className="p-8 md:p-10 rounded-2xl bg-[#f5f3f7] border border-[#e8e4ec]/60 flex flex-col transition-all duration-300 hover:border-[#d4cddc] hover:shadow-md hover:-translate-y-1 group">
                    <div className="grid grid-cols-[1fr_auto_1fr] md:flex md:flex-col items-center md:items-start mb-4 md:mb-0 w-full">
                      <div className="flex justify-end pr-3 md:pr-0 md:mb-6 w-full">
                        <div className="flex w-12 h-12 md:w-12 md:h-12 rounded-full bg-white items-center justify-center shadow-sm text-purple-600 group-hover:scale-110 transition-transform duration-300 shrink-0">
                          <Zap className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                        </div>
                      </div>
                      <div className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight text-center md:text-left md:mb-4 group-hover:text-black transition-colors whitespace-nowrap">Flexible MOQ</div>
                      <div className="md:hidden w-full"></div>
                    </div>
                    <p className="text-[15px] md:text-base text-neutral-600 font-light leading-relaxed text-center md:text-left">
                      Prototype from 1 piece and scale production as your brand grows.
                    </p>
                  </div>
                </div>

                {/* 200px pure white gap + 500px Gradient Transition for Mobile */}
                <div className="w-full h-[500px] bg-gradient-to-b from-transparent to-[#0a0a0a] md:hidden mt-[200px]"></div>

                <div id="ai-tech-section" className="w-full px-4 py-12 md:px-10 bg-[#0a0a0a] md:bg-[#fef2f2] md:border md:border-[#fecaca] md:rounded-2xl md:mt-[200px] md:shadow-[0_8px_30px_rgba(239,68,68,0.04)]">
                  <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1.8fr] gap-6 md:gap-10 items-center md:items-start mb-10 text-center md:text-left">
                    <div className="max-w-xs mx-auto md:max-w-none md:mx-0">
                      <h2 className="text-2xl font-bold text-white md:text-neutral-950 mb-3 leading-snug">AI-powered from inquiry to delivery</h2>
                      <p className="text-[15px] md:text-base text-neutral-400 md:text-neutral-800 leading-relaxed font-light">With AI integrated across production, international buyers can place orders in any language and get accurate quotes instantly</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 w-full">
                      <div className="p-5 md:p-6 border-none md:border md:border-[#fecaca] bg-white rounded-xl md:rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] md:shadow-[0_4px_20px_rgba(239,68,68,0.03)] hover:shadow-md transition-shadow flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="w-10 h-10 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-50 md:bg-[#ef4444]/10 flex items-center justify-center text-blue-500 md:text-[#ef4444] mb-3 md:mb-4 shrink-0">
                           <MessageSquare className="w-5 h-5 md:w-5 md:h-5 text-blue-500 md:text-[#ef4444]" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl md:text-base font-bold text-neutral-950 mb-1 md:mb-2 whitespace-nowrap">AI inquiry</h3>
                        <p className="text-[15px] md:text-sm text-neutral-600 leading-relaxed font-light mt-1 md:mt-0">Describe what you need in natural language. Our assistant extracts specs automatically.</p>
                      </div>
                      <div className="p-5 md:p-6 border-none md:border md:border-[#fecaca] bg-white rounded-xl md:rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] md:shadow-[0_4px_20px_rgba(239,68,68,0.03)] hover:shadow-md transition-shadow flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="w-10 h-10 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-50 md:bg-[#ef4444]/10 flex items-center justify-center text-blue-500 md:text-[#ef4444] mb-3 md:mb-4 shrink-0">
                           <FileText className="w-5 h-5 md:w-5 md:h-5 text-blue-500 md:text-[#ef4444]" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl md:text-base font-bold text-neutral-950 mb-1 md:mb-2 whitespace-nowrap">Smart quoting</h3>
                        <p className="text-[15px] md:text-sm text-neutral-600 leading-relaxed font-light mt-1 md:mt-0">Receive a detailed proposal within 24 hours based on your exact requirements.</p>
                      </div>
                      <div className="p-5 md:p-6 border-none md:border md:border-[#fecaca] bg-white rounded-xl md:rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] md:shadow-[0_4px_20px_rgba(239,68,68,0.03)] hover:shadow-md transition-shadow flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="w-10 h-10 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-50 md:bg-[#ef4444]/10 flex items-center justify-center text-blue-500 md:text-[#ef4444] mb-3 md:mb-4 shrink-0">
                           <LineChart className="w-5 h-5 md:w-5 md:h-5 text-blue-500 md:text-[#ef4444]" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl md:text-base font-bold text-neutral-950 mb-1 md:mb-2 leading-tight">Production tracking</h3>
                        <p className="text-[15px] md:text-sm text-neutral-600 leading-relaxed font-light mt-1 md:mt-0">Real-time updates from sample approval through to shipment confirmation.</p>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col md:flex-row items-stretch border border-[#fecaca] bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex-1 w-full md:w-auto p-6 text-center border-b md:border-b-0 md:border-r border-[#fef2f2] flex flex-col items-center justify-center">
                      <div className="text-xs md:text-sm font-mono text-[#ef4444] font-bold tracking-widest mb-2">01</div>
                      <div className="text-sm md:text-base font-bold text-neutral-950 mb-1">Inquiry</div>
                      <div className="text-xs md:text-sm text-neutral-500 mb-2.5 font-light">Chat with AI</div>
                      <div className="mt-auto inline-block text-[11px] font-semibold tracking-wider uppercase bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 px-2.5 py-0.5 rounded-full">AI</div>
                    </div>
                    <div className="flex-1 w-full md:w-auto p-6 text-center border-b md:border-b-0 md:border-r border-[#fef2f2] flex flex-col items-center justify-center">
                      <div className="text-xs md:text-sm font-mono text-[#ef4444] font-bold tracking-widest mb-2">02</div>
                      <div className="text-sm md:text-base font-bold text-neutral-950 mb-1">Proposal</div>
                      <div className="text-xs md:text-sm text-neutral-500 mb-2.5 font-light">Within 24h</div>
                      <div className="mt-auto inline-block text-[11px] font-semibold tracking-wider uppercase bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 px-2.5 py-0.5 rounded-full">AI</div>
                    </div>
                    <div className="flex-1 w-full md:w-auto p-6 text-center border-b md:border-b-0 md:border-r border-[#fef2f2] flex flex-col items-center justify-center">
                      <div className="text-xs md:text-sm font-mono text-[#ef4444] font-bold tracking-widest mb-2">03</div>
                      <div className="text-sm md:text-base font-bold text-neutral-950 mb-1">Sample</div>
                      <div className="text-xs md:text-sm text-neutral-500 mb-2.5 font-light">14 day turnaround</div>
                      <div className="mt-auto inline-block text-[11px] font-semibold tracking-wider uppercase bg-neutral-950/5 text-neutral-700 border border-neutral-950/10 px-2.5 py-0.5 rounded-full">Handcraft</div>
                    </div>
                    <div className="flex-1 w-full md:w-auto p-6 text-center border-b md:border-b-0 md:border-r border-[#fef2f2] flex flex-col items-center justify-center">
                      <div className="text-xs md:text-sm font-mono text-[#ef4444] font-bold tracking-widest mb-2">04</div>
                      <div className="text-sm md:text-base font-bold text-neutral-950 mb-1">Production</div>
                      <div className="text-xs md:text-sm text-neutral-500 mb-2.5 font-light">Full QC inspection</div>
                      <div className="mt-auto inline-block text-[11px] font-semibold tracking-wider uppercase bg-neutral-950/5 text-neutral-700 border border-neutral-950/10 px-2.5 py-0.5 rounded-full">Handcraft</div>
                    </div>
                    <div className="flex-1 w-full md:w-auto p-6 text-center flex flex-col items-center justify-center">
                      <div className="text-xs md:text-sm font-mono text-[#ef4444] font-bold tracking-widest mb-2">05</div>
                      <div className="text-sm md:text-base font-bold text-neutral-950 mb-1">Shipment</div>
                      <div className="text-xs md:text-sm text-neutral-500 mb-2.5 font-light">Tracked delivery</div>
                      <div className="mt-auto inline-block text-[11px] font-semibold tracking-wider uppercase bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 px-2.5 py-0.5 rounded-full">AI</div>
                    </div>
                  </div>
                

                {/* Mobile only 2-row flowchart from StartLanding */}
                <div className="flex md:hidden relative pt-8 flex-col gap-12 items-center mt-4 pb-8">
                  {/* Top Row (01 to 03) */}
                  <div className="relative w-full">
                    {/* Connecting lines for Row 1 */}
                    <div className="absolute top-[60px] left-[15%] right-[15%] h-[2px] bg-neutral-800 z-0"></div>

                    <div className="grid grid-cols-3 gap-2 relative z-10">
                      {/* Step 1 */}
                      <div className="flex flex-col items-center text-center group cursor-default">
                        <div className="text-sm font-bold text-blue-400 mb-2 transition-colors group-hover:text-blue-300">01</div>
                        <div className="w-[65px] h-[65px] rounded-2xl bg-white border border-blue-200 flex items-center justify-center shadow-sm mb-3 text-blue-600">
                          <MessageSquare className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                        <h4 className="text-[15px] font-bold text-white mb-1 leading-tight">Inquiry</h4>
                        <p className="text-xs text-neutral-400 mb-2">Chat with AI</p>
                        <span className="px-3 py-1 bg-blue-900/50 text-blue-300 text-[10px] font-bold rounded-full tracking-wide border border-blue-800">AI</span>
                      </div>
                      
                      {/* Step 2 */}
                      <div className="flex flex-col items-center text-center group cursor-default">
                        <div className="text-sm font-bold text-blue-400 mb-2 transition-colors group-hover:text-blue-300">02</div>
                        <div className="w-[65px] h-[65px] rounded-2xl bg-white border border-blue-200 flex items-center justify-center shadow-sm mb-3 text-blue-600">
                          <FileText className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                        <h4 className="text-[15px] font-bold text-white mb-1 leading-tight">Proposal</h4>
                        <p className="text-xs text-neutral-400 mb-2">Within 24h</p>
                        <span className="px-3 py-1 bg-blue-900/50 text-blue-300 text-[10px] font-bold rounded-full tracking-wide border border-blue-800">AI</span>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col items-center text-center group cursor-default">
                        <div className="text-sm font-bold text-white mb-2 transition-colors group-hover:text-neutral-200">03</div>
                        <div className="w-[65px] h-[65px] rounded-2xl bg-white border border-amber-200 flex items-center justify-center shadow-sm mb-3 text-amber-600">
                          <Scissors className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                        <h4 className="text-[15px] font-bold text-white mb-1 leading-tight">Sample</h4>
                        <p className="text-xs text-neutral-400 mb-2">14 days</p>
                        <span className="px-3 py-1 bg-amber-900/40 text-amber-300 border border-amber-700/50 text-[10px] font-bold rounded-full tracking-wide">Handcraft</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row (04 to 05) */}
                  <div className="relative w-[70%] max-w-[300px]">
                    {/* Connecting lines for Row 2 */}
                    <div className="absolute top-[60px] left-[25%] right-[25%] h-[2px] bg-neutral-800 z-0"></div>

                    <div className="grid grid-cols-2 gap-4 relative z-10">
                      {/* Step 4 */}
                      <div className="flex flex-col items-center text-center group cursor-default">
                        <div className="text-sm font-bold text-white mb-2 transition-colors group-hover:text-neutral-200">04</div>
                        <div className="w-[65px] h-[65px] rounded-2xl bg-white border border-amber-200 flex items-center justify-center shadow-sm mb-3 text-amber-600">
                          <CheckCircle2 className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                        <h4 className="text-[15px] font-bold text-white mb-1 leading-tight">Production</h4>
                        <p className="text-xs text-neutral-400 mb-2">Full QC</p>
                        <span className="px-3 py-1 bg-amber-900/40 text-amber-300 border border-amber-700/50 text-[10px] font-bold rounded-full tracking-wide">Handcraft</span>
                      </div>

                      {/* Step 5 */}
                      <div className="flex flex-col items-center text-center group cursor-default">
                        <div className="text-sm font-bold text-blue-400 mb-2 transition-colors group-hover:text-blue-300">05</div>
                        <div className="w-[65px] h-[65px] rounded-2xl bg-white border border-blue-200 flex items-center justify-center shadow-sm mb-3 text-blue-600">
                          <Truck className="w-8 h-8" strokeWidth={1.5} />
                        </div>
                        <h4 className="text-[15px] font-bold text-white mb-1 leading-tight">Shipment</h4>
                        <p className="text-xs text-neutral-400 mb-2">Tracked</p>
                        <span className="px-3 py-1 bg-blue-900/50 text-blue-300 text-[10px] font-bold rounded-full tracking-wide border border-blue-800">AI</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Map for Mobile inside the dark section */}
                <div className="flex md:hidden w-full mt-[150px]">
                  <ExportMap className="mt-0 pb-10 pt-4" />
                </div>
                </div>
              </div>
        </motion.div>
      )}

          {currentSlide === 2 && (
            <motion.div
              key="slide-2"
              variants={slideVariants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="w-full flex flex-col items-center justify-center relative mt-[-200px]"
            >
              <div className="hidden md:flex space-x-2.5 mb-5 mt-24">
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
                {/* Unified View */}
                <div className="flex flex-col w-full">
                  <section className="pt-[120px] pb-0 w-full overflow-hidden bg-transparent">
                    <div className="max-w-[1000px] mx-auto px-6 mb-12 flex flex-col items-center text-center gap-8">
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-3">
                          Custom Apparel Solutions
                        </h2>
                        <p className="text-[15px] text-neutral-600 font-light leading-relaxed max-w-2xl mx-auto">
                          Discover KAW's signature production lineup featuring perfect fits and flawless details.
                        </p>
                      </div>
                    </div>
                    <div className="max-w-[1200px] mx-auto px-6 w-full relative">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                        {[
                          "-29 001.png", "-30 003.png", "-34 012.png", "-33 008.png",
                          "-33 009.png", "-33 010.png", "-34 011.png", "-31 005.png",
                          "-35 013.png", "-35 014.png"
                        ].map((img, idx) => {
                          const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://tznhtceeqozjndfllknm.supabase.co";
                          const optimizedUrl = `${supabaseUrl}/storage/v1/render/image/public/clothes/${encodeURIComponent(img)}?format=webp&quality=80`;
                          return (
                          <div key={idx} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                            <div className="aspect-[3/4] w-full bg-neutral-100 relative overflow-hidden">
                              <img src={optimizedUrl} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                          </div>
                        )})}
                      </div>
                    </div>
                  </section>

                  <section className="mt-[200px] pt-0 pb-12 px-6 w-full max-w-[770px] mx-auto">
                    <div className="text-center mb-16">
                      <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-4">
                        Premium Fabrics
                      </h2>
                      <p className="text-[15px] text-neutral-500 font-light leading-relaxed max-w-lg mx-auto">
                        Our garments start with the best raw materials. From high-stretch performance knits to classic heritage weaves.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-[1000px] mx-auto items-start">
                      {PREMIUM_FABRICS.map((fabric) => {
                        const isOpen = openFabric === fabric.id;
                        return (
                          <div 
                            key={fabric.id} 
                            onClick={() => setOpenFabric(isOpen ? null : fabric.id)}
                            className={`bg-white rounded-xl border overflow-hidden shadow-sm transition-all cursor-pointer flex flex-col ${isOpen ? 'border-blue-400' : 'border-neutral-200'}`}
                          >
                            <div className="aspect-[2.5/1] w-full relative flex-shrink-0">
                              {getFabricPatternSvg(fabric.id, fabric.engName)}
                              <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-xs backdrop-blur-sm ${isOpen ? 'bg-blue-50 text-blue-600' : 'bg-white/80 text-neutral-400'}`}>
                                {isOpen ? <Minus size={14} className="w-4 h-4" /> : <Plus size={14} className="w-4 h-4" />}
                              </div>
                            </div>
                            <div 
                              className={`px-4 flex flex-col justify-center overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-60 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'}`}
                            >
                              <p className="text-neutral-600 text-[11px] font-light leading-relaxed">
                                {fabric.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>




              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

