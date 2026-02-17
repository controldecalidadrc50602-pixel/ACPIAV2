import React from 'react';
import { Dashboard } from '../components/Dashboard';
import { useApp } from '../context/AppContext';

export const DashboardPage: React.FC = () => {
    const { audits, lang } = useApp();
    return <Dashboard audits={audits} lang={lang} />;
};
