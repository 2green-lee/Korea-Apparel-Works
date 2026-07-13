import React, { useRef, useState, useEffect } from 'react';
import ExportMap from './ExportMap';
import WhyKorea from './WhyKorea';
import { fabricsData, getFabricPatternSvg } from '../lib/fabricData';
import { Minus, Plus, ArrowRight, ArrowUp, ImagePlus, Factory, Package, ShieldCheck, Zap, Bot, LineChart, MessageSquare, FileText, Scissors, CheckCircle2, Check, Truck, MapPin, FileCheck, Award, ChevronLeft, ChevronRight, Ship, Layers, Globe, RefreshCcw } from 'lucide-react';

export default function StartLanding() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mensScrollRef = useRef<HTMLDivElement>(null);
  const womensScrollRef = useRef<HTMLDivElement>(null);
  const whyKoreaScrollRef = useRef<HTMLDivElement>(null);
  const whyKawScrollRef = useRef<HTMLDivElement>(null);
  const [openFabric, setOpenFabric] = useState<string | null>(null);
  const [isWomensExpanded, setIsWomensExpanded] = useState(false);

  // Hero image slideshow (auto-rotates every 2s)
  const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://tznhtceeqozjndfllknm.supabase.co";
  const optimizedS1Url = `${supabaseUrl}/storage/v1/render/image/public/factory/s1.jpg?format=webp&quality=80`;
  const heroImages = [optimizedS1Url, '/s2.jpg', '/s3.jpg', '/s4.jpg'];
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
    const t1 = setTimeout(() => setChatReveal(1), 1000);
    const t2 = setTimeout(() => setChatReveal(2), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
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
                Start your brand with one piece.
              </h1>

              {/* Description */}
              <p className="max-w-xl text-lg lg:text-xl text-neutral-600 font-light mb-8 leading-relaxed">
                Korea-made polos and knits, from one piece.<br />
                Golf, tennis, and pickleball apparel — OEM/ODM with no minimum.
              </p>

              {/* Buttons */}
              <div className="w-full flex justify-center mt-4 lg:mt-auto">
                <a id="gtm-start-hero-quote-btn" href="/" className="gtm-conversion-btn inline-flex items-center justify-center gap-3 px-10 sm:px-14 py-4 bg-neutral-900 text-white rounded-xl font-medium text-[clamp(13px,1.7vw,18px)] whitespace-nowrap hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/20 hover:-translate-y-0.5">
                  <Bot size={22} className="text-blue-400" />
                  Ask Us Anything
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
                <div className={`flex justify-end transition-all duration-700 ease-out ${chatReveal >= 1 ? 'translate-y-0' : 'translate-y-3'}`}>
                  <div className="bg-white/95 backdrop-blur-md border border-neutral-100 rounded-2xl rounded-tr-md p-2 max-w-[78%] shadow-sm">
                    <img src={optimizedS1Url} alt="Uploaded design" className="rounded-xl w-full max-h-36 object-cover" />
                    <div className="flex items-center gap-1.5 px-1 pt-2 pb-0.5">
                      <FileCheck size={13} className="text-neutral-600 shrink-0" />
                      <span className="text-[12px] text-neutral-600 truncate">your-design.jpg</span>
                    </div>
                  </div>
                </div>

                {/* Mark reply */}
                <div className={`flex items-start gap-2.5 transition-all duration-700 ease-out ${chatReveal >= 2 ? 'translate-y-0' : 'translate-y-3'}`}>
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-neutral-900 mb-1">Mark</div>
                    <div className="inline-block bg-white/95 backdrop-blur-md border border-neutral-100 shadow-sm rounded-2xl rounded-tl-md px-4 py-3 max-w-[280px]">
                      <p className="text-[13px] text-neutral-600 leading-snug">
                        Got it! MOQ from <b className="text-neutral-900">1&nbsp;pc</b>, sample in <b className="text-neutral-900">3–14 days</b>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat composer (design only) */}
                <div className="mt-1 lg:mt-auto self-center w-[94%] flex items-center gap-2 bg-white border border-neutral-200 rounded-full pl-2 pr-2 py-1.5 shadow-sm">
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
        <section className="px-6 pb-12 lg:pb-[150px]">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-4xl mx-auto">
            {/* Item 1 */}
            <div className="flex flex-col items-center gap-3 sm:gap-5">
              <div className="w-full flex items-center justify-center py-6 sm:py-10 lg:py-14 px-1 bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all sm:hover:-translate-y-1">
                <div className="text-[7vw] sm:text-4xl lg:text-5xl lg:text-6xl font-extrabold text-neutral-900 whitespace-nowrap tracking-tighter">
                  1pc~
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-[11px] sm:text-sm lg:text-sm lg:text-base text-neutral-600 font-medium text-center leading-tight">MOQ</div>
                <div className="text-[9px] sm:text-[11px] lg:text-xs text-neutral-600 font-normal mt-0.5">(Minimum Order Quantity)</div>
              </div>
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

        </div>

        {/* Sample Policy Section */}
        <section ref={samplePolicyRef} className="w-full bg-white pt-24 pb-24 px-6 border-t border-neutral-100 overflow-hidden">
          <div className={`max-w-[1000px] mx-auto w-full transition-all duration-1000 ${samplePolicyIn ? 'translate-y-0' : 'translate-y-10'}`}>
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
              <p>Additional charges may apply depending on the production process and the amount of materials used.</p>
            </div>

          </div>
        </section>

        {/* Why Korea Section */}
        <div className="w-full bg-white overflow-hidden">
          <WhyKorea />
        </div>

        {/* Why Korea Apparel Works Section */}
        <div className="w-full bg-white pb-16 lg:pb-24 px-4 lg:px-0">
          <div className="max-w-[1200px] mx-auto w-full relative">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-3xl lg:text-5xl font-black text-neutral-900 tracking-tight flex items-start justify-center gap-3 lg:gap-5 z-10">
                <span className="text-center">Why Korea Apparel Works?</span>
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-[2px] pb-8">
              {['b1.jpg', 'b3.jpg', 'b5.jpg', 'b7.jpg', 'b8.jpg', 'b9.jpg'].map((imgName, idx) => {
                const optimizedUrl = `${supabaseUrl}/storage/v1/render/image/public/factory/${encodeURIComponent(imgName)}?format=webp&quality=80`;
                return (
                  <div key={idx} className="w-full aspect-[4/3] overflow-hidden bg-neutral-100 shadow-sm group/gridimg">
                    <img
                      src={optimizedUrl}
                      alt={`Factory gallery ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover opacity-90 group-hover/gridimg:opacity-100 transition-all duration-500 hover:scale-[1.05]"
                    />
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-[25px] pt-8 lg:pt-12 w-full">
              {/* Card 1 */}
              <div className="w-full p-4 sm:p-6 lg:p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 group">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3 sm:mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:scale-110 transition-all duration-300">
                  <Factory className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
                </div>
                <div className="text-sm sm:text-lg lg:text-xl font-bold text-neutral-900 tracking-tight mb-2 lg:mb-4 group-hover:text-blue-600 transition-colors leading-tight">30 Years of Manufacturing Expertise</div>
                <p className="text-[12px] sm:text-sm lg:text-base text-neutral-600 font-light leading-relaxed">
                  Family-owned factory with direct production and transparent processes.
                </p>
              </div>
              {/* Card 2 */}
              <div className="w-full p-4 sm:p-6 lg:p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-900/5 hover:-translate-y-1 group">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-3 sm:mb-6 text-purple-600 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 group-hover:scale-110 transition-all duration-300">
                  <Package className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
                </div>
                <div className="text-sm sm:text-lg lg:text-xl font-bold text-neutral-900 tracking-tight mb-2 lg:mb-4 group-hover:text-purple-600 transition-colors leading-tight">Full-Package OEM/ODM Solutions</div>
                <p className="text-[12px] sm:text-sm lg:text-base text-neutral-600 font-light leading-relaxed">
                  From design to finished product, we manage every production stage.
                </p>
              </div>
              {/* Card 3 */}
              <div className="w-full p-4 sm:p-6 lg:p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 group">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3 sm:mb-6 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 group-hover:scale-110 transition-all duration-300">
                  <ShieldCheck className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
                </div>
                <div className="text-sm sm:text-lg lg:text-xl font-bold text-neutral-900 tracking-tight mb-2 lg:mb-4 group-hover:text-emerald-600 transition-colors leading-tight">Premium Quality Control</div>
                <p className="text-[12px] sm:text-sm lg:text-base text-neutral-600 font-light leading-relaxed">
                  High-end craftsmanship and technical expertise for performance apparel.
                </p>
              </div>
              {/* Card 4 */}
              <div className="w-full p-4 sm:p-6 lg:p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5 hover:-translate-y-1 group">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-3 sm:mb-6 text-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 group-hover:scale-110 transition-all duration-300">
                  <Zap className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
                </div>
                <div className="text-sm sm:text-lg lg:text-xl font-bold text-neutral-900 tracking-tight mb-2 lg:mb-4 group-hover:text-orange-600 transition-colors leading-tight">Flexible MOQ</div>
                <p className="text-[12px] sm:text-sm lg:text-base text-neutral-600 font-light leading-relaxed">
                  Prototype from 1 piece and scale production as your brand grows.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Workflow Section */}
        <section className="mt-20 py-24 px-6 w-full bg-neutral-950 text-white border-t border-neutral-900">
          {/* Global Export Map Section placed inside the black area */}
          <div ref={exportMapRef} className={`w-full transition-all duration-1000 ease-out ${exportMapIn ? 'translate-y-0' : 'translate-y-16'}`}>
            <ExportMap />
          </div>
        </section>

        {/* Atelier Image Gallery */}
        <div className="w-full bg-neutral-950 pt-6 lg:pt-8 pb-12 lg:pb-16 px-4 lg:px-6">
          <div ref={atelierRef} className={`w-full overflow-hidden relative transition-all duration-1000 ease-out ${atelierIn ? 'translate-y-0' : 'translate-y-16'}`}>
            <div className="max-w-[1200px] mx-auto w-full grid grid-cols-3 gap-[1px] sm:gap-[2px] border border-neutral-900 rounded-none overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 bg-neutral-900">
            {['b1.jpg', 'b3.jpg', 'b5.jpg', 'b7.jpg', 'b8.jpg', 'b9.jpg'].map((imgName, idx) => {
              const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://tznhtceeqozjndfllknm.supabase.co";
              const optimizedUrl = `${supabaseUrl}/storage/v1/render/image/public/factory/${encodeURIComponent(imgName)}?format=webp&quality=80`;
              return (
                <div key={idx} className="relative aspect-square lg:aspect-[4/3] bg-neutral-950 group overflow-hidden">
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
        </div>

        {/* Final CTA Section */}
        <section className="w-full bg-neutral-950 pt-32 pb-40 px-6 flex flex-col items-center text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
            The Ultimate Apparel<br />Production Partner
          </h2>
          <p className="text-lg lg:text-xl text-neutral-400 font-light mb-10">
            Start your journey with us today.
          </p>
          <a id="gtm-start-footer-request-btn" href="/" className="gtm-conversion-btn inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-10 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300 text-lg tracking-wide">
            Ask Us Anything
          </a>
        </section>
      </main>
    </div>
  );
}
