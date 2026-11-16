import React from "react";
import type { Message } from "../../lib/useChat";
import ChatText from "../ChatText";
import { useKawFonts } from "../../lib/useKawFonts";
import "./bbally-chat.css";

// 빨리 대화 화면 — 인더엑스 시안(02_kaw_works / Start with BBally)의 시작 화면과,
// 그 톤에 맞춰 새로 만든 대화 진행 화면. 데스크톱(Hero)과 모바일(MobileChatView)이 같이 쓴다.
// 상단 바는 각 화면의 기존 것을 그대로 쓰고, 이 컴포넌트는 그 아래 영역만 그린다.

const QUICK_REQUESTS = [
  "What's the minimum order quantity?",
  "How much does a sample cost?",
  "How long does production take?",
];

const PLACEHOLDER = "We excel in crafting bespoke apparel and tops with premium-grade fabrics. Tell us what you want to make…";

export interface BballyChatPanelProps {
  mode: "desktop" | "mobile";
  messages: Message[];
  chatInput: string;
  setChatInput: (v: string) => void;
  isGenerating: boolean;
  isListening: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onSend: (e?: React.FormEvent) => void;
  onQuick: (text: string) => void;
  onToggleVoice: () => void;
  onPickFile: () => void;
  onFileSelected: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewChat: () => void;
}

function Avatar() {
  return (
    <span className="bb-avatar" aria-hidden="true">
      B
    </span>
  );
}

function Attachment({ msg }: { msg: Message }) {
  if (!msg.imageUrl) return null;
  if (msg.imageUrl.toLowerCase().endsWith(".pdf")) {
    return (
      <span className="bb-file">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></svg>
        <span className="bb-file-name">{msg.text}</span>
      </span>
    );
  }
  return <img className="bb-photo" src={msg.imageUrl} alt="Uploaded design" />;
}

export default function BballyChatPanel(props: BballyChatPanelProps) {
  const {
    mode, messages, chatInput, setChatInput, isGenerating, isListening,
    textareaRef, fileInputRef, scrollRef, onSend, onQuick, onToggleVoice, onPickFile, onFileSelected, onNewChat,
  } = props;
  useKawFonts();

  const chatting = messages.length > 1;
  // 답이 글자 단위로 들어오기 시작하면 '입력 중' 점 대신 말풍선이 바로 자란다
  const replyStreaming = !!messages[messages.length - 1]?.streaming;
  const canSend = chatInput.trim().length > 0 && !isGenerating;
  const isDesktop = mode === "desktop";

  return (
    <div className={`kaw-bbally is-${mode} ${chatting ? "is-chatting" : "is-start"}`}>
      <div className="bb-bg" aria-hidden="true" />

      <div className="bb-wrap">
        {/* 대화 시작 전: 인사말 + 자주 묻는 요청 */}
        {!chatting && (
          <>
            <div className="bb-head">
              <h1 className="bb-title">
                Hi! I'm BBally.<br />
                <span className="bb-dim">What would you like to make?</span>
              </h1>
              <p className="bb-desc">
                Upload a photo or just describe it —<br />
                get pricing, MOQ and lead time. Made in Korea.
              </p>
            </div>

            <div className="bb-block">
              <h2 className="bb-block-tit">Popular requests</h2>
              <ul className="bb-quick-list">
                {QUICK_REQUESTS.map((q) => (
                  <li key={q}>
                    <button type="button" className="bb-quick-card gtm-chat-quick" onClick={() => onQuick(q)} disabled={isGenerating}>
                      <span className="bb-quick-txt">{q}</span>
                      <span className="bb-quick-arrow" aria-hidden="true">›</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* 대화 중: 위쪽 작은 바 (새 대화) */}
        {chatting && (
          <div className="bb-thread-bar">
            <span className="bb-thread-who">
              <Avatar />
              <span>
                <strong>BBally</strong>
                <em>AI production agent · Korea Apparel Works</em>
              </span>
            </span>
            <button type="button" className="bb-new-chat" onClick={onNewChat}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              New chat
            </button>
          </div>
        )}

        {/* 메시지 */}
        <div className="bb-thread" ref={scrollRef} aria-live="polite">
          {messages.map((msg, i) => {
            if (msg.role === "model") {
              return (
                <div className="bb-row is-model" key={i}>
                  <Avatar />
                  <div className="bb-body">
                    {(i === 0 || messages[i - 1]?.role !== "model") && <strong className="bb-name">BBally</strong>}
                    <div className={`bb-bubble${msg.streaming ? " is-streaming" : ""}`}>
                      <Attachment msg={msg} />
                      {msg.imageUrl ? null : <ChatText text={msg.text} />}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <div className="bb-row is-user" key={i}>
                <div className="bb-bubble">
                  <Attachment msg={msg} />
                  {msg.imageUrl ? (
                    msg.imageUrl.toLowerCase().endsWith(".pdf") ? null : <span className="bb-photo-cap">{msg.text}</span>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            );
          })}

          {isGenerating && !replyStreaming && (
            <div className="bb-row is-model">
              <Avatar />
              <div className="bb-body">
                <div className="bb-bubble bb-typing" role="status">
                  <span /><span /><span />
                  <em className="bb-blind">BBally is typing</em>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 입력창 */}
        <form className="bb-compose" onSubmit={onSend}>
          <label htmlFor={isDesktop ? "chat-input-textarea" : "chat-input-textarea-mobile"} className="bb-blind">
            Tell BBally what you want to make
          </label>
          <textarea
            id={isDesktop ? "chat-input-textarea" : "chat-input-textarea-mobile"}
            ref={textareaRef}
            className="bb-input gtm-chat-open"
            rows={2}
            placeholder={chatting ? "Reply to BBally…" : PLACEHOLDER}
            value={chatInput}
            disabled={isGenerating}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileSelected}
            accept="image/png, image/jpeg, image/webp, application/pdf"
            hidden
          />
          <div className="bb-bar">
            <button type="button" className="bb-ico" onClick={onPickFile} title="Attach file">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              <span className="bb-blind">Attach file</span>
            </button>
            <span className="bb-divider" aria-hidden="true" />
            <button type="button" className="bb-chip" onClick={onPickFile}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
              Upload
            </button>
            <button
              type="button"
              className={`bb-chip${isListening ? " is-listening" : ""}`}
              onClick={onToggleVoice}
              aria-pressed={isListening}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
              {isListening ? "Listening…" : "Voice"}
            </button>
            <button
              type="submit"
              id={isDesktop ? "chat-send-button" : "chat-send-button-mobile"}
              className="bb-send gtm-chat-send"
              disabled={!canSend}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
              <span className="bb-blind">Send</span>
            </button>
          </div>
        </form>

        {chatting ? (
          <p className="bb-foot-note">BBally gives quick estimates. Every quote is confirmed by our team before production.</p>
        ) : (
          // 메인 첫 화면에는 footer를 두지 않으므로, 사업자 정보는 여기 한 줄로 남긴다
          <p className="bb-foot-note">
            KAW Inc. · CEO 이근일 · Business Reg. No. 179-86-04548 · <a href="mailto:contact@k-apparel.works">contact@k-apparel.works</a>
            {isDesktop && (
              <>
                {" · "}
                <button type="button" className="bb-foot-link" onClick={() => window.dispatchEvent(new CustomEvent("open-cookie-policy"))}>
                  Cookie Policy
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
