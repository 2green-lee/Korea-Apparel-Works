import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Camera, Mic, ArrowUp, RefreshCw, Search, Ruler, ChevronLeft, ChevronRight, ChevronDown, Shirt, Award, Layers, Sparkles, Check, History, MessageSquare, FileText, Truck, User, Factory, Package, ShieldCheck, Zap, LineChart, Scissors, CheckCircle2, Plus, Minus, Bot } from "lucide-react";
import ExportMap from "./ExportMap";
import { AnimatePresence, motion } from "motion/react";
import WhyKorea from './WhyKorea';
import tshirtIcon from "./free-icon-clothes-7640468.png";
import { supabase } from "../lib/supabase";

interface HeroProps {
  onPreOrderClick: () => void;
  currentSlide: number;
  setCurrentSlide: React.Dispatch<React.SetStateAction<number>> | ((slide: number | ((prev: number) => number)) => void);
  messages: { role: "user" | "model"; text: string; imageUrl?: string }[];
  setMessages: React.Dispatch<React.SetStateAction<{ role: "user" | "model"; text: string; imageUrl?: string }[]>>;
  onClearChat: () => void;
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
  onClearChat,
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
  const productCarouselRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState(1);

  const scrollProductGallery = useCallback((dir: 'left' | 'right') => {
    if (productCarouselRef.current) {
      const scrollAmount = productCarouselRef.current.clientWidth * 0.8;
      productCarouselRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (currentSlide > lastSlideRef.current) {
      setDirection(1);
    } else if (currentSlide < lastSlideRef.current) {
      setDirection(-1);
    }
    lastSlideRef.current = currentSlide;
  }, [currentSlide]);

  useEffect(() => {
    if (currentSlide === 0 && messages.length > 1) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [messages.length, currentSlide]);

  const slideVariants = useMemo(() => ({
    enter: (dir: number) => ({
      y: 30,
      opacity: 0
    }),
    center: {
      y: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      y: -30,
      opacity: 0
    })
  }), []);

  const slideTransition = useMemo(() => ({
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1]
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
    <section className={`relative w-full flex flex-col justify-center items-center overflow-x-clip overflow-y-visible z-10 px-0 lg:px-8 transition-all duration-500 min-h-[100vh] pt-20 pb-0 ${currentSlide === 0 ? '' : 'bg-white'}`}>
      


      <div className={`relative z-10 w-full flex flex-col items-center justify-center text-center px-0 lg:px-4 select-none transition-all duration-500 ${
        currentSlide === 0 ? "max-w-[1400px] my-auto" : currentSlide === 1 ? "max-w-[1100px] my-auto mt-24 lg:mt-32 mb-0" : "max-w-[1100px] my-auto mt-24 lg:mt-32 mb-16"
      }`}>
        
        <AnimatePresence mode="wait" custom={direction}>
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
                  <div className="flex flex-col items-center mt-[20px] mb-[30px]">
                    <img src="/logo1.png" alt="Korea Apparel Works Logo"  className="w-[clamp(50px,calc(35px+2.5vw),60px)] select-none pointer-events-none transition-all duration-300" />
                  </div>

                </>
              )}

              {messages.length === 1 && (
                <div className="mb-10 select-none flex flex-col items-center w-full px-2">
                  <h1 className="font-dm-sans text-[clamp(26px,calc(-4px+4.5vw),41px)] font-[450] tracking-tight text-neutral-900 leading-tight text-center transition-all duration-300">
                    Start your brand with us
                  </h1>
                  <p className="pretendard-font mt-4 text-neutral-600 text-[clamp(14px,calc(11px+0.5vw),16px)] max-w-lg mx-auto font-normal text-center transition-all duration-300">
                    Upload a photo or just describe it — get pricing, MOQ, and lead time.
                    <br />
                    Made in Korea.
                  </p>
                </div>
              )}
              <div className={`w-full backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col font-sans transition-all duration-500 overflow-hidden relative group/card select-text ${
                messages.length > 1 
                  ? "fixed top-16 bottom-0 left-0 right-0 z-40 bg-white/95 rounded-none border-none p-4 pb-[max(env(safe-area-inset-bottom),16px)] md:relative md:top-auto md:bottom-auto md:left-auto md:right-auto md:w-[calc(100%-48px)] md:bg-white/85 md:rounded-[28px] md:border md:border-neutral-200/80 md:p-6 md:max-w-[1000px] md:h-[85vh] md:max-h-[900px]" 
                  : "relative max-w-[700px] w-[calc(100%-48px)] sm:w-full h-[200px] bg-white/85 rounded-[28px] border border-neutral-200/80 p-6"
              }`}>
                {messages.length > 1 && (
                  <div className="border-b border-neutral-100 pb-4 mb-4 select-text flex flex-col flex-1 min-h-0">
                    <div 
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto overscroll-contain touch-pan-y space-y-4 pr-1 text-[15px] text-left scrollbar-thin pb-2"
                    >
                      {messages.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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
                    className="gtm-chat-open w-full bg-transparent resize-none overflow-hidden border-0 outline-none focus:ring-0 text-[16px] text-neutral-900 placeholder-neutral-400 font-light leading-relaxed select-text min-h-[38px] pb-2"
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


              <div id="about-us-section" className="w-full flex flex-col font-sans text-left relative select-text bg-transparent rounded-none overflow-visible scroll-mt-24 mt-16 lg:mt-0">


                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }}>
                  <WhyKorea />
                </motion.div>






                {/* AI Workflow Section */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative mt-20 py-24 px-6 text-white border-t border-neutral-900 bg-neutral-950 mb-[-1px]" style={{width: '100vw', marginLeft: 'calc(-50vw + 50%)'}}>
          <div className="relative z-10 w-full">
            <div className="max-w-[770px] mx-auto w-full">
            <div className="text-center mb-16">
              <h2 className="text-[33px] lg:text-[45px] xl:text-[57px] font-black mb-4 lg:mb-6 tracking-tight leading-tight flex items-start justify-center gap-3 lg:gap-5 z-10">
                <span className="text-center">Start your brand with us</span>
              </h2>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-16 sm:mb-20">
              <div className="bg-neutral-900 p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-neutral-800 flex flex-col items-center text-center transition-all hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-900/20 border border-blue-800/30 flex items-center justify-center text-blue-400 mb-3 sm:mb-4 shrink-0">
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-[20px] font-bold text-white mb-1 sm:mb-4 leading-tight">AI inquiry</h3>
                <p className="text-[16px] text-neutral-400 font-light leading-relaxed">Describe what you need in natural language. Our assistant extracts specs automatically.</p>
              </div>
              <div className="bg-neutral-900 p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-neutral-800 flex flex-col items-center text-center transition-all hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-900/20 border border-blue-800/30 flex items-center justify-center text-blue-400 mb-3 sm:mb-4 shrink-0">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-[20px] font-bold text-white mb-1 sm:mb-4 leading-tight">Smart quoting</h3>
                <p className="text-[16px] text-neutral-400 font-light leading-relaxed">Receive a detailed proposal within 24 hours based on your exact requirements.</p>
              </div>
              <div className="bg-neutral-900 p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-neutral-800 flex flex-col items-center text-center transition-all hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-900/20 border border-blue-800/30 flex items-center justify-center text-blue-400 mb-3 sm:mb-4 shrink-0">
                  <LineChart className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-[20px] font-bold text-white mb-1 sm:mb-4 leading-tight">Production tracking</h3>
                <p className="text-[16px] text-neutral-400 font-light leading-relaxed">Real-time updates from sample approval through to shipment confirmation.</p>
              </div>
            </div>

            {/* 5-Step Process (2 Rows Layout) */}
            <div className="relative pt-2 sm:pt-0 flex flex-col gap-12 sm:gap-16 items-center">
              
              {/* Top Row (01 to 03) */}
              <div className="relative w-full max-w-[770px]">
                {/* Connecting lines for Row 1 */}
                <div className="hidden sm:block absolute top-[66px] left-[16%] right-[16%] h-[2px] bg-neutral-800 z-0"></div>
                <div className="sm:hidden absolute top-[60px] left-[15%] right-[15%] h-[2px] bg-neutral-800 z-0"></div>

                <div className="flex flex-wrap justify-center sm:grid sm:grid-cols-3 gap-y-10 sm:gap-8 relative z-10">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center group cursor-default w-[33%] sm:w-auto">
                    <div className="text-sm sm:text-[13px] font-bold text-blue-400 mb-2 transition-colors group-hover:text-blue-300">01</div>
                    <div className="w-[65px] h-[65px] sm:w-[76px] sm:h-[76px] rounded-2xl bg-neutral-900 border border-blue-800 flex items-center justify-center shadow-sm mb-3 text-blue-400 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:border-blue-400">
                      <MessageSquare className="w-8 h-8 sm:w-[30px] sm:h-[30px]" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-[15px] sm:text-[17px] font-bold text-white mb-1">Inquiry</h4>
                    <p className="text-xs sm:text-[13px] text-neutral-400 mb-2 transition-colors group-hover:text-neutral-300">Chat with AI</p>
                    <span className="px-3 py-1 bg-blue-900/50 text-blue-300 text-[10px] font-bold rounded-full tracking-wide border border-blue-800">AI</span>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center group cursor-default w-[33%] sm:w-auto">
                    <div className="text-sm sm:text-[13px] font-bold text-blue-400 mb-2 transition-colors group-hover:text-blue-300">02</div>
                    <div className="w-[65px] h-[65px] sm:w-[76px] sm:h-[76px] rounded-2xl bg-neutral-900 border border-blue-800 flex items-center justify-center shadow-sm mb-3 text-blue-400 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:border-blue-400">
                      <FileText className="w-8 h-8 sm:w-[30px] sm:h-[30px]" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-[15px] sm:text-[17px] font-bold text-white mb-1">Proposal</h4>
                    <p className="text-xs sm:text-[13px] text-neutral-400 mb-2 transition-colors group-hover:text-neutral-300">Within 24h</p>
                    <span className="px-3 py-1 bg-blue-900/50 text-blue-300 text-[10px] font-bold rounded-full tracking-wide border border-blue-800">AI</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center group cursor-default w-[33%] sm:w-auto">
                    <div className="text-sm sm:text-[13px] font-bold text-white mb-2 transition-colors group-hover:text-neutral-200">03</div>
                    <div className="w-[65px] h-[65px] sm:w-[76px] sm:h-[76px] rounded-2xl bg-neutral-900 border border-amber-800 flex items-center justify-center shadow-sm mb-3 text-amber-400 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:border-amber-400">
                      <Scissors className="w-8 h-8 sm:w-[30px] sm:h-[30px]" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-[15px] sm:text-[17px] font-bold text-white mb-1">Sample</h4>
                    <p className="text-xs sm:text-[13px] text-neutral-400 mb-2 transition-colors group-hover:text-neutral-300">14 days</p>
                    <span className="px-3 py-1 bg-amber-900/40 text-amber-300 border border-amber-700/50 text-[10px] font-bold rounded-full tracking-wide">Handcraft</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row (04 to 05) */}
              <div className="relative w-full max-w-[480px]">
                {/* Connecting lines for Row 2 */}
                <div className="absolute top-[60px] sm:top-[66px] left-[25%] right-[25%] h-[2px] bg-neutral-800 z-0"></div>

                <div className="grid grid-cols-2 gap-y-10 sm:gap-8 relative z-10">
                  {/* Step 4 */}
                  <div className="flex flex-col items-center text-center group cursor-default">
                    <div className="text-sm sm:text-[13px] font-bold text-white mb-2 transition-colors group-hover:text-neutral-200">04</div>
                    <div className="w-[65px] h-[65px] sm:w-[76px] sm:h-[76px] rounded-2xl bg-neutral-900 border border-amber-800 flex items-center justify-center shadow-sm mb-3 text-amber-400 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:border-amber-400">
                      <CheckCircle2 className="w-8 h-8 sm:w-[30px] sm:h-[30px]" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-[15px] sm:text-[17px] font-bold text-white mb-1">Production</h4>
                    <p className="text-xs sm:text-[13px] text-neutral-400 mb-2 transition-colors group-hover:text-neutral-300">Full QC</p>
                    <span className="px-3 py-1 bg-amber-900/40 text-amber-300 border border-amber-700/50 text-[10px] font-bold rounded-full tracking-wide">Handcraft</span>
                  </div>

                  {/* Step 5 */}
                  <div className="flex flex-col items-center text-center group cursor-default">
                    <div className="text-sm sm:text-[13px] font-bold text-blue-400 mb-2 transition-colors group-hover:text-blue-300">05</div>
                    <div className="w-[65px] h-[65px] sm:w-[76px] sm:h-[76px] rounded-2xl bg-neutral-900 border border-blue-800 flex items-center justify-center shadow-sm mb-3 text-blue-400 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:border-blue-400">
                      <Truck className="w-8 h-8 sm:w-[30px] sm:h-[30px]" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-[15px] sm:text-[17px] font-bold text-white mb-1">Shipment</h4>
                    <p className="text-xs sm:text-[13px] text-neutral-400 mb-2 transition-colors group-hover:text-neutral-300">Tracked</p>
                    <span className="px-3 py-1 bg-blue-900/50 text-blue-300 text-[10px] font-bold rounded-full tracking-wide border border-blue-800">AI</span>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>

          
                {/* Export Map inside the dark section */}
                <div className="flex w-full mt-[100px] lg:mt-[150px] max-w-[1200px] mx-auto justify-center">
                  <ExportMap className="mt-0 pb-10 pt-4 w-full" />
                </div>
                </motion.section>
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


              <div className="w-full flex flex-col font-sans text-left relative select-text bg-transparent rounded-none overflow-visible mt-16 lg:mt-0">
                
                {/* Product Page Hero Banner (Same as Manufacturing) */}
                <div 
                  className="relative h-[275px] sm:h-[400px] lg:h-[500px] flex flex-col items-center justify-center text-center px-4 overflow-hidden mb-8 lg:mb-12"
                  style={{ 
                    width: '100vw', 
                    marginLeft: 'calc(50% - 50vw)',
                    marginRight: 'calc(50% - 50vw)'
                  }}
                >
                  <img 
                    src="/close-up-cozy-texture-clothing.jpg" 
                    alt="Cozy Fabric Texture" 
                    className="absolute inset-0 w-full h-full object-cover scale-150 sm:scale-100 transition-transform duration-500 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-neutral-900/55 mix-blend-multiply"></div>
                  <h2 className="relative z-10 text-white font-sans font-black text-3xl sm:text-4xl lg:text-5xl max-w-4xl tracking-tight leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
                    Premium Fabric,<br className="hidden sm:block" /> Flawless Details
                  </h2>
                </div>

                {/* Unified View */}
                <div className="flex flex-col w-full px-4 lg:px-0">
                  <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="pt-[150px] pb-0 w-full overflow-hidden bg-transparent">
                    <div className="max-w-[1000px] mx-auto px-6 mb-12 flex flex-col items-center text-center gap-8 relative">
                      <div className="relative z-10">
                        <h2 className="text-[33px] lg:text-[45px] xl:text-[57px] font-black tracking-tight text-neutral-900 leading-tight mb-4 lg:mb-6 flex items-start justify-center gap-3 lg:gap-5">
                          Custom Apparel Solutions
                        </h2>
                        <p className="text-[15px] sm:text-lg lg:text-[20px] text-neutral-600 font-light leading-relaxed max-w-2xl mx-auto px-6 sm:px-0">
                          Discover KAW's signature production lineup featuring perfect fits and flawless details.
                        </p>
                      </div>
                    </div>
                    <div className="max-w-[1300px] mx-auto px-4 lg:px-20 w-full relative group/carousel">
                      {/* Controls */}
                      <button 
                        onClick={() => scrollProductGallery('left')}
                        className="hidden lg:flex absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-neutral-100 items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors z-20 cursor-pointer"
                        aria-label="Scroll Left"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => scrollProductGallery('right')}
                        className="hidden lg:flex absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-neutral-100 items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors z-20 cursor-pointer"
                        aria-label="Scroll Right"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>

                      {/* Carousel */}
                      <div 
                        ref={productCarouselRef}
                        className="flex gap-4 pb-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {[
                          'w1.png', 'w2.png', 'w3.png', 'w4.png', 'w5.png', 'w6.png',
                          'm1.png', 'm2.png', 'm3.png', 'm4.png', 'm5.png', 'm6.png'
                        ].map((img, idx) => {
                          const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://tznhtceeqozjndfllknm.supabase.co";
                          const optimizedUrl = `${supabaseUrl}/storage/v1/render/image/public/clothes/${encodeURIComponent(img)}?format=webp&quality=80`;
                          return (
                          <div key={idx} className="w-[calc(50%-8px)] shrink-0 snap-start bg-white overflow-hidden shadow-sm rounded-xl">
                            <div className="aspect-[3/4] w-full bg-neutral-100 relative overflow-hidden group/item">
                              <img src={optimizedUrl} alt={`Product ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-105" loading="lazy" />
                            </div>
                          </div>
                        )})}
                      </div>
                    </div>
                  </motion.section>

                  {/* Fabrics Section */}
                  <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="hidden pt-24 pb-16 w-full bg-transparent">
                    <div className="max-w-[1000px] mx-auto px-6 mb-12 flex flex-col items-center text-center gap-6">
                      <h2 className="text-[33px] lg:text-[45px] font-black tracking-tight text-neutral-900 leading-tight">
                        Premium Fabrics
                      </h2>
                      <p className="text-[15px] sm:text-lg text-neutral-600 font-light leading-relaxed max-w-2xl mx-auto">
                        We source the finest materials globally to ensure unparalleled comfort, durability, and performance for your brand.
                      </p>
                    </div>
                    
                    <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      {/* Fabric 1 */}
                      <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden group">
                        <img src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=1000" alt="Cotton Fabric" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 transition-opacity duration-300"></div>
                        <div className="absolute bottom-6 left-6 right-6 text-left transform transition-transform duration-500 group-hover:-translate-y-2">
                          <h3 className="text-white font-bold text-xl sm:text-2xl mb-1 sm:mb-2">Organic Cotton</h3>
                          <p className="text-neutral-200 text-sm sm:text-base font-light">Breathable, soft, and sustainable</p>
                        </div>
                      </div>
                      
                      {/* Fabric 2 */}
                      <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden group">
                        <img src="https://images.unsplash.com/photo-1596435422891-b3b3e8e25d48?auto=format&fit=crop&q=80&w=1000" alt="Performance Fabric" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 transition-opacity duration-300"></div>
                        <div className="absolute bottom-6 left-6 right-6 text-left transform transition-transform duration-500 group-hover:-translate-y-2">
                          <h3 className="text-white font-bold text-xl sm:text-2xl mb-1 sm:mb-2">Performance Blends</h3>
                          <p className="text-neutral-200 text-sm sm:text-base font-light">Moisture-wicking activewear fabrics</p>
                        </div>
                      </div>

                      {/* Fabric 3 */}
                      <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden group">
                        <img src="https://images.unsplash.com/photo-1584347781845-80f0bcfb8d0d?auto=format&fit=crop&q=80&w=1000" alt="Knit Fabric" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 transition-opacity duration-300"></div>
                        <div className="absolute bottom-6 left-6 right-6 text-left transform transition-transform duration-500 group-hover:-translate-y-2">
                          <h3 className="text-white font-bold text-xl sm:text-2xl mb-1 sm:mb-2">Premium Knits</h3>
                          <p className="text-neutral-200 text-sm sm:text-base font-light">Heavyweight and textured materials</p>
                        </div>
                      </div>
                    </div>
                  </motion.section>

                </div>




              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

