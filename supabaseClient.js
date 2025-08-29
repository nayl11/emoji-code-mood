// supabaseClient.js
// Ce module initialise et exporte le client Supabase

export function getSupabaseClient() {
    if (!window.PRIVATE_CONFIG || !window.PRIVATE_CONFIG.supabaseUrl || !window.PRIVATE_CONFIG.supabaseAnonKey) {
        throw new Error('Configuration Supabase manquante.');
    }
    
    // Utiliser window.supabase qui est chargé depuis le CDN
    if (!window.supabase) {
        throw new Error('Bibliothèque Supabase non chargée. Vérifiez que le script est bien chargé.');
    }
    
    const { createClient } = window.supabase;
    return createClient(window.PRIVATE_CONFIG.supabaseUrl, window.PRIVATE_CONFIG.supabaseAnonKey);
}
