import React, { useRef, useState, useEffect } from 'react';
import ExportMap from './ExportMap';
import { fabricsData, getFabricPatternSvg } from '../lib/fabricData';
import { Minus, Plus, ArrowRight, ArrowUp, ImagePlus, Factory, Package, ShieldCheck, Zap, Bot, LineChart, MessageSquare, FileText, Scissors, CheckCircle2, Check, Truck, MapPin, FileCheck, Award, ChevronLeft, ChevronRight, Ship, Layers, Globe, RefreshCcw } from 'lucide-react';

export default function WelcomeLanding() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mensScrollRef = useRef<HTMLDivElement>(null);
  const womensScrollRef = useRef<HTMLDivElement>(null);
  const whyKoreaScrollRef = useRef<HTMLDivElement>(null);
  const whyKawScrollRef = useRef<HTMLDivElement>(null);
  const [openFabric, setOpenFabric] = useState<string | null>(null);
  const [isWomensExpanded, setIsWomensExpanded] = useState(false);

  // Hero image slideshow (auto-rotates every 2s)
  const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://tznhtceeqozjndfllknm.supabase.co";
  const heroImages = ['welcome1.jpg', 'welcome2.jpg', 'welcome3.jpg', 'welcome4.jpg', 'welcome5.jpg', 'welcome6.jpg'].map(
    (name) => `${supabaseUrl}/storage/v1/render/image/public/factory/${name}?format=webp&quality=80`
  );
  const [heroSlide, setHeroSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroImages.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const galleryRef = useRef<HTMLDivElement>(null);
  const [galleryIn, setGalleryIn] = useState(false);
  const whyKoreaRef = useRef<HTMLDivElement>(null);
  const [whyKoreaIn, setWhyKoreaIn] = useState(false);

  const capabilitiesRef = useRef<HTMLDivElement>(null);
  const [capabilitiesIn, setCapabilitiesIn] = useState(false);

  const atelierRef = useRef<HTMLDivElement>(null);
  const [atelierIn, setAtelierIn] = useState(false);

  const aiWorkflowRef = useRef<HTMLDivElement>(null);
  const [aiWorkflowIn, setAiWorkflowIn] = useState(false);

  const exportMapRef = useRef<HTMLDivElement>(null);
  const [exportMapIn, setExportMapIn] = useState(false);

  const samplePolicyRef = useRef<HTMLDivElement>(null);
  const [samplePolicyIn, setSamplePolicyIn] = useState(false);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const el = galleryRef.current;
    if (el) {
      const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { setGalleryIn(true); obs.disconnect(); }
      }, { threshold: 0.1 });
      obs.observe(el);
      observers.push(obs);
    }
    
    const atEl = atelierRef.current;
    if (atEl) {
      const obs3 = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { setAtelierIn(true); obs3.disconnect(); }
      }, { threshold: 0.1 });
      obs3.observe(atEl);
      observers.push(obs3);
    }
    
    const capEl = capabilitiesRef.current;
    if (capEl) {
      const obsCap = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { setCapabilitiesIn(true); obsCap.disconnect(); }
      }, { threshold: 0.1 });
      obsCap.observe(capEl);
      observers.push(obsCap);
    }
    
    const aiEl = aiWorkflowRef.current;
    if (aiEl) {
      const obsAi = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { setAiWorkflowIn(true); obsAi.disconnect(); }
      }, { threshold: 0.1 });
      obsAi.observe(aiEl);
      observers.push(obsAi);
    }
    
    const emEl = exportMapRef.current;
    if (emEl) {
      const obsEm = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { setExportMapIn(true); obsEm.disconnect(); }
      }, { threshold: 0.1 });
      obsEm.observe(emEl);
      observers.push(obsEm);
    }
    
    const wkEl = whyKoreaRef.current;
    if (wkEl) {
      const obsWk = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { setWhyKoreaIn(true); obsWk.disconnect(); }
      }, { threshold: 0.1 });
      obsWk.observe(wkEl);
      observers.push(obsWk);
    }

    const spEl = samplePolicyRef.current;
    if (spEl) {
      const obsSp = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { setSamplePolicyIn(true); obsSp.disconnect(); }
      }, { threshold: 0.1 });
      obsSp.observe(spEl);
      observers.push(obsSp);
    }
    
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth > 640 ? 400 : 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollGallery = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const itemWidth = window.innerWidth > 768 ? window.innerWidth * 0.25 : window.innerWidth * 0.33;
      ref.current.scrollBy({
        left: direction === 'left' ? -itemWidth * 2 : itemWidth * 2,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col relative">
      <main className="flex-1 flex flex-col">
        <div className="w-full bg-gradient-to-b from-white via-blue-50 to-blue-200">
          {/* Hero Section */}
          <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 px-6 overflow-hidden flex-1 flex items-center">
          <div className="max-w-[1200px] mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-[49px] items-stretch">

            {/* Left: Copy */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              {/* Badge */}
              <a href="/" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/70 border border-neutral-200 text-[clamp(12px,1.4vw,14px)] whitespace-nowrap font-medium text-neutral-600 mb-6 shadow-sm hover:bg-white hover:shadow-md transition-all cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                The Apparel OEM/ODM Solution Made in Korea
              </a>

              {/* Headline */}
              <h1 className="text-[9vw] sm:text-5xl lg:text-6xl lg:text-[3.4rem] xl:text-6xl font-bold tracking-tight mb-6 leading-[1.1] text-neutral-900">
                Sportswear, made the way<br />
                <span className="text-blue-600">you imagined it.</span>
              </h1>

              {/* Description */}
              <p className="max-w-xl text-lg lg:text-xl text-neutral-600 font-light mb-8 leading-relaxed">
                Every brand starts smaller than you think. Start yours with one sample.<br />
                Pickleball, tennis, golf and more. The fit, the feel, the identity. Made together, from day one.
              </p>

              {/* Buttons */}
              <div className="w-full flex justify-center mt-4 lg:mt-auto">
                <a id="gtm-welcome-hero-quote-btn" href="/" className="gtm-conversion-btn inline-flex items-center justify-center gap-3 px-10 sm:px-14 py-4 bg-neutral-900 text-white rounded-xl font-medium text-[clamp(13px,1.7vw,18px)] whitespace-nowrap hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/20 hover:-translate-y-0.5">
                  <Bot size={22} className="text-blue-400" />
                  Ask Us Anything
                </a>
              </div>
            </div>

            {/* Right: Auto-sliding Image Carousel */}
            <div className="relative mt-8 lg:mt-[64px] max-w-[614px] mx-auto w-full flex flex-col">
              <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl shadow-neutral-900/10 border border-neutral-200/50 aspect-[5/4] bg-neutral-100">
                {heroImages.map((src, idx) => (
                  <img
                    key={src}
                    src={src}
                    alt={`Lookbook ${idx + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === heroSlide ? 'opacity-100' : 'opacity-0'}`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Metrics */}
        <section className="px-6 pb-12 lg:pb-[150px]">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-4xl mx-auto">
            {/* Item 1 */}
            <div className="flex flex-col items-center gap-3 sm:gap-5">
              <div className="w-full flex items-center justify-center py-6 sm:py-10 lg:py-14 px-1 bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all sm:hover:-translate-y-1">
                <div className="text-[7vw] sm:text-4xl lg:text-5xl lg:text-6xl font-extrabold text-neutral-900 whitespace-nowrap tracking-tighter">
                  1pc~
                </div>
              </div>
              <div className="text-[11px] sm:text-sm lg:text-sm lg:text-base text-neutral-600 font-medium text-center leading-tight">MOQ</div>
            </div>
            {/* Item 2 */}
            <div className="flex flex-col items-center gap-3 sm:gap-5">
              <div className="w-full flex items-center justify-center py-6 sm:py-10 lg:py-14 px-1 bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all sm:hover:-translate-y-1">
                <div className="text-[7vw] sm:text-4xl lg:text-5xl lg:text-6xl font-extrabold text-neutral-900 whitespace-nowrap tracking-tighter">
                  3~14<span className="text-[4vw] sm:text-2xl lg:text-3xl lg:text-4xl text-neutral-500 ml-0.5 sm:ml-1">days</span>
                </div>
              </div>
              <div className="text-[11px] sm:text-sm lg:text-sm lg:text-base text-neutral-600 font-medium text-center leading-tight">Sample<br className="sm:hidden"/> Lead Time</div>
            </div>
            {/* Item 3 */}
            <div className="flex flex-col items-center gap-3 sm:gap-5">
              <div className="w-full flex items-center justify-center py-6 sm:py-10 lg:py-14 px-1 bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all sm:hover:-translate-y-1">
                <div className="text-[7vw] sm:text-4xl lg:text-5xl lg:text-6xl font-extrabold text-neutral-900 whitespace-nowrap tracking-tighter">
                  100<span className="text-[4vw] sm:text-2xl lg:text-3xl lg:text-4xl text-neutral-500 ml-0.5 sm:ml-1">+</span>
                </div>
              </div>
              <div className="text-[11px] sm:text-sm lg:text-sm lg:text-base text-neutral-600 font-medium text-center leading-tight">Partner<br className="sm:hidden"/> Brands</div>
            </div>
          </div>
        </section>



        {/* Story Section - Temporarily hidden */}
        <section className="hidden w-full bg-transparent py-16 lg:py-24 px-6 flex flex-col items-center text-center">
          <div className="max-w-4xl w-full flex flex-col items-center bg-white/70 backdrop-blur-xl border border-white/80 shadow-xl rounded-3xl p-10 lg:p-16 hover:-translate-y-2 hover:shadow-2xl hover:bg-white/80 transition-all duration-500">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-10">
              From one factory floor to a global platform
            </h2>
            <div className="space-y-6 text-[15px] sm:text-lg lg:text-xl text-neutral-800 font-light leading-relaxed max-w-3xl">
              <p>
                For over 30 years, he ran an apparel factory in Korea, crafting premium polo shirts and golf wear with true craftsmanship.
              </p>
              <p>
                I wanted to bring the exceptional expertise my father spent a lifetime building out into the world. Connecting global brands with 30 years of steadfast manufacturing know-how and genuine quality.
              </p>
            </div>
          </div>
        </section>
        </div>




        {/* Why Korea + Capabilities Wrapper */}
        <div className="w-full bg-white">

        {/* Expanded Why Korea Sections */}
        {/* Expanded Why Korea Sections */}
        <div ref={whyKoreaRef} className={`w-full pt-24 lg:pt-40 pb-16 lg:pb-32 px-6 transition-all duration-1000 ease-out ${whyKoreaIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
          
          <div className="max-w-[1200px] mx-auto w-full text-center mb-12 lg:mb-20">
            <h2 className="text-4xl lg:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight mb-8 flex items-start justify-center gap-3 lg:gap-5 z-10">
              <span className="text-center">Why Korea?</span>
            </h2>
          </div>

          <div className="max-w-[1200px] mx-auto w-full relative group/whycarousel">
            <div ref={whyKoreaScrollRef} className="flex overflow-x-auto pb-12 -mx-6 px-6 sm:mx-0 sm:px-0 sm:pb-12 gap-6 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-2 lg:overflow-visible">
              
              {/* Card 1: Tariffs */}
              <div className="flex-none w-[85vw] sm:w-[60vw] lg:w-full snap-center sm:snap-start h-auto lg:h-[550px] lg:h-auto">
                <div className="bg-white/80 backdrop-blur-xl border border-neutral-200/60 rounded-[2.5rem] lg:rounded-[3.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 py-10 lg:p-6 lg:py-8 lg:p-12 h-full flex flex-col items-center text-center relative overflow-hidden group/card hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500">
                  
                  {/* Subtle background glow for the card */}
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-gradient-to-b from-orange-100/50 to-transparent blur-3xl -z-10 rounded-full pointer-events-none"></div>

                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white border border-orange-100 flex items-center justify-center mb-6 text-orange-600 shadow-sm relative z-10 group-hover/card:scale-110 transition-transform duration-500">
                    <FileCheck className="w-7 h-7 lg:w-8 lg:h-8" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl lg:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4 lg:mb-6 leading-[1.1] relative z-10">
                    No Section 301 tariffs.
                  </h2>
                  <p className="text-base lg:text-lg text-neutral-600 font-light leading-relaxed mb-6 lg:mb-4 lg:mb-10 max-w-lg relative z-10">
                    None of the punitive surcharges that hit Chinese goods.
                  </p>

                  {/* Visual Chart: Horizontal Bar Comparison */}
                  <div className="w-full flex flex-col justify-center gap-6 lg:gap-4 lg:gap-8 items-center mt-auto relative px-2 lg:px-0 z-10">
                    
                    {/* Others Row */}
                    <div className="flex flex-col items-center w-full group/row">
                      <div className="text-neutral-400 font-extrabold mb-3 tracking-wider text-xs lg:text-sm uppercase">
                        CHINA
                      </div>
                      <div className="flex w-full h-[72px] sm:h-[90px] lg:h-[70px] lg:h-[100px] rounded-xl overflow-hidden shadow-sm border border-neutral-200">
                        <div className="w-[50%] bg-[#8F908C] flex items-center justify-center px-2">
                          <span className="text-white font-extrabold text-[9px] sm:text-xs lg:text-sm whitespace-nowrap overflow-hidden text-ellipsis">Product Cost</span>
                        </div>
                        <div className="w-[15%] bg-[#A8A9A6] flex items-center justify-center border-l border-white/20">
                          <span className="text-white font-extrabold text-[9px] sm:text-xs lg:text-sm whitespace-nowrap">Duty</span>
                        </div>
                        <div className="w-[35%] bg-[#E84E4E] flex items-center justify-center border-l border-white/20 shadow-[inset_2px_0_10px_rgba(0,0,0,0.1)] px-1">
                          <span className="text-white font-extrabold text-[9px] sm:text-xs lg:text-sm flex items-center gap-1 drop-shadow-sm whitespace-nowrap">
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" strokeWidth={3} />
                            <span className="truncate">Tariff</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Korea Row */}
                    <div className="flex flex-col items-center w-full group/row">
                      <div className="text-blue-600 font-extrabold mb-3 tracking-wider text-xs lg:text-sm flex items-center gap-2 uppercase">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        KOREA
                      </div>
                      <div className="flex w-full h-[72px] sm:h-[90px] lg:h-[70px] lg:h-[100px] rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg border-2 border-blue-200">
                        <div className="w-[50%] bg-blue-600 flex items-center justify-center px-2">
                          <span className="text-white font-extrabold text-[9px] sm:text-xs lg:text-sm whitespace-nowrap overflow-hidden text-ellipsis">Product Cost</span>
                        </div>
                        <div className="w-[15%] bg-blue-400 flex items-center justify-center border-l border-white/20">
                          <span className="text-white font-extrabold text-[9px] sm:text-xs lg:text-sm whitespace-nowrap">Duty</span>
                        </div>
                        <div className="w-[35%] bg-[#1E1E1E] flex items-center justify-center border-l border-white/10 relative overflow-hidden group/saved hover:bg-black transition-colors px-1">
                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover/saved:animate-[shimmer_1.5s_infinite]"></div>
                          <span className="text-white font-extrabold text-[8px] sm:text-[10px] lg:text-xs flex items-center gap-1 relative z-10 whitespace-nowrap">
                            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 shrink-0" strokeWidth={4} />
                            <span className="truncate">You Keep this!</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Supply Chain */}
              <div className="flex-none w-[85vw] sm:w-[60vw] lg:w-full snap-center sm:snap-start h-auto lg:h-[550px] lg:h-auto">
                <div className="bg-white/80 backdrop-blur-xl border border-neutral-200/60 rounded-[2.5rem] lg:rounded-[3.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 py-10 lg:p-6 lg:py-8 lg:p-12 h-full flex flex-col items-center text-center relative overflow-hidden group/card hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500">
                  
                  {/* Subtle background glow for the card */}
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-gradient-to-b from-blue-100/50 to-transparent blur-3xl -z-10 rounded-full pointer-events-none"></div>

                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white border border-blue-100 flex items-center justify-center mb-6 text-blue-600 shadow-sm relative z-10 group-hover/card:scale-110 transition-transform duration-500">
                    <MapPin className="w-7 h-7 lg:w-8 lg:h-8" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl lg:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4 lg:mb-6 leading-[1.1] relative z-10">
                    One Supply Chain.<br className="hidden lg:block"/> One Country.
                  </h2>
                  <p className="text-base lg:text-lg text-neutral-600 font-light leading-relaxed mb-6 lg:mb-4 lg:mb-10 max-w-lg relative z-10">
                    Yarn to finish, all in one country. Not one ocean away.
                  </p>

                  {/* Visual Chart: Supply Chain Comparison */}
                  <div className="w-full flex flex-col justify-center gap-6 lg:gap-4 lg:gap-8 items-center mt-auto relative z-10">
                    
                    {/* Traditional Offshore Sourcing */}
                    <div className="flex flex-col items-center w-full group/row">
                      <div className="text-neutral-400 font-extrabold mb-3 tracking-wider text-xs lg:text-sm uppercase">OTHERS</div>
                      <div className="flex items-center gap-1 w-full justify-between bg-white/60 p-2 sm:p-3 lg:p-4 rounded-xl border border-neutral-200 shadow-sm h-[72px] sm:h-[90px] lg:h-[70px] lg:h-[100px]">
                        {/* Stage 1 */}
                        <div className="flex flex-col items-center gap-1 sm:gap-2 w-[25%]">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-neutral-400 border border-neutral-100 shrink-0">
                            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-xs sm:text-[13px] lg:text-[15px] text-neutral-500 font-bold text-center leading-tight">Yarn</span>
                        </div>
                        {/* Route 1 */}
                        <div className="flex-1 flex flex-col items-center relative min-w-[20px]">
                          <div className="w-full border-t-2 border-dashed border-neutral-300 absolute top-1/2 -translate-y-1/2"></div>
                          <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 relative z-10" />
                          <span className="text-[10px] sm:text-[11px] lg:text-[13px] text-neutral-400 font-black mt-1.5 whitespace-nowrap tracking-tighter">BORDERS</span>
                        </div>
                        {/* Stage 2 */}
                        <div className="flex flex-col items-center gap-1 sm:gap-2 w-[25%]">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-neutral-400 border border-neutral-100 shrink-0">
                            <Factory className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-xs sm:text-[13px] lg:text-[15px] text-neutral-500 font-bold text-center leading-tight">Fabric</span>
                        </div>
                        {/* Route 2 */}
                        <div className="flex-1 flex flex-col items-center relative min-w-[20px]">
                          <div className="w-full border-t-2 border-dashed border-neutral-300 absolute top-1/2 -translate-y-1/2"></div>
                          <Ship className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 relative z-10 animate-[bounce_2s_ease-in-out_infinite]" />
                          <span className="text-[10px] sm:text-[11px] lg:text-[13px] text-neutral-400 font-black mt-1.5 whitespace-nowrap tracking-tighter">30+ DAYS</span>
                        </div>
                        {/* Stage 3 */}
                        <div className="flex flex-col items-center gap-1 sm:gap-2 w-[25%]">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-neutral-400 border border-neutral-100 shrink-0">
                            <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-xs sm:text-[13px] lg:text-[15px] text-neutral-500 font-bold text-center leading-tight">Sewing</span>
                        </div>
                      </div>
                    </div>

                    {/* Korea Sourcing */}
                    <div className="flex flex-col items-center w-full group/row">
                      <div className="text-blue-600 font-extrabold mb-3 tracking-wider text-xs lg:text-sm flex items-center gap-2 uppercase">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        KOREA
                      </div>
                      <div className="flex items-center gap-1 w-full justify-between bg-blue-50 p-2 sm:p-3 lg:p-4 rounded-xl border-2 border-blue-200 relative overflow-hidden shadow-md h-[72px] sm:h-[90px] lg:h-[70px] lg:h-[100px]">
                        {/* Stage 1 */}
                        <div className="flex flex-col items-center gap-1 sm:gap-2 z-10 w-[25%]">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-xs sm:text-[13px] lg:text-[15px] text-blue-700 font-extrabold text-center leading-tight">Yarn</span>
                        </div>
                        {/* Route 1 */}
                        <div className="flex-1 flex flex-col items-center relative z-10 min-w-[20px]">
                          <div className="w-full border-t-[3px] border-blue-400 absolute top-1/2 -translate-y-1/2"></div>
                          <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 relative z-10" />
                          <span className="text-[10px] sm:text-[11px] lg:text-[13px] text-blue-600 font-black mt-1.5 whitespace-nowrap tracking-tighter">50KM</span>
                        </div>
                        {/* Stage 2 */}
                        <div className="flex flex-col items-center gap-1 sm:gap-2 z-10 w-[25%]">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                            <Factory className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-xs sm:text-[13px] lg:text-[15px] text-blue-700 font-extrabold text-center leading-tight">Fabric</span>
                        </div>
                        {/* Route 2 */}
                        <div className="flex-1 flex flex-col items-center relative z-10 min-w-[20px]">
                          <div className="w-full border-t-[3px] border-blue-400 absolute top-1/2 -translate-y-1/2"></div>
                          <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 relative z-10" />
                          <span className="text-[10px] sm:text-[11px] lg:text-[13px] text-blue-600 font-black mt-1.5 whitespace-nowrap tracking-tighter">50KM</span>
                        </div>
                        {/* Stage 3 */}
                        <div className="flex flex-col items-center gap-1 sm:gap-2 z-10 w-[25%]">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                            <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-xs sm:text-[13px] lg:text-[15px] text-blue-700 font-extrabold text-center leading-tight">Sewing</span>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: FTA */}
              <div className="flex-none w-[85vw] sm:w-[60vw] lg:w-full snap-center sm:snap-start h-auto lg:h-[550px] lg:h-auto">
                <div className="bg-white/80 backdrop-blur-xl border border-neutral-200/60 rounded-[2.5rem] lg:rounded-[3.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 py-10 lg:p-6 lg:py-8 lg:p-12 h-full flex flex-col items-center text-center relative overflow-hidden group/card hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500">
                  
                  {/* Subtle background glow for the card */}
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-gradient-to-b from-emerald-100/50 to-transparent blur-3xl -z-10 rounded-full pointer-events-none"></div>

                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 text-emerald-600 shadow-sm relative z-10 group-hover/card:scale-110 transition-transform duration-500">
                    <FileText className="w-7 h-7 lg:w-8 lg:h-8" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl lg:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4 lg:mb-6 leading-[1.1] relative z-10">
                    Built for FTA benefit.
                  </h2>
                  <p className="text-base lg:text-lg text-neutral-600 font-light leading-relaxed mb-6 lg:mb-4 lg:mb-10 max-w-lg relative z-10">
                    Korean fabrics can qualify for 0% base duty under KORUS.
                  </p>

                  {/* Visual Chart: Price Tag Comparison */}
                  <div className="w-full flex flex-col justify-center gap-6 lg:gap-4 lg:gap-8 items-center mt-auto relative z-10">
                    <div className="w-full max-w-[260px] sm:max-w-[300px] h-[220px] lg:h-[160px] lg:h-[265px] bg-white rounded-2xl border border-neutral-200 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] overflow-hidden relative group/tag hover:-translate-y-1 transition-all duration-500 flex flex-col">
                      
                      {/* Tag Header (Hole) */}
                      <div className="h-8 shrink-0 bg-neutral-50/50 border-b border-neutral-100 flex justify-center items-center relative">
                        <div className="w-3.5 h-3.5 rounded-full bg-neutral-200/60 shadow-inner"></div>
                      </div>

                      {/* Tag Content */}
                      <div className="flex-1 p-5 sm:p-6 flex flex-col text-left justify-between">
                        
                        {/* Standard Base Duty */}
                        <div className="flex justify-between items-center text-sm sm:text-base text-neutral-400 border-b border-dashed border-neutral-200 pb-3">
                          <span className="font-semibold tracking-wide">Base Duty (Max)</span>
                          <span className="font-bold relative">
                            32.0%
                            <div className="absolute inset-0 top-1/2 -translate-y-1/2 w-[120%] -left-[10%] border-t-[2.5px] border-red-400 -rotate-[15deg]"></div>
                          </span>
                        </div>

                        {/* KORUS Exemption */}
                        <div className="flex justify-between items-center text-[13px] sm:text-[15px] text-emerald-600 border-b border-neutral-100 pb-3 bg-emerald-50/80 -mx-5 px-5 sm:-mx-6 sm:px-6 py-2.5">
                          <span className="font-extrabold tracking-wide flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" strokeWidth={4} />
                            KORUS FTA
                          </span>
                          <span className="font-bold">-100% EXEMPT</span>
                        </div>

                        {/* Final Duty */}
                        <div className="flex justify-between items-end pt-1">
                          <span className="text-[10px] sm:text-xs text-neutral-400 font-extrabold uppercase tracking-widest mb-1">Final Duty</span>
                          <div className="text-4xl sm:text-5xl font-black text-emerald-500 tracking-tighter flex items-start gap-1 drop-shadow-sm">
                            0<span className="text-xl sm:text-2xl mt-1.5">%</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Card 4: Global Brands */}
              <div className="flex-none w-[85vw] sm:w-[60vw] lg:w-full snap-center sm:snap-start h-auto lg:h-[550px] lg:h-auto">
                <div className="bg-white/80 backdrop-blur-xl border border-neutral-200/60 rounded-[2.5rem] lg:rounded-[3.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 py-10 lg:p-6 lg:py-8 lg:p-12 h-full flex flex-col items-center text-center relative overflow-hidden group/card hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500">
                  
                  {/* Subtle background glow for the card */}
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-gradient-to-b from-indigo-100/50 to-transparent blur-3xl -z-10 rounded-full pointer-events-none"></div>

                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 text-indigo-600 shadow-sm relative z-10 group-hover/card:scale-110 transition-transform duration-500">
                    <Globe className="w-7 h-7 lg:w-8 lg:h-8" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl lg:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4 lg:mb-6 leading-[1.1] relative z-10">
                    Global brands have sourced here for decades.
                  </h2>
                  <p className="text-base lg:text-lg text-neutral-600 font-light leading-relaxed mb-6 lg:mb-4 lg:mb-10 max-w-lg relative z-10">
                    Quality isn't a promise. It's a track record.
                  </p>

                  {/* Visual Chart: Abstract Global Map Nodes */}
                  <div className="w-full max-w-[600px] h-[220px] lg:h-[160px] lg:h-[265px] relative mt-auto z-10 bg-indigo-50/40 rounded-3xl border border-indigo-100/50 overflow-hidden shadow-inner">
                    
                    {/* SVG Connections */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                        </linearGradient>
                        <style>
                          {`
                            .dash-anim { stroke-dasharray: 6 6; animation: dash 20s linear infinite; }
                            @keyframes dash { to { stroke-dashoffset: -1000; } }
                          `}
                        </style>
                      </defs>
                      
                      {/* Korea to SE Asia */}
                      <path d="M200 200 Q 325 350 450 320" stroke="url(#line-grad)" strokeWidth="3" fill="none" className="dash-anim" />
                      {/* Korea to Europe */}
                      <path d="M200 200 Q 400 50 600 100" stroke="url(#line-grad)" strokeWidth="3" fill="none" className="dash-anim" />
                      {/* Korea to Canada */}
                      <path d="M200 200 Q 475 20 750 60" stroke="url(#line-grad)" strokeWidth="3" fill="none" className="dash-anim" />
                      {/* Korea to USA */}
                      <path d="M200 200 Q 525 300 850 220" stroke="url(#line-grad)" strokeWidth="3" fill="none" className="dash-anim" />
                    </svg>

                    {/* Nodes */}
                    {/* KOREA */}
                    <div className="absolute left-[20%] top-[50%] z-20">
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-3 w-3 sm:h-4 sm:w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-indigo-600 border-2 border-white shadow-sm"></span>
                      </div>
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 mt-3 sm:mt-4 text-[9px] sm:text-[11px] font-black text-indigo-900 bg-white/90 px-1.5 sm:px-2 py-0.5 rounded shadow-sm whitespace-nowrap">KOREA</span>
                    </div>

                    {/* SE ASIA */}
                    <div className="absolute left-[45%] top-[80%] z-10 hover:scale-110 transition-transform cursor-default">
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-indigo-400 border border-white shadow-sm"></div>
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 mt-2 sm:mt-3 text-[8px] sm:text-[10px] font-bold text-indigo-700 opacity-80 whitespace-nowrap">SE ASIA</span>
                    </div>

                    {/* EUROPE */}
                    <div className="absolute left-[60%] top-[25%] z-10 hover:scale-110 transition-transform cursor-default">
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-indigo-400 border border-white shadow-sm"></div>
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 mt-2 sm:mt-3 text-[8px] sm:text-[10px] font-bold text-indigo-700 opacity-80 whitespace-nowrap">EUROPE</span>
                    </div>

                    {/* CANADA */}
                    <div className="absolute left-[75%] top-[15%] z-10 hover:scale-110 transition-transform cursor-default">
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-indigo-400 border border-white shadow-sm"></div>
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 mt-2 sm:mt-3 text-[8px] sm:text-[10px] font-bold text-indigo-700 opacity-80 whitespace-nowrap">CANADA</span>
                    </div>

                    {/* USA */}
                    <div className="absolute left-[85%] top-[55%] z-10 hover:scale-110 transition-transform cursor-default">
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-indigo-400 border border-white shadow-sm"></div>
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 mt-2 sm:mt-3 text-[8px] sm:text-[10px] font-bold text-indigo-700 opacity-80 whitespace-nowrap">USA</span>
                    </div>

                  </div>

                </div>
              </div>

            </div>
            
            {/* Scroll Buttons */}
            <button onClick={() => scrollGallery(whyKoreaScrollRef, 'left')} className="absolute -left-4 lg:left-0 lg:-ml-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 lg:w-14 lg:h-14 text-neutral-400 hover:text-blue-600 drop-shadow-md opacity-100 lg:hidden transition-all duration-300 z-20 focus:outline-hidden">
              <ChevronLeft className="w-8 h-8 lg:w-10 lg:h-10" />
            </button>
            <button onClick={() => scrollGallery(whyKoreaScrollRef, 'right')} className="absolute -right-4 lg:right-0 lg:-mr-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 lg:w-14 lg:h-14 text-neutral-400 hover:text-blue-600 drop-shadow-md opacity-100 lg:hidden transition-all duration-300 z-20 focus:outline-hidden">
              <ChevronRight className="w-8 h-8 lg:w-10 lg:h-10" />
            </button>

          </div>
        </div>


        {/* Capabilities Section */}
        <section ref={capabilitiesRef} className={`w-full pt-12 lg:pt-16 pb-6 lg:pb-8 px-6 transition-all duration-1000 ease-out ${capabilitiesIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
          <div className="max-w-[1200px] mx-auto w-full group/kawcarousel">
            <div className="text-center mb-[90px]">
              <h2 className="text-4xl lg:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight flex items-start justify-center gap-3 lg:gap-5">
                <span className="text-center">Why Korea Apparel Works?</span>
              </h2>
            </div>
            <div className="relative w-full">
              <div ref={whyKawScrollRef} className="flex overflow-x-auto pb-6 -mx-6 px-6 lg:mx-0 lg:px-0 lg:pb-0 lg:grid lg:grid-cols-2 lg:grid-cols-4 gap-[25px] snap-x snap-mandatory scrollbar-hide">
              {/* Card 1 */}
              <div className="flex-none w-[42vw] sm:w-[320px] lg:w-auto snap-center p-4 sm:p-6 lg:p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 group">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3 sm:mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:scale-110 transition-all duration-300">
                  <Factory className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
                </div>
                <div className="text-lg lg:text-xl font-bold text-neutral-900 tracking-tight mb-2 lg:mb-5 group-hover:text-blue-600 transition-colors leading-tight">30 Years of Manufacturing Expertise</div>
                <p className="text-sm lg:text-base text-neutral-600 font-light leading-relaxed">
                  Family-owned factory with direct production and transparent processes.
                </p>
              </div>

              {/* Card 2 */}
              <div className="flex-none w-[42vw] sm:w-[320px] lg:w-auto snap-center p-4 sm:p-6 lg:p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-900/5 hover:-translate-y-1 group">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-3 sm:mb-6 text-purple-600 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 group-hover:scale-110 transition-all duration-300">
                  <Package className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
                </div>
                <div className="text-lg lg:text-xl font-bold text-neutral-900 tracking-tight mb-2 lg:mb-5 group-hover:text-purple-600 transition-colors leading-tight">Full-Package OEM/ODM Solutions</div>
                <p className="text-sm lg:text-base text-neutral-600 font-light leading-relaxed">
                  From design to finished product, we manage every production stage.
                </p>
              </div>

              {/* Card 3 */}
              <div className="flex-none w-[42vw] sm:w-[320px] lg:w-auto snap-center p-4 sm:p-6 lg:p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 group">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3 sm:mb-6 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 group-hover:scale-110 transition-all duration-300">
                  <ShieldCheck className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
                </div>
                <div className="text-lg lg:text-xl font-bold text-neutral-900 tracking-tight mb-2 lg:mb-5 group-hover:text-emerald-600 transition-colors leading-tight">Premium Quality Control</div>
                <p className="text-sm lg:text-base text-neutral-600 font-light leading-relaxed">
                  High-end craftsmanship and technical expertise for performance apparel.
                </p>
              </div>

              {/* Card 4 */}
              <div className="flex-none w-[42vw] sm:w-[320px] lg:w-auto snap-center p-4 sm:p-6 lg:p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5 hover:-translate-y-1 group">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-3 sm:mb-6 text-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 group-hover:scale-110 transition-all duration-300">
                  <Zap className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
                </div>
                <div className="text-lg lg:text-xl font-bold text-neutral-900 tracking-tight mb-2 lg:mb-5 group-hover:text-orange-600 transition-colors leading-tight">Flexible MOQ</div>
                <p className="text-sm lg:text-base text-neutral-600 font-light leading-relaxed">
                  Prototype from 1 piece and scale production as your brand grows.
                </p>
              </div>

              </div>

              {/* Scroll Buttons for Mobile KAW Section */}
              <button onClick={() => scrollGallery(whyKawScrollRef, 'left')} className="absolute -left-4 top-1/2 -translate-y-1/2 lg:hidden flex items-center justify-center w-10 h-10 text-neutral-400 hover:text-blue-600 drop-shadow-md opacity-100 transition-all duration-300 z-20 focus:outline-hidden">
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button onClick={() => scrollGallery(whyKawScrollRef, 'right')} className="absolute -right-4 top-1/2 -translate-y-1/2 lg:hidden flex items-center justify-center w-10 h-10 text-neutral-400 hover:text-blue-600 drop-shadow-md opacity-100 transition-all duration-300 z-20 focus:outline-hidden">
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </div>
        </section>
        </div>

        {/* Atelier Image Gallery */}
        <div ref={atelierRef} className={`w-full overflow-hidden relative bg-white pt-6 lg:pt-8 pb-12 lg:pb-16 px-4 lg:px-6 transition-all duration-1000 ease-out ${atelierIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
          <div className="max-w-[1200px] mx-auto w-full grid grid-cols-3 gap-[1px] sm:gap-[2px] border border-neutral-200/60 rounded-none overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 bg-neutral-100">
            {['b1.jpg', 'b2-2.jpg', 'b3.jpg', 'b4.jpg', 'b5.jpg', 'b6.jpg', 'b7.jpg', 'b8.jpg', 'b9.jpg'].map((imgName, idx) => {
              const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://tznhtceeqozjndfllknm.supabase.co";
              const optimizedUrl = `${supabaseUrl}/storage/v1/render/image/public/factory/${encodeURIComponent(imgName)}?format=webp&quality=80`;
              return (
                <div key={idx} className="relative aspect-square lg:aspect-[4/3] bg-white group overflow-hidden">
                  <img 
                    src={optimizedUrl} 
                    alt="Factory" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    loading="lazy" 
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Sample Policy Section */}
        <section ref={samplePolicyRef} className="w-full bg-white pt-24 pb-24 px-6 border-t border-neutral-100 overflow-hidden">
          <div className={`max-w-[1000px] mx-auto w-full transition-all duration-1000 ${samplePolicyIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* 1. Header */}
            <div className="text-center mb-16">
              <div className="text-blue-600 font-bold tracking-wider text-xs sm:text-sm uppercase mb-3">Sample policy</div>
              <h2 className="text-4xl lg:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight mb-4">Try us with zero risk</h2>
              <p className="text-lg text-neutral-600 font-light max-w-2xl mx-auto">
                See our quality in your hands before committing to anything.
              </p>
            </div>

            {/* 2. Pricing Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl p-6 border-2 border-blue-400 shadow-md shadow-blue-900/5 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-500"></div>
                <div className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide">First sample</div>
                <div className="text-4xl font-black text-neutral-900 mb-3 tracking-tight">$99</div>
                <div className="text-[16px] text-neutral-600 font-medium">One piece, one size<br/>Basic construction</div>
              </div>
              {/* Card 2 */}
              <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col hover:border-neutral-300 transition-colors">
                <div className="text-sm font-bold text-neutral-500 mb-2 uppercase tracking-wide">Additional size</div>
                <div className="text-4xl font-black text-neutral-900 mb-3 tracking-tight">$49<span className="text-xl text-neutral-400 font-semibold">/pc</span></div>
                <div className="text-[16px] text-neutral-600 font-medium">Same fabric<br/>Same shipment</div>
              </div>
              {/* Card 3 */}
              <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col hover:border-neutral-300 transition-colors">
                <div className="text-sm font-bold text-neutral-500 mb-2 uppercase tracking-wide">Revision</div>
                <div className="text-4xl font-black text-neutral-900 mb-3 tracking-tight">$59</div>
                <div className="text-[16px] text-neutral-600 font-medium">Same style, adjusted<br/>Existing pattern</div>
              </div>
            </div>
            <div className="text-center text-[14px] sm:text-[16px] text-neutral-500 mb-16">
              + Shipping at cost — typically $35–50 to the US, DHL tracked
            </div>

            {/* 3. Credit Banner */}
            <div className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl p-6 sm:p-8 mb-16 flex flex-col items-center text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-emerald-900 mb-8">Your sample fee comes back on your bulk order</h3>
              <div className="flex flex-row w-full max-w-lg mx-auto items-center justify-center divide-x divide-emerald-200/60">
                <div className="flex-1 px-4 flex flex-col items-center">
                  <div className="text-4xl sm:text-5xl font-black text-emerald-600 mb-1">50%</div>
                  <div className="text-xs sm:text-sm text-emerald-800 font-medium">credited at 50 pcs+</div>
                </div>
                <div className="flex-1 px-4 flex flex-col items-center">
                  <div className="text-4xl sm:text-5xl font-black text-emerald-600 mb-1">100%</div>
                  <div className="text-xs sm:text-sm text-emerald-800 font-medium">credited at 100 pcs+</div>
                </div>
              </div>
            </div>

            {/* 4. 3 Steps */}
            <div className="relative w-full max-w-3xl mx-auto mb-20">
              <div className="absolute top-[24px] left-[10%] right-[10%] h-[2px] bg-neutral-100 z-0 hidden sm:block"></div>
              <div className="flex flex-row justify-between relative z-10 gap-2 sm:gap-4 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-hide snap-x">
                <div className="flex flex-col items-center text-center w-[160px] sm:w-[200px] shrink-0 snap-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold text-lg mb-4 relative">
                    1
                  </div>
                  <h4 className="text-[18px] sm:text-[19px] font-bold text-neutral-900 mb-2 leading-tight">Approve before<br className="hidden sm:block"/> we ship</h4>
                  <p className="text-[15px] sm:text-[16px] text-neutral-500 leading-relaxed px-2">Photos and measurements sent for your sign-off</p>
                </div>
                
                <div className="flex flex-col items-center text-center w-[160px] sm:w-[200px] shrink-0 snap-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold text-lg mb-4 relative">
                    2
                  </div>
                  <h4 className="text-[18px] sm:text-[19px] font-bold text-neutral-900 mb-2 leading-tight">Hold it.<br className="hidden sm:block"/> Test it.</h4>
                  <p className="text-[15px] sm:text-[16px] text-neutral-500 leading-relaxed px-2">Check the fit, the fabric, the make</p>
                </div>

                <div className="flex flex-col items-center text-center w-[160px] sm:w-[200px] shrink-0 snap-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-white shadow-sm flex items-center justify-center text-emerald-600 font-bold text-lg mb-4 relative">
                    3
                  </div>
                  <h4 className="text-[18px] sm:text-[19px] font-bold text-neutral-900 mb-2 leading-tight">Scale when<br className="hidden sm:block"/> ready</h4>
                  <p className="text-[15px] sm:text-[16px] text-neutral-500 leading-relaxed px-2">Your sample fee credited to bulk</p>
                </div>
              </div>
            </div>

            {/* 5. Guarantees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              <div className="bg-neutral-50 rounded-2xl p-6 sm:p-8 flex items-start gap-4 sm:gap-5 border border-neutral-100">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0 mt-1">
                  <RefreshCcw className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-[18px] sm:text-[20px] font-bold text-neutral-900 mb-2">Off-spec? We remake it free</h4>
                  <p className="text-[16px] text-neutral-600 leading-relaxed">If it doesn't match the agreed spec, we remake and reship on us</p>
                </div>
              </div>
              <div className="bg-neutral-50 rounded-2xl p-6 sm:p-8 flex items-start gap-4 sm:gap-5 border border-neutral-100">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0 mt-1">
                  <ShieldCheck className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-[18px] sm:text-[20px] font-bold text-neutral-900 mb-2">Still off? Full refund</h4>
                  <p className="text-[16px] text-neutral-600 leading-relaxed">If the remake misses too, every dollar back including shipping</p>
                </div>
              </div>
            </div>

            {/* 6. Microcopy */}
            <div className="text-center text-[14px] sm:text-[16px] text-neutral-400 max-w-2xl mx-auto space-y-1">
              <p>New colorways quoted per fabric availability.</p>
              <p>Embroidery, prints, and custom hardware quoted per spec — before anything starts.</p>
            </div>

          </div>
        </section>

        {/* AI Workflow Section */}
        <section className="mt-20 py-24 px-6 w-full bg-neutral-950 text-white border-t border-neutral-900">
          <div ref={aiWorkflowRef} className={`w-full transition-all duration-1000 ease-out ${aiWorkflowIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
            <div className="max-w-[770px] mx-auto w-full">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl lg:text-6xl font-black mb-4 lg:mb-6 tracking-tight leading-tight flex items-start justify-center gap-3 lg:gap-5 z-10">
                <span className="text-center">AI-powered from<br className="hidden lg:block" /> inquiry to delivery</span>
              </h2>
              <p className="text-[15px] sm:text-lg lg:text-[20px] text-neutral-400 font-light leading-relaxed px-6 sm:px-0">
                We've integrated AI across the entire production workflow — so international buyers can place orders in any language, get accurate quotes instantly, and track every step of production without picking up the phone.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-16 sm:mb-20">
              <div className="bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-neutral-200 flex flex-col items-center text-center transition-all hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 sm:mb-4 shrink-0">
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-[20px] font-bold text-neutral-900 mb-1 sm:mb-4 leading-tight">AI inquiry</h3>
                <p className="text-[16px] text-neutral-600 font-light leading-relaxed">Describe what you need in natural language. Our assistant extracts specs automatically.</p>
              </div>
              <div className="bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-neutral-200 flex flex-col items-center text-center transition-all hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 sm:mb-4 shrink-0">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-[20px] font-bold text-neutral-900 mb-1 sm:mb-4 leading-tight">Smart quoting</h3>
                <p className="text-[16px] text-neutral-600 font-light leading-relaxed">Receive a detailed proposal within 24 hours based on your exact requirements.</p>
              </div>
              <div className="bg-white p-5 sm:p-6 rounded-xl sm:rounded-2xl border border-neutral-200 flex flex-col items-center text-center transition-all hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 sm:mb-4 shrink-0">
                  <LineChart className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-[20px] font-bold text-neutral-900 mb-1 sm:mb-4 leading-tight">Production tracking</h3>
                <p className="text-[16px] text-neutral-600 font-light leading-relaxed">Real-time updates from sample approval through to shipment confirmation.</p>
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
                    <div className="w-[65px] h-[65px] sm:w-[76px] sm:h-[76px] rounded-2xl bg-white border border-blue-200 flex items-center justify-center shadow-sm mb-3 text-blue-600 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:border-blue-400">
                      <MessageSquare className="w-8 h-8 sm:w-[30px] sm:h-[30px]" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-[15px] sm:text-[17px] font-bold text-white mb-1">Inquiry</h4>
                    <p className="text-xs sm:text-[13px] text-neutral-400 mb-2 transition-colors group-hover:text-neutral-300">Chat with AI</p>
                    <span className="px-3 py-1 bg-blue-900/50 text-blue-300 text-[10px] font-bold rounded-full tracking-wide border border-blue-800">AI</span>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center group cursor-default w-[33%] sm:w-auto">
                    <div className="text-sm sm:text-[13px] font-bold text-blue-400 mb-2 transition-colors group-hover:text-blue-300">02</div>
                    <div className="w-[65px] h-[65px] sm:w-[76px] sm:h-[76px] rounded-2xl bg-white border border-blue-200 flex items-center justify-center shadow-sm mb-3 text-blue-600 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:border-blue-400">
                      <FileText className="w-8 h-8 sm:w-[30px] sm:h-[30px]" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-[15px] sm:text-[17px] font-bold text-white mb-1">Proposal</h4>
                    <p className="text-xs sm:text-[13px] text-neutral-400 mb-2 transition-colors group-hover:text-neutral-300">Within 24h</p>
                    <span className="px-3 py-1 bg-blue-900/50 text-blue-300 text-[10px] font-bold rounded-full tracking-wide border border-blue-800">AI</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center group cursor-default w-[33%] sm:w-auto">
                    <div className="text-sm sm:text-[13px] font-bold text-white mb-2 transition-colors group-hover:text-neutral-200">03</div>
                    <div className="w-[65px] h-[65px] sm:w-[76px] sm:h-[76px] rounded-2xl bg-white border border-amber-200 flex items-center justify-center shadow-sm mb-3 text-amber-600 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:border-amber-400">
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
                    <div className="w-[65px] h-[65px] sm:w-[76px] sm:h-[76px] rounded-2xl bg-white border border-amber-200 flex items-center justify-center shadow-sm mb-3 text-amber-600 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:border-amber-400">
                      <CheckCircle2 className="w-8 h-8 sm:w-[30px] sm:h-[30px]" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-[15px] sm:text-[17px] font-bold text-white mb-1">Production</h4>
                    <p className="text-xs sm:text-[13px] text-neutral-400 mb-2 transition-colors group-hover:text-neutral-300">Full QC</p>
                    <span className="px-3 py-1 bg-amber-900/40 text-amber-300 border border-amber-700/50 text-[10px] font-bold rounded-full tracking-wide">Handcraft</span>
                  </div>

                  {/* Step 5 */}
                  <div className="flex flex-col items-center text-center group cursor-default">
                    <div className="text-sm sm:text-[13px] font-bold text-blue-400 mb-2 transition-colors group-hover:text-blue-300">05</div>
                    <div className="w-[65px] h-[65px] sm:w-[76px] sm:h-[76px] rounded-2xl bg-white border border-blue-200 flex items-center justify-center shadow-sm mb-3 text-blue-600 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:border-blue-400">
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

          {/* Global Export Map Section placed inside the black area */}
          <div ref={exportMapRef} className={`w-full transition-all duration-1000 ease-out ${exportMapIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
            <ExportMap />
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full bg-neutral-950 pt-32 pb-40 px-6 flex flex-col items-center text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
            The Ultimate Apparel<br />Production Partner
          </h2>
          <p className="text-lg lg:text-xl text-neutral-400 font-light mb-10">
            Start your journey with us today.
          </p>
          <a id="gtm-welcome-footer-request-btn" href="/" className="gtm-conversion-btn inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-10 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300 text-lg tracking-wide">
            Request Production
          </a>
        </section>
      </main>
    </div>
  );
}
