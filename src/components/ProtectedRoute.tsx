
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

const PLAN_HIERARCHY = {
    [SubscriptionTier.FREE]: 0,
    [SubscriptionTier.STANDARD]: 1,
    [SubscriptionTier.AI_PRO]: 2,
    [SubscriptionTier.ENTERPRISE]: 3
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

    if (requiredRole && currentUser.role !== requiredRole && currentUser.role !== UserRole.ADMIN) {
        return <Navigate to="/app" replace />;
    }

    if (requiredPlan) {
        const userPlan = currentUser.subscriptionTier || SubscriptionTier.FREE;
        if (PLAN_HIERARCHY[userPlan] < PLAN_HIERARCHY[requiredPlan]) {
            return <Navigate to="/app/subscription" replace />;
        }
    }

    return children ? <>{children}</> : <Outlet />;
};
