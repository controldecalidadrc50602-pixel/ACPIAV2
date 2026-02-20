const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const transcribeAudio = async (audioFile: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-large-v3');

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: formData,
    });

    const data = await response.json();
    return data.text || "Error en transcripción";
};
