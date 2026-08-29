import React, { useState } from "react";
import { Camera, Mic, ArrowUp, RefreshCw, History, FileText, Menu, X, Home, Factory, Shirt, User, LogOut } from "lucide-react";
import { useChat, Message } from "../../lib/useChat";

interface MobileChatViewProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onClearChat: () => void;
  user: any;
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
  onOpenLogin: () => void;
  onOpenAccount?: () => void;
  onLogout?: () => void;
  onBackToStart: () => void;
}


export default function MobileChatView({
  messages,
  setMessages,
  onClearChat,
  user,
  currentSlide,
  setCurrentSlide,
  onOpenLogin,
  onOpenAccount,
  onLogout,
  onBackToStart,
}: MobileChatViewProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    chatInput,
    setChatInput,
    isGenerating,
    textareaRef,
    fileInputRef,
    scrollRef,
    isListening,
    toggleListening,
    handleSendMessage,
    handleImageSelect,
    handleAnalyzeImage,
  } = useChat({ messages, setMessages, user, onOpenLogin });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-transparent font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/60 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.04)] sticky top-0 z-10 shrink-0">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 -ml-2 text-neutral-700 hover:text-black transition-colors"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <button
          onClick={() => {
            setCurrentSlide(0);
            onClearChat();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center justify-center focus:outline-none cursor-pointer"
        >
          <img src="/logo12345.jpg" alt="Korea Apparel Works Logo" className="h-[60px] object-contain" />
        </button>
        <div className="w-8" /> {/* Placeholder for balance */}
      </div>

      {/* Mobile Menu Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-[85%] max-w-[285px] bg-[#1e1e1e] text-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl rounded-r-2xl ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0">
          <div className="flex items-center space-x-3">
            <img src="/logo12345.jpg" alt="Logo" className="w-8 h-8 object-contain rounded-md" />
            <span className="font-medium text-[15px] tracking-wide text-neutral-100 whitespace-nowrap">Korea Apparel Works</span>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 text-neutral-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 scrollbar-hide">
          <button
            onClick={() => {
              setIsMenuOpen(false);
              onClearChat();
            }}
            className="flex items-center space-x-4 w-full text-left px-4 py-3 rounded-2xl text-[15px] font-medium text-neutral-200 hover:bg-white/5 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-neutral-400" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => {
              setIsMenuOpen(false);
              onBackToStart();
            }}
            className="flex items-center space-x-4 w-full text-left px-4 py-3 rounded-2xl text-[15px] font-medium text-neutral-200 hover:bg-white/5 transition-colors"
          >
            <Home className="w-5 h-5 text-neutral-400" />
            <span>Home</span>
          </button>
          
          <button
            onClick={() => {
              setIsMenuOpen(false);
              setCurrentSlide(1);
            }}
            className="flex items-center space-x-4 w-full text-left px-4 py-3 rounded-2xl text-[15px] font-medium text-neutral-200 hover:bg-white/5 transition-colors"
          >
            <Factory className="w-5 h-5 text-neutral-400" />
            <span>Manufacturing</span>
          </button>
          
          <button
            onClick={() => {
              setIsMenuOpen(false);
              setCurrentSlide(2);
            }}
            className="flex items-center space-x-4 w-full text-left px-4 py-3 rounded-2xl text-[15px] font-medium text-neutral-200 hover:bg-white/5 transition-colors"
          >
            <Shirt className="w-5 h-5 text-neutral-400" />
            <span>Product</span>
          </button>


        </div>

      </div>

      {/* Chat Messages Area */}
      {messages.length === 1 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <img src="/logo1.png" alt="Korea Apparel Works Logo" className="w-[40px] h-[40px] mb-5 opacity-75 object-contain" />
          <h2 className="font-dm-sans text-[26px] font-[450] tracking-tight text-neutral-800 leading-tight text-center">
            Start your brand with us
          </h2>
          <p className="pretendard-font mt-3 text-neutral-600 text-[14px] text-center max-w-xs font-normal">
            Upload a photo or just describe it — get pricing, MOQ, and lead time.<br />Made in Korea.
          </p>

          {/* 데스크톱과 마찬가지로, 말을 걸기 전에도 마크의 인사를 띄워 둔다. */}
          {messages[0]?.role === "model" && (
            <div className="w-full flex justify-start mt-7">
              <div className="max-w-[85%] rounded-[20px] bg-neutral-100 px-4 py-3 text-[14px] leading-relaxed text-neutral-700 text-left">
                {messages[0].text}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-5 scrollbar-thin scroll-smooth"
        >
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-[20px] px-4 py-3 leading-relaxed text-[15px] ${
                  msg.role === "user"
                    ? "bg-neutral-950 text-white rounded-tr-sm font-light"
                    : "bg-white text-neutral-800 border border-neutral-200/60 rounded-tl-sm whitespace-pre-wrap shadow-sm"
                }`}
              >
                {msg.imageUrl && (
                  <div className="mb-2">
                    {msg.imageUrl.endsWith(".pdf") ? (
                      <div className="flex items-center space-x-2 bg-neutral-200/50 rounded-xl p-3">
                        <FileText className="w-5 h-5 text-neutral-500 shrink-0" />
                        <span className="text-xs truncate">{msg.text}</span>
                      </div>
                    ) : (
                      <img
                        src={msg.imageUrl}
                        alt="Uploaded"
                        className="rounded-xl max-h-[200px] w-auto object-cover border border-neutral-200/60"
                      />
                    )}
                  </div>
                )}
                {!msg.imageUrl && msg.text}
                {msg.imageUrl && !msg.imageUrl.endsWith(".pdf") && (
                  <span className="text-[11px] opacity-60 block mt-1">{msg.text}</span>
                )}
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white text-neutral-500 max-w-[85%] rounded-[20px] px-4 py-3 shadow-sm border border-neutral-200/60 rounded-tl-sm flex items-center space-x-2">
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,16px)+12px)] focus-within:pb-3 shrink-0 transition-all duration-300">
        <form onSubmit={handleSendMessage} className="bg-white/95 backdrop-blur-xl border border-neutral-200/80 rounded-[28px] px-4 py-3 flex flex-col space-y-2 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <textarea
            ref={textareaRef}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Tell us what you want to make..."
            className="w-full bg-transparent resize-none overflow-hidden border-0 outline-none focus:ring-0 text-[16px] text-neutral-900 placeholder-neutral-400 font-light min-h-[44px] max-h-[120px]"
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/png, image/jpeg, image/webp, application/pdf"
                className="hidden"
              />
              <button
                type="button"
                onClick={handleAnalyzeImage}
                className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors"
                title="Upload"
              >
                <Camera className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-full transition-colors ${
                  isListening
                    ? "bg-red-50 text-red-500 animate-pulse"
                    : "text-neutral-500 hover:bg-neutral-100"
                }`}
                title={isListening ? "녹음 중지" : "음성 입력"}
              >
                <Mic className="w-5 h-5" />
              </button>


            </div>

            <button
              type="submit"
              disabled={!chatInput.trim() || isGenerating}
              className={`p-2.5 rounded-full flex items-center justify-center transition-colors ${
                chatInput.trim() && !isGenerating
                  ? "bg-neutral-950 text-white"
                  : "bg-neutral-200 text-neutral-400 pointer-events-none"
              }`}
            >
              <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
