import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import {
    Upload, CheckCircle, Save,
    Smile, Meh, Frown, Sparkles, Mic, MessageSquare, Bot, Star, ShieldAlert, Share2, ArrowLeft, ShieldCheck,
    Clock, Users, XCircle
} from 'lucide-react';
import { Language, Agent, Project, AuditType, SmartAnalysisResult, RubricItem, Sentiment, SecurityReport, AuditStatus, SubscriptionTier, UserRole } from '../types';
import { translations } from '../utils/translations';
import { getAgents, getProjects, getRubric, logSecurityEvent } from '../services/storageService';
import { interceptAndValidate } from '../services/securityService';
import { analyzeFullAudit, transcribeAudio, redactPII } from '../services/aiService';
import { checkUsageLimit } from '../services/subscriptionService';
import { generateAuditPDF } from '../services/pdfService';
import { useAuth } from '../context/AuthContext';
import { getUsageStats } from '../services/storageService';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const SelectionCard = ({ icon, title, desc, onClick, color }: any) => (
    <button onClick={onClick} className={`p-12 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center text-center gap-6 group hover:border-${color}-500 transition-all hover:shadow-2xl hover:-translate-y-2`}>
        <div className={`w-24 h-24 rounded-[2rem] bg-${color}-500/10 flex items-center justify-center text-${color}-500 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>{icon}</div>
        <div>
            <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{title}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">{desc}</p>
        </div>
    </button>
);

interface SmartAuditProps {
    lang: Language;
    onSave: (audit: any) => void;
}

export const SmartAudit: React.FC<SmartAuditProps> = ({ lang, onSave }) => {
    const t = translations[lang] || translations['es'];
    const [step, setStep] = useState<'selection' | 'upload' | 'results' | 'security_blocked'>('selection');
    const [mode, setMode] = useState<'audio' | 'text'>('audio');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<SmartAnalysisResult | null>(null);
    const [secReport, setSecReport] = useState<SecurityReport | null>(null);

    const [rawContent, setRawContent] = useState<string>("");
    const [audioFile, setAudioFile] = useState<File | null>(null);

    const [agents, setAgents] = useState<Agent[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [rubric, setRubric] = useState<RubricItem[]>([]);

    const { currentUser } = useAuth();

    const [selectedAgent, setSelectedAgent] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [interactionId, setInteractionId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setAgents(getAgents());
        setProjects(getProjects());
        setRubric(getRubric());
    }, []);

    const clearSession = () => {
        setRawContent("");
        setAudioFile(null);
        setSecReport(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!selectedAgent || !selectedProject) {
            toast.error(lang === 'es' ? "Seleccione Agente y Proyecto primero" : "Select Agent and Project first");
            clearSession();
            return;
        }

        if (mode === 'audio') {
            setAudioFile(file);
            setRawContent("[Audio Loaded - Ready for Intelligence]");
            toast.success("Audio cargado");
        } else {
            const reader = new FileReader();
            reader.onloadend = () => {
                const data = (reader.result as string).split(',')[1];
                setRawContent(data); 
                toast.success(lang === 'es' ? "Archivo cargado" : "File loaded");
            };
            reader.readAsDataURL(file);
        }
    };

    const runSecurityAnalysis = async () => {
        if (!rawContent || !currentUser) return;

        // --- BYPASS DE SUSCRIPCIÓN MAESTRO ---
        const hasFullAccess = 
            currentUser.role === UserRole.ADMIN || 
            currentUser.subscriptionTier === SubscriptionTier.ENTERPRISE ||
            currentUser.organizationId === 'acpia-pilot' ||
            currentUser.subscriptionTier === 'PRO';

        if (!hasFullAccess) {
            const usage = getUsageStats();
            const isAllowed = await checkUsageLimit(currentUser.id, usage.aiAuditsCount);
            if (!isAllowed) {
                toast.error(lang === 'es' ? "Límite de plan alcanzado. Actualiza para continuar." : "Plan limit reached. Upgrade to continue.");
                return;
            }
        }
        // --- FIN BYPASS ---

        setIsAnalyzing(true);
        setSecReport(null);

        const currentProj = projects.find(p => p.name === selectedProject);
        let rubricToAnalyze = rubric.filter(r => r.isActive && (r.type === 'BOTH' || r.type === (mode === 'audio' ? 'VOICE' : 'CHAT')));

        if (currentProj && currentProj.rubricIds && currentProj.rubricIds.length > 0) {
            rubricToAnalyze = rubricToAnalyze.filter(r => currentProj.rubricIds!.includes(r.id));
        }

        try {
            let decodedContent = "";

            if (mode === 'audio') {
                if (!audioFile) return;

                toast.loading("👂 Transcribiendo Audio (Groq Whisper)...", { id: 'transcribe' });
                const transcript = await transcribeAudio(audioFile);
                toast.dismiss('transcribe');

                if (transcript.startsWith("Error")) {
                    toast.error(transcript);
                    return;
                }

                toast.loading("🛡️ Anonimizando Datos (ISO 42001)...", { id: 'redact' });
                decodedContent = await redactPII(transcript);
                logSecurityEvent(currentUser?.id || 'unknown', 'PII_REDACTION', `Redacted PII from audio: ${audioFile.name}`, 'INFO');
                toast.dismiss('redact');

                setRawContent(btoa(decodedContent)); 

            } else {
                const binaryString = atob(rawContent);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                decodedContent = new TextDecoder().decode(bytes);
            }

            const securityCheck = interceptAndValidate(decodedContent);
            setSecReport(securityCheck);

            if (securityCheck.isBlocked) {
                logSecurityEvent(currentUser?.id || 'unknown', 'SECURITY_BLOCK', `Blocked content: ${securityCheck.reason}`, 'WARNING');
                setStep('security_blocked');
                setIsAnalyzing(false);
                return;
            }

            toast.loading("🧠 Analizando Calidad...", { id: 'analyze' });
            const analysis = await analyzeFullAudit(decodedContent);
            toast.dismiss('analyze');

            const aiResult: SmartAnalysisResult = {
                score: analysis.score,
                csat: Math.ceil(analysis.score / 20),
                notes: analysis.notes,
                sentiment: analysis.sentiment as Sentiment,
                customData: {},
                interactionType: 'EXTERNAL',
                participants: []
            };

            setResult(aiResult);
            setStep('results');
            logSecurityEvent(currentUser.id, 'AUDIT_SUCCESS', `AI Analysis completed for ${interactionId}`, 'INFO');
            toast.success(lang === 'es' ? "Inferencia completa" : "Inference complete");
            
        } catch (err) {
            console.error(err);
            toast.error(lang === 'es' ? "Error Neuronal" : "Neural Error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = () => {
        if (!result || !selectedAgent || !selectedProject) return;
        onSave({
            id: Date.now().toString(),
            type: mode === 'audio' ? AuditType.VOICE : AuditType.CHAT,
            agentName: selectedAgent,
            project: selectedProject,
            readableId: interactionId || `SM-${Date.now()}`,
            date,
            csat: result.csat ?? 3,
            qualityScore: result.score ?? 0,
            aiNotes: result.notes ?? "",
            customData: result.customData ?? {},
            sentiment: result.sentiment || 'NEUTRAL',
            isAiGenerated: true,
            status: 'PENDING_REVIEW'
        });
        clearSession();
        setStep('selection');
    };

    const getSentimentIcon = (sentiment: any) => {
        const s = typeof sentiment === 'string' ? sentiment.toUpperCase() : 'NEUTRAL';
        if (s.includes('POS')) return <Smile className="text-emerald-500" />;
        if (s.includes('NEG')) return <Frown className="text-red-500" />;
        return <Meh className="text-slate-400" />;
    };

    if (step === 'security_blocked') {
        return (
            <div className="max-w-2xl mx-auto py-20 animate-fade-in text-center bg-red-950/20 border-2 border-red-500/30 rounded-[3rem] p-12">
                <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h2 className="text-3xl font-black text-white uppercase mb-4">{t.securityAlert}</h2>
                <p className="text-slate-400 mb-8">{t.securityBlockedDesc}</p>
                {secReport && <p className="text-red-400 font-bold mb-4 uppercase text-xs tracking-widest border border-red-500/50 p-2 rounded-lg">{secReport.reason}</p>}
                <Button onClick={() => setStep('selection')}>{t.close}</Button>
            </div>
        );
    }

    if (step === 'selection') {
        return (
            <div className="max-w-4xl mx-auto space-y-10 animate-fade-in py-10">
                <div className="text-center space-y-3">
                    <div className="inline-flex p-4 bg-indigo-600/10 rounded-3xl mb-4 border border-indigo-500/20">
                        <Sparkles className="w-10 h-10 text-indigo-500 animate-pulse" />
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Inferencia de Calidad</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium">Análisis basado en sentimientos, roles y rúbricas reales.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SelectionCard icon={<Mic className="w-10 h-10" />} title={t.voice} desc="Auditoría de Voz con Inferencia de Roles" onClick={() => { setMode('audio'); setStep('upload'); }} color="indigo" />
                    <SelectionCard icon={<MessageSquare className="w-10 h-10" />} title={t.chat} desc="Auditoría de Chats y Transcripciones" onClick={() => { setMode('text'); setStep('upload'); }} color="purple" />
                </div>
            </div>
        );
    }

    if (step === 'upload') {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-20">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden">
                    <div className="p-8 border-b bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setStep('selection')} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all">
                                <ArrowLeft className="w-5 h-5 text-slate-500" />
                            </button>
                            <div>
                                <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tighter">Entrada de Datos</h2>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Motor ACPIA</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-10 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Agente</label>
                                <select value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl font-bold dark:text-white outline-none">
                                    <option value="">-- Seleccionar --</option>
                                    {agents.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Proyecto</label>
                                <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl font-bold dark:text-white outline-none">
                                    <option value="">-- Seleccionar --</option>
                                    {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Ticket ID</label>
                                <input type="text" value={interactionId} onChange={e => setInteractionId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border
