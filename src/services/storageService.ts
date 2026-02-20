import { supabase } from './supabaseClient';

// --- USUARIOS Y PERMISOS ---
export const getOrgId = () => 'acpia-pilot';

export const getUsageStats = async () => {
    return { aiAuditsCount: 0, limit: 9999, isUnlimited: true };
};

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
    if (error) console.error("Error saving audit:", error);
    return !error;
};

// --- CONFIGURACIÓN ---
export const getAppSettings = async () => {
    const { data } = await supabase.from('settings').select('*').single();
    return data || { theme: 'light', lang: 'es', companyName: 'ACPIA' };
};

export const saveAppSettings = async (settings: any) => {
    const { error } = await supabase.from('settings').upsert([settings]);
    return !error;
};

// --- UTILIDADES ---
export const logSecurityEvent = async (userId: string, event: string, details: string, level: string) => {
    console.log(`[SECURITY ${level}] ${userId}: ${event}`);
};

export const downloadCSV = (data: any[]) => {
    const csvContent = "data:text/csv;charset=utf-8," + data.map(e => Object.values(e).join(",")).join("\n");
    window.open(encodeURI(csvContent));
};

export const saveTheme = (theme: string) => localStorage.setItem('theme', theme);
export const getTheme = () => localStorage.getItem('theme') || 'light';
