import { supabase } from './supabaseClient';

// --- AUTH & PERMISOS ---
export const getOrgId = () => 'acpia-pilot';

export const getUsageStats = async () => {
    // Retorna valores altos para que el Admin nunca sea bloqueado
    return { aiAuditsCount: 0, limit: 9999, isUnlimited: true };
};

export const updateUsageStats = async () => {
    // Función necesaria para evitar errores en geminiService
    return true;
};

// --- CONFIGURACIÓN Y THEME ---
export const getAppSettings = async () => {
    const { data } = await supabase.from('settings').select('*').single();
    return data || { theme: 'light', lang: 'es', companyName: 'ACPIA', logoBase64: '' };
};

export const saveAppSettings = async (settings: any) => {
    const { error } = await supabase.from('settings').upsert([settings]);
    return !error;
};

export const saveTheme = (theme: string) => localStorage.setItem('theme', theme);
export const getTheme = () => localStorage.getItem('theme') || 'light';

// --- ENTIDADES ---
export const getAgents = async () => {
    const { data } = await supabase.from('agents').select('*').order('name');
    return data || [];
};

export const getProjects = async () => {
    const { data } = await supabase.from('projects').select('*');
    return data || [];
};

export const getRubric = async () => {
    const { data } = await supabase.from('rubrics').select('*').order('label');
    return data || [];
};

export const toggleRubricItem = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from('rubrics').update({ isActive }).eq('id', id);
    return !error;
};

// --- AUDITORÍAS ---
export const getAudits = async () => {
    const { data } = await supabase.from('audits').select('*').order('created_at', { ascending: false });
    return data || [];
};

export const saveAudit = async (auditData: any) => {
    const { error } = await supabase.from('audits').insert([{
        "readableId": auditData.readableId,
        "agentName": auditData.agentName,
        "project": auditData.project,
        "qualityScore": auditData.qualityScore || auditData.score || 0,
        "sentiment": auditData.sentiment,
        "aiNotes": auditData.aiNotes,
        "status": auditData.status || 'PENDING_REVIEW',
        "organizationId": 'acpia-pilot'
    }]);
    return !error;
};

// --- COPILOT / CHAT SESSIONS ---
export const getChatSessions = async () => {
    const { data } = await supabase.from('chat_sessions').select('*').order('created_at', { ascending: false });
    return (data || []).map(s => ({
        ...s,
        date: s.created_at // Mapeo para compatibilidad con la interfaz ChatSession
    }));
};

export const createNewSession = async () => {
    const id = crypto.randomUUID();
    const newSession = { 
        id, 
        title: 'Nueva Conversación', 
        messages: [], 
        created_at: new Date().toISOString() 
    };
    await supabase.from('chat_sessions').insert([newSession]);
    return { ...newSession, date: newSession.created_at };
};

export const saveChatSession = async (session: any) => {
    const { error } = await supabase.from('chat_sessions').upsert([{
        id: session.id,
        title: session.title,
        messages: session.messages,
        created_at: session.date || session.created_at
    }]);
    return !error;
};

export const deleteChatSession = async (id: string) => {
    await supabase.from('chat_sessions').delete().eq('id', id);
    return true;
};

// --- UTILIDADES ---
export const exportData = () => {
    console.log("Generando export de datos...");
};

export const clearAllData = async () => {
    localStorage.clear();
    return true;
};

export const logSecurityEvent = async (u: string, e: string) => console.log(`[SEC] User ${u}: ${e}`);

export const downloadCSV = (data: any[]) => {
    if (!data || data.length === 0) return;
    const csv = "data:text/csv;charset=utf-8," + data.map(e => Object.values(e).join(",")).join("\n");
    window.open(encodeURI(csv));
};
