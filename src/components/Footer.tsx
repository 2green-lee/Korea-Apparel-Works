import React from "react";

interface FooterProps {
  onAdminClick?: () => void;
  setCurrentSlide?: (slide: number) => void;
}

export default function Footer({ onAdminClick, setCurrentSlide }: FooterProps) {
  const navigateToSection = (slideIndex: number, targetId?: string) => {
    if (setCurrentSlide) {
      setCurrentSlide(slideIndex);
      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 250);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="w-full bg-transparent">
      <footer 
        id="footer" 
        className="pt-16 pb-12 overflow-hidden relative font-sans bg-transparent text-neutral-600"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10 relative z-10 flex flex-col justify-between items-stretch gap-12 select-text">
          
          {/* Upper Column Stack */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Logo & Manifesto Block (5 cols) */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center space-x-2.5">
                <img
                  src="/logo1.png"
                  alt="Korea Apparel Works Logo"
                  className="w-[18px] h-[18px] object-contain"
                />
                <span className="font-sans font-semibold tracking-widest text-[13px] text-neutral-900">
                  Korea Apparel Works
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-light leading-relaxed max-w-sm font-dm-sans">
                Forging the physical frontier of custom low-MOQ technical garments and structural style designs. Conceived elegantly for global labels, hand-assembled, pattern-drafted, and calibrated alongside veteran ateliers in Seoul, South Korea.
              </p>
              <div className="pt-4">
                <a
                  href="mailto:contact@koreaapparelworks.com"
                  className="inline-flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 active:scale-95 rounded-full px-5 py-2.5 transition duration-200 cursor-pointer text-sm font-normal text-white font-dm-sans shadow-sm hover:shadow-md"
                >
                  Contact us
                </a>
              </div>
            </div>

            {/* Links grid (7 cols) */}
            <div className="md:col-span-7 flex flex-row justify-between w-full font-dm-sans text-[11px] text-neutral-500">
              <div className="flex flex-col items-center flex-1">
                <span className="block text-neutral-800 font-dm-sans tracking-wider font-bold mb-3 select-none text-center">Home</span>
                <ul className="space-y-2 font-light flex flex-col items-center">
                  <li>
                    <button 
                      onClick={() => navigateToSection(0, "ai-dialogue-portal-container")} 
                      className="hover:text-neutral-900 cursor-pointer select-none text-center"
                    >
                      Chat
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-cookie-policy'));
                      }} 
                      className="hover:text-neutral-900 cursor-pointer select-none text-center"
                    >
                      Cookie Policy
                    </button>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="block text-neutral-800 font-dm-sans tracking-wider font-bold mb-3 select-none text-center">Manufacturing</span>
                <ul className="space-y-2 font-light flex flex-col items-center">
                  <li>
                    <button 
                      onClick={() => navigateToSection(1)} 
                      className="hover:text-neutral-900 cursor-pointer select-none text-center"
                    >
                      Atelier Workshop
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigateToSection(1)} 
                      className="hover:text-neutral-900 cursor-pointer select-none text-center"
                    >
                      Tailor Assembly
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigateToSection(1)} 
                      className="hover:text-neutral-900 cursor-pointer select-none text-center"
                    >
                      Quality Standards
                    </button>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="block text-neutral-800 font-dm-sans tracking-wider font-bold mb-3 select-none text-center">Product</span>
                <ul className="space-y-2 font-light flex flex-col items-center">
                  <li>
                    <button 
                      onClick={() => navigateToSection(2, "collection-section")} 
                      className="hover:text-neutral-900 cursor-pointer select-none text-center"
                    >
                      Collection
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigateToSection(2, "fabrics-catalog")} 
                      className="hover:text-neutral-900 cursor-pointer select-none text-center"
                    >
                      Fabric
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigateToSection(2, "ai-tech-section")} 
                      className="hover:text-neutral-900 cursor-pointer select-none text-center"
                    >
                      AI system
                    </button>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* Lower Legal disclaimer row */}
          <div className="border-t border-neutral-200/30 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-neutral-500 font-mono gap-4 select-none">
            <div>
              © {new Date().getFullYear()} KOREA APPAREL WORKS DIRECT. ALL RIGHTS RESERVED.
            </div>

          </div>

        </div>
      </footer>
    </div>
  );
}
