import React, { useState, useEffect } from 'react';
import { getAppSettings } from '../services/storageService';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
    const [settings, setSettings] = useState<any>({ companyName: 'ACPIA', logoBase64: '' });

    useEffect(() => {
        getAppSettings().then(setSettings);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 w-full max-w-md space-y-8 animate-fade-in">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/20">
                        <Sparkles className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">
                        {settings.companyName}
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        Intelligence Platform
                    </p>
                </div>
                
                {/* Botones de Auth de Supabase irían aquí */}
                <div className="pt-6 border-t border-slate-50">
                    <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" /> Sistema de Acceso Seguro
                    </p>
                </div>
            </div>
        </div>
    );
};
