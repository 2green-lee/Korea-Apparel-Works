import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

async function generateContent(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function migrate() {
    const { data: pos } = await supabase.from('apparel_orders').select('*');
    for (const po of pos) {
        if (!po.manufacturing_specs || !po.manufacturing_specs.includes('|') || po.manufacturing_specs.includes('No specs provided')) {
            console.log(`Migrating PO ${po.order_id}...`);
            
            const { data: messages } = await supabase.from('messages')
                .select('content, sender_role')
                .eq('session_id', po.session_id)
                .order('created_at', { ascending: true });
                
            if (!messages || messages.length === 0) continue;
            
            const chatLog = messages.map(m => `${m.sender_role}: ${m.content}`).join('\n');
            
            const prompt = `
            You are an expert apparel manufacturing assistant. Read the following chat log between a customer (user) and our agent (model).
            Extract the following information from the customer's messages:
            1. Fabric/Material preference (원단)
            2. Quantity (수량)
            3. Tech pack status (테크팩 유무)
            4. Any other additional requests, design details, fit, labels, or specific comments (기타 요청사항).
            
            Respond ONLY with a JSON object in this format:
            {
              "fabric_preference": "...", // e.g. "코튼 100%" or "미정"
              "quantity": "...", // e.g. "100장" or "미정"
              "has_tech_pack": "...", // e.g. "있음" or "미정"
              "additional_requests": "..." // Comprehensive summary of all other requests, in Korean. If none, "없음".
            }
            
            Chat Log:
            ${chatLog}
            `;
            
            const jsonText = await generateContent(prompt);
            console.log(jsonText);
            const parsed = JSON.parse(jsonText);
            
            const specs = `원단: ${parsed.fabric_preference} | 수량: ${parsed.quantity} | 테크팩: ${parsed.has_tech_pack}`;
            
            await supabase.from('apparel_orders').update({
                manufacturing_specs: specs,
                additional_requests: parsed.additional_requests
            }).eq('order_id', po.order_id);
            
            console.log(`Updated PO ${po.order_id} successfully.`);
        }
    }
}

migrate().catch(console.error);
