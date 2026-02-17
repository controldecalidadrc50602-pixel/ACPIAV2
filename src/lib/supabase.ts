import { createClient } from '@supabase/supabase-js';

// Usamos el prefijo VITE_ para que sean accesibles en el cliente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Advertencia: Variables de Supabase no configuradas.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
