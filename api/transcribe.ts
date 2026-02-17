
import Groq from 'groq-sdk';
// formidable or other parsers might be needed for file uploads in Node, 
// but in Vercel Edge/Web API we can use Request.formData()

export const config = {
    runtime: 'edge', // Or 'nodejs' if file handling is easier
};

// Edge runtime supports formData()
const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    if (!apiKey) {
        return new Response('Missing Groq API Key', { status: 500 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return new Response('No file uploaded', { status: 400 });
        }

        const groq = new Groq({ apiKey });

        // Groq SDK might expect a file-like object or stream. 
        // In Edge Runtime, 'File' is standard.
        const completion = await groq.audio.transcriptions.create({
            file: file,
            model: "whisper-large-v3",
            response_format: "json",
            temperature: 0.0
        });

        // Cast to any because completion might be Transcript directly
        return new Response(JSON.stringify(completion), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Groq Transcribe Error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
