import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta.env && import.meta.env.VITE_SUPABASE_URL) || localStorage.getItem('nyetor_supabase_url') || '';
const SUPABASE_ANON_KEY = (import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || localStorage.getItem('nyetor_supabase_anon_key') || '';

export const creds = {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
    isConfigured: !!SUPABASE_URL && !!SUPABASE_ANON_KEY
};

export const supabase = creds.isConfigured 
    ? createClient(creds.url, creds.key) 
    : null;
