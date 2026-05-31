import React, { useState, useEffect } from "react";
import { Menu, X, ArrowRight, Rss } from "lucide-react";

interface HeaderProps {
  onPreOrderClick: () => void;
}

export default function Header({ onPreOrderClick }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 font-sans border-b border-neutral-300 flex items-center ${
        isScrolled
          ? "bg-[#faf9f5]/95 backdrop-blur-md h-16 shadow-xs"
          : "bg-[#faf9f5]/85 h-20"
      }`}
    >
      <div className="w-full max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between h-full">
        {/* Elegant Logo for Korea Apparel Works */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center space-x-3 group cursor-pointer focus:outline-hidden"
          title="Korea Apparel Works Home"
        >
          <svg
            className="w-8 h-8 text-black transition-transform duration-300 group-hover:scale-105"
            viewBox="0 0 40 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Elegant stylized stitch line / geometric 'A' & 'W' for Apparel Works */}
            <path d="M8 32L20 8l12 24" />
            <path d="M14 20h12" />
            <path d="M20 8v24" />
          </svg>
          <span className="font-sans font-semibold text-sm tracking-widest text-black opacity-95">
            Korea Apparel Works
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 font-sans text-[13px] tracking-wide text-black/70">
        </nav>

        {/* Pre-order pill button on the right */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onPreOrderClick}
            className="bg-black hover:bg-black/85 text-white font-sans text-xs font-normal tracking-wide px-5 py-2.5 rounded-full shadow-xs hover:shadow transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
          >
            Pre-order
          </button>
        </div>
      </div>
    </header>
  );
}
