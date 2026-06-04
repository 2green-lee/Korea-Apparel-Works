import React from "react";

interface FooterProps {
  onAdminClick?: () => void;
}

export default function Footer({ onAdminClick }: FooterProps) {
  return (
    <footer id="footer" className="bg-black text-neutral-450 pt-16 pb-12 overflow-hidden border-t border-white/5 relative font-sans">
      <div className="max-w-6xl mx-auto px-6 md:px-10 relative z-10 flex flex-col justify-between items-stretch gap-12 select-text">
        
        {/* Upper Column Stack */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Logo & Manifesto Block (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-2.5">
              <svg
                className="w-7 h-7 text-white"
                viewBox="0 0 40 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 32L20 8l12 24" />
                <path d="M14 20h12" />
                <path d="M20 8v24" />
              </svg>
              <span className="font-sans font-semibold text-white tracking-widest text-[11px] text-white/95">
                Korea Apparel Works
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-light leading-relaxed max-w-sm font-sans">
              Forging the physical frontier of custom low-MOQ technical garments and structural style designs. Conceived elegantly for global labels, hand-assembled, pattern-drafted, and calibrated alongside veteran ateliers in Seoul, South Korea.
            </p>
          </div>

          {/* Links grid (7 cols) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 font-mono text-[11px] text-neutral-400">
            <div>
              <span className="block text-white uppercase tracking-wider font-bold mb-3 select-none">PRODUCTION</span>
              <ul className="space-y-2 font-light">
                <li><span className="hover:text-white cursor-pointer select-none">Boutique Ateliers</span></li>
                <li><span className="hover:text-white cursor-pointer select-none">Low-MOQ Sewers</span></li>
                <li><span className="hover:text-white cursor-pointer select-none">Pattern Grading</span></li>
                <li><span className="hover:text-white cursor-pointer select-none">Activewear Fabric</span></li>
              </ul>
            </div>
            <div>
              <span className="block text-white uppercase tracking-wider font-bold mb-3 select-none">TECHNOLOGY</span>
              <ul className="space-y-2 font-light">
                <li><span className="hover:text-white cursor-pointer select-none">Connected Knitwear</span></li>
                <li><span className="hover:text-white cursor-pointer select-none">AI Audio Capture</span></li>
                <li><span className="hover:text-white cursor-pointer select-none">Garment Blueprints</span></li>
                <li><span className="hover:text-white cursor-pointer select-none">Seoul Hub Portal</span></li>
              </ul>
            </div>
            <div>
              <span className="block text-white uppercase tracking-wider font-bold mb-3 select-none">CONTACT</span>
              <ul className="space-y-2 font-light">
                <li><span className="hover:text-white cursor-pointer select-none">Seoul Office</span></li>
                <li><span className="hover:text-white cursor-pointer select-none">Partner With Us</span></li>
                <li><span className="hover:text-white cursor-pointer select-none">Production SLA</span></li>
                <li><span className="hover:text-white cursor-pointer select-none">Fulfillments</span></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Lower Legal disclaimer row */}
        <div className="border-t border-neutral-900 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-neutral-600 font-mono gap-4 select-none">
          <div>
            © {new Date().getFullYear()} KOREA APPAREL WORKS DIRECT. ALL RIGHTS RESERVED.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-neutral-400 cursor-pointer">PRIVACY JOURNAL</span>
            <span>•</span>
            <span className="hover:text-neutral-400 cursor-pointer">TERMS OF SERVICE</span>
            <span>•</span>
            <span className="hover:text-neutral-400 cursor-pointer">CUSTOMS DATA</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
