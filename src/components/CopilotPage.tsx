import React, { useState, useEffect } from 'react';
import { getChatSessions, createNewSession, saveChatSession } from '../services/storageService';
import { ChatSession } from '../types';

export const CopilotPage: React.FC = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSession, setActiveSession] = useState<ChatSession | null>(null);

    // CARGA INICIAL CORREGIDA
    useEffect(() => {
        const loadSessions = async () => {
            const data = await getChatSessions(); // Resolvemos la promesa
            setSessions(data);
            if (data.length > 0) setActiveSession(data[0]);
        };
        loadSessions();
    }, []);

    // CREAR SESIÓN CORREGIDA
    const handleNewChat = async () => {
        const newSess = await createNewSession(); // Resolvemos la promesa
        setSessions([newSess, ...sessions]);
        setActiveSession(newSess);
    };

    if (!activeSession) return <div className="p-20 text-center font-black uppercase italic">Iniciando Copilot...</div>;

    return (
        <div className="flex h-full gap-6 animate-fade-in">
            {/* El resto de tu UI premium de Copilot va aquí */}
            <h2 className="text-2xl font-black uppercase tracking-tighter">ACPIA Copilot</h2>
        </div>
    );
};
