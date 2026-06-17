export type StreamColorFinish = "titanium-silver" | "matte-obsidian" | "champagne-gold";

export interface FinishDetails {
  id: StreamColorFinish;
  name: string;
  hex: string;
  material: string;
  description: string;
  accentHex: string; // Reflection color
}

export interface PreOrderData {
  id: string;
  email: string;
  fullName: string;
  finish: StreamColorFinish;
  size: number;
  country: string;
  createdAt: string;
  shippingOption: "standard" | "priority";
}

export interface ConversationalNote {
  id: string;
  timestamp: string;
  duration: string;
  rawTranscript: string;
  aiSummary: string;
  category: "thought" | "task" | "meeting" | "quick-note";
  actionItems: string[];
  tags: string[];
  importance: "standard" | "high";
}

export interface SpecFeature {
  metric: string;
  value: string;
  details: string;
}
