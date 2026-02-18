import { supabase } from './supabaseClient';

// Agregamos el export de la interfaz que le falta al build
export interface DashboardStats {
    auditCount: number;
    agentCount: number;
    agents: any[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const { count: auditCount } = await supabase
            .from('audits')
            .select('*', { count: 'exact', head: true });

        const { data: agents } = await supabase
            .from('agents')
            .select('id, name')
            .limit(5);

        return {
            auditCount: auditCount || 0,
            agentCount: agents?.length || 0,
            agents: agents || []
        };
    } catch (error) {
        console.error("Dashboard Service Error", error);
        return { auditCount: 0, agentCount: 0, agents: [] };
    }
};
