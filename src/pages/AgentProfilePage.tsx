import React from 'react';
import { AgentScorecard } from '../components/AgentScorecard';
import { useApp } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { getRubric } from '../services/storageService';

export const AgentProfilePage: React.FC = () => {
    const { audits, lang } = useApp();
    const { agentName } = useParams<{ agentName: string }>();
    const navigate = useNavigate();

    // Decode agent name if it was URL encoded
    const decodedAgentName = agentName ? decodeURIComponent(agentName) : null;

    if (!decodedAgentName) return <div>Agent not found</div>;

    return (
        <AgentScorecard
            agentName={decodedAgentName}
            audits={audits}
            rubric={getRubric()}
            lang={lang}
            onBack={() => navigate('/app/crm')}
        />
    );
};
