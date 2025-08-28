// supabaseClient.js
// Ce module initialise et exporte le client Supabase

export function getSupabaseClient() {
    if (!window.PRIVATE_CONFIG || !window.PRIVATE_CONFIG.supabaseUrl || !window.PRIVATE_CONFIG.supabaseAnonKey) {
        throw new Error('Configuration Supabase manquante.');
    }
    const { createClient } = window.supabaseLib;
    return createClient(window.PRIVATE_CONFIG.supabaseUrl, window.PRIVATE_CONFIG.supabaseAnonKey);
}
