import React from 'react';
import { Management } from '../components/Management';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const ManagementPage: React.FC = () => {
    const { lang, refreshData } = useApp();
    const { currentUser } = useAuth();

    if (!currentUser) return null;

    return <Management />;
};
