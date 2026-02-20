import React, { useState, useEffect } from 'react';
import { getAgents, getProjects, getRubric, toggleRubricItem } from '../services/storageService';
import { UserRole, Agent, Project, RubricItem } from '../types';
import { Shield, Users, Briefcase, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Management: React.FC = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [rubric, setRubric] = useState<RubricItem[]>([]);

    const loadData = async () => {
        const [a, p, r] = await Promise.all([getAgents(), getProjects(), getRubric()]);
        setAgents(a); setProjects(p); setRubric(r);
    };

    useEffect(() => { loadData(); }, []);

    const handleToggleRubric = async (id: string, current: boolean) => {
        const ok = await toggleRubricItem(id, !current);
        if (ok) {
            toast.success("Rúbrica actualizada");
            loadData();
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black uppercase tracking-tighter dark:text-white italic">Gestión de Activos</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Administración de Agentes, Proyectos y Rúbricas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Agentes Card */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500"><Users /></div>
                        <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white">Agentes Activos</h3>
                    </div>
                    <div className="space-y-3">
                        {agents.map(agent => (
                            <div key={agent.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center font-bold text-xs uppercase dark:text-white">
                                {agent.name} <span className="text-[8px] opacity-50 font-black">{agent.id.slice(0,8)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rúbricas Card */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500"><Shield /></div>
                        <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white">Criterios IA</h3>
                    </div>
                    <div className="space-y-3">
                        {rubric.map(item => (
                            <button key={item.id} onClick={() => handleToggleRubric(item.id, item.isActive)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center group transition-all">
                                <span className="font-bold text-xs uppercase dark:text-white">{item.label}</span>
                                {item.isActive ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-slate-300" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
