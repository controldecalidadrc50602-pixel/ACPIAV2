import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SubscriptionTier, UserRole } from '../types';

// 1. Aquí actualizamos el manual para que acepte las palabras exactas que envía App.tsx
interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
    requiredPlan?: SubscriptionTier;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    requiredRole, 
    requiredPlan 
}) => {
    const { currentUser, isAdmin } = useAuth();

    // Si no hay usuario logueado, lo mandamos al inicio
    if (!currentUser) {
        return <Navigate to="/" />;
    }

    // 2. Verificación de Rol (Si requiere un rol específico y no lo tiene, lo saca)
    // El ADMIN (tú, con el bypass) siempre tiene permiso de pasar
    if (requiredRole && currentUser.role !== requiredRole && !isAdmin) {
        return <Navigate to="/app/dashboard" />;
    }

    // 3. Verificación de Plan de Suscripción
    if (requiredPlan) {
        // Aseguramos qué plan tiene el usuario (si no tiene, es FREE)
        const userTier = (currentUser.subscriptionTier as SubscriptionTier) || SubscriptionTier.FREE;
        
        // Le damos un "peso" o valor numérico a cada plan para saber cuál es mayor
        const tierWeights = {
            [SubscriptionTier.FREE]: 0,
            [SubscriptionTier.PRO]: 1,
            [SubscriptionTier.ENTERPRISE]: 2
        };

        // Si el peso del plan del usuario es menor al que requiere la página, lo bloquea
        if (tierWeights[userTier] < tierWeights[requiredPlan]) {
            return <Navigate to="/app/dashboard" />; // (Opcional: podrías mandarlo a "/billing")
        }
    }

    // Si pasó todas las verificaciones de seguridad, le mostramos la página
    return <>{children}</>;
};
