// Configuración para ejecutar en el Edge (máxima velocidad, mínima latencia)
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { messages } = await req.json();
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    // Conexión directa con la API de Inferencia de Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // El modelo más potente y rápido actualmente en Groq
        messages: [
          { 
            role: 'system', 
            content: 'Eres NEXUS-AI, el núcleo inteligente de ACPIA. Eres experto en auditoría, ISO 27001 y gestión de calidad. Responde de forma concisa, técnica y profesional.' 
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify({ error: errorData.error?.message || 'Groq API Error' }), { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Fallo crítico en el servidor' }), { status: 500 });
  }
}
