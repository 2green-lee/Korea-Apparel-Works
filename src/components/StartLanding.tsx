import React, { useRef, useState } from 'react';
import ExportMap from './ExportMap';
import { fabricsData, getFabricPatternSvg } from '../lib/fabricData';
import { Minus, Plus, ArrowRight, Factory, Package, ShieldCheck, Zap, Bot, LineChart, MessageSquare, FileText, Scissors, CheckCircle2, Truck } from 'lucide-react';

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
          <span className="font-sans font-medium text-[17px] tracking-normal sm:tracking-[0.1em] transition-colors duration-500 select-none text-neutral-900 group-hover:opacity-80 whitespace-nowrap">
            Korea Apparel Works
          </span>
        </a>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="w-full bg-gradient-to-br from-rose-100 from-[35%] to-blue-200 to-[45%]">
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 flex flex-col items-center text-center overflow-hidden flex-1 justify-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-neutral-100/80 border border-neutral-200 text-sm font-medium text-neutral-600 mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Full-Package OEM/ODM Solutions
          </div>

          {/* Headline */}
          <h1 className="text-[11vw] sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.2] whitespace-nowrap">
            Looking for <br />
            <span 
              style={{ 
                backgroundImage: 'linear-gradient(135deg, #CD2E3A 45%, #0047A0 55%)', 
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              "Made in Korea"
            </span> <br />
            Apparel?
          </h1>

          {/* Description */}
          <p className="max-w-2xl text-lg md:text-xl text-neutral-600 font-light mb-12 leading-relaxed">
            Consultation and quotes are always 100% free.
          </p>

          {/* Buttons */}
          <div className="flex justify-center mb-20 w-full">
            <a id="gtm-start-hero-quote-btn" href="/" className="gtm-conversion-btn inline-flex items-center justify-center gap-2 px-10 py-4 bg-neutral-900 text-white rounded-xl font-medium text-lg hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/20 hover:-translate-y-0.5">
              Get a Free Quote
              <ArrowRight size={20} />
            </a>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-4xl mx-auto">
            {/* Item 1 */}
            <div className="flex flex-col items-center gap-3 sm:gap-5">
              <div className="w-full flex items-center justify-center py-6 sm:py-10 md:py-14 px-1 bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all sm:hover:-translate-y-1">
                <div className="text-[7vw] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 whitespace-nowrap tracking-tighter">
                  1<span className="text-[4vw] sm:text-2xl md:text-3xl lg:text-4xl text-neutral-500 ml-0.5 sm:ml-1">pcs~</span>
                </div>
              </div>
              <div className="text-[11px] sm:text-sm md:text-base text-neutral-600 font-medium text-center leading-tight">Minimum Order<br className="sm:hidden"/> (MOQ)</div>
            </div>
            {/* Item 2 */}
            <div className="flex flex-col items-center gap-3 sm:gap-5">
              <div className="w-full flex items-center justify-center py-6 sm:py-10 md:py-14 px-1 bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all sm:hover:-translate-y-1">
                <div className="text-[7vw] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 whitespace-nowrap tracking-tighter">
                  3~14<span className="text-[4vw] sm:text-2xl md:text-3xl lg:text-4xl text-neutral-500 ml-0.5 sm:ml-1">days</span>
                </div>
              </div>
              <div className="text-[11px] sm:text-sm md:text-base text-neutral-600 font-medium text-center leading-tight">Sample<br className="sm:hidden"/> Lead Time</div>
            </div>
            {/* Item 3 */}
            <div className="flex flex-col items-center gap-3 sm:gap-5">
              <div className="w-full flex items-center justify-center py-6 sm:py-10 md:py-14 px-1 bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all sm:hover:-translate-y-1">
                <div className="text-[7vw] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 whitespace-nowrap tracking-tighter">
                  100<span className="text-[4vw] sm:text-2xl md:text-3xl lg:text-4xl text-neutral-500 ml-0.5 sm:ml-1">+</span>
                </div>
              </div>
              <div className="text-[11px] sm:text-sm md:text-base text-neutral-600 font-medium text-center leading-tight">Partner<br className="sm:hidden"/> Brands</div>
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
                For over 30 years, he ran an apparel factory in Korea, crafting premium polo shirts and golf wear with true craftsmanship.
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
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3 sm:mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:scale-110 transition-all duration-300">
                <Factory className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
              </div>
              <div className="text-[20px] font-bold text-neutral-900 tracking-tight mb-4 sm:mb-5 group-hover:text-blue-600 transition-colors leading-tight">30 Years of Manufacturing Expertise</div>
              <p className="text-[16px] text-neutral-600 font-light leading-relaxed">
                Family-owned factory with direct production and transparent processes.
              </p>
            </div>

            <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-neutral-200 flex flex-col items-center text-center transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-3 sm:mb-6 text-orange-500 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 group-hover:scale-110 transition-all duration-300">
                <Package className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
              </div>
              <div className="text-[20px] font-bold text-neutral-900 tracking-tight mb-4 sm:mb-5 group-hover:text-orange-500 transition-colors leading-tight">Full-Package OEM/ODM Solutions</div>
              <p className="text-[16px] text-neutral-600 font-light leading-relaxed">
                From design to finished product, we manage every production stage.
              </p>
            </div>

            <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-neutral-200 flex flex-col items-center text-center transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3 sm:mb-6 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 group-hover:scale-110 transition-all duration-300">
                <ShieldCheck className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
              </div>
              <div className="text-[20px] font-bold text-neutral-900 tracking-tight mb-4 sm:mb-5 group-hover:text-emerald-600 transition-colors leading-tight">Premium Quality Control</div>
              <p className="text-[16px] text-neutral-600 font-light leading-relaxed">
                High-end craftsmanship and technical expertise for performance apparel.
              </p>
            </div>

            <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-white border border-neutral-200 flex flex-col items-center text-center transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-3 sm:mb-6 text-purple-600 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 group-hover:scale-110 transition-all duration-300">
                <Zap className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
              </div>
              <div className="text-[20px] font-bold text-neutral-900 tracking-tight mb-4 sm:mb-5 group-hover:text-purple-600 transition-colors leading-tight">Flexible MOQ</div>
              <p className="text-[16px] text-neutral-600 font-light leading-relaxed">
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
        </section>

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

        {/* Product Collection Gradient Transition */}
        <div className="h-[400px] md:h-[700px] w-full" style={{ background: "linear-gradient(to bottom, #0a0a0a 0%, #171717 25%, #262626 50%, #52525b 70%, #ffffff 100%)" }}></div>

        {/* Product Collection Section */}
        <section className="pt-[150px] md:pt-[200px] pb-0 w-full overflow-hidden bg-white">
          <div className="max-w-[1000px] mx-auto px-6 mb-12 flex flex-col items-center text-center gap-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-3">
                Custom Apparel Solutions
              </h2>
              <p className="text-[15px] md:text-[20px] text-neutral-600 font-light leading-relaxed max-w-2xl mx-auto">
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
                <div key={idx} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-neutral-300 hover:shadow-lg">
                  <div className="aspect-[3/4] w-full bg-neutral-100 relative overflow-hidden">
                    <img src={optimizedUrl} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                </div>
              )})}
            </div>
          </div>
        </section>

        {/* Fabric Introduction Section */}
        <section className="mt-[200px] pb-0 px-6 w-full max-w-[770px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight mb-4">
              Premium Fabrics
            </h2>
            <p className="text-[15px] md:text-[20px] text-neutral-500 font-light max-w-lg mx-auto leading-relaxed">
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
