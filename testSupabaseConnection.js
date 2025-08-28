// testSupabaseConnection.js
import { getSupabaseClient } from './supabaseClient.js';

(async function testConnection() {
    if (!window.supabaseLib) {
        window.supabaseLib = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
    }
    try {
        const supabase = getSupabaseClient();
        const { error } = await supabase.from('moods').select('count').limit(1);
        if (error) {
            console.error('❌ Connexion Supabase échouée :', error.message || error);
            alert('Connexion Supabase échouée : ' + (error.message || error));
        } else {
            console.log('✅ Connexion Supabase OK');
            alert('Connexion Supabase OK');
        }
    } catch (e) {
        console.error('❌ Erreur de configuration Supabase :', e.message || e);
        alert('Erreur de configuration Supabase : ' + (e.message || e));
    }
})();
