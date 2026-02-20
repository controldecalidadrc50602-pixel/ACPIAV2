import { supabase } from './supabaseClient';

// --- AUTH COMPATIBILITY (Bypass para errores de importación) ---
export const authenticate = async () => ({ success: true });
export const initAuth = async () => ({ success: true });

// --- USUARIOS Y PERMISOS ---
export const getOrgId = () => 'acpia-pilot';
export const getUsageStats = async () => ({ aiAuditsCount: 0, limit: 9999, isUnlimited: true });
export const updateUsageStats = async () => true;

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

// --- CONFIGURACIÓN ---
export const getAppSettings = async () => {
    const { data } = await supabase.from('settings').select('*').single();
    return data || { theme: 'light', lang: 'es', companyName: 'ACPIA', logoBase64: '' };
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
