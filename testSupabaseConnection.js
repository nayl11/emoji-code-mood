// testSupabaseConnection.js
// Script de test détaillé de la connexion Supabase

(async function() {
    const output = document.getElementById('testOutput');
    function log(msg) {
        output.innerHTML += `<div>${msg}</div>`;
    }

    log('🔍 Test de connexion Supabase démarré...');

    // Étape 1 : Vérification de la config
    if (!window.PRIVATE_CONFIG) {
        log('❌ ERREUR : window.PRIVATE_CONFIG est introuvable.');
        return;
    }
    log('✅ window.PRIVATE_CONFIG trouvé.');

    if (!window.PRIVATE_CONFIG.supabaseUrl || !window.PRIVATE_CONFIG.supabaseAnonKey) {
        log('❌ ERREUR : Les clés Supabase sont manquantes dans la configuration.');
        return;
    }
    log('✅ Clés Supabase présentes.');

    // Étape 2 : Chargement de la librairie supabase-js
    try {
        if (!window.supabaseLib) {
            window.supabaseLib = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
            log('✅ Librairie supabase-js chargée.');
        } else {
            log('ℹ️ Librairie supabase-js déjà chargée.');
        }
    } catch (e) {
        log('❌ ERREUR : Impossible de charger la librairie supabase-js.');
        log(e.message);
        return;
    }

    // Étape 3 : Création du client
    let supabase;
    try {
        const { createClient } = window.supabaseLib;
        supabase = createClient(window.PRIVATE_CONFIG.supabaseUrl, window.PRIVATE_CONFIG.supabaseAnonKey);
        log('✅ Client Supabase créé.');
    } catch (e) {
        log('❌ ERREUR : Impossible de créer le client Supabase.');
        log(e.message);
        return;
    }

    // Étape 4 : Test de requête
    try {
        log('⏳ Test de requête sur la table "moods"...');
        const { data, error } = await supabase.from('moods').select('*').limit(1);
        if (error) {
            log('❌ ERREUR lors de la requête : ' + error.message);
            return;
        }
        log('✅ Requête réussie. Exemple de données :');
        log('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
    } catch (e) {
        log('❌ ERREUR inattendue lors de la requête.');
        log(e.message);
    }
})();
