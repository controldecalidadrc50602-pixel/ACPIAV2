import React from 'react';
import { Settings } from '../components/Settings';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
    const { lang, setLang, refreshData } = useApp();
    return <Settings  />;
};
