import React, { useState, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  onPreOrderClick: () => void;
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  messages: { role: "user" | "model"; text: string }[];
  onClearChat: () => void;
  onAdminClick?: () => void;
  user: any;
  onOpenLogin: () => void;
  onOpenAccount: () => void;
  onLogout: () => void;
}

const Header = React.memo(function Header({ onPreOrderClick, currentSlide, setCurrentSlide, messages, onClearChat, onAdminClick, user, onOpenLogin, onOpenAccount, onLogout }: HeaderProps) {
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
  const isHome = false; // Forced to false for light-theme styles match

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans flex items-center ${
        currentSlide > 0
          ? "bg-[#fcfcfc] h-16"
          : isScrolled || isHovered 
            ? "bg-[#e9eceb] h-16" 
            : "bg-transparent h-16"
      }`}
    >
      <div className="w-full h-full px-6 md:px-12 flex items-center justify-between">
        
        {/* 데스크톱 왼쪽 네비게이션 메뉴 (토글 캡슐 형태) */}
        <div className="hidden md:flex items-center bg-neutral-100/60 backdrop-blur-md p-1 rounded-full relative">
          {["Home", "Manufacturing", "Product"].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setCurrentSlide(index)}
              className={`relative px-5 py-1.5 rounded-full text-[14px] font-medium transition-colors duration-300 z-10 cursor-pointer ${
                currentSlide === index ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {currentSlide === index && (
                <motion.div
                  layoutId="header-tab-indicator"
                  className="absolute inset-0 bg-white rounded-full"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
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
              setCurrentSlide(0);
              onClearChat();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex flex-col items-center group cursor-pointer focus:outline-hidden"
            title="Reset to home and clear conversation"
          >
            <span className="font-sans font-medium text-[17px] tracking-[0.1em] transition-colors duration-500 select-none text-neutral-900 group-hover:opacity-80">
              Korea Apparel Works
            </span>
          </button>
        </div>

        {/* Right Side: Options */}
        <div className="flex items-center space-x-3 text-[15px] font-normal">
          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenAccount}
                className="flex items-center space-x-1.5 bg-neutral-100 hover:bg-neutral-200 active:scale-95 rounded-full px-3.5 py-1.5 transition duration-200 cursor-pointer text-sm font-normal text-neutral-800"
              >
                <User className="w-3.5 h-3.5" />
                <span>My Account</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center justify-center hover:bg-neutral-100 active:scale-95 rounded-full p-2 transition duration-200 cursor-pointer text-neutral-500 hover:text-neutral-800"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center space-x-1.5 bg-neutral-900 hover:bg-neutral-800 active:scale-95 rounded-full px-4 py-2 transition duration-200 cursor-pointer text-sm font-normal text-white"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
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
            className={`text-left text-base ${currentSlide === 0 ? "font-semibold text-neutral-950" : "font-medium text-neutral-600 hover:text-neutral-950"} cursor-pointer focus:outline-hidden`}
          >
            Home
          </button>
          <button
            onClick={() => {
              setCurrentSlide(1);
              setMobileMenuOpen(false);
            }}
            className={`text-left text-base ${currentSlide === 1 ? "font-semibold text-neutral-950" : "font-medium text-neutral-600 hover:text-neutral-950"} cursor-pointer focus:outline-hidden`}
          >
            Manufacturing
          </button>
          <button
            onClick={() => {
              setCurrentSlide(2);
              setMobileMenuOpen(false);
            }}
            className={`text-left text-base ${currentSlide === 2 ? "font-semibold text-neutral-950" : "font-medium text-neutral-600 hover:text-neutral-950"} cursor-pointer focus:outline-hidden`}
          >
            Product
          </button>
          <hr className="border-neutral-200/50" />
          <div className="flex justify-end items-center text-sm text-neutral-500 pt-2">
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
});

export default Header;
