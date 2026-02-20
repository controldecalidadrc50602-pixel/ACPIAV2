import { supabase } from './supabaseClient';

// Obtener Agentes Reales
export const getAgents = async () => {
    try {
        const { data, error } = await supabase
            .from('agents')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Error cargando agentes:", e);
        return [];
    }
};

// Obtener Proyectos
export const getProjects = async () => {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*');
        
        if (error) return [];
        return data || [];
    } catch (e) {
        return [];
    }
};

// Guardar Auditoría IA
export const saveAudit = async (auditData: any) => {
    try {
        const { error } = await supabase.from('audits').insert([{
            "readableId": auditData.readableId,
            "agentName": auditData.agentName,
            "project": auditData.project,
            "qualityScore": auditData.qualityScore || auditData.score,
            "sentiment": auditData.sentiment,
            "aiNotes": auditData.aiNotes,
            "status": 'PENDING_REVIEW',
            "organizationId": 'acpia-pilot'
        }]);

        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error al guardar auditoría:", e);
        return false;
    }
};

// Bypass de estadísticas para Administrador
export const getUsageStats = () => {
    return { 
        aiAuditsCount: 0, 
        limit: 99999,
        isUnlimited: true 
    };
};

// Log de Seguridad (ISO 42001)
export const logSecurityEvent = async (userId: string, event: string, details: string, level: string) => {
    console.log(`[SECURITY ${level}] User ${userId}: ${event} - ${details}`);
    // Opcional: Guardar en una tabla de logs si la creas luego
};
