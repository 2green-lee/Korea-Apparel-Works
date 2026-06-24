import React, { useRef, useState } from 'react';
import ExportMap from './ExportMap';

const fabricsData = [
  { id: "mesh", name: "MESH", desc: "An outstandingly fast sweat-wicking and refreshing mesh fabric featuring a hole structure that maximizes air circulation. It perfectly serves high-performance sports and daily casual outerwear in hot, humid climates." },
  { id: "jersey", name: "JERSEY", desc: "A functional single jersey with excellent surface retention and firm bounce-back. Free from distortion along the stretch axis, it is ideal for high-class activewear and t-shirts to minimize sagging on necklines or elbows." },
  { id: "flat-back-rib", name: "FLAT BACK RIB", desc: "A high-performance rib fabric with a dense ribbed structure that is flat-woven on the back for maximum security and excellent stretch. High pilling resistance makes it optimal for premium sportswear necks and cuffs." },
  { id: "pique", name: "PIQUE", desc: "A heritage pique fabric with a sophisticated honeycomb texture. It stays clear of the skin to maintain dryness, standing as the primary choice for luxury polo shirts and casual tennis wear." },
  { id: "interlock", name: "INTERLOCK", desc: "A double-sided interlock fabric offering an ultra-smooth touch and uniform weave with no distinction between front and back. Biowashed and silket-finished, it delivers a subtle silk-like luster perfect for premium loungewear and sweatshirts." },
  { id: "jacquard", name: "JACQUARD", desc: "A high-end jacquard fabric where patterns are physically woven into the structure rather than printed. The fabric itself carries deep silhouettes and volume, bringing a luxury collection mood with a single garment." },
  { id: "stripe", name: "STRIPE", desc: "A modern knit with stripes and colors precision-dyed before weaving for perfect line spacing and color fastness. Resistant to bleeding or fading after washes, it retains its timeless French marine aesthetic." },
  { id: "others", name: "OTHERS", desc: "Various other specialty fabrics and customized weaves built to your direct design requirements and styling instructions." }
];
import { ArrowRight, MessageCircle, Factory, Package, ShieldCheck, Zap, Bot, LineChart, MessageSquare, FileText, Scissors, CheckCircle2, Truck, ChevronLeft, ChevronRight, Plus, Minus, MoreHorizontal } from 'lucide-react';

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
          <rect x="35" y="30" width="130" height="24" rx="4" fill="#ffffff" fillOpacity="0.9" />
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
          <rect x="35" y="30" width="130" height="24" rx="4" fill="#ffffff" fillOpacity="0.9" />
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
          <rect x="35" y="30" width="130" height="24" rx="4" fill="#ffffff" fillOpacity="0.9" />
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
          <rect x="35" y="30" width="130" height="24" rx="4" fill="#ffffff" fillOpacity="0.9" />
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
          <rect x="35" y="30" width="130" height="24" rx="4" fill="#ffffff" fillOpacity="0.9" />
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
          <rect x="35" y="30" width="130" height="24" rx="4" fill="#ffffff" fillOpacity="0.9" />
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
          <rect x="35" y="30" width="130" height="24" rx="4" fill="#ffffff" fillOpacity="0.9" />
          <text x="100" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="#475569" fontFamily="monospace" letterSpacing="0.15em">
            {nameEng.toUpperCase()}
          </text>
        </svg>
      );
    default:
      return null;
  }
};

export default function StartLanding() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [openFabric, setOpenFabric] = useState<string | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth > 640 ? 400 : 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col relative">
      {/* Absolute Header for Brand Name (h-16 matches main Header exactly) */}
      <header className="absolute top-0 left-0 right-0 h-16 flex justify-center items-center z-50">
        <a href="/" className="group focus:outline-hidden flex flex-col items-center">
          <span className="font-sans font-medium text-[13px] sm:text-[17px] tracking-normal sm:tracking-[0.1em] transition-colors duration-500 select-none text-neutral-900 group-hover:opacity-80 whitespace-nowrap">
            Korea Apparel Works
          </span>
        </a>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="w-full bg-gradient-to-br from-white from-40% via-blue-100 via-75% to-indigo-200">
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 flex flex-col items-center text-center overflow-hidden flex-1 justify-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-neutral-100/80 border border-neutral-200 text-sm font-medium text-neutral-600 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Full-Package OEM/ODM Solutions
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Apparel Production <br />
            <span className="text-blue-600">Handled from A to Z.</span>
          </h1>

          {/* Description */}
          <p className="max-w-2xl text-lg md:text-xl text-neutral-500 font-light mb-12 leading-relaxed">
            From sampling to low-MOQ runs and bulk OEM/ODM manufacturing — we take care of the complex garment production process from start to finish, giving you direct access to premium "Made in Korea" production.
          </p>

          {/* Buttons */}
          <div className="flex justify-center mb-20 w-full">
            <a id="gtm-start-hero-quote-btn" href="/" className="gtm-conversion-btn inline-flex items-center justify-center gap-2 px-10 py-4 bg-neutral-900 text-white rounded-xl font-medium text-lg hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/20 hover:-translate-y-0.5">
              Get a Free Quote
              <ArrowRight size={20} />
            </a>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-6 md:gap-16 pt-8 border-t border-neutral-200 max-w-3xl w-full">
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">1<span className="text-xl md:text-2xl font-bold text-neutral-500">pcs~</span></div>
              <div className="text-xs md:text-sm text-neutral-500 font-medium">Minimum Order (MOQ)</div>
            </div>
            <div className="flex flex-col items-center border-l border-neutral-200 pl-6 md:pl-16">
              <div className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">3~14<span className="text-xl md:text-2xl font-bold text-neutral-500">days</span></div>
              <div className="text-xs md:text-sm text-neutral-500 font-medium">Sample Lead Time</div>
            </div>
            <div className="flex flex-col items-center border-l border-neutral-200 pl-6 md:pl-16">
              <div className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">100<span className="text-xl md:text-2xl font-bold text-neutral-500">+</span></div>
              <div className="text-xs md:text-sm text-neutral-500 font-medium">Partner Brands</div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="w-full bg-transparent py-16 md:py-24 px-6 flex flex-col items-center text-center">
          <div className="max-w-4xl w-full flex flex-col items-center bg-white/70 backdrop-blur-xl border border-white/80 shadow-xl rounded-3xl p-10 md:p-16 hover:-translate-y-2 hover:shadow-2xl hover:bg-white/80 transition-all duration-500">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-10">
              From one factory floor to a global platform
            </h2>
            <div className="space-y-6 text-[15px] sm:text-lg md:text-xl text-neutral-800 font-light leading-relaxed max-w-3xl">
              <p>
                Our story begins with my father.
              </p>
              <p>
                For over 30 years, he ran an apparel factory in Korea, crafting premium polo shirts and golf wear with true craftsmanship.
              </p>
              <p>
                Despite having outstanding technical skills, the factory was like many traditional manufacturers. It relied on local, word-of-mouth orders, entirely disconnected from the global market while the rest of the world rapidly moved forward.
              </p>
              <p>
                I wanted to bring the exceptional expertise my father spent a lifetime building out into the world. Connecting global brands with 30 years of steadfast manufacturing know-how and genuine quality.
              </p>
            </div>
          </div>
        </section>
        </div>

        {/* Capabilities Section */}
        <section className="w-full bg-white py-24 md:py-32 px-6">
          <div className="max-w-[770px] mx-auto w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
                Why Korea Apparel Works
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-8">
            <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-neutral-200 flex flex-col items-center text-center transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-3 sm:mb-6 text-neutral-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:scale-110 transition-all duration-300">
                <Factory className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
              </div>
              <div className="text-[13px] sm:text-lg md:text-xl font-bold text-neutral-900 tracking-tight mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors leading-tight">30 Years of Manufacturing Expertise</div>
              <p className="text-[11px] sm:text-sm text-neutral-500 font-light leading-relaxed">
                Family-owned factory with direct production and transparent processes.
              </p>
            </div>

            <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-neutral-200 flex flex-col items-center text-center transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-3 sm:mb-6 text-neutral-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:scale-110 transition-all duration-300">
                <Package className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
              </div>
              <div className="text-[13px] sm:text-lg md:text-xl font-bold text-neutral-900 tracking-tight mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors leading-tight">Full-Package OEM/ODM Solutions</div>
              <p className="text-[11px] sm:text-sm text-neutral-500 font-light leading-relaxed">
                From design to finished product, we manage every production stage.
              </p>
            </div>

            <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-neutral-200 flex flex-col items-center text-center transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-3 sm:mb-6 text-neutral-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:scale-110 transition-all duration-300">
                <ShieldCheck className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
              </div>
              <div className="text-[13px] sm:text-lg md:text-xl font-bold text-neutral-900 tracking-tight mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors leading-tight">Premium Quality Control</div>
              <p className="text-[11px] sm:text-sm text-neutral-500 font-light leading-relaxed">
                High-end craftsmanship and technical expertise for performance apparel.
              </p>
            </div>

            <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-neutral-200 flex flex-col items-center text-center transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-3 sm:mb-6 text-neutral-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:scale-110 transition-all duration-300">
                <Zap className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
              </div>
              <div className="text-[13px] sm:text-lg md:text-xl font-bold text-neutral-900 tracking-tight mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors leading-tight">Flexible MOQ</div>
              <p className="text-[11px] sm:text-sm text-neutral-500 font-light leading-relaxed">
                Prototype from 1 piece and scale production as your brand grows.
              </p>
            </div>
            </div>
          </div>

          {/* Atelier Image Gallery */}
          <div className="w-full mt-20 md:mt-[250px] overflow-hidden relative">
            {/* Gradient overlays removed as requested */}
            
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
                  {['/b1.jpg', '/b2-2.jpg', '/b3.jpg', '/b4.jpg', '/b5.jpg', '/b6.jpg', '/b7.jpg', '/b8.jpg', '/b9.jpg'].map((imgUrl, idx) => (
                    <div key={`${groupIdx}-${idx}`} className="flex-none w-[50vw] sm:w-[320px] md:w-[400px] aspect-[4/3] rounded-xl overflow-hidden border border-neutral-200/80 bg-neutral-100 shadow-sm">
                      <img 
                        src={imgUrl} 
                        alt={`Atelier gallery ${idx + 1}`} 
                        loading="lazy"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* AI Workflow Section */}
        <section className="mt-20 py-24 px-6 w-full bg-neutral-950 text-white border-t border-neutral-900">
          <div className="max-w-[770px] mx-auto w-full">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-white">
                AI-powered from inquiry to delivery
              </h2>
              <p className="text-[15px] sm:text-lg text-neutral-400 font-light leading-relaxed px-6 sm:px-0">
                We've integrated AI across the entire production workflow — so international buyers can place orders in any language, get accurate quotes instantly, and track every step of production without picking up the phone.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-16 sm:mb-20">
              <div className="bg-white px-2 py-4 sm:p-6 rounded-xl sm:rounded-2xl border border-neutral-200 flex flex-col items-center text-center transition-all hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-2 sm:mb-4 shrink-0">
                  <Bot className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-[15px] sm:text-[20px] font-bold text-neutral-900 mb-3 sm:mb-4 leading-tight">AI inquiry</h3>
                <p className="text-[11px] sm:text-sm text-neutral-500 font-light leading-snug sm:leading-relaxed">Describe what you need in natural language. Our assistant extracts specs automatically.</p>
              </div>
              <div className="bg-white px-2 py-4 sm:p-6 rounded-xl sm:rounded-2xl border border-neutral-200 flex flex-col items-center text-center transition-all hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-2 sm:mb-4 shrink-0">
                  <Zap className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-[15px] sm:text-[20px] font-bold text-neutral-900 mb-3 sm:mb-4 leading-tight">Smart quoting</h3>
                <p className="text-[11px] sm:text-sm text-neutral-500 font-light leading-snug sm:leading-relaxed">Receive a detailed proposal within 24 hours based on your exact requirements.</p>
              </div>
              <div className="bg-white px-2 py-4 sm:p-6 rounded-xl sm:rounded-2xl border border-neutral-200 flex flex-col items-center text-center transition-all hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-2 sm:mb-4 shrink-0">
                  <LineChart className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-[15px] sm:text-[20px] font-bold text-neutral-900 mb-3 sm:mb-4 leading-tight">Production tracking</h3>
                <p className="text-[11px] sm:text-sm text-neutral-500 font-light leading-snug sm:leading-relaxed">Real-time updates from sample approval through to shipment confirmation.</p>
              </div>
            </div>

            {/* 5-Step Process (2 Rows Layout) */}
            <div className="relative pt-2 sm:pt-0 flex flex-col gap-12 sm:gap-16 items-center">
              
              {/* Top Row (01 to 03) */}
              <div className="relative w-full max-w-[770px]">
                {/* Connecting lines for Row 1 */}
                <div className="hidden sm:block absolute top-[66px] left-[16%] right-[16%] h-[2px] bg-neutral-800 z-0"></div>
                <div className="sm:hidden absolute top-[66px] left-[25%] right-[25%] h-[2px] bg-neutral-800 z-0"></div>

                <div className="flex flex-wrap justify-center sm:grid sm:grid-cols-3 gap-y-10 sm:gap-8 relative z-10">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center group cursor-default w-[45%] sm:w-auto">
                    <div className="text-[13px] font-bold text-blue-400 mb-2.5 transition-colors group-hover:text-blue-300">01</div>
                    <div className="w-[60px] h-[60px] sm:w-[76px] sm:h-[76px] rounded-2xl bg-white border border-blue-200 flex items-center justify-center shadow-sm mb-3.5 text-blue-600 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:border-blue-400">
                      <MessageSquare className="w-[26px] h-[26px] sm:w-[30px] sm:h-[30px]" />
                    </div>
                    <h4 className="text-[15px] sm:text-[17px] font-bold text-white mb-1">Inquiry</h4>
                    <p className="text-[11px] sm:text-[13px] text-neutral-400 mb-2.5 transition-colors group-hover:text-neutral-300">Chat with AI</p>
                    <span className="px-2.5 py-1 bg-blue-900/50 text-blue-300 text-[10px] font-bold rounded-full tracking-wide border border-blue-800">AI</span>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center group cursor-default w-[45%] sm:w-auto">
                    <div className="text-[13px] font-bold text-blue-400 mb-2.5 transition-colors group-hover:text-blue-300">02</div>
                    <div className="w-[60px] h-[60px] sm:w-[76px] sm:h-[76px] rounded-2xl bg-white border border-blue-200 flex items-center justify-center shadow-sm mb-3.5 text-blue-600 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:border-blue-400">
                      <FileText className="w-[26px] h-[26px] sm:w-[30px] sm:h-[30px]" />
                    </div>
                    <h4 className="text-[15px] sm:text-[17px] font-bold text-white mb-1">Proposal</h4>
                    <p className="text-[11px] sm:text-[13px] text-neutral-400 mb-2.5 transition-colors group-hover:text-neutral-300">Within 24h</p>
                    <span className="px-2.5 py-1 bg-blue-900/50 text-blue-300 text-[10px] font-bold rounded-full tracking-wide border border-blue-800">AI</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center group cursor-default w-[45%] sm:w-auto">
                    <div className="text-[13px] font-bold text-white mb-2.5 transition-colors group-hover:text-neutral-200">03</div>
                    <div className="w-[60px] h-[60px] sm:w-[76px] sm:h-[76px] rounded-2xl bg-white border border-amber-200 flex items-center justify-center shadow-sm mb-3.5 text-amber-600 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:border-amber-400">
                      <Scissors className="w-[26px] h-[26px] sm:w-[30px] sm:h-[30px]" />
                    </div>
                    <h4 className="text-[15px] sm:text-[17px] font-bold text-white mb-1">Sample</h4>
                    <p className="text-[11px] sm:text-[13px] text-neutral-400 mb-2.5 transition-colors group-hover:text-neutral-300">14 days</p>
                    <span className="px-2.5 py-1 bg-amber-900/40 text-amber-300 border border-amber-700/50 text-[10px] font-bold rounded-full tracking-wide">Handcraft</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row (04 to 05) */}
              <div className="relative w-full max-w-[480px]">
                {/* Connecting lines for Row 2 */}
                <div className="absolute top-[66px] left-[25%] right-[25%] h-[2px] bg-neutral-800 z-0"></div>

                <div className="grid grid-cols-2 gap-y-10 sm:gap-8 relative z-10">
                  {/* Step 4 */}
                  <div className="flex flex-col items-center text-center group cursor-default">
                    <div className="text-[13px] font-bold text-white mb-2.5 transition-colors group-hover:text-neutral-200">04</div>
                    <div className="w-[60px] h-[60px] sm:w-[76px] sm:h-[76px] rounded-2xl bg-white border border-amber-200 flex items-center justify-center shadow-sm mb-3.5 text-amber-600 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:border-amber-400">
                      <CheckCircle2 className="w-[26px] h-[26px] sm:w-[30px] sm:h-[30px]" />
                    </div>
                    <h4 className="text-[15px] sm:text-[17px] font-bold text-white mb-1">Production</h4>
                    <p className="text-[11px] sm:text-[13px] text-neutral-400 mb-2.5 transition-colors group-hover:text-neutral-300">Full QC</p>
                    <span className="px-2.5 py-1 bg-amber-900/40 text-amber-300 border border-amber-700/50 text-[10px] font-bold rounded-full tracking-wide">Handcraft</span>
                  </div>

                  {/* Step 5 */}
                  <div className="flex flex-col items-center text-center group cursor-default">
                    <div className="text-[13px] font-bold text-blue-400 mb-2.5 transition-colors group-hover:text-blue-300">05</div>
                    <div className="w-[60px] h-[60px] sm:w-[76px] sm:h-[76px] rounded-2xl bg-white border border-blue-200 flex items-center justify-center shadow-sm mb-3.5 text-blue-600 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:border-blue-400">
                      <Truck className="w-[26px] h-[26px] sm:w-[30px] sm:h-[30px]" />
                    </div>
                    <h4 className="text-[15px] sm:text-[17px] font-bold text-white mb-1">Shipment</h4>
                    <p className="text-[11px] sm:text-[13px] text-neutral-400 mb-2.5 transition-colors group-hover:text-neutral-300">Tracked</p>
                    <span className="px-2.5 py-1 bg-blue-900/50 text-blue-300 text-[10px] font-bold rounded-full tracking-wide border border-blue-800">AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Global Export Map Section placed inside the black area */}
          <ExportMap />
        </section>

        {/* Product Collection Gradient Transition */}
        <div className="h-[400px] md:h-[700px] w-full" style={{ background: "linear-gradient(to bottom, #0a0a0a 0%, #171717 25%, #262626 50%, #52525b 70%, #ffffff 100%)" }}></div>

        {/* Product Collection Section */}
        <section className="pt-[150px] md:pt-[200px] pb-32 w-full overflow-hidden bg-white">
          <div className="max-w-[1000px] mx-auto px-6 mb-12 flex flex-col items-center text-center gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-3">
                Custom Apparel Solutions
              </h2>
              <p className="text-[15px] sm:text-lg text-neutral-600 font-light leading-relaxed max-w-2xl mx-auto">
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
              ].map((img, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-neutral-300 hover:shadow-lg">
                  <div className="aspect-[3/4] w-full bg-neutral-100 relative overflow-hidden">
                    <img src={`/clothes/${img}`} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fabric Introduction Section */}
        <section className="pt-32 pb-0 px-6 w-full max-w-[770px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-4">
              Premium Fabrics
            </h2>
            <p className="text-[15px] sm:text-lg text-neutral-500 font-light max-w-lg mx-auto leading-relaxed">
              Our garments start with the best raw materials. From high-stretch performance knits to classic heritage weaves.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-[1000px] mx-auto items-start">
            {fabricsData.map((fabric) => {
              const isOpen = openFabric === fabric.id;
              return (
                <div 
                  key={fabric.id} 
                  onClick={() => setOpenFabric(isOpen ? null : fabric.id)}
                  className={`bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col group ${isOpen ? 'border-blue-400' : 'border-neutral-200 hover:border-blue-300'}`}
                >
                  <div className="aspect-[2.5/1] w-full relative flex-shrink-0">
                    {getFabricPatternSvg(fabric.id, fabric.name)}
                    <div className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors shadow-xs backdrop-blur-sm ${isOpen ? 'bg-blue-50 text-blue-600' : 'bg-white/80 text-neutral-400 group-hover:text-blue-500'}`}>
                      {isOpen ? <Minus size={14} className="sm:w-4 sm:h-4" /> : <Plus size={14} className="sm:w-4 sm:h-4" />}
                    </div>
                  </div>
                  <div 
                    className={`px-4 sm:px-6 flex flex-col justify-center overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-60 py-4 sm:py-6 opacity-100' : 'max-h-0 py-0 opacity-0'}`}
                  >
                    <p className="text-neutral-600 text-[11px] sm:text-[15px] font-light leading-relaxed">
                      {fabric.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full bg-neutral-950 pt-32 pb-40 px-6 mt-[400px] flex flex-col items-center text-center border-t border-neutral-900">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
            The Ultimate Apparel<br />Production Partner
          </h2>
          <p className="text-lg md:text-xl text-neutral-400 font-light mb-10">
            Start your journey with us today.
          </p>
          <a id="gtm-start-footer-request-btn" href="/" className="gtm-conversion-btn inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-10 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300 text-lg tracking-wide">
            Request Production
          </a>
        </section>
      </main>
    </div>
  );
}
