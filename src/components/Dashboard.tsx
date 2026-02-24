import React, { useEffect, useState } from 'react';
import { Audit, AuditType, Language, AgentTrend, Project } from '../types';
import { getQuickInsight } from '../services/geminiService';
import { getProjects } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart, Legend } from 'recharts';
import { Zap, TrendingUp, Users, Phone, MessageSquare, Briefcase, Calendar, CheckCircle, ArrowRight, Smile, Frown, Meh, AlertTriangle, TrendingDown, Star, Layout, ShieldCheck, Cpu } from 'lucide-react';
import { translations } from '../utils/translations';

interface DashboardProps {
  audits: Audit[];
  lang: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({ audits, lang }) => {
  const t = translations[lang] || translations['es'];
  const [insight, setInsight] = useState<string>(t.generating || 'Generando Inteligencia...');
  const [projects, setProjects] = useState<Project[]>([]);

  // --- CARGA ASÍNCRONA CORREGIDA ---
  useEffect(() => {
    let mounted = true;
    
    const loadDashboardData = async () => {
        // 1. Cargar Insight de IA
        if (audits.length > 0) {
            setInsight(t.generating || 'Generando Inteligencia...');
            const result = await getQuickInsight(audits, lang);
            if (mounted) setInsight(result);
        }
        
        // 2. Cargar Proyectos (Async)
        const projectsData = await getProjects();
        if (mounted) setProjects(projectsData);
    };

    loadDashboardData();
    return () => { mounted = false; };
  }, [audits, lang]); 

  const totalAudits = audits.length;
  
  if (totalAudits === 0) {
      // Tu renderizado de bienvenida se mantiene igual...
  }

  // Cálculos de métricas (Iguales a los tuyos)
  const voiceAudits = audits.filter(a => a.type === AuditType.VOICE).length;
  const chatAudits = audits.filter(a => a.type === AuditType.CHAT).length;
  const avgCsat = totalAudits > 0 ? (audits.reduce((acc, curr) => acc + curr.csat, 0) / totalAudits).toFixed(1) : '0';

  const sentimentData = [
      { name: 'POS', value: audits.filter(a => a.sentiment === 'POSITIVE').length || 0, color: '#10b981' },
      { name: 'NEU', value: audits.filter(a => !a.sentiment || a.sentiment === 'NEUTRAL').length || 0, color: '#64748b' },<br>      { name: 'NEG', value: audits.filter(a => a.sentiment === 'NEGATIVE').length || 0, color: '#ef4444' },<br>  ].filter(d => d.value > 0);<br><br>  // Fix: Explicitly type reduced object<br>  const projectStats: Record<string, { total: number; count: number }> = audits.reduce((acc: Record<string, { total: number; count: number }>, a) => {<br>      if(!acc[a.project]) acc[a.project] = { total: 0, count: 0 };<br>      acc[a.project].total += (a.qualityScore || 0);<br>      acc[a.project].count++;<br>      return acc;<br>  }, {} as Record<string, {total: number, count: number}>);<br><br>  const projectData = Object.entries(projectStats).map(([name, stat]) => ({<br>      name,<br>      actual: Math.round(stat.total / stat.count),<br>      target: projects.find(p => p.name === name)?.targets?.score || 90<br>  }));<br><br>  return (<br>    <div className="flex flex-col lg:flex-row gap-8 pb-24 animate-fade-in-up"><br>      {/* ... Resto del JSX del Dashboard ... */}<br>    </div><br>  );<br>};
