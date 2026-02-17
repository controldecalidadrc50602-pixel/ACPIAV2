import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Check, Zap, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
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

    // Checkout State
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{ id: string, name: string, price: number } | null>(null);

    const handleSelectPlan = (planId: SubscriptionTier, planName: string, price: number) => {
        if (!currentUser) {
            toast.error("Debes iniciar sesión primero");
            return;
        }
        if (planId === SubscriptionTier.FREE) {
            // Downgrade or Switch to Free instantly
            handleUpgradeSuccess(planId);
        } else {
            // Open Checkout
            setSelectedPlan({ id: planId, name: planName, price });
            setIsCheckoutOpen(true);
        }
    };

    const handleUpgradeSuccess = async (planId?: string) => {
        const targetPlan = planId || selectedPlan?.id;
        if (!targetPlan || !currentUser) return;

        const success = await upgradePlan(currentUser.id, targetPlan as SubscriptionTier);

        if (success) {
            toast.success(lang === 'es' ? `¡Bienvenido al plan ${targetPlan}!` : `Welcome to ${targetPlan} plan!`);
            toast.success(lang === 'es' ? `¡Bienvenido al plan ${targetPlan}!` : `Welcome to ${targetPlan} plan!`);
            if (onPlanChanged) {
                onPlanChanged();
            } else {
                window.location.reload();
            }
        } else {
            toast.error("Error al actualizar plan.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-32 space-y-20 animate-fade-in text-center">

            {selectedPlan && (
                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    onSuccess={() => handleUpgradeSuccess()}
                    planName={selectedPlan.name}
                    price={selectedPlan.price}
                />
            )}

            <div className="space-y-6 pt-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-4">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">SaaS Pricing 2025</span>
                </div>
                <h1 className="text-6xl font-black dark:text-white tracking-tighter uppercase leading-none">
                    Escala tu Calidad con IA
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                    Paga por lo que auditas. Sin costos ocultos, infraestructura 100% gestionada en la nube.
                </p>

                {/* Toggle Annual/Monthly omitted for MVP simplicity */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 text-left">
                {PRICING_PLANS.map(plan => (
                    <div key={plan.id} className={`relative flex flex-col p-10 rounded-[3rem] border-2 transition-all ${plan.recommended ? 'scale-105 border-indigo-500 shadow-2xl bg-slate-900 text-white' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                        {plan.recommended && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase shadow-xl">Más Popular</div>}

                        <h3 className="text-xl font-black mb-2 uppercase tracking-tighter">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-6xl font-black tracking-tighter">${plan.price}</span>
                            <span className="text-sm opacity-60 font-bold">/mes</span>
                        </div>

                        <div className={`mb-10 p-5 rounded-3xl border ${plan.recommended ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-50 dark:bg-slate-850 border-slate-100 dark:border-slate-800'}`}>
                            <div className="flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase mb-1">
                                <Zap className="w-3 h-3" /> Potencia IA
                            </div>
                            <p className="text-lg font-black uppercase tracking-tight">{plan.id === 'FREE' ? 'Limitada' : 'Full Power'}</p>
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

            <div className="bg-white dark:bg-slate-900 p-16 rounded-[4rem] border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-16 shadow-xl text-left">
                <div className="space-y-4">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h4 className="text-xl font-black uppercase tracking-tighter dark:text-white">Gobernanza ISO 42001</h4>
                    <p className="text-sm text-slate-500 font-medium">Tus datos nunca entrenan modelos públicos. Seguridad de nivel bancario integrada.</p>
                </div>
                <div className="space-y-4">
                    <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h4 className="text-xl font-black uppercase tracking-tighter dark:text-white">ROI Operativo 10x</h4>
                    <p className="text-sm text-slate-500 font-medium">Reduce el costo por auditoría de $5.00 a $0.05. Escala tu calidad sin contratar más personal.</p>
                </div>
                <div className="space-y-4">
                    <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-purple-500" />
                    </div>
                    <h4 className="text-xl font-black uppercase tracking-tighter dark:text-white">Actualizaciones IA</h4>
                    <p className="text-sm text-slate-500 font-medium">Acceso inmediato a los últimos modelos de Gemini Flash y Groq sin costo adicional.</p>
                </div>
            </div>
        </div>
    );
};
