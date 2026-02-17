
import Groq from 'groq-sdk';

export const config = {
    runtime: 'edge',
};

const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    if (!apiKey) {
        return new Response('Missing Groq API Key', { status: 500 });
    }

    try {
        const { messages, model = "llama3-8b-8192", temperature = 0.3, response_format } = await req.json();

        const groq = new Groq({ apiKey });

        const completion = await groq.chat.completions.create({
            messages,
            model,
            temperature,
            response_format,
            stream: false, // For simplicity in MVP
        });

        return new Response(JSON.stringify(completion), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Groq API Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
