import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  onPreOrderClick: () => void;
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  messages: { role: "user" | "model"; text: string }[];
  onClearChat: () => void;
}

export default function Header({ onPreOrderClick, currentSlide, setCurrentSlide, messages, onClearChat }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = isScrolled || isHovered || mobileMenuOpen;

  const getLinkClass = (slideIndex: number) => {
    return `transition-colors duration-300 ${
      currentSlide === slideIndex ? "text-neutral-950 font-medium" : "text-neutral-600 hover:text-neutral-950"
    } cursor-pointer focus:outline-hidden`;
  };

  const textClass = `transition-colors duration-300 text-neutral-600 hover:text-neutral-950`;

  return (
    <header
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-500 font-sans flex items-center h-16 bg-white border-b border-neutral-200/50 shadow-[0_1px_10px_rgba(0,0,0,0.03)]"
    >
      <div className="w-full h-full px-6 md:px-12 flex items-center justify-between">
        
        {/* Left Side: Desktop navigation menu */}
        <div className="hidden md:flex items-center space-x-12 text-xs font-normal tracking-wide">
          <button onClick={() => setCurrentSlide(0)} className={getLinkClass(0)}>
            Home
          </button>
          <button onClick={() => setCurrentSlide(1)} className={getLinkClass(1)}>
            Manufacturing
          </button>
          <button onClick={() => setCurrentSlide(2)} className={getLinkClass(2)}>
            Product
          </button>
        </div>

        {/* Left Side: Mobile Menu Trigger */}
        <div className="flex md:hidden mr-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="transition-colors duration-300 focus:outline-hidden text-neutral-700 hover:text-black"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Center: Brand Identity Logo exactly styled as Belledonne */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <button
            onClick={() => {
              if (messages.length > 1) {
                onClearChat();
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex flex-col items-center group cursor-pointer focus:outline-hidden"
            title={messages.length > 1 ? "Clear conversation" : ""}
          >
            <span className="font-sans font-normal text-[15px] tracking-[0.20em] transition-colors duration-500 select-none text-neutral-900 group-hover:opacity-80">
              Korea Apparel Works
            </span>
          </button>
        </div>

        {/* Right Side: Options replaced with a single Contact us link */}
        <div className="flex items-center text-xs font-normal">
          <button
            onClick={() => {
              const footerEl = document.getElementById("footer");
              if (footerEl) {
                footerEl.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className={`${textClass} cursor-pointer focus:outline-hidden normal-case tracking-wider`}
          >
            Contact us
          </button>
        </div>

      </div>

      {/* Mobile Navigation Panel */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-neutral-200/50 py-6 px-8 flex flex-col space-y-4 shadow-lg animate-fadeIn z-50 md:hidden">
          <button
            onClick={() => {
              setCurrentSlide(0);
              setMobileMenuOpen(false);
            }}
            className={`text-left text-sm ${currentSlide === 0 ? "font-semibold text-neutral-950" : "font-medium text-neutral-600 hover:text-neutral-950"} cursor-pointer focus:outline-hidden`}
          >
            Home
          </button>
          <button
            onClick={() => {
              setCurrentSlide(1);
              setMobileMenuOpen(false);
            }}
            className={`text-left text-sm ${currentSlide === 1 ? "font-semibold text-neutral-950" : "font-medium text-neutral-600 hover:text-neutral-950"} cursor-pointer focus:outline-hidden`}
          >
            Manufacturing
          </button>
          <button
            onClick={() => {
              setCurrentSlide(2);
              setMobileMenuOpen(false);
            }}
            className={`text-left text-sm ${currentSlide === 2 ? "font-semibold text-neutral-950" : "font-medium text-neutral-600 hover:text-neutral-950"} cursor-pointer focus:outline-hidden`}
          >
            Product
          </button>
          <hr className="border-neutral-200/50" />
          <div className="flex justify-between text-xs text-neutral-500 pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                const footerEl = document.getElementById("footer");
                if (footerEl) {
                  footerEl.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="hover:text-black text-left normal-case tracking-wider"
            >
              Contact us
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
