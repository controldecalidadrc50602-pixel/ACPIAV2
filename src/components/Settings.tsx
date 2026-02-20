import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Save, Trash2, Download, Upload, Shield, Moon, Sun, Globe, Building } from 'lucide-react';
import { getAppSettings, saveAppSettings, exportData, clearAllData, saveTheme, getTheme } from '../services/storageService';
import { toast } from 'react-hot-toast';

export const Settings: React.FC = () => {
    const { refreshData } = useApp();
    const [companyName, setCompanyName] = useState('ACPIA');
    const [theme, setThemeState] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const loadSettings = async () => {
            const settings = await getAppSettings();
            setCompanyName(settings.companyName || 'ACPIA');
            const savedTheme = getTheme() as 'light' | 'dark';
            setThemeState(savedTheme);
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        await saveAppSettings({ companyName, theme });
        saveTheme(theme);
        toast.success("Configuración guardada");
        refreshData();
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black uppercase tracking-tighter dark:text-white italic">Configuración</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Gestión de infraestructura y marca</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tarjeta de Marca */}
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500 flex items-center gap-3">
                        <Building className="w-5 h-5" /> Identidad Visual
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Nombre de Empresa</label>
                            <input 
                                value={companyName} 
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-5 rounded-2xl font-bold dark:text-white outline-none focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Tarjeta de Interfaz */}
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-3">
                        <Moon className="w-5 h-5" /> Preferencias
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setThemeState('light')}
                            className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'light' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-800'}`}
                        >
                            <Sun className={theme === 'light' ? 'text-indigo-600' : 'text-slate-400'} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Light</span>
                        </button>
                        <button 
                            onClick={() => setThemeState('dark')}
                            className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-100 dark:border-slate-800'}`}
                        >
                            <Moon className={theme === 'dark' ? 'text-indigo-600' : 'text-slate-400'} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Dark</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Acciones de Datos */}
            <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-wrap gap-4 justify-between items-center">
                <div className="flex gap-4">
                    <button onClick={() => exportData()} className="flex items-center gap-3 px-8 py-4 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">
                        <Download className="w-4 h-4" /> Exportar Backup
                    </button>
                    <button onClick={() => { if(confirm("¿Borrar todo?")) clearAllData(); }} className="flex items-center gap-3 px-8 py-4 bg-red-900/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-900/40 transition-all">
                        <Trash2 className="w-4 h-4" /> Reset Sistema
                    </button>
                </div>
                <button onClick={handleSave} className="flex items-center gap-3 px-12 py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all">
                    <Save className="w-5 h-5" /> Guardar Cambios
                </button>
            </div>
        </div>
    );
};
