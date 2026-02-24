import React, { useState, useEffect } from 'react';
import { AuditType, Perception, Language, Agent, Project, RubricItem, Audit, VoiceAudit, ChatAudit } from '../types';
import { getAgents, getProjects, getRubric } from '../services/storageService';
import { Button } from './ui/Button';
import { Save, Sparkles, Bot, Phone, MessageSquare, ArrowLeft, Zap, CheckCircle, Calendar, Clock, Timer, CheckSquare, Briefcase, Hash } from 'lucide-react';
import { translations } from '../utils/translations';
import { generateAuditFeedback } from '../services/geminiService';
import { toast } from 'react-hot-toast';

interface AuditFormProps {
  onSave: (audit: any) => void;
  lang: Language;
  initialData?: Audit | null;
}

export const AuditForm: React.FC<AuditFormProps> = ({ onSave, lang, initialData }) => {
  const t = translations[lang] || translations['es'];
  const [step, setStep] = useState<'selection' | 'form'>(initialData ? 'form' : 'selection');
  const [type, setType] = useState<AuditType>(initialData?.type || AuditType.VOICE);
  
  const [storedAgents, setStoredAgents] = useState<Agent[]>([]);
  const [storedProjects, setStoredProjects] = useState<Project[]>([]);
  const [allRubric, setAllRubric] = useState<RubricItem[]>([]);
  const [filteredRubric, setFilteredRubric] = useState<RubricItem[]>([]);
  
  const [agentName, setAgentName] = useState('');
  const [project, setProject] = useState('');
  const [notes, setNotes] = useState('');
  const [aiNotes, setAiNotes] = useState('');
  const [customAnswers, setCustomAnswers] = useState<Record<string, boolean>>({});
  const [perception, setPerception] = useState<Perception>(Perception.OPTIMAL);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [ticketId, setTicketId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [duration, setDuration] = useState('0'); 
  const [initialResponse, setInitialResponse] = useState('00:00'); 
  const [resolutionTime, setResolutionTime] = useState('00:00'); 
  const [chatTime, setChatTime] = useState('00:00'); 
  const [responseUnder5, setResponseUnder5] = useState(true); 

  // --- CARGA ASÍNCRONA CORREGIDA ---
  useEffect(() => {
    if (step === 'form') {
        const loadInitialData = async () => {
            const [dAgents, dProjects, dRubric] = await Promise.all([
                getAgents(),
                getProjects(),
                getRubric()
            ]);
            
            setStoredAgents(dAgents);
            setStoredProjects(dProjects);
            setAllRubric(dRubric);
            
            if (initialData) {
                loadFromData(initialData);
            } else if (!ticketId) {
                setTicketId(`QA-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`);
            }
        };
        loadInitialData();
    }
  }, [step, initialData]);

  useEffect(() => {
    if (allRubric.length === 0) return;
    let indicators = allRubric.filter(r => r.isActive && (r.type === 'BOTH' || r.type === type));
    if (project) {
        const selectedProj = storedProjects.find(p => p.name === project);
        if (selectedProj && selectedProj.rubricIds && selectedProj.rubricIds.length > 0) {
            indicators = indicators.filter(r => selectedProj.rubricIds!.includes(r.id));
        }
    }
    setFilteredRubric(indicators);
  }, [project, type, allRubric, storedProjects]);

  const loadFromData = (data: any) => {
    setAgentName(data.agentName || '');
    setProject(data.project || '');
    setNotes(data.notes || '');
    setAiNotes(data.aiNotes || '');
    setCustomAnswers(data.customData || {});
    setPerception(data.perception || Perception.OPTIMAL);
    setDate(data.date || new Date().toISOString().split('T')[0]);
    setTicketId(data.readableId || data.id);
    if(data.type === AuditType.VOICE) setDuration((data as VoiceAudit).duration?.toString() || '0');
    else {
        setChatTime((data as ChatAudit).chatTime || '00:00');
        setInitialResponse((data as ChatAudit).initialResponseTime || '00:00');
        setResolutionTime((data as ChatAudit).resolutionTime || '00:00');
        setResponseUnder5((data as ChatAudit).responseUnder5Min);
    }
  };

  const calculateScore = () => {
    if (filteredRubric.length === 0) return 0;
    let trues = 0;
    filteredRubric.forEach(q => { if(customAnswers[q.id]) trues++; });
    return Math.round((trues / filteredRubric.length) * 100);
  };

  useEffect(() => {
    const score = calculateScore();
    if (score === 100) setPerception(Perception.OPTIMAL);
    else if (score >= 75) setPerception(Perception.ACCEPTABLE);
    else setPerception(Perception.POOR);
  }, [customAnswers, filteredRubric]);

  const handleSave = () => {
    if(!agentName || !project || !ticketId) { 
        toast.error(lang === 'es' ? "Complete agente, proyecto e ID de Ticket" : "Complete agent, project and Ticket ID"); 
        return; 
    }
    
    const baseAudit = {
        agentName, project, perception, qualityScore: calculateScore(),
        date, type, customData: customAnswers, notes, aiNotes, readableId: ticketId,
        id: initialData?.id || Date.now().toString(),
        csat: perception === Perception.OPTIMAL ? 5 : perception === Perception.ACCEPTABLE ? 4 : 2,
        status: initialData?.status || 'PENDING_REVIEW'
    };

    let finalAudit;
    if (type === AuditType.VOICE) {
        finalAudit = { ...baseAudit, duration: parseFloat(duration) } as VoiceAudit;
    } else {
        finalAudit = { ...baseAudit, chatTime, initialResponseTime: initialResponse, resolutionTime, responseUnder5Min: responseUnder5 } as ChatAudit;
    }

    onSave(finalAudit);
  };

  if (step === 'selection') {
      return (
          <div className="max-w-4xl mx-auto space-y-10 animate-fade-in py-10">
              <div className="text-center space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Tipo de Interacción</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ChannelCard icon={<Phone className="w-12 h-12" />} label={t.voice} onClick={() => { setType(AuditType.VOICE); setStep('form'); }} color="indigo" />
                  <ChannelCard icon={<MessageSquare className="w-12 h-12" />} label={t.chat} onClick={() => { setType(AuditType.CHAT); setStep('form'); }} color="purple" />
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto pb-32 animate-fade-in-up">
      {/* El resto de tu renderizado de formulario se mantiene igual */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden">
        {/* ... Resto del JSX del formulario ... */}
      </div>
    </div>
  );
};

const ChannelCard: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, color: string }> = ({ icon, label, onClick, color }) => (
    <button onClick={onClick} className={`p-12 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center gap-8 group hover:border-${color}-500 transition-all hover:shadow-2xl`}>
        <div className={`w-28 h-28 rounded-[2rem] bg-${color}-500/10 flex items-center justify-center text-${color}-500 group-hover:scale-110 transition-transform duration-500`}>{icon}</div>
        <span className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{label}</span>
    </button>
);
