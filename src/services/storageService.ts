import { supabase } from './supabaseClient';

// --- CHAT SESSIONS (Ajustado para tipos de CopilotPage) ---
export const getChatSessions = async () => {
    const { data } = await supabase.from('chat_sessions').select('*').order('created_at', { ascending: false });
    return (data || []).map(s => ({
        ...s,
        date: s.created_at // Mapeo para compatibilidad con la interfaz ChatSession
    }));
};

export const createNewSession = async () => {
    const id = crypto.randomUUID();
    const newSession = { 
        id, 
        title: 'Nueva Conversación', 
        messages: [], 
        created_at: new Date().toISOString() 
    };
    await supabase.from('chat_sessions').insert([newSession]);
    return { ...newSession, date: newSession.created_at };
};

export const saveChatSession = async (session: any) => {
    const { error } = await supabase.from('chat_sessions').upsert([{
        id: session.id,
        title: session.title,
        messages: session.messages,
        created_at: session.date || session.created_at
    }]);
    return !error;
};

export const deleteChatSession = async (id: string) => {
    await supabase.from('chat_sessions').delete().eq('id', id);
    return true;
};

// --- AGREGAR ESTO PARA EL ERROR DE MANAGEMENT ---
export const toggleRubricItem = async (id: string, isActive: boolean) => {
    await supabase.from('rubrics').update({ isActive }).eq('id', id);
    return true;
};
