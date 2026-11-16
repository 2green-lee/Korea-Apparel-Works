// welcome 페이지 대화창에 적은 첫 질문을 빨리 채팅 화면(/)으로 넘겨주는 통로.
// welcome에서 저장 → / 로 이동 → useChat이 꺼내서 바로 전송한다.
const HANDOFF_KEY = "kaw_bbally_handoff";

export function saveBballyHandoff(text: string) {
  try {
    sessionStorage.setItem(HANDOFF_KEY, text);
  } catch {
    // 저장이 막힌 브라우저면 그냥 채팅 화면으로만 이동한다
  }
}

export function takeBballyHandoff(): string | null {
  try {
    const text = sessionStorage.getItem(HANDOFF_KEY);
    sessionStorage.removeItem(HANDOFF_KEY);
    return text && text.trim() ? text.trim() : null;
  } catch {
    return null;
  }
}
