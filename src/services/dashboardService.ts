import { supabase } from './supabaseClient';

export const getDashboardStats = async () => {
    try {
        // Usamos .from('agents') y .from('audits') tal cual salen en tus errores 404
        const { data: agents } = await supabase.from('agents').select('id, name').limit(5);
        const { count: auditCount } = await supabase.from('audits').select('*', { count: 'exact', head: true });

        return {
            auditCount: auditCount || 0,
            agentCount: agents?.length || 0,
            agents: agents || []
        };
    } catch (e) {
        console.error("Dashboard Service Error", e);
        return { auditCount: 0, agentCount: 0, agents: [] };
    }
};
