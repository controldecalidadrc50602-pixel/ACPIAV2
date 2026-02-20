import { Message } from '../types';

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Función base para llamadas a Groq
const callGroq = async (payload: any) => {
    if (!GROQ_API_KEY) {
        throw new Error("VITE_GROQ_API_KEY no encontrada en variables de entorno.");
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
        throw new Error(errorData.error?.message || 'Error en Groq API');
    }

    return await response.json();
};

// 1. Exportar análisis de segmentos
export const generateAuditAnalysis = async (text: string, rubricLabel: string): Promise<string> => {
    try {
        const completion = await callGroq({
            messages: [
                { role: "system", content: `Eres un auditor experto. Analiza este segmento basado en: ${rubricLabel}. Sé conciso.` },
                { role: "user", content: text }
            ],
            model: "llama3-8b-8192",
            temperature: 0.3,
        });
        return completion.choices[0]?.message?.content || "Sin análisis.";
    } catch (e) {
        console.error("Error en análisis", e);
        return "Error en el servicio de IA.";
    }
};

// 2. Exportar análisis completo (LO QUE FALTABA)
export const analyzeFullAudit = async (transcript: string): Promise<{ score: number, notes: string, sentiment: string }> => {
    try {
        const completion = await callGroq({
            messages: [
                { role: "system", content: "Analiza la llamada. Devuelve un JSON: { \"score\": 0-100, \"notes\": \"resumen\", \"sentiment\": \"POSITIVE/NEUTRAL/NEGATIVE\" }" },
                { role: "user", content: transcript }
            ],
            model: "llama3-70b-8192",
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;
        return content ? JSON.parse(content) : { score: 0, notes: "Error de formato", sentiment: "NEUTRAL" };
    } catch (e) {
        console.error("Full Analysis Error", e);
        return { score: 0, notes: "Error de conexión", sentiment: "NEUTRAL" };
    }
};

// 3. Exportar Redact PII (LO QUE TAMBIÉN FALTABA)
export const redactPII = async (text: string): Promise<string> => {
    try {
        const completion = await callGroq({
            messages: [
                { role: "system", content: "Reemplaza nombres, teléfonos y correos por [REDACTED]. Devuelve solo el texto modificado." },
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

// 4. Exportar transcripción
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

        const data = await response.json();
        return data.text || "";
    } catch (e) {
        console.error("Transcribe Error", e);
        return "Error transcribiendo audio.";
    }
};

// 5. Chat con Copilot
export const chatWithCopilot = async (messages: Message[], context?: string): Promise<string> => {
    try {
        const completion = await callGroq({
            messages: [
                { role: "system", content: `Eres ACPIA Copilot. Contexto: ${context}` },
                ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))
            ],
            model: "llama3-70b-8192",
        });
        return completion.choices[0]?.message?.content || "No entiendo.";
    } catch (e) {
        console.error("Chat Error", e);
        return "Error en Copilot.";
    }
};
