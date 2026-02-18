import React from 'react';
import { AgentRanking } from '../components/AgentRanking';
import { BarChart3, Users, Zap, CheckCircle } from 'lucide-react';

export const DashboardPage = () => {
    // Aquí conectarías con tus datos de Supabase
    const mockAgents = [
        { id: '1', name: 'Samir' },
        { id: '2', name: 'Grace' },
        { id: '3', name: 'Alan' }
    ];

    return (
        <div className="space-y-10 animate-fade-in">
            {/* KPI Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard icon={<Zap className="text-yellow-500" />} label="IA Auditorías" value="1,284" trend="+12%" />
                <KpiCard icon={<BarChart3 className="text-indigo-500" />} label="Score Global" value="94.2%" trend="+2.4%" />
                <KpiCard icon={<Users className="text-emerald-500" />} label="Agentes Activos" value="48" trend="Estable" />
                <KpiCard icon={<CheckCircle className="text-purple-500" />} label="Cumplimiento" value="99.8%" trend="ISO" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {/* Aquí podrías poner un gráfico de Recharts más adelante */}
                    <div className="h-96 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 font-black uppercase tracking-widest italic">
                        Gráfico de Tendencia (Procesando Datos...)
                    </div>
                </div>
                
                {/* Ranking de Agentes */}
                <AgentRanking agents={mockAgents} />
            </div>
        </div>
    );
};

const KpiCard = ({ icon, label, value, trend }: any) => (
    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{icon}</div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h3>
        <p className="text-[10px] font-bold text-emerald-500 mt-2 uppercase">{trend}</p>
    </div>
);
