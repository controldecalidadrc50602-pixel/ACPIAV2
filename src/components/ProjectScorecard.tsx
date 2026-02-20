import React, { useState, useEffect } from 'react';
import { Audit, Language, RubricItem, AuditType, Project } from '../types';
import { translations } from '../utils/translations';
import { getProjects } from '../services/storageService';
import { generatePerformanceAnalysis } from '../services/geminiService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Briefcase, Target, TrendingUp, AlertTriangle, Users, ArrowLeft, Phone, MessageSquare, BarChart2, Zap } from 'lucide-react';
import { Button } from './ui/Button';

interface ProjectScorecardProps {
    projectName: string;
    audits: Audit[];
    rubric: RubricItem[];
    lang: Language;
    onBack: () => void;
}

export const ProjectScorecard: React.FC<ProjectScorecardProps> = ({ projectName, audits, rubric, lang, onBack }) => {
    const t = translations[lang] || translations['es'];
    const projectAudits = audits.filter(a => a.project === projectName);
    
    // --- CORRECCIÓN DE ESTADO PARA PROYECTOS ---
    const [currentProjectConfig, setCurrentProjectConfig] = useState<Project | null>(null);
    const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState('');

    useEffect(() => {
        const loadProjectConfig = async () => {
            const allProjects = await getProjects(); // Resolvemos la promesa
            const config = allProjects.find((p: Project) => p.name === projectName);
            if (config) setCurrentProjectConfig(config);
        };
        loadProjectConfig();
    }, [projectName]);

    // Stats
    const totalAudits = projectAudits.length;
    const avgScore = totalAudits > 0 ? Math.round(projectAudits.reduce((a,b) => a + (b.qualityScore || 0), 0) / totalAudits) : 0;
    const avgCsat = totalAudits > 0 ? (projectAudits.reduce((a,b) => a + b.csat, 0) / totalAudits).toFixed(1) : "0.0";
    
    // Channel Stats
    const voiceAudits = projectAudits.filter(a => a.type === AuditType.VOICE);
    const chatAudits = projectAudits.filter(a => a.type === AuditType.CHAT);
    const voiceAvg = voiceAudits.length > 0 ? Math.round(voiceAudits.reduce((a,b) => a + (b.qualityScore || 0), 0) / voiceAudits.length) : 0;
    const chatAvg = chatAudits.length > 0 ? Math.round(chatAudits.reduce((a,b) => a + (b.qualityScore || 0), 0) / chatAudits.length) : 0;

    // Targets (Usando el estado cargado)
    const targetScore = currentProjectConfig?.targets?.score || 90;
    const targetCsat = currentProjectConfig?.targets?.csat || 4.5;

    // Weakness Analysis
    const failures: Record<string, number> = {};
    projectAudits.forEach(a => {
        if(a.customData) {
            Object.entries(a.customData).forEach(([key, val]) => {
                if(val === false) failures[key] = (failures[key] || 0) + 1;
            });
        }
    });

    const rubricStats = rubric.map(item => {
        let total = 0;
        let pass = 0;
        projectAudits.forEach(a => {
            if(a.customData && a.customData[item.id] !== undefined) {
                total++;
                if(a.customData[item.id]) pass++;
            }
        });
        return {
            ...item,
            avg: total > 0 ? Math.round((pass / total) * 100) : 0,
            count: total
        };
    }).filter(i => i.count > 0).sort((a,b) => a.avg - b.avg);

    const topWeaknesses = Object.entries(failures)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, count]) => {
            const rItem = rubric.find(r => r.id === id);
            return {
                name: rItem ? (t[rItem.id] || rItem.label) : id,
                count,
                percentage: Math.round((count / totalAudits) * 100)
            };
        });

    // Radar Data
    const categories = Array.from(new Set(rubric.map(r => r.category))) as string[];
    const radarData = categories.map(cat => {
        const catItems = rubric.filter(r => r.category === cat);
        const catItemIds = catItems.map(r => r.id);
        
        let projPass = 0;
        let projTotal = 0;
        projectAudits.forEach(a => {
            if(a.customData) {
                catItemIds.forEach(id => {
                    if(a.customData![id] !== undefined) {
                        projTotal++;
                        if(a.customData![id]) projPass++;
                    }
                });
            }
        });
        
        let compPass = 0;
        let compTotal = 0;
        audits.forEach(a => {
             if(a.customData) {
                catItemIds.forEach(id => {
                    if(a.customData![id] !== undefined) {
                        compTotal++;
                        if(a.customData![id]) compPass++;
                    }
                });
            }
        });

        return {
            subject: cat.toUpperCase(),
            A: projTotal > 0 ? Math.round((projPass / projTotal) * 100) : 0,
            B: compTotal > 0 ? Math.round((compPass / compTotal) * 100) : 0,
            fullMark: 100
        };
    });

    // Agent Ranking
    const agentScores: Record<string, { total: number; count: number }> = {};
    projectAudits.forEach(a => {
        if (!agentScores[a.agentName]) agentScores[a.agentName] = { total: 0, count: 0 };
        agentScores[a.agentName].total += (a.qualityScore || 0);
        agentScores[a.agentName].count++;
    });
    
    const topAgents = Object.entries(agentScores)
        .map(([name, data]) => ({ name, score: Math.round(data.total / data.count) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    const handleGenerateAnalysis = async () => {
        setIsGeneratingAnalysis(true);
        const stats = {
            avgScore,
            avgCsat,
            totalAudits,
            voiceAvg,
            voiceCount: voiceAudits.length,
            chatAvg,
            chatCount: chatAudits.length,
            topWeakness: rubricStats[0]?.label
        };
        const analysis = await generatePerformanceAnalysis(projectName, 'PROJECT', stats, lang);
        setAiAnalysis(analysis);
        setIsGeneratingAnalysis(false);
    };

    const getProgressColor = (score: number) => {
        if(score >= 90) return 'bg-green-500';
        if(score >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-6">
                <Button onClick={onBack} variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4"/>}>Back</Button>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tighter">
                    <Briefcase className="w-8 h-8 text-indigo-600" />
                    {projectName}
                </h1>
            </div>

            {/* AI INSIGHTS CARD */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                    <h3 className="font-black flex items-center gap-3 text-lg uppercase tracking-widest text-indigo-400">
                        <Zap className="w-6 h-6 animate-pulse" />
                        AI Performance Insight
                    </h3>
                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 text-sm leading-relaxed min-h-[80px] border border-white/10 font-medium italic">
                         {aiAnalysis || (isGeneratingAnalysis ? "Analizando métricas..." : "Pendiente de análisis inteligente...")}
                    </div>
                    {!aiAnalysis && (
                        <Button onClick={handleGenerateAnalysis} disabled={isGeneratingAnalysis} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-8 h-12 font-black uppercase text-[10px] tracking-widest">
                            {isGeneratingAnalysis ? "Generando..." : "Ejecutar Diagnóstico IA"}
                        </Button>
                    )}
                </div>
                <TrendingUp className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <KpiCard label="Auditorías" value={totalAudits} color="slate" />
                 <KpiCard 
                    label="Score Calidad" 
                    value={`${avgScore}%`} 
                    color={avgScore >= targetScore ? "emerald" : "red"} 
                    target={`Meta: ${targetScore}%`}
                 />
                 <KpiCard 
                    label="CSAT" 
                    value={avgCsat} 
                    color={parseFloat(avgCsat) >= targetCsat ? "emerald" : "orange"} 
                    target={`Meta: ${targetCsat}`}
                 />
                 <KpiCard label="Agentes" value={Object.keys(agentScores).length} color="indigo" />
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rubric Progress */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-1">
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
                        <BarChart2 className="w-5 h-5 text-indigo-500" /> Detalle de Rúbrica
                    </h3>
                     <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                            {rubricStats.map((item, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                                        <span>{t[item.id] || item.label}</span>
                                        <span className={item.avg >= 90 ? 'text-emerald-500' : 'text-orange-500'}>{item.avg}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(item.avg)}`} style={{ width: `${item.avg}%` }} />
                                    </div>
                                </div>
                            ))}
                     </div>
                </div>

                {/* Radar Chart */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-1">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-3">
                        <Target className="w-5 h-5 text-purple-500" /> Comparativa vs Equipo
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }} />
                                <Radar name="Proyecto" dataKey="A" stroke="#4f46e5" strokeWidth={3} fill="#4f46e5" fillOpacity={0.6} />
                                <Radar name="Promedio" dataKey="B" stroke="#94a3b8" strokeWidth={1} fill="#94a3b8" fillOpacity={0.1} />
                                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weaknesses & Top Agents */}
                <div className="space-y-8 lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-red-500 mb-6 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5" /> Puntos Críticos
                        </h3>
                        <div className="space-y-3">
                            {topWeaknesses.map((w, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                                    <span className="text-[10px] font-black uppercase text-red-700 dark:text-red-400">{w.name}</span>
                                    <span className="text-xs font-black text-red-600">{w.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 mb-6 flex items-center gap-3">
                            <Users className="w-5 h-5" /> Top Performers
                        </h3>
                        <div className="space-y-4">
                            {topAgents.map((agent, i) => (
                                <div key={i} className="flex items-center justify-between">
                                     <span className="text-xs font-black text-slate-700 dark:text-white uppercase">{agent.name}</span>
                                     <span className="text-xs font-black text-emerald-500 italic">{agent.score}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KpiCard = ({ label, value, color, target }: any) => (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
        <div className={`absolute top-0 left-0 w-full h-1 bg-${color}-500`}></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</p>
        <div className="flex items-baseline gap-3">
            <h4 className={`text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white`}>{value}</h4>
            {target && <span className="text-[9px] font-bold text-slate-400 uppercase">{target}</span>}
        </div>
    </div>
);
