import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import ExportMap from './ExportMap';
import WhyKorea from './WhyKorea';
import { fabricsData, getFabricPatternSvg } from '../lib/fabricData';
import { Minus, Plus, ArrowRight, ArrowUp, ImagePlus, Factory, Package, ShieldCheck, Zap, Bot, LineChart, MessageSquare, FileText, Scissors, CheckCircle2, Check, Truck, MapPin, FileCheck, Award, ChevronLeft, ChevronRight, Ship, Layers, Globe, RefreshCcw } from 'lucide-react';

// 히어로 배경 영상.
// 6GB 원본을 그대로 쓰면 안 되고, 15~20초로 잘라 압축한 무음 루프(수 MB)를 public/ 폴더에 넣으세요.
//   ffmpeg -i 원본.mov -t 15 -an -vf "scale=1920:-2,fps=30" -c:v libx264 -crf 26 -preset slow -movflags +faststart -pix_fmt yuv420p hero-loop.mp4
// 파일이 없으면 아래 poster 이미지가 대신 보입니다.
const HERO_VIDEO_URL = '/hero-loop.mp4';
const HERO_VIDEO_POSTER = '/p1.jpg';

export default function WelcomeLanding() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mensScrollRef = useRef<HTMLDivElement>(null);
  const womensScrollRef = useRef<HTMLDivElement>(null);
  const whyKoreaScrollRef = useRef<HTMLDivElement>(null);
  const whyKawScrollRef = useRef<HTMLDivElement>(null);
  const [openFabric, setOpenFabric] = useState<string | null>(null);
  const [isWomensExpanded, setIsWomensExpanded] = useState(false);

  // Sticky mobile CTA: show after scrolling past the hero CTA
  const [showStickyCta, setShowStickyCta] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [kawSlide, setKawSlide] = useState(0);

  // 모바일에서는 영상을 오버레이 배경이 아니라 16:9 카드로 보여준다
  // (가로 영상을 세로 패널에 깔면 좌우가 잘려 세로 조각만 보이기 때문)
  const [isMobileHero, setIsMobileHero] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
  useEffect(() => {
    const onResize = () => setIsMobileHero(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
      <header className="sticky top-0 z-50 w-full flex items-center h-[80px] bg-white border-b border-neutral-200 shadow-xs">
        <div className="w-full h-full px-6 lg:px-12 flex items-center justify-between relative">
          
          {/* Left Side Spacer (match Header.tsx) */}
          <div className="hidden min-[930px]:flex items-center space-x-8">
            <div className="w-8" />
          </div>
          <div className="flex min-[930px]:hidden mr-4 w-5"></div>

          <a href="/" className="flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group focus:outline-hidden">
            <img src="/logo12345.jpg" alt="Korea Apparel Works Logo" className="h-[70px] object-contain translate-y-[3px]" />
          </a>
          
          {/* Right Side */}
          <div className="flex">
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <div className="w-full bg-gradient-to-b from-white via-blue-50 to-blue-200">
          {/* Hero Section */}
          <motion.section initial={{ y: 30 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative pt-6 pb-16 lg:pt-8 lg:pb-24 px-4 lg:px-6 overflow-hidden flex-1 flex items-center">
          <div className="max-w-[1320px] mx-auto w-full">

            {isMobileHero ? (
            /* Mobile: badge above, 4:3 video panel with headline + CTA overlaid, description below */
            <div className="flex flex-col items-center pt-4">
              {/* Badge above the video */}
              <a href="/" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/70 border border-neutral-200 text-[12px] whitespace-nowrap font-medium text-neutral-600 mb-5 shadow-sm hover:bg-white hover:shadow-md transition-all cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                The Apparel OEM/ODM Solution Made in Korea
              </a>

              <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl shadow-neutral-900/20 aspect-[4/3] bg-neutral-950 flex items-center justify-center">
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  src={HERO_VIDEO_URL}
                  poster={HERO_VIDEO_POSTER}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                />
                {/* Readability overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/55 via-neutral-950/35 to-neutral-950/60" />

                {/* On-video copy: headline + description + CTA */}
                <div className="relative z-10 flex flex-col items-center text-center px-4 py-8">
                  <h1 className="text-[8.5vw] sm:text-5xl font-bold tracking-tight mb-4 leading-[1.15] text-white">
                    Start your brand<br />
                    <span className="text-blue-400 whitespace-nowrap">with one piece.</span>
                  </h1>

                  <p className="max-w-md text-[13px] sm:text-sm text-white/85 font-light mb-5 leading-relaxed px-3">
                    Korea-made polos and knits, from one piece.<br />
                    Golf, tennis, and pickleball apparel — OEM/ODM with no minimum.
                  </p>

                  <a id="gtm-welcome-hero-quote-btn" href="/" className="gtm-conversion-btn inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-neutral-900 rounded-lg font-medium text-[14px] whitespace-nowrap hover:bg-neutral-100 transition-all shadow-lg shadow-neutral-950/30 hover:-translate-y-0.5">
                    Get pricing & lead time
                  </a>
                </div>
              </div>

              {/* Below the video: reassurance */}
              <div className="flex items-center gap-1.5 mt-5 mb-2 text-[13px] sm:text-sm text-neutral-600">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
                <span>No sample markup — fee 100% credited on bulk orders</span>
              </div>
            </div>
            ) : (
            /* Desktop: Vimeo-style full-bleed video panel with copy overlaid */
            <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl shadow-neutral-900/20 min-h-[560px] lg:min-h-[78vh] flex items-center justify-center">
              {/* Background video (poster shows until the clip is added) */}
              <video
                className="absolute inset-0 w-full h-full object-cover"
                src={HERO_VIDEO_URL}
                poster={HERO_VIDEO_POSTER}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
              />
              {/* Readability overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/55 via-neutral-950/35 to-neutral-950/60" />

              {/* Copy */}
              <div className="relative z-10 flex flex-col items-center text-center px-6 py-16 lg:py-24 max-w-3xl mx-auto">
                {/* Badge */}
                <a href="/" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-[clamp(12px,1.4vw,14px)] whitespace-nowrap font-medium text-white/90 mb-6 shadow-sm hover:bg-white/25 transition-all cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  The Apparel OEM/ODM Solution Made in Korea
                </a>

                {/* Headline */}
                <h1 className="text-[9vw] sm:text-5xl lg:text-6xl lg:text-[3.4rem] xl:text-6xl font-bold tracking-tight mb-6 leading-[1.15] text-white">
                  Start your brand<br />
                  <span className="text-blue-400 whitespace-nowrap">with one piece.</span>
                </h1>

                {/* Description */}
                <p className="max-w-xl text-lg lg:text-xl text-white/85 font-light mb-8 leading-relaxed">
                  Korea-made polos and knits, from one piece.<br />
                  Golf, tennis, and pickleball apparel — OEM/ODM with no minimum.
                </p>

                {/* Buttons */}
                <div className="w-full flex flex-col items-center mt-2">
                  <a id="gtm-welcome-hero-quote-btn" href="/" className="gtm-conversion-btn inline-flex items-center justify-center gap-3 px-10 sm:px-14 py-4 bg-white text-neutral-900 rounded-xl font-medium text-[clamp(13px,1.7vw,18px)] whitespace-nowrap hover:bg-neutral-100 transition-all shadow-lg shadow-neutral-950/30 hover:-translate-y-0.5">
                    Get pricing & lead time
                  </a>
                  <div className="flex items-center gap-1.5 mt-3.5 text-[13px] sm:text-sm text-white/80">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2.5} />
                    <span>No sample markup — fee 100% credited on bulk orders</span>
                  </div>
                </div>
              </div>
            </div>
            )}

          </div>
        </motion.section>

        {/* Metrics */}
        <motion.section initial={{ y: 30 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="px-6 pb-8 lg:pb-16">
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
        <motion.section initial={{ y: 30 }} whileInView={{ y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="hidden w-full bg-transparent py-16 lg:py-24 px-6 flex flex-col items-center text-center">
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
        <motion.section initial={{ y: 30 }} whileInView={{ y: 0 }} viewport={{ once: true, margin: "200px 0px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="w-full bg-white overflow-hidden">
          <WhyKorea isLandingPage={true} ctaId="gtm-welcome-middle-quote-btn" />
        </motion.section>


        {/* Final CTA Section */}
        <section className="w-full bg-neutral-950 pt-32 pb-40 px-6 flex flex-col items-center text-center -mt-[1px] relative z-10">
          <motion.div initial={{ y: 30 }} whileInView={{ y: 0 }} viewport={{ once: true, margin: "200px 0px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex flex-col items-center w-full">
            <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
              The Ultimate Apparel<br />Production Partner
            </h2>
            <p className="text-lg lg:text-xl text-neutral-400 font-light mb-10">
              Start your journey with us today.
            </p>
            <a id="gtm-welcome-footer-request-btn" href="/" className="gtm-conversion-btn inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-10 rounded-lg shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300 text-lg tracking-wide">
              Start with one piece
            </a>
          </motion.div>
        </section>
      </main>

      {/* Sticky mobile CTA bar (no opacity animation — keeps Clarity recordings clean) */}
      {showStickyCta && (
        <div
          className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 pt-3"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
        >
          <a
            id="gtm-welcome-sticky-quote-btn"
            href="/"
            className="gtm-conversion-btn flex items-center justify-center gap-2 w-full py-3.5 bg-neutral-900 text-white rounded-xl font-medium text-[15px]"
          >
            Get pricing & lead time
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
