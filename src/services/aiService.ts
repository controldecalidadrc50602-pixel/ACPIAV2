import { Message } from '../types';

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Función maestra para llamadas directas a Groq
const callGroq = async (payload: any) => {
    if (!GROQ_API_KEY) {
        throw new Error("VITE_GROQ_API_KEY is missing in environment variables");
    }

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Groq API Error:", errorData);
        throw new Error(errorData.error?.message || 'Groq API failure');
    }

    return await response.json();
};

export const generateAuditAnalysis = async (text: string, rubricLabel: string): Promise<string> => {
    try {
        const completion = await callGroq({
            messages: [
                { role: "system", content: `You are an expert QA Auditor. Analyze based on: ${rubricLabel}. Be concise.` },
                { role: "user", content: text }
            ],
            model: "llama3-8b-8192",
            temperature: 0.3,
        });
        return completion.choices[0]?.message?.content || "No analysis generated.";
    } catch (e) {
        console.error("Analysis Error", e);
        return "Error calling AI Service.";
    }
};

export const chatWithCopilot = async (messages: Message[], context?: string): Promise<string> => {
    try {
        const apiMessages = [
            { role: "system", content: `You are ACPIA Copilot. Context: ${context || "QA Assistant"}` },
            ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
        ];

        const completion = await callGroq({
            messages: apiMessages,
            model: "llama3-70b-8192",
            temperature: 0.7,
        });
        return completion.choices[0]?.message?.content || "I didn't understand that.";
    } catch (e) {
        console.error("Chat Error", e);
        return "Error processing request.";
    }
};

export const analyzeFullAudit = async (transcript: string): Promise<{ score: number, notes: string, sentiment: string }> => {
    try {
        const completion = await callGroq({
            messages: [
                { role: "system", content: "Analyze call. Return ONLY JSON: { \"score\": number, \"notes\": \"string\", \"sentiment\": \"string\" }" },
                { role: "user", content: transcript }
            ],
            model: "llama3-70b-8192",
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        return content ? JSON.parse(content) : { score: 0, notes: "Error", sentiment: "NEUTRAL" };
    } catch (e) {
        console.error("Full Analysis Error", e);
        return { score: 0, notes: "Error", sentiment: "NEUTRAL" };
    }
};

// --- ESTA ES LA FUNCIÓN QUE FALTABA Y CAUSABA EL ERROR ---
export const redactPII = async (text: string): Promise<string> => {
    try {
        const completion = await callGroq({
            messages: [
                { role: "system", content: "Replace all PII (Names, Phones, Emails) with [REDACTED]. Return ONLY the redacted text." },
                { role: "user", content: text }
            ],
            model: "llama3-8b-8192",
            temperature: 0.0,
        });
        return completion.choices[0]?.message?.content || text;
    } catch (e) {
        console.error("PII Redaction Error", e);
        return text;
    }
};

export const transcribeAudio = async (audioFile: File): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('model', 'whisper-large-v3');

        const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
            body: formData,
        });

        const completion = await response.json();
        return completion.text || "";
    } catch (e) {
        console.error("Transcribe Error", e);
        return "Error transcribing audio.";
    }
};
