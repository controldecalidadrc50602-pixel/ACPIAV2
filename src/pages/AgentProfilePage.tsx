import React, { useState, useEffect } from 'react'; // Agregamos useState y useEffect
import { AgentScorecard } from '../components/AgentScorecard';
import { useApp } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { getRubric } from '../services/storageService';
import { RubricItem } from '../types'; // Importamos el tipo para que TS esté feliz

export const AgentProfilePage: React.FC = () => {
    const { audits, lang } = useApp();
    const { agentName } = useParams<{ agentName: string }>();
    const navigate = useNavigate();
    
    // 1. Creamos la "mesa" para poner la rúbrica cuando llegue
    const [rubric, setRubric] = useState<RubricItem[]>([]);

    // 2. Llamamos a la pizzería (Supabase) de forma asíncrona
    useEffect(() => {
        const loadRubric = async () => {
            const data = await getRubric(); // Esperamos a que la promesa se resuelva
            setRubric(data); // Guardamos los datos reales
        };
        loadRubric();
    }, []);

    const decodedAgentName = agentName ? decodeURIComponent(agentName) : null;

    if (!decodedAgentName) return <div>Agent not found</div>;

    return (
        <AgentScorecard
            agentName={decodedAgentName}
            audits={audits}
            rubric={rubric} // 3. Ahora pasamos los datos reales, no la promesa
            lang={lang}
            onBack={() => navigate('/app/crm')}
        />
    );
};
