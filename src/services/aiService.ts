import { Message, Audit } from '../types';

// Groq API Key is now handled in the backend (api/chat.ts)

export const generateAuditAnalysis = async (text: string, rubricLabel: string): Promise<string> => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are an expert QA Auditor. Analyze the following transcript segment based on this criteria: " + rubricLabel + ". Be concise, objective and constructive." },
                    { role: "user", content: text }
                ],
                model: "llama3-8b-8192",
                temperature: 0.3,
            })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const completion = await response.json();
        return completion.choices[0]?.message?.content || "No analysis generated.";
    } catch (e) {
        console.error("Analysis Error", e);
        return "Error calling AI Service.";
    }
};

export const chatWithCopilot = async (messages: Message[], context?: string): Promise<string> => {
    try {
        const systemMessage = {
            role: "system",
            content: `You are ACPIA Copilot, an AI assistant for Quality Assurance. 
            Context: ${context || "No specific context provided."}
            Help the user improve agent performance, analyze trends, and write reports.`
        };

        const apiMessages = [
            systemMessage,
            ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.text }))
        ];

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: apiMessages,
                model: "llama3-70b-8192",
                temperature: 0.7,
            })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const completion = await response.json();
        return completion.choices[0]?.message?.content || "I didn't understand that.";
    } catch (e) {
        console.error("Chat Error", e);
        return "Error processing your request.";
    }
};

export const analyzeFullAudit = async (transcript: string): Promise<{ score: number, notes: string, sentiment: string }> => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "Analyze this call transcript. Return a JSON with: score (0-100), notes (summary), and sentiment (POSITIVE, NEUTRAL, NEGATIVE, MIXED)." },
                    { role: "user", content: transcript }
                ],
                model: "llama3-70b-8192",
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const completion = await response.json();
        const content = completion.choices[0]?.message?.content;
        if (content) {
            return JSON.parse(content);
        }
        return { score: 0, notes: "Failed to parse AI response", sentiment: "NEUTRAL" };
    } catch (e) {
        console.error("Full Analysis Error", e);
        return { score: 0, notes: "Error", sentiment: "NEUTRAL" };
    }
}

export const transcribeAudio = async (audioFile: File): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', audioFile);

        const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const completion = await response.json();
        return completion.text || "";
    } catch (e) {
        console.error("Transcribe Error", e);
        return "Error transcribing audio.";
    }
};

export const redactPII = async (text: string): Promise<string> => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are a Data Privacy Shield. Replace all PII (Names, Phone Numbers, Credit Cards, Emails, Addresses) in the text with [REDACTED]. Return ONLY the redacted text. Do not include any explanations or other text." },
                    { role: "user", content: text }
                ],
                model: "llama3-70b-8192",
                temperature: 0.0,
            })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const completion = await response.json();
        return completion.choices[0]?.message?.content || text;
    } catch (e) {
        console.error("PII Redaction Error", e);
        return text;
    }
};
