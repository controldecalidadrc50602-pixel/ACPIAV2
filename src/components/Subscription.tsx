export const PRICING_PLANS = [
  {
    id: 'FREE',
    name: 'Starter',
    price: 49,
    recommended: false,
    features: ['50 auditorías/mes', 'Copilot IA Estándar', 'Soporte por email', '1 Proyecto']
  },
  {
    id: 'PRO',
    name: 'Professional',
    price: 199,
    recommended: true,
    features: ['Auditorías ilimitadas', 'Copilot IA Advanced', 'Análisis de Agentes (V1)', 'Múltiples Proyectos']
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 'Custom',
    recommended: false,
    features: ['Acceso Total RC506', 'Soporte 24/7', 'White Label', 'Modelos Personalizados']
  }
];
