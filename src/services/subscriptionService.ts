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
    id: SubscriptionTier.FREE, // Usamos el ID existente para no romper la base de datos
    name: 'Starter',
    price: 49,
    recommended: false,
    features: [
      '50 auditorías mensuales',
      'Copilot IA Estándar',
      'Soporte por email',
      'Acceso a 1 Proyecto'
    ]
  },
  {
    id: SubscriptionTier.PRO,
    name: 'Professional',
    price: 199,
    recommended: true,
    features: [
      'Auditorías ilimitadas',
      'Copilot IA Advanced (Llama-3.3)',
      'Análisis de Agentes históricos (V1)',
      'Proyectos ilimitados (CMSJ, KIDOZ, etc.)',
      'Dashboards de tendencia'
    ]
  },
  {
    id: SubscriptionTier.ENTERPRISE,
    name: 'Enterprise',
    price: 'Custom',
    recommended: false,
    features: [
      'Acceso Total Personal RC506',
      'Soporte 24/7 dedicado',
      'Entrenamiento de IA personalizado',
      'Exportación masiva de datos'
    ]
  }
];

// Función para actualizar el plan en Supabase
export const upgradePlan = async (userId: string, tier: SubscriptionTier) => {
  // Aquí va tu lógica existente de Supabase para actualizar el campo subscription_tier
  return true; 
};
