import React, { useState, useEffect } from "react";
import { Menu, X, User, LogOut, Home, RefreshCw, Factory, Shirt, History } from "lucide-react";
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
  savedChats?: { role: "user" | "model"; text: string }[][];
  onRestoreChat?: (index: number) => void;
}

const Header = React.memo(function Header({ onPreOrderClick, currentSlide, setCurrentSlide, messages, onClearChat, onAdminClick, user, onOpenLogin, onOpenAccount, onLogout, savedChats, onRestoreChat }: HeaderProps) {
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

  const getChatLabel = (chat: { role: "user" | "model"; text: string }[]) => {
    const firstUserMsg = chat.find(m => m.role === "user");
    if (firstUserMsg) {
      const text = firstUserMsg.text;
      if (text.length > 10) {
        return text.slice(0, 10).trim() + "...";
      }
      return text;
    }
    return "Saved Chat";
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
            <span className="font-sans font-medium text-[13px] sm:text-[17px] tracking-normal sm:tracking-[0.1em] transition-colors duration-500 select-none text-neutral-900 group-hover:opacity-80 whitespace-nowrap">
              Korea Apparel Works
            </span>
          </button>
        </div>

        {/* Right Side: Options (Hidden for now) */}
        <div className="hidden">
          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => e.preventDefault()}
                className="flex items-center space-x-1.5 bg-neutral-100 rounded-full px-3.5 py-1.5 transition duration-200 cursor-default text-sm font-normal text-neutral-800"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">My Account</span>
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
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>

      </div>

      {/* Mobile Navigation Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 transition-opacity md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-[85%] max-w-[285px] bg-[#1e1e1e] text-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0">
          <div className="flex items-center space-x-3">
            <img src="/logo1.png" alt="Logo" className="w-6 h-6 object-contain invert opacity-90" />
            <span className="font-medium text-[15px] tracking-wide text-neutral-100 whitespace-nowrap">Korea Apparel Works</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-neutral-400 hover:text-white transition-colors focus:outline-hidden">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 scrollbar-hide">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onClearChat();
              setCurrentSlide(0);
            }}
            className="flex items-center space-x-4 w-full text-left px-4 py-3 rounded-2xl text-[15px] font-medium text-neutral-200 hover:bg-white/5 transition-colors focus:outline-hidden"
          >
            <RefreshCw className="w-5 h-5 text-neutral-400" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setCurrentSlide(0);
            }}
            className="flex items-center space-x-4 w-full text-left px-4 py-3 rounded-2xl text-[15px] font-medium text-neutral-200 hover:bg-white/5 transition-colors focus:outline-hidden"
          >
            <Home className="w-5 h-5 text-neutral-400" />
            <span>Home</span>
          </button>
          
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setCurrentSlide(1);
            }}
            className="flex items-center space-x-4 w-full text-left px-4 py-3 rounded-2xl text-[15px] font-medium text-neutral-200 hover:bg-white/5 transition-colors focus:outline-hidden"
          >
            <Factory className="w-5 h-5 text-neutral-400" />
            <span>Manufacturing</span>
          </button>
          
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setCurrentSlide(2);
            }}
            className="flex items-center space-x-4 w-full text-left px-4 py-3 rounded-2xl text-[15px] font-medium text-neutral-200 hover:bg-white/5 transition-colors focus:outline-hidden"
          >
            <Shirt className="w-5 h-5 text-neutral-400" />
            <span>Product</span>
          </button>

          {/* Recent Chats Section */}
          {savedChats && savedChats.length > 0 && (
            <div className="pt-6 pb-2">
              <div className="px-4 pb-3 text-[13px] font-medium text-neutral-500">Recent</div>
              {savedChats.map((chat, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCurrentSlide(0);
                    if (onRestoreChat) onRestoreChat(idx);
                  }}
                  className="flex items-center space-x-4 w-full text-left px-4 py-3 rounded-2xl text-[14px] text-neutral-300 hover:bg-white/5 transition-colors focus:outline-hidden"
                >
                  <History className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span className="truncate">{getChatLabel(chat)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </header>
  );
});

export default Header;
