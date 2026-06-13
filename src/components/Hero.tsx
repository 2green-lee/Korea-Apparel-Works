import React, { useState, useEffect, useRef } from "react";
import { Camera, Mic, ArrowUp, RefreshCw, Search, Ruler, ChevronLeft, ChevronRight, Shirt, Award, Layers, Sparkles, Check, History, MessageSquare, FileText, Truck, User } from "lucide-react";
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
    name: "기타 (OTHERS)",
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

  const slideVariants = {
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
  };

  const slideTransition = {
    duration: 0.8,
    ease: [0.16, 1, 0.3, 1]
  };

  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generationIdRef = useRef(0);
  const sessionIdRef = useRef(crypto.randomUUID());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = textarea.scrollHeight;
      if (messages.length > 1) {
        textarea.style.height = `${Math.min(Math.max(newHeight, 38), 180)}px`;
      } else {
        textarea.style.height = `${Math.min(Math.max(newHeight, 52), 300)}px`;
      }
    }
  }, [chatInput, messages.length]);

  const handlePrevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleNextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isGenerating) return;

    const userMsg = chatInput.trim();
    setChatInput("");

    const isFirstConversationTurn = messages.length === 1;

    generationIdRef.current += 1;
    const currentId = generationIdRef.current;

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsGenerating(true);

    if (isFirstConversationTurn && !user) {
      setTimeout(() => {
        if (currentId === generationIdRef.current) {
          onOpenLogin();
        }
      }, 1200);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          userId: user?.id,
          userEmail: user?.email,
          message: userMsg,
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

  const handleQuickCommand = async (promptText: string) => {
    if (isGenerating) return;

    const isFirstConversationTurn = messages.length === 1;

    generationIdRef.current += 1;
    const currentId = generationIdRef.current;

    setMessages((prev) => [...prev, { role: "user", text: promptText }]);
    setIsGenerating(true);

    if (isFirstConversationTurn && !user) {
      setTimeout(() => {
        if (currentId === generationIdRef.current) {
          onOpenLogin();
        }
      }, 1200);
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          userId: user?.id,
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isGenerating) return;

    e.target.value = '';

    const isFirstConversationTurn = messages.length === 1;
    generationIdRef.current += 1;
    const currentId = generationIdRef.current;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: `Uploading: ${file.name}`, imageUrl: URL.createObjectURL(file) }
    ]);
    setIsGenerating(true);

    if (isFirstConversationTurn && !user) {
      setTimeout(() => {
        if (currentId === generationIdRef.current) {
          onOpenLogin();
        }
      }, 1200);
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const folderName = user ? user.id : sessionIdRef.current;
      const isDocument = file.type === 'application/pdf';
      const subFolder = isDocument ? 'tech-packs' : 'sample-images';
      const filePath = `${folderName}/${subFolder}/${fileName}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderName", `${folderName}/${subFolder}`);
      formData.append("fileName", fileName);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const publicUrlData = await uploadResponse.json();

      const imageUrl = publicUrlData.publicUrl;

      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: "user", text: file.name, imageUrl: imageUrl };
        return newMsgs;
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          userId: user?.id,
          message: `[Image Attached: ${imageUrl}] Please analyze this image for apparel manufacturing.`,
          imageUrl: imageUrl,
          history: messages.slice(1)
        })
      });

      const data = await response.json();
      if (currentId !== generationIdRef.current) return;

      if (data.error) {
        setMessages((prev) => [...prev, { role: "model", text: `Error: ${data.error}` }]);
      } else {
        setMessages((prev) => [...prev, { role: "model", text: data.text }]);
      }
    } catch (err: any) {
      if (currentId !== generationIdRef.current) return;
      setMessages((prev) => [
        ...prev,
        { role: "model", text: `Image processing failed: ${err.message || 'Unknown error'}` }
      ]);
    } finally {
      if (currentId === generationIdRef.current) setIsGenerating(false);
    }
  };

  const handleAnalyzeImage = () => {
    if (!user) {
      onOpenLogin();
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <section className={`relative w-full flex flex-col justify-center items-center overflow-x-hidden overflow-y-visible z-10 px-4 md:px-8 transition-all duration-500 min-h-[100vh] py-20`}>
      


      <button
        onClick={handlePrevSlide}
        className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 active:scale-95 flex items-center justify-center transition-all duration-300 cursor-pointer group text-neutral-700 hover:text-neutral-950"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-[28px] h-[28px] group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={handleNextSlide}
        className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 active:scale-95 flex items-center justify-center transition-all duration-300 cursor-pointer group text-neutral-700 hover:text-neutral-950"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-[28px] h-[28px] group-hover:translate-x-0.5 transition-transform" />
      </button>

      <div className={`relative z-10 w-full flex flex-col items-center justify-center text-center px-4 select-none transition-all duration-500 ${
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
                  <img src="/logo1.png" alt="Korea Apparel Works Logo" className="w-[clamp(50px,calc(35px+2.5vw),60px)] mb-[50px] select-none pointer-events-none transition-all duration-300" />
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
                    ref={textareaRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onFocus={() => {
                      if (!user) {
                        if (textareaRef.current) textareaRef.current.blur();
                        onOpenLogin();
                      }
                    }}
                    placeholder="We excel in crafting bespoke apparel and tops with premium-grade fabrics. Tell us what you want to make..."
                    className="w-full bg-transparent resize-none overflow-hidden border-0 outline-none focus:ring-0 text-sm md:text-base text-neutral-900 placeholder-neutral-400 font-light leading-relaxed select-text min-h-[38px] pb-2"
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
                        onClick={() => setChatInput("Describe the fabrics for custom streetwear production.")}
                        className="p-2.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition duration-300 cursor-pointer"
                        title="Voice dictation prompt"
                      >
                        <Mic className="w-4 h-4" />
                      </button>

                      <button
                        type="submit"
                        disabled={!chatInput.trim() || isGenerating}
                        className={`p-2.5 rounded-full aspect-square flex items-center justify-center transition-all duration-300 cursor-pointer ${
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
              <div className="flex space-x-2.5 mb-5 mt-24">
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
                <div className="pt-16 pb-12 px-8 md:px-12 border-b border-neutral-100/55 w-full bg-transparent flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                  <div className="flex-1 w-full lg:pr-4">
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

                <div className="w-full py-16 px-8 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start border-b border-neutral-100 bg-transparent">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-neutral-950 mb-6 font-sans">From one factory floor to a global platform</h2>
                    <div className="space-y-4 text-sm md:text-base text-neutral-600 leading-relaxed font-light">
                      <p>It started with my father. For over 30 years, he ran a garment manufacturing facility in Korea — producing premium men's polo shirts, golf wear, and performance collar tees with the kind of precision that only comes from decades of hands-on craft.</p>
                      <p>The factory had deep expertise and a loyal client base, but like many traditional manufacturers, it had never been connected to the global market. Orders came through local networks. The technology stayed the same. The world moved on.</p>
                      <p>Watching this, I saw an opportunity — not to replace what my father had built, but to open it up. Korea Apparel Works is the bridge between that 30 years of manufacturing heritage and the brands worldwide who are looking for exactly what we make.</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-10">
                    <div className="w-full aspect-[16/9] md:aspect-[3/2] rounded-2xl overflow-hidden border border-neutral-200/80 relative group bg-neutral-100">
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
              <div className="flex space-x-2.5 mb-5 mt-24">
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

              <div className="w-full flex flex-col font-sans text-left relative select-text bg-transparent border border-transparent rounded-none p-4 md:p-0 pt-16 md:pt-16 overflow-hidden">
                <div id="collection-section" className="mb-8 pb-6 border-b border-neutral-100">
                  <h1 className="font-sans text-3xl md:text-4xl font-semibold text-neutral-950 tracking-tight leading-tight">
                    {SLIDES[2].headline}
                  </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white hover:bg-neutral-50/50 rounded-2xl p-6 md:p-8 border border-neutral-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center mb-5 transition-colors group-hover:bg-neutral-950 group-hover:text-white">
                        <Shirt className="w-5.5 h-5.5" strokeWidth={1.5} />
                      </div>
                      <h4 className="text-base font-bold text-neutral-950 mb-2.5">Signature Workshop Hoodie</h4>
                      <p className="text-sm text-neutral-600 font-light leading-relaxed mb-4">
                        Uses 480gsm premium high-density cotton loopback French terry to guarantee a perfect drape, unique 3D silhouette, and excellent warmth.
                      </p>
                      
                      <div className="bg-neutral-50/80 rounded-xl p-3 border border-neutral-100/80 mb-5 text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">원단 종류</span>
                          <span className="text-neutral-800 font-semibold">Heavy French Terry</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">중량/밀도</span>
                          <span className="text-neutral-800 font-mono font-semibold">480 gsm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">주원사</span>
                          <span className="text-neutral-800 font-semibold">100% Combed Cotton</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-neutral-100 pt-4 mt-auto">
                      <div className="flex items-center justify-between text-xs md:text-sm font-mono text-neutral-500">
                        <span>MOQ: 30장</span>
                        <span className="text-neutral-950 font-semibold">M - XXL</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white hover:bg-neutral-50/50 rounded-2xl p-6 md:p-8 border border-neutral-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center mb-5 transition-colors group-hover:bg-neutral-950 group-hover:text-white">
                        <Shirt className="w-5.5 h-5.5" strokeWidth={1.2} />
                      </div>
                      <h4 className="text-base font-bold text-neutral-950 mb-2.5">Compact Flawless T-Shirt</h4>
                      <p className="text-sm text-neutral-600 font-light leading-relaxed mb-4">
                        Designed with 280gsm compact single cotton knit for wash shrinkage under 1%, featuring shoulder chain stitching and a dense double rib finish.
                      </p>

                      <div className="bg-neutral-50/80 rounded-xl p-3 border border-neutral-100/80 mb-5 text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">원단 종류</span>
                          <span className="text-neutral-800 font-semibold">Compact Silket Single</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">중량/밀도</span>
                          <span className="text-neutral-800 font-mono font-semibold">280 gsm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">주원사</span>
                          <span className="text-neutral-800 font-semibold">100% Supima Cotton</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-neutral-100 pt-4 mt-auto">
                      <div className="flex items-center justify-between text-xs md:text-sm font-mono text-neutral-500">
                        <span>MOQ: 50장</span>
                        <span className="text-neutral-950 font-semibold">S - XL</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white hover:bg-neutral-50/50 rounded-2xl p-6 md:p-8 border border-neutral-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center mb-5 transition-colors group-hover:bg-neutral-950 group-hover:text-white">
                        <Layers className="w-5.5 h-5.5" strokeWidth={1.5} />
                      </div>
                      <h4 className="text-base font-bold text-neutral-950 mb-2.5">Technical City Shell Jacket</h4>
                      <p className="text-sm text-neutral-600 font-light leading-relaxed mb-4">
                        Constructed from wind and water-resistant memory recycled nylon yarn, standing out with an urban 3D sleeve structure and high-precision seam sealing stitches.
                      </p>

                      <div className="bg-neutral-50/80 rounded-xl p-3 border border-neutral-100/80 mb-5 text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">원단 종류</span>
                          <span className="text-neutral-800 font-semibold">Memory Recycled Nylon</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">중량/밀도</span>
                          <span className="text-neutral-800 font-mono font-semibold">145 gsm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">가공 처리</span>
                          <span className="text-neutral-800 font-semibold">DWR Water-Repellent</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-neutral-100 pt-4 mt-auto">
                      <div className="flex items-center justify-between text-xs md:text-sm font-mono text-neutral-500">
                        <span>MOQ: 30장</span>
                        <span className="text-neutral-950 font-semibold">M - XL</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full mt-12 bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.03)] relative overflow-hidden" id="fabrics-catalog">
                  <div className="mb-8">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Materials
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold font-sans text-neutral-950 tracking-tight">
                      Choose your fabric
                    </h3>
                    <p className="text-xs md:text-sm text-neutral-500 font-light mt-1.5 max-w-2xl leading-relaxed">
                      우리는 세 가지 빌딩 블록(Performance, Classic, Premium / Design) 유형의 검증된 고규격 원단 라인업을 제공합니다. 아래 카테고리를 활용해 원하는 물성과 스타일의 원단을 비교해 보세요.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {[
                      { id: "all", label: "All fabrics" },
                      { id: "Performance", label: "Performance" },
                      { id: "Classic", label: "Classic" },
                      { id: "Premium / Design", label: "Premium / Design" }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => {
                          setActiveFabricCategory(btn.id);
                        }}
                        className={`px-4.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 ${
                          activeFabricCategory === btn.id
                            ? "bg-neutral-950 text-white border border-neutral-950 shadow-sm"
                            : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:text-neutral-900"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const filtered = activeFabricCategory === "all"
                      ? PREMIUM_FABRICS
                      : PREMIUM_FABRICS.filter((f) => f.category === activeFabricCategory);

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="fabricGrid">
                        {filtered.map((f) => (
                          <div
                            key={f.id}
                            className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden hover:border-emerald-500 hover:shadow-[0_12px_30px_rgba(5,150,105,0.06)] transition-all duration-300 flex flex-col group justify-between"
                          >
                            <div className="h-24 bg-neutral-50 flex items-center justify-center border-b border-neutral-100 relative overflow-hidden">
                              {getFabricPatternSvg(f.id, f.engName)}
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between items-center text-[10px] font-mono mb-1.5">
                                    <span className="font-bold text-emerald-700 bg-emerald-50/70 px-2 py-0.5 rounded">
                                      {f.category}
                                    </span>
                                    <span className="font-semibold text-neutral-400">
                                      {f.weight}
                                    </span>
                                  </div>
                                  <h4 className="text-base font-bold text-neutral-900 tracking-tight font-sans">
                                    {f.name}
                                  </h4>
                                  <div className="text-[10px] text-neutral-400 mt-1 font-sans leading-normal">
                                    {f.composition}
                                  </div>
                                </div>

                                <p className="text-xs text-neutral-500 font-light leading-relaxed">
                                  {f.description}
                                </p>

                                <div className="flex flex-wrap gap-1">
                                  {f.tags.map((tag, idx) => {
                                    const colorClasses = 
                                      idx === 0 ? "bg-blue-50 text-blue-800 border-blue-100/50" :
                                      idx === 1 ? "bg-emerald-50 text-emerald-800 border-emerald-100/50" :
                                      "bg-neutral-50 text-neutral-600 border-neutral-200/50";
                                    return (
                                      <span
                                        key={idx}
                                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${colorClasses}`}
                                      >
                                        {tag}
                                      </span>
                                    );
                                  })}
                                </div>

                                <div className="flex flex-wrap gap-1 border-t border-neutral-100 pt-3">
                                  {f.uses.map((use, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[9px] text-neutral-400 bg-neutral-50 border border-neutral-100 px-2 py-0.5 rounded"
                                    >
                                      {use}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentSlide(0);
                                  setChatInput(`"${f.name} (${f.engName})" 원단에 대하여 제작 견적과 발주 진행 요령에 대해 문의하고 싶습니다.`);
                                  setTimeout(() => {
                                    const textarea = document.querySelector("textarea");
                                    if (textarea) {
                                      textarea.focus();
                                    }
                                  }, 150);
                                }}
                                className="w-full mt-5 bg-white hover:bg-neutral-950 text-neutral-600 hover:text-white border border-neutral-200 hover:border-neutral-950 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer group"
                              >
                                <span>Inquire about {f.engName.split(' ').pop()}</span>
                                <span className="text-neutral-400 group-hover:text-neutral-200 transition-colors">↗</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div id="ai-tech-section" className="w-full py-12 px-6 md:px-10 bg-[#e8f7f0] border border-[#b2e4cb] rounded-2xl mt-12 shadow-[0_8px_30px_rgba(5,150,105,0.04)]">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-10 items-start mb-10">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-neutral-950 mb-3 leading-snug">AI-powered from inquiry to delivery</h2>
                      <p className="text-sm md:text-base text-neutral-800 leading-relaxed font-light">We've integrated AI across the entire production workflow — so international buyers can place orders in any language, get accurate quotes instantly, and track every step of production without picking up the phone.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div className="p-6 border border-[#b2e4cb] bg-white rounded-2xl shadow-[0_4px_20px_rgba(5,150,105,0.03)] hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-xl bg-[#059669]/10 flex items-center justify-center text-[#059669] mb-4">
                           <MessageSquare className="w-5 h-5 text-[#059669]" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-base font-bold text-neutral-950 mb-2">AI inquiry</h3>
                        <p className="text-xs md:text-sm text-neutral-600 leading-[1.6] font-light">Describe what you need in natural language. Our assistant extracts specs automatically.</p>
                      </div>
                      <div className="p-6 border border-[#b2e4cb] bg-white rounded-2xl shadow-[0_4px_20px_rgba(5,150,105,0.03)] hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-xl bg-[#059669]/10 flex items-center justify-center text-[#059669] mb-4">
                           <FileText className="w-5 h-5 text-[#059669]" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-base font-bold text-neutral-950 mb-2">Smart quoting</h3>
                        <p className="text-xs md:text-sm text-neutral-600 leading-[1.6] font-light">Receive a detailed proposal within 24 hours based on your exact requirements.</p>
                      </div>
                      <div className="p-5 border border-[#b2e4cb] bg-white rounded-2xl shadow-[0_4px_20px_rgba(5,150,105,0.03)] hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-xl bg-[#059669]/10 flex items-center justify-center text-[#059669] mb-4">
                           <Truck className="w-5 h-5 text-[#059669]" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-base font-bold text-neutral-950 mb-2">Production tracking</h3>
                        <p className="text-xs md:text-sm text-neutral-600 leading-[1.6] font-light">Real-time updates from sample approval through to shipment confirmation.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-stretch border border-[#b2e4cb] bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex-1 w-full md:w-auto p-6 text-center border-b md:border-b-0 md:border-r border-[#e8f7f0] flex flex-col items-center justify-center">
                      <div className="text-xs md:text-sm font-mono text-[#059669] font-bold tracking-widest mb-2">01</div>
                      <div className="text-sm md:text-base font-bold text-neutral-950 mb-1">Inquiry</div>
                      <div className="text-xs md:text-sm text-neutral-500 mb-2.5 font-light">Chat with AI</div>
                      <div className="mt-auto inline-block text-[11px] font-semibold tracking-wider uppercase bg-[#059669]/10 text-[#059669] border border-[#059669]/20 px-2.5 py-0.5 rounded-full">AI</div>
                    </div>
                    <div className="flex-1 w-full md:w-auto p-6 text-center border-b md:border-b-0 md:border-r border-[#e8f7f0] flex flex-col items-center justify-center">
                      <div className="text-xs md:text-sm font-mono text-[#059669] font-bold tracking-widest mb-2">02</div>
                      <div className="text-sm md:text-base font-bold text-neutral-950 mb-1">Proposal</div>
                      <div className="text-xs md:text-sm text-neutral-500 mb-2.5 font-light">Within 24h</div>
                      <div className="mt-auto inline-block text-[11px] font-semibold tracking-wider uppercase bg-[#059669]/10 text-[#059669] border border-[#059669]/20 px-2.5 py-0.5 rounded-full">AI</div>
                    </div>
                    <div className="flex-1 w-full md:w-auto p-6 text-center border-b md:border-b-0 md:border-r border-[#e8f7f0] flex flex-col items-center justify-center">
                      <div className="text-xs md:text-sm font-mono text-[#059669] font-bold tracking-widest mb-2">03</div>
                      <div className="text-sm md:text-base font-bold text-neutral-950 mb-1">Sample</div>
                      <div className="text-xs md:text-sm text-neutral-500 mb-2.5 font-light">14 day turnaround</div>
                      <div className="mt-auto inline-block text-[11px] font-semibold tracking-wider uppercase bg-neutral-950/5 text-neutral-700 border border-neutral-950/10 px-2.5 py-0.5 rounded-full">Handcraft</div>
                    </div>
                    <div className="flex-1 w-full md:w-auto p-6 text-center border-b md:border-b-0 md:border-r border-[#e8f7f0] flex flex-col items-center justify-center">
                      <div className="text-xs md:text-sm font-mono text-[#059669] font-bold tracking-widest mb-2">04</div>
                      <div className="text-sm md:text-base font-bold text-neutral-950 mb-1">Production</div>
                      <div className="text-xs md:text-sm text-neutral-500 mb-2.5 font-light">Full QC inspection</div>
                      <div className="mt-auto inline-block text-[11px] font-semibold tracking-wider uppercase bg-neutral-950/5 text-neutral-700 border border-neutral-950/10 px-2.5 py-0.5 rounded-full">Handcraft</div>
                    </div>
                    <div className="flex-1 w-full md:w-auto p-6 text-center flex flex-col items-center justify-center">
                      <div className="text-xs md:text-sm font-mono text-[#059669] font-bold tracking-widest mb-2">05</div>
                      <div className="text-sm md:text-base font-bold text-neutral-950 mb-1">Shipment</div>
                      <div className="text-xs md:text-sm text-neutral-500 mb-2.5 font-light">Tracked delivery</div>
                      <div className="mt-auto inline-block text-[11px] font-semibold tracking-wider uppercase bg-[#059669]/10 text-[#059669] border border-[#059669]/20 px-2.5 py-0.5 rounded-full">AI</div>
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
      <div className="relative z-10 w-full max-w-4xl mt-12 flex justify-between items-center text-neutral-400 font-mono text-[9px] uppercase tracking-[0.15em] select-none" />
    </section>
  );
}

