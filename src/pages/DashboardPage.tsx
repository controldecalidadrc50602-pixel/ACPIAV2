import React, { useEffect, useState } from 'react';
import { AgentRanking } from '../components/AgentRanking';
import { getDashboardStats } from '../services/dashboardService';
import { Zap, BarChart3, Users, CheckCircle, Loader2 } from 'lucide-react';

export const DashboardPage = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardStats().then(data => {
            setStats(data);
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center text-indigo-500 gap-4">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="font-black uppercase tracking-widest text-xs">Sincronizando con Supabase...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard icon={<Zap className="text-yellow-500" />} label="Auditorías Totales" value={stats.auditCount} trend="En Vivo" />
                <KpiCard icon={<BarChart3 className="text-indigo-500" />} label="Promedio Calidad" value={stats.avgScore} trend="Real-time" />
                <KpiCard icon={<Users className="text-emerald-500" />} label="Agentes Sistema" value={stats.agents.length} trend="Activos" />
                <KpiCard icon={<CheckCircle className="text-purple-500" />} label="Estado" value="ONLINE" trend="Supabase" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                     <div className="h-full bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 flex flex-col justify-center">
                        <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Métricas de Operación</h2>
                        <p className="text-slate-400 font-medium">Datos extraídos de la base de datos de RC506.</p>
                        {/* Aquí puedes integrar un gráfico real cuando quieras */}
                     </div>
                </div>
                
                {/* Ranking Real */}
                <AgentRanking agents={stats.agents} />
            </div>
        </div>
    );
};

const KpiCard = ({ icon, label, value, trend }: any) => (
    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">{icon}</div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h3>
        <p className="text-[10px] font-bold text-indigo-500 mt-2 uppercase tracking-widest">{trend}</p>
    </div>
);
