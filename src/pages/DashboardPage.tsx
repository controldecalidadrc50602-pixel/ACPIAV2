import React, { useEffect, useState } from 'react';
import { AgentRanking } from '../components/AgentRanking';
import { getDashboardStats, DashboardStats } from '../services/dashboardService'; // Importamos la interfaz
import { Zap, BarChart3, Users, CheckCircle, Loader2 } from 'lucide-react';

export const DashboardPage = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Definimos el tipo (data: DashboardStats) para que TS no se queje
        getDashboardStats().then((data: DashboardStats) => {
            setStats(data);
            setLoading(false);
        });
    }, []);

    if (loading || !stats) return (
        <div className="h-96 flex flex-col items-center justify-center text-indigo-500 gap-4">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="font-black uppercase tracking-widest text-[10px]">Sincronizando con Supabase RC506...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in">
            {/* ... Resto del JSX que ya tenemos con los KPIs usando stats.auditCount, etc. */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard icon={<Zap className="text-yellow-500" />} label="Auditorías Totales" value={stats.auditCount} trend="Real-Time" />
                <KpiCard icon={<BarChart3 className="text-indigo-500" />} label="Calidad Real" value={stats.avgScore} trend="Supabase" />
                {/* ... */}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Actividad de la Semana</h2>
                    <p className="text-slate-400 text-sm mt-2 font-bold">Datos reales de la operación acpia-pilot.</p>
                </div>
                <AgentRanking agents={stats.agents} />
            </div>
        </div>
    );
};

const KpiCard = ({ icon, label, value, trend }: any) => (
    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{icon}</div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h3>
        <p className="text-[10px] font-bold text-indigo-500 mt-2 uppercase tracking-widest">{trend}</p>
    </div>
);
