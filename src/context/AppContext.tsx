import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAudits, getAppSettings } from '../services/storageService';
import { Audit } from '../types';

interface AppContextType {
    audits: Audit[];
    companyName: string;
    lang: 'es' | 'en';
    refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [audits, setAudits] = useState<Audit[]>([]);
    const [companyName, setCompanyName] = useState('ACPIA');
    const [lang, setLang] = useState<'es' | 'en'>('es');

    const refreshData = async () => {
        const [a, s] = await Promise.all([getAudits(), getAppSettings()]);
        setAudits(a);
        setCompanyName(s.companyName || 'ACPIA');
        setLang((s.lang as 'es' | 'en') || 'es');
    };

    useEffect(() => {
        refreshData();
    }, []);

    return (
        <AppContext.Provider value={{ audits, companyName, lang, refreshData }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};
