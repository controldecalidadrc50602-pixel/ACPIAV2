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

        const hasFullAccess = 
            currentUser.role === UserRole.ADMIN || 
            currentUser.subscriptionTier === SubscriptionTier.ENTERPRISE ||
            currentUser.organizationId === 'acpia-pilot';

        if (!hasFullAccess) {
            const usage = getUsageStats();
            const isAllowed = await checkUsageLimit(currentUser.id, usage.aiAuditsCount);
            if (!isAllowed) {
                toast.error("Límite de plan alcanzado. Actualiza para continuar.");
                return;
            }
        }

        setIsAnalyzing(true);
        setSecReport(null);

        try {
            let decodedContent = "";

            if (mode === 'audio') {
                if (!audioFile) return;
                toast.loading("👂 Transcribiendo Audio...", { id: 'transcribe' });
                const transcript = await transcribeAudio(audioFile);
                toast.dismiss('transcribe');
                decodedContent = await redactPII(transcript);
            } else {
                const binaryString = atob(rawContent);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                decodedContent = new TextDecoder().decode(bytes);
            }

            const securityCheck = interceptAndValidate(decodedContent);
            if (securityCheck.isBlocked) {
                setSecReport(securityCheck);
                setStep('security_blocked');
                return;
            }

            toast.loading("🧠 Analizando con IA...", { id: 'analyze' });
            const analysis = await analyzeFullAudit(decodedContent);
            toast.dismiss('analyze');

            setResult({
                score: analysis.score,
                csat: Math.ceil(analysis.score / 20),
                notes: analysis.notes,
                sentiment: analysis.sentiment as Sentiment,
                customData: {},
                interactionType: 'EXTERNAL',
                participants: []
            });
            setStep('results');
            
        } catch (err) {
            console.error(err);
            toast.error("Error en la Inferencia Neuronal");
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
        setStep('selection');
    };

    const getSentimentIcon = (sentiment: any) => {
        const s = String(sentiment).toUpperCase();
        if (s.includes('POS')) return <Smile className="text-emerald-500" />;
        if (s.includes('NEG')) return <Frown className="text-red-500" />;
        return <Meh className="text-slate-400" />;
    };

    if (step === 'security_blocked') {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center bg-red-950/20 border-2 border-red-500/30 rounded-[3rem] p-12">
                <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h2 className="text-3xl font-black text-white uppercase mb-4">Seguridad Bloqueada</h2>
                <p className="text-slate-400 mb-8">El contenido infringe las políticas de seguridad.</p>
                <Button onClick={() => setStep('selection')}>Cerrar</Button>
            </div>
        );
    }

    if (step === 'selection') {
        return (
            <div className="max-w-4xl mx-auto space-y-10 py-10">
                <div className="text-center space-y-3">
                    <Sparkles className="w-12 h-12 text-indigo-500 mx-auto animate-pulse" />
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Inferencia de Calidad</h2>
                    <p className="text-slate-500 font-medium italic">Seleccione el canal de entrada para la IA.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SelectionCard icon={<Mic className="w-10 h-10" />} title="Voz" desc="Auditoría de Audio" onClick={() => { setMode('audio'); setStep('upload'); }} color="indigo" />
                    <SelectionCard icon={<MessageSquare className="w-10 h-10" />} title="Chat" desc="Auditoría de Texto" onClick={() => { setMode('text'); setStep('upload'); }} color="purple" />
                </div>
            </div>
        );
    }

    if (step === 'upload') {
        return (
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3.5rem] p-10 shadow-2xl">
                    <div className="flex items-center gap-4 mb-10">
                        <button onClick={() => setStep('selection')} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:scale-110 transition-transform"><ArrowLeft className="w-5 h-5" /></button>
                        <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white italic">Carga de Datos</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <select value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl font-bold dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none transition-all">
                            <option value="">-- Agente --</option>
                            {agents.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                        </select>
                        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl font-bold dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none transition-all">
                            <option value="">-- Proyecto --</option>
                            {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                        </select>
                        <input type="text" value={interactionId} onChange={e => setInteractionId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl font-bold dark:text-white border-2 border-transparent focus:border-indigo-500 outline-none transition-all" placeholder="ID de Ticket" />
                    </div>

                    {!isAnalyzing ? (
                        <div className="space-y-8">
                            <div onClick={() => fileInputRef.current?.click()} className={`border-4 border-dashed rounded-[3rem] p-20 flex flex-col items-center justify-center cursor-pointer transition-all ${rawContent ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500'}`}>
                                {rawContent ? <CheckCircle className="w-16 h-16 text-emerald-500" /> : <Upload className="w-16 h-16 text-slate-400" />}
                                <p className="mt-4 font-black text-slate-500 uppercase text-xs tracking-widest">{rawContent ? 'Archivo Listo' : 'Subir Archivo'}</p>
                                <input type="file" ref={fileInputRef} className="hidden" accept={mode === 'audio' ? "audio/*" : ".txt"} onChange={handleFileChange} />
                            </div>
                            <Button onClick={runSecurityAnalysis} disabled={!rawContent || !selectedAgent || !selectedProject} className="w-full h-20 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-2xl">
                                Iniciar Inteligencia
                            </Button>
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center animate-pulse"><Bot className="w-20 h-20 text-indigo-500 animate-bounce" /><p className="font-black uppercase tracking-widest mt-6 dark:text-white">Procesando Inferencia...</p></div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-32 space-y-8 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3.5rem] shadow-2xl overflow-hidden">
                <div className="p-8 border-b bg-slate-50 dark:bg-slate-850 flex justify-between items-center">
                    <h2 className="text-2xl font-black uppercase tracking-tighter dark:text-white italic flex items-center gap-3"><Sparkles className="w-7 h-7 text-indigo-500" /> Resultados IA</h2>
                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={() => setStep('upload')} className="rounded-xl px-6 font-black uppercase text-[10px]">Reintentar</Button>
                        <Button onClick={handleSave} className="rounded-xl px-10 font-black uppercase text-[10px] shadow-lg shadow-indigo-600/30">Confirmar Registro</Button>
                    </div>
                </div>

                <div className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-center border-b-4 border-indigo-500 shadow-xl">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block">Calidad Final</span>
                            <div className="text-6xl font-black text-white italic">{result?.score}%</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-850 p-8 rounded-[2.5rem] text-center flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sentimiento</span>
                             {getSentimentIcon(result?.sentiment)}
                             <p className="font-black mt-2 dark:text-white uppercase text-xs">{result?.sentiment}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-850 p-8 rounded-[2.5rem] text-center border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">CSAT Estimado</span>
                            <div className="flex justify-center gap-1">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-4 h-4 ${i <= (result?.csat || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} />)}
                            </div>
                        </div>
                        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-center shadow-lg shadow-indigo-600/20">
                             <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-3 block">Estado</span>
                             <div className="font-black text-white text-xl uppercase tracking-tighter italic">Analizado</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-3"><Bot className="w-5 h-5" /> Razonamiento de la IA</h3>
                            <div className="bg-white dark:bg-slate-850 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-inner min-h-[300px]">
                                <ReactMarkdown className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
                                    {String(result?.notes || "No se generó informe.")}
                                </ReactMarkdown>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-indigo-500" /> Seguridad</h3>
                            <div className="p-8 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-[2.5rem] flex flex-col items-center text-center">
                                <ShieldCheck className="w-12 h-12 text-emerald-500 mb-4" />
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Protección PII</p>
                                <p className="font-bold text-slate-600 dark:text-slate-400 text-xs uppercase">Datos Anonimizados</p>
                            </div>
                            <div className="p-8 bg-indigo-500/5 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] text-center">
                                <Clock className="w-8 h-8 text-indigo-500 mx-auto mb-4" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duración Análisis</p>
                                <p className="font-black dark:text-white uppercase italic text-sm">Real-Time</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
