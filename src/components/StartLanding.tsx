import React, { useRef, useState, useEffect } from 'react';
import ExportMap from './ExportMap';
import { fabricsData, getFabricPatternSvg } from '../lib/fabricData';
import { Minus, Plus, ArrowRight, ArrowUp, ImagePlus, Factory, Package, ShieldCheck, Zap, Bot, LineChart, MessageSquare, FileText, Scissors, CheckCircle2, Check, Truck, MapPin, FileCheck, Award, ChevronLeft, ChevronRight, Ship, Layers } from 'lucide-react';

export default function StartLanding() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mensScrollRef = useRef<HTMLDivElement>(null);
  const womensScrollRef = useRef<HTMLDivElement>(null);
  const whyKoreaScrollRef = useRef<HTMLDivElement>(null);
  const [openFabric, setOpenFabric] = useState<string | null>(null);
  const [isWomensExpanded, setIsWomensExpanded] = useState(false);

  // Hero image slideshow (auto-rotates every 2s)
  const heroImages = ['/s1.jpg', '/s2.jpg', '/s3.jpg', '/s4.jpg'];
  const [heroSlide, setHeroSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroImages.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // Sequential reveal of the chat thread: photo bubble first, then Mark's reply
  const [chatReveal, setChatReveal] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setChatReveal(1), 450);
    const t2 = setTimeout(() => setChatReveal(2), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Metrics cards reveal when scrolled into view
  const metricsRef = useRef<HTMLDivElement>(null);
  const [metricsIn, setMetricsIn] = useState(false);
  useEffect(() => {
    const el = metricsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { setMetricsIn(true); obs.disconnect(); }
    }, { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
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
          <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 px-6 overflow-hidden flex-1 flex items-center">
          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-[49px] items-stretch">

            {/* Left: Copy */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              {/* Badge */}
              <a href="/" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/70 border border-neutral-200 text-[clamp(12px,1.4vw,14px)] whitespace-nowrap font-medium text-neutral-600 mb-6 shadow-sm hover:bg-white hover:shadow-md transition-all cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Made in Korea · No Section 301 Tariffs
              </a>

              {/* Headline */}
              <h1 className="text-[9vw] sm:text-5xl md:text-6xl lg:text-[3.4rem] xl:text-6xl font-bold tracking-tight mb-6 leading-[1.1] text-neutral-900">
                The apparel you want,<br />
                <span className="text-blue-600">
                  from a single photo.
                </span>
              </h1>

              {/* Description */}
              <p className="max-w-xl text-lg md:text-xl text-neutral-600 font-light mb-8 leading-relaxed">
                Upload a photo and chat with Mark, our AI agent — and we'll send you a tailored quote within 24 hours. Made in Korea, so there are no Section 301 tariffs.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 lg:items-center lg:mt-auto">
                <a id="gtm-start-hero-quote-btn" href="/" className="gtm-conversion-btn inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-neutral-900 text-white rounded-xl font-medium text-[clamp(13px,1.7vw,18px)] whitespace-nowrap hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/20 hover:-translate-y-0.5">
                  Upload a Photo &amp; Chat with Mark
                </a>
              </div>
            </div>

            {/* Right: Hero image + Mark chat overlay */}
            <div className="relative mt-4 lg:mt-0 max-w-[614px] mx-auto w-full flex flex-col">
              <div className="relative hidden overflow-hidden shadow-2xl shadow-blue-900/10 border border-white/60 aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3]">
                {heroImages.map((src, idx) => (
                  <img
                    key={src}
                    src={src}
                    alt="Premium apparel manufacturing in Korea"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === heroSlide ? 'opacity-100' : 'opacity-0'}`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
              </div>

              {/* Desktop spacer: aligns the chat card top with the headline (below the badge) */}
              <div className="hidden lg:block lg:h-[64px] shrink-0" aria-hidden="true" />

              {/* Chat window: stretches from headline top to button bottom on desktop */}
              <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200/80 bg-white/70 shadow-sm p-4 sm:p-5 lg:flex-1">
                {/* User message: uploaded photo */}
                <div className={`flex justify-end transition-all duration-700 ease-out ${chatReveal >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                  <div className="bg-white/95 backdrop-blur-md border border-neutral-100 rounded-2xl rounded-tr-md p-2 max-w-[78%] shadow-sm">
                    <img src="/s1.jpg" alt="Uploaded design" className="rounded-xl w-full max-h-36 object-cover" />
                    <div className="flex items-center gap-1.5 px-1 pt-2 pb-0.5">
                      <FileCheck size={13} className="text-neutral-600 shrink-0" />
                      <span className="text-[12px] text-neutral-600 truncate">your-design.jpg</span>
                    </div>
                  </div>
                </div>

                {/* Mark reply */}
                <div className={`flex items-start gap-2.5 transition-all duration-700 ease-out ${chatReveal >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-neutral-900 mb-1">Mark · AI Agent</div>
                    <div className="inline-block bg-white/95 backdrop-blur-md border border-neutral-100 shadow-sm rounded-2xl rounded-tl-md px-4 py-3 max-w-[280px]">
                      <p className="text-[13px] text-neutral-600 leading-snug">
                        Got it! MOQ from <b className="text-neutral-900">1&nbsp;pc</b>, sample in <b className="text-neutral-900">3–14 days</b>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat composer (design only) */}
                <div className={`mt-1 lg:mt-auto self-center w-[94%] flex items-center gap-2 bg-white border border-neutral-200 rounded-full pl-2 pr-2 py-1.5 shadow-sm transition-all duration-700 ease-out ${chatReveal >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                  <button type="button" aria-label="Upload a photo" className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors shrink-0">
                    <ImagePlus size={18} />
                  </button>
                  <span className="flex-1 text-[14px] text-neutral-400 truncate select-none">Message Mark…</span>
                  <button type="button" aria-label="Send" className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 hover:bg-blue-700 transition-colors">
                    <ArrowUp size={18} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Metrics */}
        <section className="px-6 pb-16 md:pb-20">
          <div ref={metricsRef} className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-4xl mx-auto">
            {/* Item 1 */}
            <div className={`flex flex-col items-center gap-3 sm:gap-5 transition-all duration-700 ease-out ${metricsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: metricsIn ? '0ms' : '0ms' }}>
              <div className="w-full flex items-center justify-center py-6 sm:py-10 md:py-14 px-1 bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all sm:hover:-translate-y-1">
                <div className="text-[7vw] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 whitespace-nowrap tracking-tighter">
                  1<span className="text-[4vw] sm:text-2xl md:text-3xl lg:text-4xl text-neutral-500 ml-0.5 sm:ml-1">pcs~</span>
                </div>
              </div>
              <div className="text-[11px] sm:text-sm md:text-sm md:text-base text-neutral-600 font-medium text-center leading-tight">Minimum Order<br className="sm:hidden"/> (MOQ)</div>
            </div>
            {/* Item 2 */}
            <div className={`flex flex-col items-center gap-3 sm:gap-5 transition-all duration-700 ease-out ${metricsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: metricsIn ? '120ms' : '0ms' }}>
              <div className="w-full flex items-center justify-center py-6 sm:py-10 md:py-14 px-1 bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all sm:hover:-translate-y-1">
                <div className="text-[7vw] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 whitespace-nowrap tracking-tighter">
                  3~14<span className="text-[4vw] sm:text-2xl md:text-3xl lg:text-4xl text-neutral-500 ml-0.5 sm:ml-1">days</span>
                </div>
              </div>
              <div className="text-[11px] sm:text-sm md:text-sm md:text-base text-neutral-600 font-medium text-center leading-tight">Sample<br className="sm:hidden"/> Lead Time</div>
            </div>
            {/* Item 3 */}
            <div className={`flex flex-col items-center gap-3 sm:gap-5 transition-all duration-700 ease-out ${metricsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: metricsIn ? '240ms' : '0ms' }}>
              <div className="w-full flex items-center justify-center py-6 sm:py-10 md:py-14 px-1 bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all sm:hover:-translate-y-1">
                <div className="text-[7vw] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 whitespace-nowrap tracking-tighter">
                  100<span className="text-[4vw] sm:text-2xl md:text-3xl lg:text-4xl text-neutral-500 ml-0.5 sm:ml-1">+</span>
                </div>
              </div>
              <div className="text-[11px] sm:text-sm md:text-sm md:text-base text-neutral-600 font-medium text-center leading-tight">Partner<br className="sm:hidden"/> Brands</div>
            </div>
          </div>
        </section>

        {/* Story Section - Temporarily hidden */}
        <section className="hidden w-full bg-transparent py-16 md:py-24 px-6 flex flex-col items-center text-center">
          <div className="max-w-4xl w-full flex flex-col items-center bg-white/70 backdrop-blur-xl border border-white/80 shadow-xl rounded-3xl p-10 md:p-16 hover:-translate-y-2 hover:shadow-2xl hover:bg-white/80 transition-all duration-500">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-10">
              From one factory floor to a global platform
            </h2>
            <div className="space-y-6 text-[15px] sm:text-lg md:text-xl text-neutral-800 font-light leading-relaxed max-w-3xl">
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

        {/* Hero to Custom Apparel Gradient Transition */}
        <div className="h-[500px] w-full" style={{ background: "linear-gradient(to bottom, #BFDBFE 0%, #dbeafe 20%, #eff6ff 45%, #ffffff 100%)" }}></div>

        {/* Custom Apparel Solutions Section (Moved from bottom) */}
        <section className="w-full bg-white py-20 md:py-32 px-6 overflow-hidden">
          <div className="max-w-[1000px] mx-auto mb-12 flex flex-col items-center text-center gap-8">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
                Custom Apparel Solutions
              </h2>
              <p className="text-lg md:text-xl text-neutral-500 font-light leading-relaxed max-w-2xl mx-auto">
                Discover KAW's signature production lineup featuring perfect fits and flawless details.
              </p>
            </div>
          </div>
          {/* Men's Collection */}
          <div className="max-w-[1200px] mx-auto w-full relative mb-12 sm:mb-16 group/carousel">
            <div ref={mensScrollRef} className="flex overflow-x-auto pb-6 -mx-6 px-6 sm:mx-0 sm:px-0 sm:pb-6 gap-3 sm:gap-6 snap-x snap-mandatory scrollbar-hide">
              {[
                "-29 001.png", "-30 003.png", "-33 008.png",
                "-33 009.png", "-33 010.png", "-34 011.png", "-31 005.png",
                "-35 013.png", "-35 014.png"
              ].map((img, idx) => {
                const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://tznhtceeqozjndfllknm.supabase.co";
                const optimizedUrl = `${supabaseUrl}/storage/v1/render/image/public/clothes/${encodeURIComponent(img)}?format=webp&quality=80`;
                return (
                <div key={idx} className="flex-none w-[calc(50vw-1.5rem)] sm:w-[calc(40%-1rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(28%-1rem)] bg-white rounded-2xl sm:rounded-[1.5rem] border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] flex flex-col group snap-start">
                  <div className="aspect-[3/4] w-full bg-neutral-100 relative overflow-hidden">
                    <img src={optimizedUrl} alt={`Men's Product ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                  </div>
                </div>
              )})}
            </div>
            <button onClick={() => scrollGallery(mensScrollRef, 'left')} className="absolute left-0 top-1/2 -translate-y-[calc(50%+12px)] -ml-4 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white border border-neutral-200 shadow-md text-neutral-600 hover:text-blue-600 hover:border-blue-200 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 z-10 focus:outline-hidden">
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button onClick={() => scrollGallery(mensScrollRef, 'right')} className="absolute right-0 top-1/2 -translate-y-[calc(50%+12px)] -mr-4 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white border border-neutral-200 shadow-md text-neutral-600 hover:text-blue-600 hover:border-blue-200 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 z-10 focus:outline-hidden">
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Women's Collection */}
          <div className="max-w-[1200px] mx-auto w-full relative group/carousel">
            <div ref={womensScrollRef} className="flex overflow-x-auto pb-6 -mx-6 px-6 sm:mx-0 sm:px-0 sm:pb-6 gap-3 sm:gap-6 snap-x snap-mandatory scrollbar-hide">
              {[
                "w1.png", "w2.png", "w3.png", "w4.png"
              ].map((img, idx) => (
                <div key={`w-${idx}`} className="flex-none w-[calc(50vw-1.5rem)] sm:w-[calc(40%-1rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(28%-1rem)] bg-white rounded-2xl sm:rounded-[1.5rem] border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] flex flex-col group snap-start">
                  <div className="aspect-[3/4] w-full bg-neutral-100 relative overflow-hidden">
                    <img src={`/${img}`} alt={`Women's Product ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => scrollGallery(womensScrollRef, 'left')} className="absolute left-0 top-1/2 -translate-y-[calc(50%+12px)] -ml-4 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white border border-neutral-200 shadow-md text-neutral-600 hover:text-blue-600 hover:border-blue-200 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 z-10 focus:outline-hidden">
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button onClick={() => scrollGallery(womensScrollRef, 'right')} className="absolute right-0 top-1/2 -translate-y-[calc(50%+12px)] -mr-4 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-white border border-neutral-200 shadow-md text-neutral-600 hover:text-blue-600 hover:border-blue-200 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 z-10 focus:outline-hidden">
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </section>


        {/* Why Korea + Capabilities Wrapper */}
        <div className="w-full bg-white">

        {/* Expanded Why Korea Sections */}
        {/* Expanded Why Korea Sections */}
        <div className="w-full pt-24 md:pt-40 pb-16 md:pb-32 px-6">
          
          <div className="max-w-[1200px] mx-auto w-full text-center mb-12 md:mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight">
              Why Korea?
            </h2>
          </div>

          <div className="max-w-[1200px] mx-auto w-full relative group/whycarousel">
            <div ref={whyKoreaScrollRef} className="flex overflow-x-auto pb-12 -mx-6 px-6 sm:mx-0 sm:px-0 sm:pb-12 gap-6 snap-x snap-mandatory scrollbar-hide">
              
              {/* Card 1: Tariffs */}
              <div className="flex-none w-[85vw] sm:w-[85vw] md:w-[85vw] lg:w-[45%] snap-center sm:snap-start h-auto">
                <div className="bg-white/80 backdrop-blur-xl border border-neutral-200/60 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 py-12 md:p-10 lg:p-12 h-full flex flex-col items-center text-center relative overflow-hidden group/card hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500">
                  
                  {/* Subtle background glow for the card */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-gradient-to-b from-orange-50/50 to-transparent blur-3xl -z-10 rounded-full pointer-events-none"></div>

                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white border border-orange-100 flex items-center justify-center mb-6 text-orange-600 shadow-sm relative z-10 group-hover/card:scale-110 transition-transform duration-500">
                    <FileCheck className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4 md:mb-6 leading-[1.1] relative z-10">
                    No Section 301 tariffs.
                  </h2>
                  <p className="text-base md:text-lg text-neutral-600 font-light leading-relaxed mb-6 md:mb-10 max-w-lg relative z-10">
                    None of the punitive surcharges that hit Chinese goods.
                  </p>

                  {/* Visual Chart: Horizontal Bar Comparison */}
                  <div className="w-full flex flex-col justify-center gap-6 md:gap-8 items-center mt-auto relative px-2 md:px-0 z-10">
                    
                    {/* Others Row */}
                    <div className="flex flex-col items-center w-full group/row">
                      <div className="text-neutral-400 font-extrabold mb-3 tracking-wider text-xs md:text-sm uppercase">
                        OTHERS
                      </div>
                      <div className="flex w-full h-[72px] sm:h-[90px] md:h-[100px] rounded-xl overflow-hidden shadow-sm border border-neutral-200">
                        <div className="w-[50%] bg-[#8F908C] flex items-center justify-center px-2">
                          <span className="text-white font-extrabold text-[9px] sm:text-xs md:text-sm whitespace-nowrap overflow-hidden text-ellipsis">Product Cost</span>
                        </div>
                        <div className="w-[15%] bg-[#A8A9A6] flex items-center justify-center border-l border-white/20">
                          <span className="text-white font-extrabold text-[9px] sm:text-xs md:text-sm whitespace-nowrap">Duty</span>
                        </div>
                        <div className="w-[35%] bg-[#E84E4E] flex items-center justify-center border-l border-white/20 shadow-[inset_2px_0_10px_rgba(0,0,0,0.1)] px-1">
                          <span className="text-white font-extrabold text-[9px] sm:text-xs md:text-sm flex items-center gap-1 drop-shadow-sm whitespace-nowrap">
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" strokeWidth={3} />
                            <span className="truncate">Tariff</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Korea Row */}
                    <div className="flex flex-col items-center w-full group/row">
                      <div className="text-blue-600 font-extrabold mb-3 tracking-wider text-xs md:text-sm flex items-center gap-2 uppercase">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        KOREA
                      </div>
                      <div className="flex w-full h-[72px] sm:h-[90px] md:h-[100px] rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg border-2 border-blue-200">
                        <div className="w-[50%] bg-blue-600 flex items-center justify-center px-2">
                          <span className="text-white font-extrabold text-[9px] sm:text-xs md:text-sm whitespace-nowrap overflow-hidden text-ellipsis">Product Cost</span>
                        </div>
                        <div className="w-[15%] bg-blue-400 flex items-center justify-center border-l border-white/20">
                          <span className="text-white font-extrabold text-[9px] sm:text-xs md:text-sm whitespace-nowrap">Duty</span>
                        </div>
                        <div className="w-[35%] bg-[#1E1E1E] flex items-center justify-center border-l border-white/10 relative overflow-hidden group/saved hover:bg-black transition-colors px-1">
                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover/saved:animate-[shimmer_1.5s_infinite]"></div>
                          <span className="text-white font-extrabold text-[8px] sm:text-[10px] md:text-xs flex items-center gap-1 relative z-10 whitespace-nowrap">
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
              <div className="flex-none w-[85vw] sm:w-[85vw] md:w-[85vw] lg:w-[45%] snap-center sm:snap-start h-auto">
                <div className="bg-white/80 backdrop-blur-xl border border-neutral-200/60 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 py-12 md:p-10 lg:p-12 h-full flex flex-col items-center text-center relative overflow-hidden group/card hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500">
                  
                  {/* Subtle background glow for the card */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-gradient-to-b from-blue-50/50 to-transparent blur-3xl -z-10 rounded-full pointer-events-none"></div>

                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white border border-blue-100 flex items-center justify-center mb-6 text-blue-600 shadow-sm relative z-10 group-hover/card:scale-110 transition-transform duration-500">
                    <MapPin className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4 md:mb-6 leading-[1.1] relative z-10">
                    One Supply Chain.<br className="hidden md:block"/> One Country.
                  </h2>
                  <p className="text-base md:text-lg text-neutral-600 font-light leading-relaxed mb-6 md:mb-10 max-w-lg relative z-10">
                    Yarn to finish, all in one country. Not one ocean away.
                  </p>

                  {/* Visual Chart: Supply Chain Comparison */}
                  <div className="w-full flex flex-col justify-center gap-6 md:gap-8 items-center mt-auto relative z-10">
                    
                    {/* Traditional Offshore Sourcing */}
                    <div className="flex flex-col items-center w-full group/row">
                      <div className="text-neutral-400 font-extrabold mb-3 tracking-wider text-xs md:text-sm uppercase">OTHERS</div>
                      <div className="flex items-center gap-1 w-full justify-between bg-white/60 p-2 sm:p-3 md:p-4 rounded-xl border border-neutral-200 shadow-sm h-[72px] sm:h-[90px] md:h-[100px]">
                        {/* Stage 1 */}
                        <div className="flex flex-col items-center gap-1 sm:gap-2 w-[25%]">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-neutral-400 border border-neutral-100 shrink-0">
                            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-[9px] sm:text-[10px] md:text-xs text-neutral-500 font-bold text-center leading-tight">Yarn</span>
                        </div>
                        {/* Route 1 */}
                        <div className="flex-1 flex flex-col items-center relative min-w-[20px]">
                          <div className="w-full border-t-2 border-dashed border-neutral-300 absolute top-1/2 -translate-y-1/2"></div>
                          <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 relative z-10" />
                          <span className="text-[7px] sm:text-[8px] md:text-[9px] text-neutral-400 font-black mt-1.5 whitespace-nowrap tracking-tighter">BORDERS</span>
                        </div>
                        {/* Stage 2 */}
                        <div className="flex flex-col items-center gap-1 sm:gap-2 w-[25%]">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-neutral-400 border border-neutral-100 shrink-0">
                            <Factory className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-[9px] sm:text-[10px] md:text-xs text-neutral-500 font-bold text-center leading-tight">Fabric</span>
                        </div>
                        {/* Route 2 */}
                        <div className="flex-1 flex flex-col items-center relative min-w-[20px]">
                          <div className="w-full border-t-2 border-dashed border-neutral-300 absolute top-1/2 -translate-y-1/2"></div>
                          <Ship className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 relative z-10 animate-[bounce_2s_ease-in-out_infinite]" />
                          <span className="text-[7px] sm:text-[8px] md:text-[9px] text-neutral-400 font-black mt-1.5 whitespace-nowrap tracking-tighter">30+ DAYS</span>
                        </div>
                        {/* Stage 3 */}
                        <div className="flex flex-col items-center gap-1 sm:gap-2 w-[25%]">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-neutral-400 border border-neutral-100 shrink-0">
                            <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-[9px] sm:text-[10px] md:text-xs text-neutral-500 font-bold text-center leading-tight">Sewing</span>
                        </div>
                      </div>
                    </div>

                    {/* Korea Sourcing */}
                    <div className="flex flex-col items-center w-full group/row">
                      <div className="text-blue-600 font-extrabold mb-3 tracking-wider text-xs md:text-sm flex items-center gap-2 uppercase">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        KOREA
                      </div>
                      <div className="flex items-center gap-1 w-full justify-between bg-blue-50 p-2 sm:p-3 md:p-4 rounded-xl border-2 border-blue-200 relative overflow-hidden shadow-md group-hover/row:-translate-y-1 transition-all duration-300 h-[72px] sm:h-[90px] md:h-[100px]">
                        {/* Stage 1 */}
                        <div className="flex flex-col items-center gap-1 sm:gap-2 z-10 w-[25%]">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-[9px] sm:text-[10px] md:text-xs text-blue-700 font-extrabold text-center leading-tight">Yarn<br className="sm:hidden"/>Spinning</span>
                        </div>
                        {/* Route 1 */}
                        <div className="flex-1 flex flex-col items-center relative z-10 min-w-[20px]">
                          <div className="w-full border-t-[3px] border-blue-400 absolute top-1/2 -translate-y-1/2"></div>
                          <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 relative z-10" />
                          <span className="text-[7px] sm:text-[8px] md:text-[9px] text-blue-600 font-black mt-1.5 whitespace-nowrap tracking-tighter">50KM</span>
                        </div>
                        {/* Stage 2 */}
                        <div className="flex flex-col items-center gap-1 sm:gap-2 z-10 w-[25%]">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                            <Factory className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-[9px] sm:text-[10px] md:text-xs text-blue-700 font-extrabold text-center leading-tight">Fabric<br className="sm:hidden"/>Mill</span>
                        </div>
                        {/* Route 2 */}
                        <div className="flex-1 flex flex-col items-center relative z-10 min-w-[20px]">
                          <div className="w-full border-t-[3px] border-blue-400 absolute top-1/2 -translate-y-1/2"></div>
                          <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 relative z-10" />
                          <span className="text-[7px] sm:text-[8px] md:text-[9px] text-blue-600 font-black mt-1.5 whitespace-nowrap tracking-tighter">50KM</span>
                        </div>
                        {/* Stage 3 */}
                        <div className="flex flex-col items-center gap-1 sm:gap-2 z-10 w-[25%]">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                            <Scissors className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-[9px] sm:text-[10px] md:text-xs text-blue-700 font-extrabold text-center leading-tight">Sewing<br className="sm:hidden"/>Factory</span>
                        </div>
                        <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover/row:opacity-10 transition-opacity duration-300"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: FTA */}
              <div className="flex-none w-[85vw] sm:w-[85vw] md:w-[85vw] lg:w-[45%] snap-center sm:snap-start h-auto">
                <div className="bg-white/80 backdrop-blur-xl border border-neutral-200/60 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 py-12 md:p-10 lg:p-12 h-full flex flex-col items-center text-center relative overflow-hidden group/card hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 justify-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-6 text-orange-600 shadow-sm relative z-10 group-hover/card:scale-110 transition-transform duration-500">
                    <FileText className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4 md:mb-6 leading-[1.1] relative z-10">
                    Built for FTA benefit.
                  </h2>
                  <p className="text-base md:text-lg text-neutral-600 font-light leading-relaxed max-w-lg relative z-10">
                    Korean fabrics can qualify for 0% base duty under KORUS.
                  </p>
                </div>
              </div>

              {/* Card 4: Global Brands */}
              <div className="flex-none w-[85vw] sm:w-[80vw] md:w-[750px] lg:w-[900px] snap-center sm:snap-start h-auto">
                <div className="bg-white/80 backdrop-blur-xl border border-neutral-200/60 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 py-12 md:p-10 lg:p-12 h-full flex flex-col items-center text-center relative overflow-hidden group/card hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 justify-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-6 text-orange-600 shadow-sm relative z-10 group-hover/card:scale-110 transition-transform duration-500">
                    <Award className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4 md:mb-6 leading-[1.1] relative z-10">
                    Global brands have sourced here for decades.
                  </h2>
                  <p className="text-base md:text-lg text-neutral-600 font-light leading-relaxed max-w-lg relative z-10">
                    Quality isn't a promise. It's a track record.
                  </p>
                </div>
              </div>

            </div>
            
            {/* Scroll Buttons for desktop */}
            <button onClick={() => scrollGallery(whyKoreaScrollRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-6 hidden md:flex items-center justify-center w-14 h-14 rounded-full bg-white border border-neutral-200 shadow-md text-neutral-600 hover:text-blue-600 hover:border-blue-200 opacity-0 group-hover/whycarousel:opacity-100 transition-all duration-300 z-20 focus:outline-hidden">
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <button onClick={() => scrollGallery(whyKoreaScrollRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-6 hidden md:flex items-center justify-center w-14 h-14 rounded-full bg-white border border-neutral-200 shadow-md text-neutral-600 hover:text-blue-600 hover:border-blue-200 opacity-0 group-hover/whycarousel:opacity-100 transition-all duration-300 z-20 focus:outline-hidden">
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
            </button>

          </div>
        </div>


        {/* Capabilities Section */}
        <section className="w-full py-12 md:py-16 px-6">
          <div className="max-w-[770px] mx-auto w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
                Why Korea Apparel Works?
              </h2>
            </div>
            <div className="flex overflow-x-auto pb-6 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 gap-4 md:gap-8 snap-x snap-mandatory scrollbar-hide">
              {/* Card 1 */}
              <div className="flex-none w-[42vw] sm:w-[320px] md:w-auto snap-center p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5 hover:-translate-y-1 group">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-3 sm:mb-6 text-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 group-hover:scale-110 transition-all duration-300">
                  <Factory className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                </div>
                <div className="text-lg md:text-xl font-bold text-neutral-900 tracking-tight mb-2 md:mb-5 group-hover:text-orange-600 transition-colors leading-tight">30 Years of Manufacturing Expertise</div>
                <p className="text-sm md:text-base text-neutral-600 font-light leading-relaxed">
                  Family-owned factory with direct production and transparent processes.
                </p>
              </div>

              {/* Card 2 */}
              <div className="flex-none w-[42vw] sm:w-[320px] md:w-auto snap-center p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5 hover:-translate-y-1 group">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-3 sm:mb-6 text-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 group-hover:scale-110 transition-all duration-300">
                  <Package className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                </div>
                <div className="text-lg md:text-xl font-bold text-neutral-900 tracking-tight mb-2 md:mb-5 group-hover:text-orange-600 transition-colors leading-tight">Full-Package OEM/ODM Solutions</div>
                <p className="text-sm md:text-base text-neutral-600 font-light leading-relaxed">
                  From design to finished product, we manage every production stage.
                </p>
              </div>

              {/* Card 3 */}
              <div className="flex-none w-[42vw] sm:w-[320px] md:w-auto snap-center p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5 hover:-translate-y-1 group">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-3 sm:mb-6 text-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 group-hover:scale-110 transition-all duration-300">
                  <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                </div>
                <div className="text-lg md:text-xl font-bold text-neutral-900 tracking-tight mb-2 md:mb-5 group-hover:text-orange-600 transition-colors leading-tight">Premium Quality Control</div>
                <p className="text-sm md:text-base text-neutral-600 font-light leading-relaxed">
                  High-end craftsmanship and technical expertise for performance apparel.
                </p>
              </div>

              {/* Card 4 */}
              <div className="flex-none w-[42vw] sm:w-[320px] md:w-auto snap-center p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5 hover:-translate-y-1 group">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-3 sm:mb-6 text-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 group-hover:scale-110 transition-all duration-300">
                  <Zap className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
                </div>
                <div className="text-lg md:text-xl font-bold text-neutral-900 tracking-tight mb-2 md:mb-5 group-hover:text-orange-600 transition-colors leading-tight">Flexible MOQ</div>
                <p className="text-sm md:text-base text-neutral-600 font-light leading-relaxed">
                  Prototype from 1 piece and scale production as your brand grows.
                </p>
              </div>

            </div>
          </div>
        </section>
        </div>

          {/* Atelier Image Gallery */}
          <div className="w-full mt-20 md:mt-[250px] overflow-hidden relative bg-white py-12 md:py-16">
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
                  {['b1.jpg', 'b2-2.jpg', 'b3.jpg', 'b4.jpg', 'b5.jpg', 'b6.jpg', 'b7.jpg', 'b8.jpg', 'b9.jpg'].map((imgName, idx) => {
                    const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://tznhtceeqozjndfllknm.supabase.co";
                    const optimizedUrl = `${supabaseUrl}/storage/v1/render/image/public/factory/${encodeURIComponent(imgName)}?format=webp&quality=80`;
                    return (
                    <div key={`${groupIdx}-${idx}`} className="flex-none w-[50vw] sm:w-[320px] md:w-[400px] aspect-[4/3] rounded-xl overflow-hidden border border-neutral-200/80 bg-neutral-100 shadow-sm">
                      <img 
                        src={optimizedUrl} 
                        alt={`Atelier gallery ${idx + 1}`} 
                        loading="lazy"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

        {/* AI Workflow Section */}
        <section className="mt-20 py-24 px-6 w-full bg-neutral-950 text-white border-t border-neutral-900">
          <div className="max-w-[770px] mx-auto w-full">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-white">
                AI-powered from inquiry to delivery
              </h2>
              <p className="text-[15px] sm:text-lg md:text-[20px] text-neutral-400 font-light leading-relaxed px-6 sm:px-0">
                We've integrated AI across the entire production workflow — so international buyers can place orders in any language, get accurate quotes instantly, and track every step of production without picking up the phone.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-16 sm:mb-20">
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

          {/* Global Export Map Section placed inside the black area */}
          <ExportMap />
        </section>

        {/* Final CTA Section */}
        <section className="w-full bg-neutral-950 pt-32 pb-40 px-6 flex flex-col items-center text-center">
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
