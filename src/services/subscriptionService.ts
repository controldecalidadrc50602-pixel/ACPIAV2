
import { User, SubscriptionTier, UsageStats } from '../types';

import { loadStripe } from '@stripe/stripe-js';

// Retrieve generic public key (safe to expose)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

export const PLAN_LIMITS: Record<SubscriptionTier, { audits: number, aiModel: 'basic' | 'advanced', copilot: boolean }> = {
    [SubscriptionTier.FREE]: { audits: 3, aiModel: 'basic', copilot: false },
    [SubscriptionTier.STANDARD]: { audits: 50, aiModel: 'basic', copilot: true },
    [SubscriptionTier.AI_PRO]: { audits: 9999, aiModel: 'advanced', copilot: true },
    [SubscriptionTier.ENTERPRISE]: { audits: 9999, aiModel: 'advanced', copilot: true }
};

export const PRICING_PLANS = [
    {
        id: SubscriptionTier.FREE,
        name: 'Starter',
        price: 0,
        features: ['3 Auditorías/mes', 'IA Básica (Llama 3 8b)', 'Soporte Comunitario'],
        color: 'slate',
        recommended: false
    },
    {
        id: SubscriptionTier.STANDARD,
        name: 'Professional',
        price: 29,
        features: ['50 Auditorías/mes', 'Copilot IA', 'Reportes Exportables', 'Soporte Email'],
        color: 'blue',
        recommended: true
    },
    {
        id: SubscriptionTier.AI_PRO,
        name: 'AI Unlimited',
        price: 99,
        features: ['Auditorías Ilimitadas', 'IA Avanzada (Llama 3 70b)', 'Análisis de Sentimiento Deep', 'Soporte Prioritario 24/7'],
        color: 'indigo',
        recommended: false
    }
];

export const checkUsageLimit = (user: User | null, usage: UsageStats | undefined): { allowed: boolean, reason?: string } => {
    if (!user) return { allowed: false, reason: 'Usuario no autenticado' };

    // Admins and Internal Company bypass limits
    if (user.role === 'ADMIN' || user.organizationId === 'RC506') return { allowed: true };

    const tier = user.subscriptionTier || SubscriptionTier.FREE;
    const limits = PLAN_LIMITS[tier];
    const currentUsage = usage?.aiAuditsCount || 0;

    if (currentUsage >= limits.audits) {
        return {
            allowed: false,
            reason: `Límite de auditorías alcanzado (${limits.audits}) para el plan ${tier}. Actualiza tu plan para continuar.`
        };
    }

    return { allowed: true };
};

export const upgradePlan = async (userId: string, newTier: SubscriptionTier, userEmail?: string): Promise<boolean> => {
    try {
        // Map Tier to Stripe Price ID (You must create these in Stripe Dashboard)
        const priceIds: Record<SubscriptionTier, string> = {
            [SubscriptionTier.FREE]: '', // No payment for free
            [SubscriptionTier.STANDARD]: 'price_STANDARD_ID',
            [SubscriptionTier.AI_PRO]: 'price_PRO_ID',
            [SubscriptionTier.ENTERPRISE]: 'price_ENTERPRISE_ID'
        };

        const priceId = priceIds[newTier];
        if (!priceId) {
            console.error("Invalid Price ID");
            return false;
        }

        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                priceId,
                userId,
                userEmail,
                successUrl: window.location.origin + '/subscription?success=true',
                cancelUrl: window.location.origin + '/subscription?canceled=true',
            })
        });

        if (!response.ok) throw new Error('Failed to create checkout session');

        const { sessionId } = await response.json();
        const stripe = await stripePromise;

        if (!stripe) throw new Error("Stripe failed to load");

        const { error } = await stripe.redirectToCheckout({ sessionId });

        if (error) {
            console.error('Stripe Redirect Error:', error);
            return false;
        }

        return true; // Redirecting...
    } catch (e) {
        console.error("Upgrade failed", e);
        return false;
    }
};
