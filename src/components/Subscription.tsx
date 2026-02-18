import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Check, Zap, ShieldCheck, TrendingUp, Sparkles, MessageSquare } from 'lucide-react';
import { Language, SubscriptionTier } from '../types';
import { translations } from '../utils/translations';
import { useAuth } from '../context/AuthContext';
import { PRICING_PLANS, upgradePlan } from '../services/subscriptionService';
import { CheckoutModal } from './CheckoutModal';
import { toast } from 'react-hot-toast';

interface SubscriptionProps {
    lang: Language;
    onPlanChanged?: () => void;
}

export const Subscription: React.FC<SubscriptionProps> = ({ lang, onPlanChanged }) => {
    const t = translations[lang];
    const { currentUser } = useAuth();
    const currentTier = currentUser?.subscriptionTier || SubscriptionTier.FREE;

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{ id: string, name: string, price: number | string } | null>(null);

    const handleSelectPlan = (planId: SubscriptionTier, planName: string, price: number | string) => {
        if (!currentUser) {
            toast.error(lang === 'es' ? "Debes iniciar sesión primero" : "Please login first");
            return;
        }

        // --- LÓGICA DE BYPASS PARA RC506 ---
        const isInternal = currentUser.organization_id === 'acpia-pilot' || currentUser.email?.endsWith('@rc506.com');
        
        if (isInternal) {
            toast.success("Acceso Personal RC506: Plan desbloqueado");
            handleUpgradeSuccess(planId);
            return;
        }
        // ----------------------------------

        if (planId === SubscriptionTier.FREE) {
            handleUpgradeSuccess(planId);
        } else {
            setSelectedPlan({ id: planId, name: planName, price: price as number });
            setIsCheckoutOpen(true);
        }
    };

    const handleUpgradeSuccess = async (planId?: string) => {
        const targetPlan = planId || selectedPlan?.id;
        if (!targetPlan || !currentUser) return;

        const success = await upgradePlan(currentUser.id, targetPlan as SubscriptionTier);

        if (success) {
            toast.success(`¡Plan ${targetPlan} activado!`);
            if (onPlanChanged) onPlanChanged();
            else window.location.reload();
        } else {
            toast.error("Error al actualizar.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-32 space-y-12 animate-fade-in px-6">
            
            {/* TÍTULO DE APARTADO MEJORADO */}
            <div className="mb-16 text-left border-l-4 border-indigo-500 pl-8 pt-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-4">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">Configuración del Sistema</span>
                </div>
                <h1 className="text-5xl font-black dark:text-white tracking-tighter uppercase leading-none">
                    Apartado: <span className="text-indigo-500">Suscripciones</span>
                </h1>
                <p className="text-lg text-slate-500 mt-4 font-medium max-w-2xl">
                    Gestiona el nivel de potencia de IA para la organización <span className="text-indigo-400 font-bold">acpia-pilot</span>.
                </p>
            </div>

            {selectedPlan && (
                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    onSuccess={() => handleUpgradeSuccess()}
                    planName={selectedPlan.name}
                    price={selectedPlan.price as number}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {PRICING_PLANS.map(plan => (
                    <div key={plan.id} className={`relative flex flex-col p-10 rounded-[3rem] border-2 transition-all ${plan.recommended ? 'scale-105 border-indigo-500 shadow-2xl bg-slate-900 text-white' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                        {plan.recommended && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase shadow-xl">Recomendado</div>}

                        <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-6xl font-black tracking-tighter">
                                {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                            </span>
                            {typeof plan.price === 'number' && <span className="text-sm opacity-60 font-bold">/mes</span>}
                        </div>

                        <ul className="space-y-4 mb-12 flex-1">
                            {plan.features.map((feat, i) => (
                                <li key={i} className="flex items-start gap-4 text-sm font-medium">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.recommended ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="opacity-80 leading-tight">{feat}</span>
                                </li>
                            ))}
                        </ul>

                        <Button
                            disabled={currentTier === plan.id}
                            className={`h-16 font-black rounded-2xl uppercase tracking-widest text-xs ${plan.recommended ? 'bg-white text-indigo-900 hover:bg-slate-100' : 'bg-indigo-600 text-white'}`}
                            onClick={() => handleSelectPlan(plan.id, plan.name, plan.price)}
                        >
                            {currentTier === plan.id ? 'Plan Actual' : 'Seleccionar Plan'}
                        </Button>
                    </div>
                ))}
            </div>

            {/* SECCIÓN DE SEGURIDAD ISO */}
            <div className="bg-white dark:bg-slate-900 p-16 rounded-[4rem] border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-16 shadow-xl text-left">
                <div className="space-y-4">
                    <ShieldCheck className="w-12 h-12 text-emerald-500" />
                    <h4 className="text-xl font-black uppercase tracking-tighter dark:text-white">Gobernanza ISO 42001</h4>
                    <p className="text-sm text-slate-500">Tus datos nunca entrenan modelos públicos. Seguridad empresarial integrada.</p>
                </div>
                <div className="space-y-4">
                    <TrendingUp className="w-12 h-12 text-indigo-500" />
                    <h4 className="text-xl font-black uppercase tracking-tighter dark:text-white">ROI Operativo 10x</h4>
                    <p className="text-sm text-slate-500">Escala tu calidad sin contratar más personal técnico.</p>
                </div>
                <div className="space-y-4">
                    <MessageSquare className="w-12 h-12 text-purple-500" />
                    <h4 className="text-xl font-black uppercase tracking-tighter dark:text-white">Soporte RC506</h4>
                    <p className="text-sm text-slate-500">Acceso prioritario para todo el equipo de auditoría interna.</p>
                </div>
            </div>
        </div>
    );
};
