import { SubscriptionTier } from '../types';

export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  price: number | string;
  recommended: boolean;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  { id: SubscriptionTier.FREE, name: 'Starter', price: 49, recommended: false, features: ['50 auditorías/mes', 'Copilot IA Estándar', 'Soporte por email'] },
  { id: SubscriptionTier.PRO, name: 'Professional', price: 199, recommended: true, features: ['Auditorías ilimitadas', 'Copilot IA Advanced', 'Análisis V1'] },
  { id: SubscriptionTier.ENTERPRISE, name: 'Enterprise', price: 'Custom', recommended: false, features: ['Acceso Total RC506', 'Soporte 24/7', 'IA Personalizada'] }
];

export const upgradePlan = async (userId: string, tier: SubscriptionTier) => {
  // Lógica para actualizar en Supabase
  return true; 
};

// ESTA ES LA FUNCIÓN QUE FALTABA Y DABA ERROR EN SMARTAUDIT
export const checkUsageLimit = async (userId: string, currentUsage: number) => {
  return true; 
};
