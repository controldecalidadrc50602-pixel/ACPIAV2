
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Please check .env.local');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

// Helper to check connection
export const checkSupabaseConnection = async () => {
    try {
        const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
        if (error) throw error;
        return true;
    } catch (e) {
        console.error('Supabase connection check failed:', e);
        return false;
    }
};
