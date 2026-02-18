import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { AgentRanking } from '../components/AgentRanking';
import { Zap, BarChart3, Users, CheckCircle } from 'lucide-react';

// 1. Definimos la interfaz para que TS sepa qué es un Agente
interface DashboardAgent {
    id: string;
    name: string;
    role: string;
}

export const DashboardPage = () => {
    // 2. Corregimos el error TS2345 dándole el tipo correcto al useState
    const [realAgents, setRealAgents] = useState<DashboardAgent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRealData = async () => {
            try {
                // Consultamos tu tabla de Supabase (asegúrate que el nombre sea 'users' o 'agents')
                const { data, error } = await supabase
                    .from('users') 
                    .select('id, name, role')
                    .limit(5);
                
                if (error) throw error;

                if (data) {
                    // Mapeamos los datos para asegurar que cumplen con la interfaz
                    setRealAgents(data as DashboardAgent[]);
                }
            } catch (err) {
                console.error("Error cargando datos reales:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRealData();
    }, []);

    if (loading) return (
        <div className="p-20 text-center animate-pulse">
            <h2 className="text-indigo-500 font-black uppercase tracking-widest">Sincronizando con RC506...</h2>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in">
            {/* KPIs Reales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard icon={<Zap className="text-yellow-500" />} label="Agentes en Sistema" value={realAgents.length} trend="Live" />
                <KpiCard icon={<BarChart3 className="text-indigo-500" />} label="Estado Red" value="Online" trend="Supabase" />
                <KpiCard icon={<Users className="text-emerald-500" />} label="Organización" value="RC506" trend="Enterprise" />
                <KpiCard icon={<CheckCircle className="text-purple-500" />} label="Seguridad" value="SSL/RLS" trend="Active" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 flex flex-col justify-center">
                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Monitor de Operaciones</h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Datos reales extraídos de la infraestructura acpia-pilot</p>
                </div>
                
                {/* Ranking con datos de Supabase */}
                <AgentRanking agents={realAgents} />
            </div>
        </div>
    );
};

const KpiCard = ({ icon, label, value, trend }: any) => (
    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">{icon}</div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h3>
        <p className="text-[10px] font-bold text-indigo-500 mt-2 uppercase tracking-widest">{trend}</p>
    </div>
);
