import React, { useState, useEffect } from 'react';
import { getAudits, getAgents, getProjects, getAppSettings, downloadCSV } from '../services/storageService';
import { BarChart3, Download, Filter, FileSpreadsheet } from 'lucide-react';

export const Reports: React.FC = () => {
    const [audits, setAudits] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [companyName, setCompanyName] = useState('ACPIA');

    useEffect(() => {
        const loadReportsData = async () => {
            const [au, ag, pr, sett] = await Promise.all([
                getAudits(), getAgents(), getProjects(), getAppSettings()
            ]);
            setAudits(au);
            setAgents(ag);
            setProjects(pr);
            setCompanyName(sett.companyName);
        };
        loadReportsData();
    }, []);

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter dark:text-white italic">Business Intelligence</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Reportes de {companyName}</p>
                </div>
                <button 
                    onClick={() => downloadCSV(audits)}
                    className="action-button bg-slate-900 text-white flex items-center gap-2"
                >
                    <FileSpreadsheet className="w-4 h-4" /> Exportar CSV
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Aquí irían las tarjetas de métricas con el diseño premium */}
            </div>
        </div>
    );
};
