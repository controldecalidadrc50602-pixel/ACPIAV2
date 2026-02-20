
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { Audit, Language, RubricItem, SmartAnalysisResult, CoachingPlan, Sentiment, Participant } from '../types';
import { updateUsageStats } from './storageService';

const getAI = () => {
    if (!process.env.API_KEY) throw new Error("MISSING_KEY");
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Construye el esquema de respuesta dinámicamente basado en la rúbrica.
 * Esto evita el error de "OBJECT type should be non-empty".
 */
const getDynamicSchema = (rubric: RubricItem[]) => {
  const customDataProperties: Record<string, any> = {};
  
  // Si no hay rúbrica, añadimos una propiedad dummy para evitar el error de objeto vacío
  if (rubric.length === 0) {
    customDataProperties["_info"] = { type: Type.STRING, description: "No rubric items provided" };
  } else {
    rubric.forEach(r => {
      customDataProperties[r.id] = { 
        type: Type.BOOLEAN, 
        description: `Evaluación para el criterio: ${r.label}` 
      };
    });
  }

  return {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER, description: "Puntaje de calidad de 0 a 100" },
      csat: { type: Type.NUMBER, description: "Satisfacción estimada de 1 a 5" },
      sentiment: { type: Type.STRING, description: "POSITIVE, NEUTRAL o NEGATIVE" },
      interactionType: { type: Type.STRING, description: "INTERNAL o EXTERNAL" },
      participants: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING, description: "AGENT o CUSTOMER" },
            tone: { type: Type.STRING },
            sentiment: { type: Type.STRING },
            name: { type: Type.STRING }
          },
          required: ["role"]
        }
      },
      customData: {
        type: Type.OBJECT,
        properties: customDataProperties,
        description: "Mapa de resultados de la rúbrica"
      },
      notes: { type: Type.STRING, description: "Informe detallado de auditoría en formato Markdown estructurado" },
      durationAnalysis: { type: Type.STRING, description: "Breve comentario sobre la eficiencia del tiempo" }
    },
    required: ["score", "csat", "notes", "customData", "participants"]
  };
};

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.status === 429 || error.status >= 500)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

const getInferenceRules = (rubric: RubricItem[], lang: Language) => {
    const rubricContext = rubric.map(r => `- ID: "${r.id}" (KPI: "${r.label}")`).join('\n');
    return lang === 'es'
        ? `REGLAS ACPIA:
           1. EVALUACIÓN: Evalúa cada uno de estos ítems en el objeto 'customData' como true/false:
           ${rubricContext}
           2. INFORME: El campo 'notes' DEBE ser un informe Markdown extenso con secciones: Puntos Positivos, Negativos, Mejoras y Resumen.`
        : `ACPIA RULES:
           1. EVALUATION: Evaluate each item in 'customData' as true/false:
           ${rubricContext}
           2. REPORT: The 'notes' field MUST be a long Markdown report with sections: Positives, Negatives, Improvements and Summary.`;
};

const cleanJsonResponse = (text: string): string => {
    if (!text) return "{}";
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end < start) return "{}";
    return text.substring(start, end + 1).trim();
};

const normalizeResult = (data: any, rubric: RubricItem[]): SmartAnalysisResult => {
    const raw = data || {};
    
    // Sentimiento
    let finalSentiment: Sentiment = 'NEUTRAL';
    const sVal = (raw.sentiment || 'NEUTRAL').toString().toUpperCase();
    if (sVal.includes('POS')) finalSentiment = 'POSITIVE';
    else if (sVal.includes('NEG')) finalSentiment = 'NEGATIVE';

    // Participantes
    let finalParticipants: Participant[] = [];
    if (Array.isArray(raw.participants)) {
        finalParticipants = raw.participants.map((p: any) => ({
            name: String(p.name || p.role || 'User'),
            role: String(p.role || 'UNKNOWN').toUpperCase().includes('AGENT') ? 'AGENT' : 'CUSTOMER',
            sentiment: (String(p.sentiment || 'NEUTRAL').toUpperCase().includes('POS') ? 'POSITIVE' : 'NEUTRAL') as Sentiment,
            tone: String(p.tone || 'Neutral')
        }));
    }

    // Rúbrica
    const customRaw = raw.customData || {};
    const sanitizedCustom: Record<string, boolean> = {};
    rubric.forEach(r => {
        sanitizedCustom[r.id] = !!customRaw[r.id];
    });

    return {
        score: Number(raw.score || 0),
        csat: Number(raw.csat || 3),
        notes: typeof raw.notes === 'string' ? raw.notes : "No se generó el informe de razonamiento.",
        customData: sanitizedCustom,
        sentiment: finalSentiment,
        interactionType: String(raw.interactionType || '').includes('INTERN') ? 'INTERNAL' : 'EXTERNAL',
        participants: finalParticipants.length > 0 ? finalParticipants : [{ name: 'System', role: 'UNKNOWN', sentiment: 'NEUTRAL', tone: 'N/A' }],
        durationAnalysis: String(raw.durationAnalysis || 'Análisis completado')
    };
};

export const analyzeText = async (content: string, rubric: RubricItem[], lang: Language): Promise<SmartAnalysisResult | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const schema = getDynamicSchema(rubric);
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analiza esta transcripción: ${content}`,
            config: { 
                systemInstruction: `Eres un Auditor Senior de Calidad. Genera un JSON estrictamente según el esquema. ${getInferenceRules(rubric, lang)}`,
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.1
            }
        });

       // En lugar de updateUsageStats(userId), simplemente llama a la función:
await updateUsageStats();
        const parsed = JSON.parse(cleanJsonResponse(response.text || "{}"));
        return normalizeResult(parsed, rubric);
    });
};

export const analyzeAudio = async (base64Audio: string, rubric: RubricItem[], lang: Language): Promise<SmartAnalysisResult | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const schema = getDynamicSchema(rubric);

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ inlineData: { mimeType: 'audio/mp3', data: base64Audio } }, { text: "Audita este audio." }] },
            config: { 
                systemInstruction: `Eres un Auditor de Voz Senior. Genera un JSON según el esquema. ${getInferenceRules(rubric, lang)}`,
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.1
            }
        });
// En lugar de updateUsageStats(userId), simplemente llama a la función:
await updateUsageStats();
        const parsed = JSON.parse(cleanJsonResponse(response.text || "{}"));
        return normalizeResult(parsed, rubric);
    });
};

export const testConnection = async () => {
    try { 
        const ai = getAI(); 
        await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: 'ping' }); 
        return true; 
    } catch (e) { return false; }
};

export const sendChatMessage = async (history: any[], newMessage: string, auditContext: Audit[], lang: Language): Promise<string> => {
    const ai = getAI();
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [ ...history, { role: 'user', parts: [{ text: newMessage }] } ],
        config: { systemInstruction: `Eres ACPIA Copilot. Idioma: ${lang}. Contexto: ${JSON.stringify(auditContext.slice(0, 3))}` }
    });
    return response.text || "";
};

export const getQuickInsight = async (audits: Audit[], lang: Language): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Resume estas auditorías: ${JSON.stringify(audits.slice(0, 5))}. Idioma: ${lang}.`,
    });
    return response.text?.trim() || "";
};

export const generateAuditFeedback = async (data: { agentName: string, score: number }, lang: Language): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Feedback para ${data.agentName} con score ${data.score}%. Idioma: ${lang}.`,
    });
    return response.text?.trim() || "";
};

export const generateReportSummary = async (audits: Audit[], lang: Language): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Resume el reporte: ${JSON.stringify(audits.slice(0, 5))}. Idioma: ${lang}.`,
    });
    return response.text?.trim() || "";
};

export const generatePerformanceAnalysis = async (name: string, type: 'AGENT' | 'PROJECT', stats: any, lang: Language): Promise<string> => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analiza a ${type} ${name}: ${JSON.stringify(stats)}. Idioma: ${lang}.`,
    });
    return response.text?.trim() || "";
};

export const generateCoachingPlan = async (agentName: string, recentAudits: Audit[], lang: Language): Promise<CoachingPlan | null> => {
    return withRetry(async () => {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Genera plan de coaching para ${agentName}. Idioma: ${lang}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topic: { type: Type.STRING },
                        tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        const parsed = JSON.parse(response.text || "{}");
        return {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            topic: parsed.topic || "Entrenamiento",
            tasks: parsed.tasks || [],
            status: 'pending'
        };
    });
};
