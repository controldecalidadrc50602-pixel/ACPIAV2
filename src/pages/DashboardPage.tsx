import React, { useEffect, useState } from 'react';
import { AgentRanking } from '../components/AgentRanking';
import { getDashboardStats, DashboardStats } from '../services/dashboardService';
import { Zap, Users, ShieldCheck, Loader2, BarChart3 } from 'lucide-react';

export const DashboardPage = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardStats().then((data: DashboardStats) => {
            setStats(data);
            setLoading(false);
        });
    }, []);

    if (loading || !stats) return (
        <div className="h-screen flex flex-col items-center justify-center text-indigo-500 gap-4 bg-slate-950">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
            <p className="font-black uppercase tracking-[0.3em] text-[10px]">Sincronizando con Infraestructura RC506...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in p-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard icon={<Zap className="text-yellow-500" />} label="Auditorías Totales" value={stats.auditCount} trend="Live" />
                <KpiCard icon={<Users className="text-emerald-500" />} label="Agentes Registrados" value={stats.agentCount} trend="Real-time" />
                <KpiCard icon={<BarChart3 className="text-indigo-500" />} label="Calidad Promedio" value="Calculando..." trend="Supabase" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-indigo-600 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Operación Activa</h2>
                        <p className="text-indigo-100 font-bold mt-4 uppercase tracking-[0.2em] text-xs">Organización: acpia-pilot</p>
                    </div>
                    <ShieldCheck className="absolute -right-10 -bottom-10 w-72 h-72 opacity-10" />
                </div>
                
                {/* Ranking Real desde Supabase */}
                <AgentRanking agents={stats.agents} />
            </div>
        </div>
    );
};

const KpiCard = ({ icon, label, value, trend }: any) => (
    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{icon}</div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h3>
        <p className="text-[9px] font-bold text-indigo-500 mt-2 uppercase tracking-widest">{trend}</p>
    </div>
);
