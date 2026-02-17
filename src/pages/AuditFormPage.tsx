import React from 'react';
import { AuditForm } from '../components/AuditForm';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveAudit } from '../services/storageService';
import { toast } from 'react-hot-toast';
import { translations } from '../utils/translations';

export const AuditFormPage: React.FC = () => {
    const { lang, refreshData } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const initialData = location.state?.initialData || null;
    const t = translations[lang] || translations['es'];

    const handleSave = (audit: any) => {
        saveAudit(audit);
        refreshData();
        toast.success(t.saved);
        navigate('/app/crm');
    };

    return <AuditForm onSave={handleSave} lang={lang} initialData={initialData} />;
};
