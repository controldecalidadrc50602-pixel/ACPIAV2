import { Message } from '../types';

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const callGroq = async (payload: any) => {
    if (!GROQ_API_KEY) throw new Error("Llave VITE_GROQ_API_KEY no encontrada.");

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Error en Groq");
    }
    return await response.json();
};

export const generateAuditAnalysis = async (text: string, rubricLabel: string) => {
    const res = await callGroq({
        messages: [{ role: "system", content: "Auditor QA experto." }, { role: "user", content: text }],
        model: "llama3-8b-8192"
    });
    return res.choices[0]?.message?.content || "";
};

export const analyzeFullAudit = async (transcript: string) => {
    const res = await callGroq({
        messages: [
            { role: "system", content: "Return JSON: { \"score\": 0-100, \"notes\": \"string\", \"sentiment\": \"POSITIVE\" }" },
            { role: "user", content: transcript }
        ],
        model: "llama3-70b-8192",
        response_format: { type: "json_object" }
    });
    return JSON.parse(res.choices[0]?.message?.content);
};

export const redactPII = async (text: string) => {
    const res = await callGroq({
        messages: [{ role: "system", content: "Redact PII." }, { role: "user", content: text }],
        model: "llama3-8b-8192"
    });
    return res.choices[0]?.message?.content || text;
};

export const transcribeAudio = async (audioFile: File) => {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-large-v3');

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: formData
    });
    const data = await response.json();
    return data.text || "";
};

export const chatWithCopilot = async (messages: Message[]) => {
    const res = await callGroq({
        messages: messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
        model: "llama3-70b-8192"
    });
    return res.choices[0]?.message?.content || "";
};
