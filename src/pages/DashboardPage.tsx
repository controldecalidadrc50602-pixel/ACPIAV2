import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { AgentRanking } from '../components/AgentRanking';

export const DashboardPage = () => {
    const [realAgents, setRealAgents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRealData = async () => {
            // Traemos los agentes reales de tu tabla de Supabase
            const { data } = await supabase
                .from('users')
                .select('id, name, role')
                .eq('role', 'AUDITOR')
                .limit(5);
            
            if (data) setRealAgents(data);
            setLoading(false);
        };
        fetchRealData();
    }, []);

    if (loading) return <div className="p-20 text-center animate-pulse text-indigo-500 font-black">SINCRONIZANDO CON RC506...</div>;

    return (
        <div className="space-y-10">
            {/* Otros componentes de KPI */}
            <AgentRanking agents={realAgents} />
        </div>
    );
};
