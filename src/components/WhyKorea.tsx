import React, { useRef, useState, useEffect } from 'react';
import { MapPin, Layers, Truck, Factory, Ship, Scissors, ChevronLeft, ChevronRight, Globe, RefreshCcw, ShieldCheck, Package, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhyKorea({ isLandingPage = false, ctaId = "gtm-start-hero-quote-btn" }: { isLandingPage?: boolean; ctaId?: string }) {
  const whyKoreaScrollRef = useRef<HTMLDivElement>(null);
  const samplePolicyRef = useRef<HTMLDivElement>(null);
  const [samplePolicyIn, setSamplePolicyIn] = useState(false);
  const [kawSlide, setKawSlide] = useState(0);

  useEffect(() => {
    const obsSp = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { setSamplePolicyIn(true); obsSp.disconnect(); }
    }, { threshold: 0.05 });
    const spEl = samplePolicyRef.current;
    if (spEl) obsSp.observe(spEl);
    return () => { if (spEl) obsSp.unobserve(spEl); };
  }, []);

  const scrollGallery = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.8;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const bannerSection = (
      <div 
        className="relative h-[275px] sm:h-[400px] lg:h-[500px] flex flex-col items-center justify-center text-center px-4 overflow-hidden"
        style={{ 
          width: '100vw', 
          marginLeft: 'calc(50% - 50vw)',
          marginRight: 'calc(50% - 50vw)'
        }}
      >
        <img 
          src="https://tznhtceeqozjndfllknm.supabase.co/storage/v1/object/public/images/color-tone-texture-fabric-sample-1783704580880.jpg" 
          alt="Fabric Texture" 
          className="absolute inset-0 w-full h-full object-cover scale-150 sm:scale-100 transition-transform duration-500 pointer-events-none"
        />
        <div className="absolute inset-0 bg-neutral-900/55 mix-blend-multiply"></div>
        <h2 className="relative z-10 text-white font-sans font-black text-3xl sm:text-4xl lg:text-5xl max-w-4xl tracking-tight leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
          The Apparel OEM/ODM Solution<br className="hidden sm:block" /> Made in Korea
        </h2>
      </div>
  );

  return (
    <div className="w-full flex flex-col items-center">
      {!isLandingPage && bannerSection}
      
      {/* Sample Policy Section */}
      <motion.section initial={{ y: 30 }} whileInView={{ y: 0 }} viewport={{ once: true, margin: "200px 0px" }} transition={{ duration: 0.8, ease: "easeOut" }} ref={samplePolicyRef} className="w-full bg-white pt-24 pb-24 px-6 overflow-hidden">
        <div className={`max-w-[1000px] mx-auto w-full transition-all duration-500 ${samplePolicyIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {/* 1. Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight mb-4">Try us with zero risk</h2>
            <p className="text-lg text-neutral-600 font-light max-w-2xl mx-auto">
              See our quality in your hands before committing to anything.
            </p>
          </div>

          {/* 2. No Sample Markup Banner */}
          <div className="w-full bg-blue-50/50 border border-blue-100 rounded-3xl p-8 sm:p-12 mb-8 flex flex-col items-center text-center relative overflow-hidden">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-900 mb-4 tracking-tight">No sample markup</h3>
            <p className="text-lg sm:text-xl text-blue-800/80 font-medium max-w-2xl leading-relaxed">
              We make your first sample at actual production cost — the same rate you'd pay in bulk.
            </p>
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
            <div className="flex flex-row justify-between relative z-10 gap-2 sm:gap-4 pb-4 sm:pb-0">
              <div className="flex flex-col items-center text-center flex-1 min-w-0 sm:w-[200px]">
                <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold text-lg mb-4 relative">
                  1
                </div>
                <h4 className="text-[15px] sm:text-[19px] font-bold text-neutral-900 mb-2 leading-tight">Approve before<br className="hidden sm:block"/> we ship</h4>
                <p className="text-[13px] sm:text-[16px] text-neutral-500 leading-relaxed px-1 sm:px-2">Photos and measurements sent for your sign-off</p>
              </div>
              
              <div className="flex flex-col items-center text-center flex-1 min-w-0 sm:w-[200px]">
                <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold text-lg mb-4 relative">
                  2
                </div>
                <h4 className="text-[15px] sm:text-[19px] font-bold text-neutral-900 mb-2 leading-tight">Hold it.<br className="hidden sm:block"/> Test it.</h4>
                <p className="text-[13px] sm:text-[16px] text-neutral-500 leading-relaxed px-1 sm:px-2">Check the fit, the fabric, the make</p>
              </div>

              <div className="flex flex-col items-center text-center flex-1 min-w-0 sm:w-[200px]">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-white shadow-sm flex items-center justify-center text-emerald-600 font-bold text-lg mb-4 relative">
                  3
                </div>
                <h4 className="text-[15px] sm:text-[19px] font-bold text-neutral-900 mb-2 leading-tight">Scale when<br className="hidden sm:block"/> ready</h4>
                <p className="text-[13px] sm:text-[16px] text-neutral-500 leading-relaxed px-1 sm:px-2">Your sample fee credited to bulk</p>
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

          {/* Intermediate CTA */}
          <div className="flex justify-center mb-16">
            <a 
              id={ctaId} 
              href="/" 
              className="gtm-conversion-btn inline-flex items-center justify-center gap-3 px-12 py-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium text-[clamp(14px,1.6vw,17px)] whitespace-nowrap transition-all shadow-lg shadow-neutral-900/10 hover:-translate-y-0.5"
            >
              Get pricing & lead time
            </a>
          </div>

          {/* 6. Microcopy */}
          <div className="text-center text-[14px] sm:text-[16px] text-neutral-400 max-w-2xl mx-auto space-y-1">
            <p>Additional charges may apply depending on the production process and the amount of materials used.</p>
          </div>
        </div>
      </motion.section>

      {isLandingPage && bannerSection}

      <motion.div initial={{ y: 30 }} whileInView={{ y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="w-full max-w-[1200px] pt-24 lg:pt-32 pb-16 lg:pb-24 px-4 lg:px-0">
      <div className="max-w-[1200px] mx-auto w-full text-center mb-12 lg:mb-16">
        <h2 className="text-3xl lg:text-5xl font-black text-neutral-900 tracking-tight flex items-start justify-center gap-3 lg:gap-5 z-10">
          <span className="text-center">Why Korea?</span>
        </h2>
      </div>

      <div className="max-w-[1200px] mx-auto w-full relative group/whycarousel">
        <div ref={whyKoreaScrollRef} className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:max-w-none lg:mx-0">
          {/* Card 2: Supply Chain */}
          <div className="w-full lg:h-auto">
            <div className="bg-white/80 backdrop-blur-xl border border-neutral-200/60 rounded-[2.5rem] lg:rounded-[3.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 py-10 lg:p-6 lg:py-8 lg:p-12 h-full flex flex-col items-center text-center relative overflow-hidden group/card hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500">
              
              {/* Subtle background glow for the card */}
              <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-gradient-to-b from-blue-100/50 to-transparent blur-3xl -z-10 rounded-full pointer-events-none"></div>

              <div className="hidden lg:flex w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white border border-blue-100 items-center justify-center mb-6 text-blue-600 shadow-sm relative z-10 group-hover/card:scale-110 transition-transform duration-500">
                <MapPin className="w-7 h-7 lg:w-8 lg:h-8" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl lg:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4 lg:mb-6 leading-[1.1] relative z-10">
                One Supply Chain.<br className="hidden lg:block"/> One Country.
              </h2>


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

          {/* Card 4: Global Brands */}
          <div className="w-full lg:h-auto">
            <div className="bg-white/80 backdrop-blur-xl border border-neutral-200/60 rounded-[2.5rem] lg:rounded-[3.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 py-10 lg:p-6 lg:py-8 lg:p-12 h-full flex flex-col items-center text-center relative overflow-hidden group/card hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500">
              
              {/* Subtle background glow for the card */}
              <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-gradient-to-b from-indigo-100/50 to-transparent blur-3xl -z-10 rounded-full pointer-events-none"></div>

              <div className="hidden lg:flex w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-indigo-50 border border-indigo-100 items-center justify-center mb-6 text-indigo-600 shadow-sm relative z-10 group-hover/card:scale-110 transition-transform duration-500">
                <Globe className="w-7 h-7 lg:w-8 lg:h-8" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl lg:text-3xl lg:text-4xl font-bold text-neutral-900 tracking-tight mb-4 lg:mb-6 leading-[1.1] relative z-10">
                Global brands have sourced here for decades.
              </h2>


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
      </div>

      {/* Why Korea Apparel Works Section */}
      <motion.section initial={{ y: 30 }} whileInView={{ y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="w-full bg-white pt-20 lg:pt-[220px] pb-16 lg:pb-24 px-4 lg:px-0">
        <div className="max-w-[1200px] mx-auto w-full relative">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-3xl lg:text-5xl font-black text-neutral-900 tracking-tight flex items-start justify-center gap-3 lg:gap-5 z-10">
              <span className="text-center">Why Korea Apparel Works?</span>
            </h2>
          </div>

          {/* Factory photo carousel */}
          <div className="relative w-full max-w-[900px] mx-auto">
            <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] overflow-hidden rounded-2xl bg-neutral-100 shadow-md">
              {['b7.jpg', 'b1.jpg', 'b5.jpg', 'b3.jpg', 'b8.jpg', 'b9.jpg'].map((imgName, idx) => {
                const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://tznhtceeqozjndfllknm.supabase.co";
                return (
                <img
                  key={idx}
                  src={`${supabaseUrl}/storage/v1/render/image/public/factory/${encodeURIComponent(imgName)}?format=webp&quality=80`}
                  alt={`Factory gallery ${idx + 1}`}
                  loading="lazy"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${kawSlide === idx ? 'opacity-100' : 'opacity-0'}`}
                />
              )})}
              <button onClick={() => setKawSlide((p) => (p + 5) % 6)} aria-label="Previous image" className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-neutral-700 hover:bg-white shadow-md transition-all z-10">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={() => setKawSlide((p) => (p + 1) % 6)} aria-label="Next image" className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-neutral-700 hover:bg-white shadow-md transition-all z-10">
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <button key={idx} onClick={() => setKawSlide(idx)} aria-label={`Go to image ${idx + 1}`} className={`h-2 rounded-full transition-all ${kawSlide === idx ? 'bg-white w-5' : 'bg-white/50 w-2'}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-[25px] pt-8 lg:pt-12 w-full">
            {/* Card 1 */}
            <div className="w-full p-4 sm:p-6 lg:p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3 sm:mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:scale-110 transition-all duration-300">
                <Factory className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
              </div>
              <div className="text-[15px] sm:text-lg lg:text-xl font-bold text-neutral-900 tracking-tight mb-2 lg:mb-4 group-hover:text-blue-600 transition-colors leading-tight">30 Years of Manufacturing Expertise</div>
              <p className="text-[13px] sm:text-sm lg:text-base text-neutral-600 font-light leading-relaxed">
                Family-owned factory with direct production and transparent processes.
              </p>
            </div>
            {/* Card 2 */}
            <div className="w-full p-4 sm:p-6 lg:p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-900/5 hover:-translate-y-1 group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-3 sm:mb-6 text-purple-600 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 group-hover:scale-110 transition-all duration-300">
                <Package className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
              </div>
              <div className="text-[15px] sm:text-lg lg:text-xl font-bold text-neutral-900 tracking-tight mb-2 lg:mb-4 group-hover:text-purple-600 transition-colors leading-tight">Full-Package OEM/ODM Solutions</div>
              <p className="text-[13px] sm:text-sm lg:text-base text-neutral-600 font-light leading-relaxed">
                From design to finished product, we manage every production stage.
              </p>
            </div>
            {/* Card 3 */}
            <div className="w-full p-4 sm:p-6 lg:p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3 sm:mb-6 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 group-hover:scale-110 transition-all duration-300">
                <ShieldCheck className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
              </div>
              <div className="text-[15px] sm:text-lg lg:text-xl font-bold text-neutral-900 tracking-tight mb-2 lg:mb-4 group-hover:text-emerald-600 transition-colors leading-tight">Premium Quality Control</div>
              <p className="text-[13px] sm:text-sm lg:text-base text-neutral-600 font-light leading-relaxed">
                High-end craftsmanship and technical expertise for performance apparel.
              </p>
            </div>
            {/* Card 4 */}
            <div className="w-full p-4 sm:p-6 lg:p-8 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5 hover:-translate-y-1 group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-3 sm:mb-6 text-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 group-hover:scale-110 transition-all duration-300">
                <Zap className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
              </div>
              <div className="text-[15px] sm:text-lg lg:text-xl font-bold text-neutral-900 tracking-tight mb-2 lg:mb-4 group-hover:text-orange-600 transition-colors leading-tight">Flexible MOQ</div>
              <p className="text-[13px] sm:text-sm lg:text-base text-neutral-600 font-light leading-relaxed">
                Prototype from 1 piece and scale production as your brand grows.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
    </div>
  );
}
