import { supabase } from './supabaseClient';

// --- AUTH & USER ---
export const authenticate = async () => ({ success: true });
export const initAuth = async () => ({ success: true });
export const getOrgId = () => 'acpia-pilot';
export const getUsageStats = async () => ({ aiAuditsCount: 0, limit: 9999, isUnlimited: true });
export const updateUsageStats = async () => true;

// --- ENTIDADES (AGENTES & PROYECTOS) ---
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

// --- COPILOT / CHAT SESSIONS (Lo que faltaba) ---
export const getChatSessions = async () => {
    const { data } = await supabase.from('chat_sessions').select('*').order('updated_at', { ascending: false });
    return data || [];
};

export const saveChatSession = async (session: any) => {
    const { error } = await supabase.from('chat_sessions').upsert([session]);
    return !error;
};

export const deleteChatSession = async (id: string) => {
    const { error } = await supabase.from('chat_sessions').delete().eq('id', id);
    return !error;
};

export const createNewSession = async () => {
    const newSession = { id: crypto.randomUUID(), title: 'Nueva Conversación', messages: [], updated_at: new Date() };
    await saveChatSession(newSession);
    return newSession;
};

// --- CONFIGURACIÓN ---
export const getAppSettings = async () => {
    const { data } = await supabase.from('settings').select('*').single();
    return data || { theme: 'light', lang: 'es', companyName: 'ACPIA', chatbotName: 'ACPIA Copilot' };
};

export const saveAppSettings = async (settings: any) => {
    const { error } = await supabase.from('settings').upsert([settings]);
    return !error;
};

// --- UTILIDADES ---
export const logSecurityEvent = async (u: string, e: string) => console.log(`[SEC] ${e}`);
export const downloadCSV = (data: any[]) => {
    const csv = "data:text/csv;charset=utf-8," + data.map(e => Object.values(e).join(",")).join("\n");
    window.open(encodeURI(csv));
};
export const exportData = () => {};
export const clearAllData = async () => { localStorage.clear(); return true; };
export const saveTheme = (t: string) => localStorage.setItem('theme', t);
export const getTheme = () => localStorage.getItem('theme') || 'light';
