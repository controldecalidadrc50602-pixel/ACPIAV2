import React, { useEffect, useState } from 'react';
import { 
    LayoutDashboard, 
    Bot, 
    MessageSquare, 
    Bell, 
    Calendar, 
    ExternalLink, 
    PlayCircle,
    BarChart3,
    ArrowUpRight
} from 'lucide-react';
import { getDashboardStats, DashboardStats } from '../services/dashboardService';

export const DashboardPage = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        getDashboardStats().then(setStats);
    }, []);

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 animate-fade-in">
            {/* Saludo Inicial */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                        Buenos días, <span className="text-indigo-600">Braily.</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">¿Qué deseas auditar hoy?</p>
                </div>
                <div className="hidden md:flex gap-3">
                    <button className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Agenda
                    </button>
                </div>
            </div>

            {/* Fila de Acciones Principales (Igual a tu ejemplo) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ActionCard 
                    icon={<Bot className="w-8 h-8 text-blue-600" />}
                    title="Analizar Agentes IA"
                    desc="Inferencia de calidad y sentimientos."
                    links={['Auditoría Voz', 'Auditoría Chat']}
                    accent="blue"
                />
                <ActionCard 
                    icon={<MessageSquare className="w-8 h-8 text-indigo-600" />}
                    title="Atender Auditorías"
                    desc="Revisión de tickets y feedback manual."
                    links={['Pendientes', 'En Revisión']}
                    accent="indigo"
                />
                <ActionCard 
                    icon={<Bell className="w-8 h-8 text-purple-600" />}
                    title="Alertas de Calidad"
                    desc="Notificaciones de bajo desempeño."
                    links={['Ver Alertas', 'Configurar']}
                    accent="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Sección Izquierda: Mis Agentes/Proyectos */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Mis Agentes Activos</h3>
                            <button className="text-indigo-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline">
                                Ver más <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {['Guadalupe 2.0', 'RC506 Inbound', 'Soporte Nivel 1'].map((bot, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{bot}</p>
                                            <p className="text-[10px] text-slate-400 font-medium italic">Modificado: 20/02/2026</p>
                                        </div>
                                    </div>
                                    <PlayCircle className="w-5 h-5 text-slate-300 hover:text-indigo-500 cursor-pointer" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sección Derecha: Agenda / Ayuda */}
                <div className="space-y-8">
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-4 relative z-10">Próximas Sesiones</h3>
                        <div className="space-y-6 relative z-10">
                            <EventItem date="25 FEB" title="Calibración con RC506" />
                            <EventItem date="04 MAR" title="Update de Rúbricas IA" />
                        </div>
                        <BarChart3 className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10" />
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Recursos</h3>
                        <div className="space-y-4">
                            {['Centro de Ayuda', 'Webinar de IA', 'Monitor de APIs'].map(link => (
                                <p key={link} className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-2">
                                    {link} <ExternalLink className="w-3 h-3" />
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActionCard = ({ icon, title, desc, links, accent }: any) => (
    <div className={`p-8 bg-white dark:bg-slate-900 border-b-4 border-${accent}-500 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group`}>
        <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
            {icon}
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">{title}</h3>
        <p className="text-[11px] font-medium text-slate-400 mt-2 mb-6 leading-relaxed">{desc}</p>
        <div className="flex gap-4">
            {links.map((link: string) => (
                <button key={link} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" /> {link}
                </button>
            ))}
        </div>
    </div>
);

const Zap = ({ className }: any) => <PlayCircle className={className} />;

const EventItem = ({ date, title }: any) => (
    <div className="flex gap-4 items-start">
        <div className="text-center">
            <p className="text-lg font-black leading-none">{date.split(' ')[0]}</p>
            <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest">{date.split(' ')[1]}</p>
        </div>
        <p className="text-xs font-bold leading-tight mt-1">{title}</p>
    </div>
);
