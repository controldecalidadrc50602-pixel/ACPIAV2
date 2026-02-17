import React from 'react';
import { CRM } from '../components/CRM';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const CRMPage: React.FC = () => {
    const { lang, refreshData } = useApp();
    const navigate = useNavigate();

    return (
        <CRM
            lang={lang}
            onEdit={(audit) => {
                // We need to pass the audit to edit. 
                // For now we can pass it via state location or context. 
                // Ideally, route should be /audit/edit/:id or /audit/new with state
                navigate('/app/audit/new', { state: { initialData: audit } });
            }}
            onViewProfile={(agentName) => navigate(`/app/agent/${agentName}`)}
            onViewProject={(projectName) => navigate(`/app/project/${projectName}`)}
            onDataChange={refreshData}
        />
    );
};
