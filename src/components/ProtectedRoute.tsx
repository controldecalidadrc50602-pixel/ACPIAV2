import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole, SubscriptionTier } from '../types';

interface ProtectedRouteProps {
    requiredRole?: UserRole;
    requiredPlan?: SubscriptionTier;
    redirectPath?: string;
    children?: React.ReactNode;
}

// Actualizado con los nuevos Tiers de la Fase 1
const PLAN_HIERARCHY: Record<SubscriptionTier, number> = {
    [SubscriptionTier.FREE]: 0,
    [SubscriptionTier.PRO]: 1, // Antes era STANDARD/AI_PRO
    [SubscriptionTier.ENTERPRISE]: 2
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    requiredRole,
    requiredPlan,
    redirectPath = '/login',
    children
}) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to={redirectPath} replace />;
    }

    // El Administrador siempre tiene acceso a todo
    if (requiredRole && currentUser.role !== requiredRole && currentUser.role !== UserRole.ADMIN) {
        return <Navigate to="/app" replace />;
    }

    if (requiredPlan) {
        const userPlan = currentUser.subscriptionTier || SubscriptionTier.FREE;
        
        // Validación de jerarquía: Si el plan del usuario es menor al requerido, redirigir
        if (PLAN_HIERARCHY[userPlan] < PLAN_HIERARCHY[requiredPlan]) {
            return <Navigate to="/app/subscription" replace />;
        }
    }

    return children ? <>{children}</> : <Outlet />;
};
// En ProtectedRoute.tsx
// Buscamos el tier del usuario y le decimos a TS: "Confía en mí, es uno de estos"
const userTier = (currentUser?.subscriptionTier as SubscriptionTier) || SubscriptionTier.FREE;
const currentLimit = limits[userTier];
