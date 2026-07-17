import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import ExportMap from './ExportMap';
import WhyKorea from './WhyKorea';
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
  const heroImages = ['p1.jpg', 'p2.jpg', 'p3.jpg', 'p4.jpg', 'p5.jpg', 'p7.jpg'].map(
    (name) => `${supabaseUrl}/storage/v1/render/image/public/clothes/${name}?format=webp&quality=80`
  );
  const [heroSlide, setHeroSlide] = useState(0);
  const [kawSlide, setKawSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroImages.length);
    }, 3500);
    return () => clearInterval(id);
  }, [heroImages.length]);

  // Push conversion CTA clicks to dataLayer so GTM/Google Ads can track them reliably
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('.gtm-conversion-btn');
      if (el) {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({ event: 'conversion_click', cta_id: el.id || 'unknown', page: 'welcome' });
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
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
      {/* Header */}
      <header className="sticky top-0 z-50 w-full flex items-center h-[70px] bg-white border-b border-neutral-200 shadow-xs">
        <div className="w-full h-full px-6 lg:px-12 flex items-center justify-between relative">
          
          {/* Left Side Spacer (match Header.tsx) */}
          <div className="hidden min-[930px]:flex items-center space-x-8">
            <div className="w-8" />
          </div>
          <div className="flex min-[930px]:hidden mr-4 w-5"></div>

          <a href="/" className="flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group focus:outline-hidden">
            <img src="/logo6.png" alt="Korea Apparel Works Logo" className="h-[60px] object-contain translate-y-[3px]" />
          </a>
          
          {/* Right Side */}
          <div className="flex">
            <a href="mailto:contact@k-apparel.works" className="inline-flex items-center justify-center active:scale-95 rounded-full px-5 py-2.5 transition duration-200 cursor-pointer text-sm font-medium font-dm-sans shadow-sm hover:shadow-md bg-neutral-900 hover:bg-neutral-800 text-white">Contact us</a>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <div className="w-full bg-gradient-to-b from-white via-blue-50 to-blue-200">
          {/* Hero Section */}
          <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 px-6 overflow-hidden flex-1 flex items-center">
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
                Start your brand <span className="text-blue-600">with one piece.</span>
              </h1>

              {/* Description */}
              <p className="max-w-xl text-lg lg:text-xl text-neutral-600 font-light mb-8 leading-relaxed">
                Korea-made polos and knits, from one piece.<br />
                Golf, tennis, and pickleball apparel — OEM/ODM with no minimum.
              </p>

              {/* Buttons */}
              <div className="w-full flex justify-center mt-4 lg:mt-auto">
                <a id="gtm-welcome-hero-quote-btn" href="/" className="gtm-conversion-btn inline-flex items-center justify-center gap-3 px-10 sm:px-14 py-4 bg-neutral-900 text-white rounded-xl font-medium text-[clamp(13px,1.7vw,18px)] whitespace-nowrap hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/20 hover:-translate-y-0.5">
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
        </motion.section>

        {/* Metrics */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="px-6 pb-12 lg:pb-[150px]">
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
                <div className="text-[9px] sm:text-[11px] lg:text-xs text-neutral-600 font-normal mt-0.5 text-center">(Minimum Order Quantity)</div>
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
        </motion.section>



        {/* Story Section - Temporarily hidden */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="hidden w-full bg-transparent py-16 lg:py-24 px-6 flex flex-col items-center text-center">
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
        </motion.section>
        </div>




        {/* Why Korea + Capabilities Wrapper */}
        <div className="w-full bg-white">

        </div>

        {/* Why Korea Section */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="w-full bg-white overflow-hidden">
          <WhyKorea isLandingPage={true} />
        </motion.section>


        {/* Final CTA Section */}
        <section className="w-full bg-neutral-950 pt-32 pb-40 px-6 flex flex-col items-center text-center -mt-[1px] relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex flex-col items-center w-full">
            <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
              The Ultimate Apparel<br />Production Partner
            </h2>
            <p className="text-lg lg:text-xl text-neutral-400 font-light mb-10">
              Start your journey with us today.
            </p>
            <a id="gtm-welcome-footer-request-btn" href="/" className="gtm-conversion-btn inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-10 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300 text-lg tracking-wide">
              Ask Us Anything
            </a>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
