import React, { useRef, useState, useEffect } from 'react';
import { MapPin, Layers, Truck, Factory, Ship, Scissors, ChevronLeft, ChevronRight, Globe } from 'lucide-react';

export default function WhyKorea() {
  const whyKoreaRef = useRef<HTMLDivElement>(null);
  const [whyKoreaIn, setWhyKoreaIn] = useState(false);
  const whyKoreaScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setWhyKoreaIn(true);
        }
      });
    }, { threshold: 0.1 });

    if (whyKoreaRef.current) observer.observe(whyKoreaRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollGallery = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.8;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
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
        <div className="absolute inset-0 bg-neutral-900/40 mix-blend-multiply"></div>
        <h2 className="relative z-10 text-white font-sans font-black text-3xl sm:text-4xl lg:text-5xl max-w-4xl tracking-tight leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
          The Apparel OEM/ODM Solution<br className="hidden sm:block" /> Made in Korea
        </h2>
      </div>

      <div ref={whyKoreaRef} className={`w-full max-w-[1200px] pt-24 lg:pt-32 pb-16 lg:pb-24 px-4 lg:px-0 transition-all duration-1000 ease-out ${whyKoreaIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
      <div className="max-w-[1200px] mx-auto w-full text-center mb-12 lg:mb-16">
        <h2 className="text-3xl lg:text-5xl font-black text-neutral-900 tracking-tight flex items-start justify-center gap-3 lg:gap-5 z-10">
          <span className="text-center">Why Korea?</span>
        </h2>
      </div>

      <div className="max-w-[1200px] mx-auto w-full relative group/whycarousel">
        <div ref={whyKoreaScrollRef} className="flex overflow-x-auto pb-12 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-12 gap-6 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-2 lg:max-w-none lg:mx-0 lg:overflow-visible">
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
    </div>
  );
}
