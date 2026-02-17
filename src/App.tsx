import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './components/layout/MainLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { translations } from './utils/translations';
import { Toaster } from 'react-hot-toast';

import { DashboardPage } from './pages/DashboardPage';
import { CRMPage } from './pages/CRMPage';
import { AuditFormPage } from './pages/AuditFormPage';
import { SmartAuditPage } from './pages/SmartAuditPage';
import { ReportsPage } from './pages/ReportsPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { ManagementPage } from './pages/ManagementPage';
import { SettingsPage } from './pages/SettingsPage';
import { AgentProfilePage } from './pages/AgentProfilePage';
import { ProjectScorecardPage } from './pages/ProjectScorecardPage';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';

import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole, SubscriptionTier } from './types';

// ... imports remain the same

const AppRoutes = () => {
    const { currentUser } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/app" replace />} />

            {/* Public Landing Page */}
            <Route path="/" element={!currentUser ? <LandingPage /> : <Navigate to="/app" replace />} />

            {/* Protected App Routes */}
            <Route path="/app" element={
                <ProtectedRoute>
                    <MainLayout />
                </ProtectedRoute>
            }>
                <Route index element={<DashboardPage />} />
                <Route path="crm" element={<CRMPage />} />

                {/* Free Tier Limits */}
                <Route path="audit/new" element={<AuditFormPage />} />

                {/* Paid Features */}
                <Route path="smart-audit" element={
                    <ProtectedRoute requiredPlan={SubscriptionTier.STANDARD}>
                        <SmartAuditPage />
                    </ProtectedRoute>
                } />
                <Route path="reports" element={
                    <ProtectedRoute requiredPlan={SubscriptionTier.STANDARD}>
                        <ReportsPage />
                    </ProtectedRoute>
                } />

                <Route path="subscription" element={<SubscriptionPage />} />

                {/* Admin Only */}
                <Route path="management" element={
                    <ProtectedRoute requiredRole={UserRole.ADMIN}>
                        <ManagementPage />
                    </ProtectedRoute>
                } />

                <Route path="settings" element={<SettingsPage />} />
                <Route path="agent/:agentName" element={<AgentProfilePage />} />
                <Route path="project/:projectName" element={<ProjectScorecardPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppProvider>
                    <ErrorBoundary t={translations['es']}>
                        <Toaster position="top-right" />
                        <AppRoutes />
                    </ErrorBoundary>
                </AppProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
