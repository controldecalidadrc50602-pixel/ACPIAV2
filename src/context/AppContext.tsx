import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAudits, getAppSettings, saveAppSettings } from '../services/storageService';
import { Audit } from '../types';

interface AppContextType {
    audits: Audit[];
    companyName: string;
    lang: 'es' | 'en';
    setLang: (lang: 'es' | 'en') => void; // Añadido para corregir errores en Login/Settings
    refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [audits, setAudits] = useState<Audit[]>([]);
    const [companyName, setCompanyName] = useState('ACPIA');
    const [lang, setLangState] = useState<'es' | 'en'>('es');

    // Función para cambiar idioma globalmente y persistirlo
    const setLang = async (newLang: 'es' | 'en') => {
        setLangState(newLang);
        // Opcional: Guardar en base de datos para que persista al recargar
        const currentSettings = await getAppSettings();
        await saveAppSettings({ ...currentSettings, lang: newLang });
    };

    const refreshData = async () => {
        try {
            // Resolvemos las promesas de Supabase de forma segura
            const [a, s] = await Promise.all([getAudits(), getAppSettings()]);
            
            if (a) setAudits(a);
            if (s) {
                setCompanyName(s.companyName || 'ACPIA');
                setLangState((s.lang as 'es' | 'en') || 'es');
            }
        } catch (error) {
            console.error("Error sincronizando AppContext:", error);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    return (
        <AppContext.Provider value={{ audits, companyName, lang, setLang, refreshData }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};
