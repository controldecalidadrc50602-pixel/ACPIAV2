import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Sparkles, CheckCircle, BarChart, Lock, ArrowRight, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
    const { companyName } = useApp();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white">
            {/* Header */}
            <header className="fixed w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-indigo-100 dark:border-indigo-900/30">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase">{companyName}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/login" className="hidden md:block font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase text-xs tracking-widest">Login</Link>
                        <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-bold uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 flex items-center gap-2">
                            Comenzar <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 relative overflow-hidden">
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-bold text-xs uppercase tracking-widest mb-8 border border-indigo-100 dark:border-indigo-800 animate-fade-in-up">
                        <Sparkles className="w-4 h-4" /> Nuevo: Auditoría por Voz con IA de Baja Latencia
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 dark:from-white dark:via-indigo-400 dark:to-white">
                        Calidad Automatizada <br /> para Call Centers Modernos.
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Transforma tus auditorías con <strong className="text-indigo-600 dark:text-indigo-400">Inteligencia Artificial</strong>.<br />
                        Analiza el 100% de tus llamadas, detecta sentimientos y garantiza cumplimiento ISO en segundos.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <Link to="/login" className="w-full md:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/40 hover:-translate-y-1 transition-all text-sm flex items-center justify-center gap-3">
                            <Zap className="w-5 h-5" /> Iniciar Ahora
                        </Link>
                        <a href="#features" className="w-full md:w-auto px-10 py-5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] font-black uppercase tracking-widest hover:-translate-y-1 transition-all text-sm">
                            Ver Demo
                        </a>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <FeatureCard
                            icon={<Zap className="w-8 h-8 text-yellow-500" />}
                            title="Análisis Instantáneo"
                            desc="Olvídate de escuchar horas de audio. ACPIA transcribe y califica en segundos con precisión humana."
                        />
                        <FeatureCard
                            icon={<Lock className="w-8 h-8 text-emerald-500" />}
                            title="Seguridad ISO 27001"
                            desc="Redacción automática de datos sensibles (PII) y logs de auditoría inmutables para cumplimiento legal."
                        />
                        <FeatureCard
                            icon={<BarChart className="w-8 h-8 text-indigo-500" />}
                            title="Reportes Ejecutivos"
                            desc="Genera PDFs profesionales y dashboards de tendencias para presentar a tus clientes de alto nivel."
                        />
                    </div>
                </div>
            </section>

            {/* Social Proof / Stats */}
            <section className="py-20 border-y border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <Stat number="100%" label="Cobertura IA" />
                    <Stat number="99.9%" label="Uptime Serverless" />
                    <Stat number="10x" label="Más Eficiente" />
                    <Stat number="ISO" label="Cumplimiento" />
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 px-6 bg-white dark:bg-slate-900">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Planes de Inversión</h2>
                        <p className="text-slate-500 text-lg">Impulsa la calidad de tu operación con tecnología de vanguardia.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        <PricingCard 
                            title="Starter" 
                            price="$49" 
                            features={['50 Auditorías/mes', 'Copilot IA Estándar', 'Soporte por Email', '1 Usuario Pro']} 
                        />
                        <PricingCard 
                            title="Professional" 
                            price="$199" 
                            recommended 
                            features={['Auditorías Ilimitadas', 'Análisis de Sentimiento', 'Dashboard de Rankings', '5 Usuarios Pro', 'Exportación PDF Pro']} 
                        />
                        <PricingCard 
                            title="Enterprise" 
                            price="Custom" 
                            features={['Marca Blanca Total', 'Integración API/Webhooks', 'Seguridad SSO', 'Soporte 24/7 Dedicado', 'Usuarios Ilimitados']} 
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center opacity-50 text-sm">
                    <p>© 2026 {companyName}. All rights reserved. Powered by ACPIA Intelligence.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-white transition-colors">Términos</a>
                        <a href="#" className="hover:text-white transition-colors">Contacto</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }: any) => (
    <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-500 transition-all group">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="text-xl font-black mb-3 uppercase tracking-tight">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{desc}</p>
    </div>
);

const Stat = ({ number, label }: any) => (
    <div>
        <div className="text-5xl font-black text-indigo-600 mb-2 tracking-tighter">{number}</div>
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</div>
    </div>
);

const PricingCard = ({ title, price, features, recommended }: any) => (
    <div className={`p-8 rounded-[2.5rem] relative transition-all hover:-translate-y-2 ${recommended ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 scale-105 z-10' : 'bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800'}`}>
        {recommended && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-indigo-900 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Opción Recomendada</div>}
        <h3 className={`text-xl font-black uppercase tracking-widest mb-2 ${recommended ? 'text-indigo-200' : 'text-slate-400'}`}>{title}</h3>
        <div className="text-5xl font-black mb-8 tracking-tighter">{price}{price !== 'Custom' && <span className="text-lg font-bold opacity-50">/mo</span>}</div>
        <ul className="space-y-4 mb-8">
            {features.map((f: string, i: number) => (
                <li key={i} className="flex items-center gap-3 font-bold text-sm opacity-90">
                    <CheckCircle className={`w-5 h-5 ${recommended ? 'text-indigo-300' : 'text-indigo-600'}`} /> {f}
                </li>
            ))}
        </ul>
        <Link to="/login" className={`w-full block text-center py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${recommended ? 'bg-white text-indigo-600 hover:bg-slate-100' : 'bg-indigo-600/10 dark:bg-slate-800 text-indigo-600 dark:text-white hover:bg-indigo-600 hover:text-white'}`}>
            Seleccionar {title}
        </Link>
    </div>
);
