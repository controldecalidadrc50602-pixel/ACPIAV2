import { supabase } from './supabaseClient';

// --- CONFIGURACIÓN Y THEME ---
export const getAppSettings = async () => {
    const { data } = await supabase.from('settings').select('*').single();
    return data || { theme: 'light', lang: 'es', companyName: 'ACPIA' };
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

// --- UTILIDADES ---
export const exportData = () => {
    console.log("Exportando datos...");
};

export const clearAllData = async () => {
    localStorage.clear();
    return true;
};

export const logSecurityEvent = async (u: string, e: string) => console.log(`[SEC] ${e}`);

export const downloadCSV = (data: any[]) => {
    const csv = "data:text/csv;charset=utf-8," + data.map(e => Object.values(e).join(",")).join("\n");
    window.open(encodeURI(csv));
};
