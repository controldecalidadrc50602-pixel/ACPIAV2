import { supabase } from './supabaseClient';

export const getAgents = async () => {
    const { data } = await supabase.from('agents').select('*').order('name');
    return data || [];
};

export const getProjects = async () => {
    const { data } = await supabase.from('projects').select('*');
    return data || [];
};

export const getAudits = async () => {
    const { data } = await supabase.from('audits').select('*').order('created_at', { ascending: false });
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

export const getOrgId = () => 'acpia-pilot';

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

export const downloadCSV = (data: any[]) => {
    const csvContent = "data:text/csv;charset=utf-8," + data.map(e => Object.values(e).join(",")).join("\n");
    window.open(encodeURI(csvContent));
};

export const exportData = () => { /* Implementación básica */ };
export const clearAllData = async () => { localStorage.clear(); return true; };
export const updateUsageStats = async () => true;
