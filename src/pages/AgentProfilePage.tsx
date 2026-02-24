import React, { useState, useEffect } from 'react';
import { AgentScorecard } from '../components/AgentScorecard';
import { useApp } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { getRubric } from '../services/storageService';
import { RubricItem } from '../types';

export const AgentProfilePage: React.FC = () => {
    const { audits, lang } = useApp();
    const { agentName } = useParams<{ agentName: string }>();
    const navigate = useNavigate();
    
    // Estado para guardar la rúbrica cuando llegue de la DB
    const [rubric, setRubric] = useState<RubricItem[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const data = await getRubric(); // Esperamos la respuesta asíncrona
            setRubric(data);
        };
        loadData();
    }, []);

    const decodedAgentName = agentName ? decodeURIComponent(agentName) : null;

    if (!decodedAgentName) return <div>Agente no encontrado</div>;

    return (
        <AgentScorecard
            agentName={decodedAgentName}
            audits={audits}
            rubric={rubric} // Pasamos los datos ya resueltos
            lang={lang}
            onBack={() => navigate('/app/crm')}
        />
    );
};
