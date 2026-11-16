import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { takeBballyHandoff } from "./bballyHandoff";

export interface Message {
  role: "user" | "model";
  text: string;
  imageUrl?: string;
  /** 빨리 답변이 아직 흘러들어오는 중 */
  streaming?: boolean;
}

// ─── 빨리 답변 스트리밍 ────────────────────────────────────────────
// /api/chat/stream 으로 받아 글자 단위로 말풍선에 채운다. 그 통로가 없거나(예전 서버) 열리지 않으면
// 기존 /api/chat 으로 한 번에 받는다. 주문 JSON 블록(```json)은 흘러오는 동안에도 화면에 보이지 않게 자른다.
function visibleText(raw: string) {
  const cut = raw.indexOf("```json");
  return (cut >= 0 ? raw.slice(0, cut) : raw).replace(/`{1,3}$/, "").trimEnd();
}

type ReplyResult = { ok: true; text: string; supplierInquiryIds?: unknown } | { ok: false; error: string; offline?: boolean };

async function readJsonReply(body: unknown): Promise<ReplyResult> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (data.error) return { ok: false, error: data.error };
  return { ok: true, text: data.text, supplierInquiryIds: data.supplierInquiryIds };
}

async function streamReply(body: unknown, onText: (text: string) => void): Promise<ReplyResult> {
  let response: Response;
  try {
    response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify(body),
    });
  } catch {
    return readJsonReply(body);
  }
  const type = response.headers.get("content-type") || "";
  if (!response.ok || !response.body || !type.includes("text/event-stream")) {
    // 스트리밍 통로가 없는 서버 → 기존 방식
    return readJsonReply(body);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let raw = "";
  let final: ReplyResult | null = null;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) >= 0) {
        const block = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const line = block.split("\n").find((l) => l.startsWith("data:"));
        if (!line) continue;
        let evt: any;
        try {
          evt = JSON.parse(line.slice(5).trim());
        } catch {
          continue;
        }
        if (typeof evt.t === "string") {
          raw += evt.t;
          onText(visibleText(raw));
        } else if (evt.done) {
          final = { ok: true, text: evt.text, supplierInquiryIds: evt.supplierInquiryIds };
        } else if (evt.error) {
          final = { ok: false, error: evt.error };
        }
      }
    }
  } catch {
    // 연결이 중간에 끊김 — 받은 데까지라도 보여 준다
  }
  if (final) return final;
  if (raw.trim()) return { ok: true, text: visibleText(raw) };
  return { ok: false, error: "offline", offline: true };
}

// ─── 협력 업체 답변 받아오기 ───────────────────────────────────────
// BBally가 업체에 문의를 넣으면 문의 번호를 브라우저에 적어 두고, 답이 오면 채팅창에 BBally 메시지로 붙인다.
// 새로고침해서 세션이 바뀌어도, 다시 들어오면 받아 온다(메일로도 따로 간다).
const PENDING_KEY = "kaw_pending_inquiries";
const PENDING_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const POLL_MS = 30_000;

interface PendingInquiry {
  id: number;
  sessionId: string;
  at: number;
}

function readPending(): PendingInquiry[] {
  try {
    const list = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
    return Array.isArray(list) ? list.filter((p) => p && Date.now() - p.at < PENDING_TTL_MS) : [];
  } catch {
    return [];
  }
}

function writePending(list: PendingInquiry[]) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(list));
  } catch {
    // 저장 못 해도 메일로는 간다
  }
}

function addPending(ids: unknown, sessionId: string) {
  if (!Array.isArray(ids) || !ids.length) return;
  const list = readPending();
  for (const id of ids) {
    if (typeof id === "number" && !list.some((p) => p.id === id)) list.push({ id, sessionId, at: Date.now() });
  }
  writePending(list);
}

interface UseChatProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  user: any;
  onOpenLogin: () => void;
}

export function useChat({ messages, setMessages, user, onOpenLogin }: UseChatProps) {
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const generationIdRef = useRef(0);
  const sessionIdRef = useRef(crypto.randomUUID());

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e: any) => {
        console.error("Speech recognition error:", e.error);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setChatInput((prev) => (prev ? prev + " " + finalTranscript : finalTranscript));
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const [pendingCount, setPendingCount] = useState(() => (typeof window === "undefined" ? 0 : readPending().length));

  useEffect(() => {
    if (!pendingCount) return;
    let stopped = false;
    const check = async () => {
      const pending = readPending();
      if (!pending.length) {
        setPendingCount(0);
        return;
      }
      const bySession = new Map<string, number[]>();
      for (const p of pending) bySession.set(p.sessionId, [...(bySession.get(p.sessionId) || []), p.id]);
      const done = new Set<number>();
      for (const [sessionId, ids] of bySession) {
        try {
          const r = await fetch(`/api/chat/updates?sessionId=${encodeURIComponent(sessionId)}&ids=${ids.join(",")}`);
          if (!r.ok) continue;
          const data = await r.json();
          if (stopped) return;
          for (const u of data.updates || []) {
            done.add(u.id);
            setMessages((prev) => (prev.some((m) => m.text === u.text) ? prev : [...prev, { role: "model", text: u.text }]));
          }
          for (const id of data.closed || []) done.add(id);
        } catch {
          // 다음 차례에 다시
        }
      }
      if (done.size) {
        const left = readPending().filter((p) => !done.has(p.id));
        writePending(left);
        setPendingCount(left.length);
      }
    };
    check();
    const timer = window.setInterval(check, POLL_MS);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [pendingCount, setMessages]);

  const trackInquiries = useCallback((ids: unknown) => {
    addPending(ids, sessionIdRef.current);
    setPendingCount(readPending().length);
  }, []);

  // 빨리에게 보내고 답을 말풍선 하나로 채운다 (흘러오는 동안 계속 갱신, 끝나면 최종 글로 확정)
  const fetchBballyReply = useCallback(
    async (body: Record<string, unknown>, currentId: number): Promise<ReplyResult> => {
      let started = false;
      const result = await streamReply(body, (text) => {
        if (currentId !== generationIdRef.current || !text) return;
        setMessages((prev) => {
          if (!started) {
            started = true;
            return [...prev, { role: "model", text, streaming: true }];
          }
          const next = [...prev];
          next[next.length - 1] = { role: "model", text, streaming: true };
          return next;
        });
      });
      if (currentId !== generationIdRef.current) return result;
      if (result.ok) {
        setMessages((prev) => {
          const next = [...prev];
          if (started) next[next.length - 1] = { role: "model", text: result.text };
          else next.push({ role: "model", text: result.text });
          return next;
        });
      } else if (started) {
        // 글이 오다가 실패하면 받은 부분은 남기고 '흘러오는 중' 표시만 끈다
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.streaming) next[next.length - 1] = { role: "model", text: last.text };
          return next;
        });
      }
      return result;
    },
    [setMessages]
  );

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert("현재 브라우저는 음성 인식을 지원하지 않습니다. 최신 크롬(Chrome)을 사용해주세요.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Ignore if already started
      }
    }
  }, [isListening]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = textarea.scrollHeight;
      if (messages.length > 1) {
        textarea.style.height = `${Math.min(Math.max(newHeight, 38), 180)}px`;
      } else {
        textarea.style.height = `${Math.min(Math.max(newHeight, 52), 300)}px`;
      }
    }
  }, [chatInput, messages.length]);

  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isGenerating) return;

    const userMsg = chatInput.trim();
    setChatInput("");

    generationIdRef.current += 1;
    const currentId = generationIdRef.current;

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsGenerating(true);

    try {
      const result = await fetchBballyReply(
        {
          sessionId: sessionIdRef.current,
          userId: user?.id,
          userEmail: user?.email,
          message: userMsg,
          history: messages.slice(1),
        },
        currentId
      );
      if (currentId !== generationIdRef.current) return;

      if (!result.ok && result.offline) throw new Error("offline");
      if (!result.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: `Query error: ${result.error}. Please ensure your Gemini API key is configured under Settings > Secrets.`
          }
        ]);
      } else {
        trackInquiries(result.supplierInquiryIds);
      }
    } catch (err) {
      if (currentId !== generationIdRef.current) return;
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Communication offline. Make sure the server is booted up and try again."
        }
      ]);
    } finally {
      if (currentId === generationIdRef.current) {
        setIsGenerating(false);
      }
    }
  }, [chatInput, isGenerating, messages, user, setMessages, trackInquiries, fetchBballyReply]);

  const handleQuickCommand = useCallback(async (promptText: string) => {
    if (isGenerating) return;

    generationIdRef.current += 1;
    const currentId = generationIdRef.current;

    setMessages((prev) => [...prev, { role: "user", text: promptText }]);
    setIsGenerating(true);

    try {
      const result = await fetchBballyReply(
        {
          sessionId: sessionIdRef.current,
          userId: user?.id,
          userEmail: user?.email,
          message: promptText,
          history: messages.slice(1),
        },
        currentId
      );
      if (currentId !== generationIdRef.current) return;

      if (!result.ok && result.offline) throw new Error("offline");
      if (!result.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: `Query error: ${result.error}. Please configure your API key.`
          }
        ]);
      } else {
        trackInquiries(result.supplierInquiryIds);
      }
    } catch (err) {
      if (currentId !== generationIdRef.current) return;
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Communication offline. Please check that the server is active."
        }
      ]);
    } finally {
      if (currentId === generationIdRef.current) {
        setIsGenerating(false);
      }
    }
  }, [isGenerating, messages, user, setMessages, trackInquiries, fetchBballyReply]);

  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isGenerating) return;

    e.target.value = '';

    generationIdRef.current += 1;
    const currentId = generationIdRef.current;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: `Uploading: ${file.name}`, imageUrl: URL.createObjectURL(file) }
    ]);
    setIsGenerating(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const folderName = user ? user.id : sessionIdRef.current;
      const isDocument = file.type === 'application/pdf';
      const subFolder = isDocument ? 'tech-packs' : 'sample-images';

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderName", `${folderName}/${subFolder}`);
      formData.append("fileName", fileName);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const publicUrlData = await uploadResponse.json();
      const imageUrl = publicUrlData.publicUrl;

      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: "user", text: file.name, imageUrl: imageUrl };
        return newMsgs;
      });

      const result = await fetchBballyReply(
        {
          sessionId: sessionIdRef.current,
          userId: user?.id,
          userEmail: user?.email,
          message: `[Image Attached: ${imageUrl}] Please analyze this image for apparel manufacturing.`,
          imageUrl: imageUrl,
          history: messages.slice(1),
        },
        currentId
      );
      if (currentId !== generationIdRef.current) return;

      if (!result.ok && result.offline) throw new Error("Connection lost");
      if (!result.ok) {
        setMessages((prev) => [...prev, { role: "model", text: `Error: ${result.error}` }]);
      } else {
        trackInquiries(result.supplierInquiryIds);
      }
    } catch (err: any) {
      if (currentId !== generationIdRef.current) return;
      setMessages((prev) => [
        ...prev,
        { role: "model", text: `Image processing failed: ${err.message || 'Unknown error'}` }
      ]);
    } finally {
      if (currentId === generationIdRef.current) setIsGenerating(false);
    }
  }, [isGenerating, messages, user, setMessages, trackInquiries, fetchBballyReply]);

  // welcome 페이지 대화창에서 넘어온 첫 질문이 있으면 화면이 열리자마자 바로 보낸다
  const handoffCheckedRef = useRef(false);
  useEffect(() => {
    if (handoffCheckedRef.current) return;
    handoffCheckedRef.current = true;
    const text = takeBballyHandoff();
    if (text) void handleQuickCommand(text);
  }, [handleQuickCommand]);

  const handleAnalyzeImage = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return {
    chatInput,
    setChatInput,
    isGenerating,
    textareaRef,
    fileInputRef,
    scrollRef,
    isListening,
    toggleListening,
    handleSendMessage,
    handleQuickCommand,
    handleImageSelect,
    handleAnalyzeImage
  };
}
