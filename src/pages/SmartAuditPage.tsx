import React from 'react';
import { SmartAudit } from '../components/SmartAudit';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { saveAudit } from '../services/storageService';
import { toast } from 'react-hot-toast';
import { translations } from '../utils/translations';

export const SmartAuditPage: React.FC = () => {
    const { lang, refreshData } = useApp();
    const navigate = useNavigate();
    const t = translations[lang] || translations['es'];

    const handleSave = (audit: any) => {
        saveAudit(audit);
        refreshData();
        toast.success(t.saved);
        navigate('/app/crm');
    };

    return <SmartAudit lang={lang} onSave={handleSave} />;
};
