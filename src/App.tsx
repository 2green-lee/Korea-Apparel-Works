import React, { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import PreOrderModal from "./components/PreOrderModal";
import { StreamColorFinish } from "./types";

export default function App() {
  const [isPreOrderOpen, setIsPreOrderOpen] = useState(false);
  const [customFinish, setCustomFinish] = useState<StreamColorFinish>("titanium-silver");
  const [customSize, setCustomSize] = useState<number>(9);

  const handleOpenPreOrder = (finish?: StreamColorFinish, size?: number) => {
    if (finish) setCustomFinish(finish);
    if (size) setCustomSize(size);
    setIsPreOrderOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#faf8f3] text-black antialiased selection:bg-amber-100 selection:text-black">
      
      {/* 2. Brand sticky Navigation Header */}
      <Header onPreOrderClick={() => handleOpenPreOrder()} />

      {/* 3. Landing Modules */}
      <main>
        
        {/* 4. Layered 3D Ring Hero Showcase */}
        <Hero onPreOrderClick={() => handleOpenPreOrder()} />

      </main>

      {/* 5. Standalone Premium legal bottom */}
      <Footer />

      {/* 6. Dynamic Priority queue reservation ticket dialog */}
      <PreOrderModal
        isOpen={isPreOrderOpen}
        onClose={() => setIsPreOrderOpen(false)}
        defaultFinish={customFinish}
        defaultSize={customSize}
      />

    </div>
  );
}
