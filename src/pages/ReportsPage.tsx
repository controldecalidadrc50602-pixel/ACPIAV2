import React from 'react';
import { Reports } from '../components/Reports';
import { useApp } from '../context/AppContext';

export const ReportsPage: React.FC = () => {
    const { lang } = useApp();
    return <Reports lang={lang} />;
};
