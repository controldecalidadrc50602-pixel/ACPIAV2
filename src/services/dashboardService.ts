import { supabase } from './supabaseClient';

export interface DashboardStats {
    auditCount: number;
    avgScore: string;
    agents: any[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        // 1. Obtener total de auditorías reales
        const { count } = await supabase
            .from('audits')
            .select('*', { count: 'exact', head: true });

        // 2. Obtener agentes de tu tabla de la V1
        const { data: agents } = await supabase
            .from('agents')
            .select('id, name')
            .limit(5);

        // 3. Calcular promedio de calidad real
        const { data: scores } = await supabase
            .from('audits')
            .select('quality_score');
        
        const avgScore = scores && scores.length > 0
            ? (scores.reduce((acc, curr) => acc + curr.quality_score, 0) / scores.length).toFixed(1) 
            : "0";

        return {
            auditCount: count || 0,
            avgScore: `${avgScore}%`,
            agents: agents || []
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return { auditCount: 0, avgScore: "0%", agents: [] };
    }
};
