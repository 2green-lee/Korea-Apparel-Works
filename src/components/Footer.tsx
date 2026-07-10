import React from "react";

interface FooterProps {
  onAdminClick?: () => void;
  setCurrentSlide?: (slide: number) => void;
  currentSlide?: number;
}

const Footer = React.memo(function Footer({ onAdminClick, setCurrentSlide, currentSlide }: FooterProps) {
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

  const isHome = currentSlide === 0;
  
  const bgClass = isHome ? "bg-transparent" : "bg-[#0a0a0a]";
  const textTitleClass = isHome ? "text-neutral-900" : "text-white";
  const textDescClass = isHome ? "text-neutral-600" : "text-neutral-400";
  const logoClass = isHome ? "w-[18px] h-[18px] object-contain brightness-0 opacity-80" : "w-[18px] h-[18px] object-contain brightness-0 invert opacity-90";
  const borderClass = isHome ? "border-neutral-200" : "border-neutral-800";
  const contactBtnClass = isHome ? "bg-neutral-900 hover:bg-neutral-800 text-white" : "bg-white hover:bg-neutral-200 text-neutral-900";

  return (
    <div className={`w-full ${bgClass}`}>
      <footer 
        id="footer" 
        className={`pt-16 pb-12 overflow-hidden relative font-sans bg-transparent ${textDescClass}`}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-10 relative z-10 flex flex-col justify-between items-stretch gap-12 select-text">
          
          {/* Upper Column Stack */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Logo & Manifesto Block (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center space-x-2.5">
                <img
                  src="/logo1.png"
                  alt="Korea Apparel Works Logo"
                  className={logoClass}
                />
                <span className={`font-sans font-semibold tracking-widest text-[13px] ${textTitleClass}`}>
                  Korea Apparel Works
                </span>
              </div>
              <p className={`text-[11px] font-light leading-relaxed max-w-sm font-dm-sans ${textDescClass}`}>
                Forging the physical frontier of custom low-MOQ technical garments and structural style designs. Conceived elegantly for global labels, hand-assembled, pattern-drafted, and calibrated alongside veteran ateliers in Seoul, South Korea.
              </p>
              <div className="pt-4">
                <a
                  href="mailto:contact@koreaapparel.works"
                  className={`inline-flex items-center justify-center active:scale-95 rounded-full px-5 py-2.5 transition duration-200 cursor-pointer text-sm font-medium font-dm-sans shadow-sm hover:shadow-md ${contactBtnClass}`}
                >
                  Contact us
                </a>
              </div>
            </div>

            {/* Links grid (7 cols) */}
            <div className={`lg:col-span-7 flex flex-row justify-between w-full font-dm-sans text-[11px] ${textDescClass}`}>
              <div className="flex flex-col items-center flex-1">
                <span className={`block font-dm-sans tracking-wider font-bold mb-3 select-none text-center ${textTitleClass}`}>Home</span>
                <ul className="space-y-2 font-light flex flex-col items-center">
                  <li>
                    <button 
                      onClick={() => navigateToSection(0, "ai-dialogue-portal-container")} 
                      className={`hover:${textTitleClass} transition-colors cursor-pointer select-none text-center`}
                    >
                      Chat
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-cookie-policy'));
                      }} 
                      className={`hover:${textTitleClass} transition-colors cursor-pointer select-none text-center`}
                    >
                      Cookie Policy
                    </button>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className={`block font-dm-sans tracking-wider font-bold mb-3 select-none text-center ${textTitleClass}`}>Manufacturing</span>
                <ul className="space-y-2 font-light flex flex-col items-center">
                  <li>
                    <button 
                      onClick={() => navigateToSection(1, "about-us-section")} 
                      className={`hover:${textTitleClass} transition-colors cursor-pointer select-none text-center`}
                    >
                      About us
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigateToSection(1, "core-capabilities-section")} 
                      className={`hover:${textTitleClass} transition-colors cursor-pointer select-none text-center`}
                    >
                      Core Capabilities
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigateToSection(1, "ai-tech-section")} 
                      className={`hover:${textTitleClass} transition-colors cursor-pointer select-none text-center`}
                    >
                      Process
                    </button>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className={`block font-dm-sans tracking-wider font-bold mb-3 select-none text-center ${textTitleClass}`}>Product</span>
                <ul className="space-y-2 font-light flex flex-col items-center">
                  <li>
                    <button 
                      onClick={() => navigateToSection(2, "collection-section")} 
                      className={`hover:${textTitleClass} transition-colors cursor-pointer select-none text-center`}
                    >
                      Collection
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigateToSection(2, "fabrics-catalog")} 
                      className={`hover:${textTitleClass} transition-colors cursor-pointer select-none text-center`}
                    >
                      Fabric
                    </button>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* Lower Legal disclaimer row */}
          <div className={`border-t pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] ${textDescClass} font-mono gap-4 select-none ${borderClass}`}>
            <div>
              © {new Date().getFullYear()} KOREA APPAREL WORKS DIRECT. ALL RIGHTS RESERVED.
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
});

export default Footer;
