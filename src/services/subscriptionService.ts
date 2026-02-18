import { SubscriptionTier } from '../types';

export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  price: number | string;
  recommended: boolean;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  { 
    id: SubscriptionTier.FREE, 
    name: 'Starter', 
    price: 49, 
    recommended: false, 
    features: ['50 auditorías/mes', 'Copilot IA Estándar', 'Soporte por email'] 
  },
  { 
    id: SubscriptionTier.PRO, 
    name: 'Professional', 
    price: 199, 
    recommended: true, 
    features: ['Auditorías ilimitadas', 'Copilot IA Advanced', 'Análisis V1', 'Dashboard Pro'] 
  },
  { 
    id: SubscriptionTier.ENTERPRISE, 
    name: 'Enterprise', 
    price: 'Custom', 
    recommended: false, 
    features: ['Acceso Total RC506', 'Soporte 24/7', 'IA Personalizada', 'Seguridad SSO'] 
  }
];

export const upgradePlan = async (userId: string, tier: SubscriptionTier) => {
  return true; 
};

export const checkUsageLimit = async (userId: string, currentUsage: number) => {
  return true; 
};
