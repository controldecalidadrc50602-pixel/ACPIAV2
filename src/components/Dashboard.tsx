import React, { useEffect, useState } from 'react';
import { Audit, AuditType, Language, Project } from '../types';
import { getQuickInsight } from '../services/geminiService';
import { getProjects } from '../services/storageService';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line 
} from 'recharts';
import { 
    Zap, TrendingUp, Users, Phone, MessageSquare, Briefcase, 
    Smile, AlertTriangle, Cpu, Layout 
} from 'lucide-react';
import { translations } from '../utils/translations';

interface DashboardProps {
  audits: Audit[];
  lang: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({ audits, lang }) => {
  const t = translations[lang] || translations['es'];
  const [insight, setInsight] = useState<string>(t.generating || 'Generando Inteligencia...');
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadDashboardData = async () => {
        if (audits.length > 0) {
            setInsight(t.generating || 'Generando Inteligencia...');
            const result = await getQuickInsight(audits, lang);
            if (mounted) setInsight(result);
        }
        const projectsData = await getProjects();
        if (mounted) setProjects(projectsData);
    };
    loadDashboardData();
    return () => { mounted = false; };
  }, [audits, lang]); 

  const totalAudits = audits.length;
  
  if (totalAudits === 0) {
      return (
          <div className="max-w-6xl mx-auto py-16 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-16 shadow-2xl text-center relative overflow-hidden group">
                  <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-white shadow-2xl">
                      <Zap className="w-12 h-12" />
                  </div>
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase leading-none">
                      {t.welcomeTitle || 'Consola de Inteligencia'}
                  </h2>
                  <p className="text-slate-500 max-w-2xl mx-auto mb-16 text-xs font-black uppercase tracking-[0.3em]">
                      {t.welcomeDesc || 'Plataforma Zero-Touch para Auditoría de Calidad Masiva'}
                  </p>
              </div>
          </div>
      );
  }

  const voiceAudits = audits.filter(a => a.type === AuditType.VOICE).length;
  const chatAudits = audits.filter(a => a.type === AuditType.CHAT).length;
  const avgCsat = totalAudits > 0 ? (audits.reduce((acc, curr) => acc + curr.csat, 0) / totalAudits).toFixed(1) : '0';

  const sentimentData = [
      { name: 'POS', value: audits.filter(a => a.sentiment === 'POSITIVE').length || 0, color: '#10b981' },
      { name: 'NEU', value: audits.filter(a => !a.sentiment || a.sentiment === 'NEUTRAL').length || 0, color: '#64748b' },
      { name: 'NEG', value: audits.filter(a => a.sentiment === 'NEGATIVE').length || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const projectStats: Record<string, { total: number; count: number }> = audits.reduce((acc: Record<string, { total: number; count: number }>, a) => {
      if(!acc[a.project]) acc[a.project] = { total: 0, count: 0 };
      acc[a.project].total += (a.qualityScore || 0);
      acc[a.project].count++;
      return acc;
  }, {} as Record<string, {total: number, count: number}>);

  const projectData = Object.entries(projectStats).map(([name, stat]) => ({
      name,
      actual: Math.round(stat.total / stat.count),
      target: projects.find(p => p.name === name)?.targets?.score || 90
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-24 animate-fade-in-up">
      <div className="flex-1 space-y-8">
        {/* INSIGHT CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl">
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-xl text-indigo-400 border border-white/10"><Cpu className="w-5 h-5" /></div>
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">ACPIA Intelligence Engine</h2>
                    </div>
                </div>
                <p className="text-2xl font-bold text-white italic tracking-tight leading-relaxed">"{insight}"</p>
            </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <KpiCard label={t.totalAudits || "Total"} val={totalAudits} icon={<TrendingUp className="text-indigo-400" />} />
            <KpiCard label={t.avgCsat || "CSAT"} val={avgCsat} icon={<Users className="text-emerald-400" />} />
            <KpiCard label={t.voice || "Voz"} val={voiceAudits} icon={<Phone className="text-blue-400" />} />
            <KpiCard label={t.chat || "Chat"} val={chatAudits} icon={<MessageSquare className="text-purple-400" />} />
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ChartContainer title={t.projectPerformance || "Desempeño"} icon={<Layout className="text-indigo-500" />}>
                <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={projectData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                            <XAxis type="number" stroke="#64748b" domain={[0, 100]} tick={{fontSize: 10}} />
                            <YAxis dataKey="name" type="category" stroke="#64748b" width={80} tick={{fontSize: 10, fontWeight: 'bold'}} />
                            <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: '#0f172a', color: '#fff' }} />
                            <Bar dataKey="actual" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={18} />
                            <Line dataKey="target" stroke="#f43f5e" strokeWidth={2} dot={{r:3}} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </ChartContainer>

            <ChartContainer title={t.sentimentAnalysis || "Sentimiento"} icon={<Smile className="text-emerald-500" />}>
                <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none">
                                {sentimentData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: '#0f172a', color: '#fff' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </ChartContainer>
        </div>
      </div>

      {/* SIDEBAR DASHBOARD */}
      <div className="w-full lg:w-96 space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden">
              <div className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-sm">{t.earlyWarning || "Alertas"}</h3>
              </div>
              <div className="p-6">
                   <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Operativo</p>
                      <p className="text-slate-900 dark:text-white font-bold italic">Flujo de Calidad Estable</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

const KpiCard = ({ label, val, icon }: any) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">{icon}</div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">{val}</h3>
    </div>
);

const ChartContainer = ({ title, icon, children }: any) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
        <div className="flex items-center gap-4 mb-8">
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">{icon}</div>
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-sm">{title}</h3>
        </div>
        {children}
    </div>
);
