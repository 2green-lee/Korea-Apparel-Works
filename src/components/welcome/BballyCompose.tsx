import React, { useState } from "react";
import { saveBballyHandoff } from "../../lib/bballyHandoff";
import { pushConversion } from "./tracking";

const PLACEHOLDER = "We excel in crafting bespoke apparel and tops with premium-grade fabrics. Tell us what you want to make…";

// welcome 페이지 대화창. 여기에 적고 보내면 빨리 채팅 화면(/)으로 넘어가 그 질문이 바로 전송된다.
// 사진 첨부·음성 입력은 채팅 화면에서 동작하므로, 그 버튼들은 채팅 화면으로 바로 보낸다.
export default function BballyCompose() {
  const [text, setText] = useState("");

  const goToChat = (message?: string) => {
    pushConversion("gtm-welcome-chat-compose");
    if (message && message.trim()) saveBballyHandoff(message.trim());
    window.location.href = "/";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToChat(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      goToChat(text);
    }
  };

  return (
    <form className="chat-compose" onSubmit={handleSubmit}>
      <label htmlFor="welcomeBballyPrompt" className="blind">Tell BBally what you want to make</label>
      <textarea
        id="welcomeBballyPrompt"
        className="compose-txt compose-input"
        rows={2}
        placeholder={PLACEHOLDER}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <span className="compose-bar">
        <button type="button" className="compose-ico" onClick={() => goToChat(text)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          <span className="blind">Attach file</span>
        </button>
        <span className="compose-divider" aria-hidden="true"></span>
        <button type="button" className="compose-chip" onClick={() => goToChat(text)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
          Upload
        </button>
        <button type="button" className="compose-chip" onClick={() => goToChat(text)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
          Voice
        </button>
        <button type="submit" className="compose-send">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
          <span className="blind">Send to BBally</span>
        </button>
      </span>
    </form>
  );
}
