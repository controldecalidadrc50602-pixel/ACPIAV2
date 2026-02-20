import React from 'react';
import { Bot, Users, Bell, PlayCircle, Calendar, ArrowRight, Sparkles } from 'lucide-react';

export const DashboardPage = () => {
  return (
    <div className="max-w-[1400px] mx-auto space-y-12 animate-fade-in">
      {/* Bienvenida Premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
            Buenos días, <span className="text-indigo-600">Braily.</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Gestión de Calidad e Inteligencia</p>
        </div>
        <div className="flex gap-3">
           <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
             <Calendar className="w-4 h-4 text-indigo-500" /> Agenda de sesiones
           </button>
        </div>
      </div>

      {/* Grid de Acciones Principales (Inspirado en tu imagen) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ModuleCard 
          icon={<Bot className="w-10 h-10" />} 
          title="Diseñar agentes de IA" 
          desc="Crea, modifica y administra agentes."
          links={[{label: 'Chatbots', to: '/app/smart-audit'}, {label: 'Callbots', to: '/app/smart-audit'}]}
          color="indigo"
        />
        <ModuleCard 
          icon={<Users className="w-10 h-10" />} 
          title="Atender usuarios" 
          desc="Responde y gestiona conversaciones."
          links={[{label: 'Tickets', to: '/app/crm'}, {label: 'Contactos', to: '/app/crm'}]}
          color="blue"
        />
        <ModuleCard 
          icon={<Bell className="w-10 h-10" />} 
          title="Enviar notificaciones" 
          desc="Gestiona campañas masivas."
          links={[{label: 'Notificator', to: '/app/reports'}]}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Mis Bots */}
        <div className="lg:col-span-2 glass-card p-10 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Mis bots activos</h3>
            <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">Ver más <ArrowRight className="w-3 h-3"/></button>
          </div>
          <div className="space-y-4">
            <BotRow name="Guadalupe 2.0" date="20/01/2026" />
            <BotRow name="RC506 2.0" date="27/08/2025" />
            <BotRow name="Soporte Plataforma" date="17/07/2025" />
          </div>
        </div>

        {/* Ayuda y Recursos */}
        <div className="space-y-8">
           <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden">
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 relative z-10">Webinar Semanal</h3>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-6 relative z-10">Aprende a usar variables en conversaciones</p>
              <button className="bg-white text-indigo-600 action-button relative z-10">Inscribirse ahora</button>
              <Sparkles className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10" />
           </div>
        </div>
      </div>
    </div>
  );
};

const ModuleCard = ({ icon, title, desc, links, color }: any) => (
  <div className="glass-card p-12 flex flex-col items-center text-center group hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 border-b-8 border-b-indigo-500/10">
    <div className={`w-20 h-20 rounded-[2rem] bg-${color}-500/10 flex items-center justify-center text-${color}-600 mb-8 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-3">{title}</h3>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 leading-relaxed px-4">{desc}</p>
    <div className="flex flex-wrap justify-center gap-4">
      {links.map((link: any) => (
        <button key={link.label} className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:underline">{link.label}</button>
      ))}
    </div>
  </div>
);

const BotRow = ({ name, date }: any) => (
  <div className="flex items-center justify-between p-5 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Bot className="w-6 h-6"/></div>
      <div>
        <p className="font-black text-slate-900 uppercase text-xs">{name}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase">Modificado {date}</p>
      </div>
    </div>
    <PlayCircle className="text-slate-300 hover:text-indigo-600 cursor-pointer w-6 h-6 transition-colors" />
  </div>
);
