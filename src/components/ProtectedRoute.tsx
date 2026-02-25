import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SubscriptionTier } from '../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
    requireSubscription?: boolean;
}

const limits: Record<SubscriptionTier, number> = {
    [SubscriptionTier.FREE]: 10,
    [SubscriptionTier.PRO]: 500,
    [SubscriptionTier.ENTERPRISE]: 99999
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    requireAdmin = false, 
    requireSubscription = false 
}) => {
    const { currentUser, isAdmin } = useAuth();

    if (!currentUser) {
        return <Navigate to="/" />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/app/dashboard" />;
    }

    if (requireSubscription) {
        // Le indicamos a TS que confíe en el tipo de suscripción
        const userTier = (currentUser.subscriptionTier as SubscriptionTier) || SubscriptionTier.FREE;
        const currentLimit = limits[userTier];
        
        // Aquí puedes agregar tu lógica si sobrepasa el límite
        // if (usoActual > currentLimit) return <Navigate to="/billing" />
    }

    return <>{children}</>;
};
