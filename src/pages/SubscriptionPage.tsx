import React from 'react';
import { Subscription } from '../components/Subscription';
import { useApp } from '../context/AppContext';

export const SubscriptionPage: React.FC = () => {
    const { lang, refreshData } = useApp();
    return <Subscription lang={lang} onPlanChanged={refreshData} />;
};
