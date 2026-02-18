import { supabase } from './supabaseClient';

export interface DashboardStats {
    auditCount: number;
    agentCount: number;
    agents: any[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        // 1. Contar auditorías reales
        const { count: auditCount } = await supabase
            .from('audits')
            .select('*', { count: 'exact', head: true });

        // 2. Traer agentes para el Ranking
        const { data: agents } = await supabase
            .from('agents')
            .select('id, name')
            .limit(5);

        // 3. Contar total de agentes
        const { count: agentCount } = await supabase
            .from('agents')
            .select('*', { count: 'exact', head: true });

        return {
            auditCount: auditCount || 0,
            agentCount: agentCount || 0,
            agents: agents || []
        };
    } catch (error) {
        console.error("Error Dashboard:", error);
        return { auditCount: 0, agentCount: 0, agents: [] };
    }
};
