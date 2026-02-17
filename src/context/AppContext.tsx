import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Audit, Language } from '../types';
import { getAudits, getAppSettings, getTheme, fullCloudPull } from '../services/storageService';
import { useAuth } from './AuthContext';

interface AppContextType {
    audits: Audit[];
    lang: Language;
    setLang: (lang: Language) => void;
    appLogo: string | null;
    companyName: string;
    refreshData: () => Promise<void>;
    theme: 'light' | 'dark';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [audits, setAudits] = useState<Audit[]>([]);
    const [lang, setLang] = useState<Language>('es');
    const [appLogo, setAppLogo] = useState<string | null>(null);
    const [companyName, setCompanyName] = useState('Rc506 | Gestion de Calidad');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const refreshData = useCallback(async () => {
        try {
            const settings = getAppSettings();
            if (currentUser && settings.supabaseUrl) {
                await fullCloudPull(currentUser.organizationId);
            }

            setAudits(getAudits() || []);
            if (settings) {
                setAppLogo(settings.logoBase64 || null);
                setCompanyName(settings.companyName || 'Rc506 | Gestion de Calidad');
                if (settings.preferredLanguage && settings.preferredLanguage !== lang) {
                    setLang(settings.preferredLanguage as Language);
                }
            }
            const currentTheme = getTheme();
            setTheme(currentTheme);
            document.documentElement.classList.toggle('dark', currentTheme === 'dark');
        } catch (e) {
            console.error("Error refreshing global data", e);
        }
    }, [currentUser, lang]);

    useEffect(() => {
        refreshData();
    }, [currentUser, refreshData]);

    return (
        <AppContext.Provider value={{ audits, lang, setLang, appLogo, companyName, refreshData, theme }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
