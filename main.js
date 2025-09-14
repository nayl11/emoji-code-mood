// main.js - Version avec module supabaseClient.js
// ========================================
// CONFIGURATION ET INITIALISATION
// ========================================

console.log('🎭 Emoji Code Humeur - Version Modulaire v2.2');

// Vérification de la configuration injectée par GitHub Actions
if (!window.PRIVATE_CONFIG || !window.PRIVATE_CONFIG.supabaseUrl || !window.PRIVATE_CONFIG.supabaseAnonKey) {
    console.error('❌ Configuration Supabase manquante');
    alert('❌ ERREUR : La configuration Supabase est manquante.\nVérifiez que le fichier private-config.js est bien injecté avant main.js.');
    throw new Error('Configuration Supabase manquante.');
}

const CONFIG = { ...window.PRIVATE_CONFIG };
console.log('✅ Configuration Supabase détectée - Mode Supabase activé');

// Variables globales
let supabase = null;
let humeurs = [];
let selectedEmoji = '';
let sessionStartTime = new Date();
let autoRefreshInterval = null;
let isConnected = false;
let realtimeChannel = null;

// Configuration auto-actualisation
const AUTO_REFRESH_INTERVAL = 30000; // 30 secondes
const CONNECTION_CHECK_INTERVAL = 10000; // 10 secondes

// ========================================
// INITIALISATION SUPABASE AVEC MODULE
// ========================================

async function initSupabase() {
    try {
        console.log('🔧 Chargement du module supabaseClient...');
        
        // Import dynamique du module
        const { getSupabaseClient } = await import('./supabaseClient.js');
        
        // Initialisation du client via le module
        supabase = getSupabaseClient();
        
        // Test de connexion avec la table "humeur"
        const { data, error } = await supabase.from('humeur').select('count').limit(1);
        if (error) {
            throw error;
        }
        
        console.log('🚀 Supabase connecté avec succès via module (table humeur)');
        isConnected = true;
        updateConnectionStatus(true);
        
        // Charger les données existantes
        await loadHumeursFromSupabase();
        
        // Configurer le temps réel
        setupRealtimeSubscription();
        
        // Démarrer l'auto-refresh
        startAutoRefresh();
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement du module ou connexion Supabase:', error);
        
        // Fallback : essayer sans module
        console.log('🔄 Tentative de fallback sans module...');
        try {
            if (typeof window.supabase === 'undefined') {
                throw new Error('Bibliothèque Supabase non chargée via CDN');
            }
            
            supabase = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
            
            const { data, error } = await supabase.from('humeur').select('count').limit(1);
            if (error) throw error;
            
            console.log('✅ Fallback réussi - Supabase connecté directement');
            isConnected = true;
            updateConnectionStatus(true);
            
            await loadHumeursFromSupabase();
            setupRealtimeSubscription();
            startAutoRefresh();
            
            return true;
            
        } catch (fallbackError) {
            console.error('❌ Échec du fallback:', fallbackError);
            isConnected = false;
            updateConnectionStatus(false);
            showConnectionError(fallbackError);
            return false;
        }
    }
}

function showConnectionError(error) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'connection-error';
    errorContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ffebee;
        border: 2px solid #f44336;
        border-radius: 8px;
        padding: 20px;
        max-width: 500px;
        z-index: 10000;
        font-family: system-ui, sans-serif;
    `;
    
    errorContainer.innerHTML = `
        <div class="error-message">
            <h3 style="color: #d32f2f; margin: 0 0 10px 0;">❌ Erreur de connexion Supabase</h3>
            <p style="margin: 0 0 15px 0;"><strong>Détails :</strong> ${error.message}</p>
            <div class="error-actions">
                <button onclick="window.location.reload()" style="
                    background: #f44336;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-right: 10px;
                ">🔄 Réessayer</button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    background: #757575;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                ">Fermer</button>
            </div>
        </div>
    `;
    
    document.body.insertBefore(errorContainer, document.body.firstChild);
}

function updateConnectionStatus(connected) {
    const indicator = document.getElementById('modeIndicator');
    const icon = document.getElementById('modeIcon');
    const text = document.getElementById('modeText');
    
    if (indicator && icon && text) {
        if (connected) {
            indicator.style.background = '#e3f2fd';
            indicator.style.color = '#1976d2';
            icon.textContent = '⚡';
            text.textContent = 'Connecté - Synchronisation automatique';
        } else {
            indicator.style.background = '#ffebee';
            indicator.style.color = '#d32f2f';
            icon.textContent = '🔌';
            text.textContent = 'Reconnexion en cours...';
        }
    } else {
        console.log(connected ? '✅ Connecté' : '❌ Déconnecté');
    }
}

async function loadHumeursFromSupabase() {
    if (!supabase || !isConnected) return;

    try {
        const { data, error } = await supabase
            .from('humeur')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        humeurs = data || [];
        updateDisplay();
        console.log(`📊 ${humeurs.length} codes humeur chargés automatiquement`);
        
        if (!isConnected) {
            isConnected = true;
            updateConnectionStatus(true);
        }
    } catch (error) {
        console.error('❌ Erreur chargement Supabase:', error);
        isConnected = false;
        updateConnectionStatus(false);
    }
}

function setupRealtimeSubscription() {
    if (!supabase) return;

    realtimeChannel = supabase
        .channel('humeur_realtime')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'humeur' },
            (payload) => {
                console.log('🔄 Changement temps réel:', payload.eventType);

                if (payload.eventType === 'INSERT') {
                    humeurs.unshift(payload.new);
                    updateDisplay();

                    setTimeout(() => {
                        const newItem = document.querySelector('.mood-item');
                        if (newItem) {
                            newItem.style.animation = 'slideIn 0.5s ease, glow 2s ease';
                            setTimeout(() => {
                                newItem.style.animation = '';
                            }, 2500);
                        }
                    }, 100);
                } else if (payload.eventType === 'DELETE') {
                    loadHumeursFromSupabase();
                }
            }
        )
        .subscribe((status) => {
            console.log('📡 Realtime status:', status);
            isConnected = status === 'SUBSCRIBED';
            updateConnectionStatus(isConnected);
        });
}

function startAutoRefresh() {
    autoRefreshInterval = setInterval(async () => {
        console.log('🔄 Actualisation automatique...');
        await loadHumeursFromSupabase();
    }, AUTO_REFRESH_INTERVAL);

    setInterval(async () => {
        if (!isConnected && supabase) {
            console.log('🔌 Tentative de reconnexion...');
            try {
                await supabase.from('humeur').select('count').limit(1);
                isConnected = true;
                updateConnectionStatus(true);
                await loadHumeursFromSupabase();
            } catch (error) {
                console.log('❌ Reconnexion échouée');
            }
        }
    }, CONNECTION_CHECK_INTERVAL);
}

// ========================================
// RESTE DU CODE IDENTIQUE À LA VERSION PRÉCÉDENTE
// ========================================

function setupEventListeners() {
    console.log('🔧 Initialisation des interactions utilisateur');

    const emojiButtons = document.querySelectorAll('.emoji-btn');
    emojiButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedEmoji = btn.dataset.emoji;
        });
    });

    const form = document.getElementById('moodForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            submitMood();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            toggleAdminPanel();
        }
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            exportMoods();
        }
        if (e.ctrlKey && e.key === 'j') {
            e.preventDefault();
            exportMoodsJSON();
        }
    });
}

async function submitMood() {
    const nom = document.getElementById('studentName')?.value?.trim();
    const langagePrefere = document.getElementById('favoriteLanguage')?.value;
    const autrePreference = document.getElementById('otherPreference')?.value;
    const commentaire = document.getElementById('comment')?.value?.trim();
    const submitBtn = document.getElementById('submitBtn');

    if (submitBtn?.disabled) return;
    
    if (!selectedEmoji) {
        alert('N\'oublie pas de choisir un emoji ! 😊');
        return;
    }

    if (!nom || nom.length < 2) {
        alert('Le prénom doit contenir au moins 2 caractères');
        return;
    }

    if (!langagePrefere) {
        alert('Choisis ton langage préféré !');
        return;
    }

    if (!autrePreference) {
        alert('Choisis ta préférence additionnelle !');
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '🔄 Envoi en cours...';
    }

    const humeur = {
        nom: nom,
        emoji: selectedEmoji,
        langage_prefere: langagePrefere,
        autre_preference: autrePreference,
        commentaire: commentaire || null
    };

    const success = await addHumeur(humeur);

    if (success) {
        resetForm();
        if (submitBtn) {
            submitBtn.textContent = '✅ Envoyé avec succès !';
            setTimeout(() => {
                submitBtn.textContent = '🚀 Partager mon humeur';
                submitBtn.disabled = false;
            }, 2500);
        }
    } else {
        if (submitBtn) {
            submitBtn.textContent = '❌ Erreur - Réessayer';
            setTimeout(() => {
                submitBtn.textContent = '🚀 Partager mon humeur';
                submitBtn.disabled = false;
            }, 3000);
        }
    }
}

async function addHumeur(humeur) {
    if (!supabase) {
        console.error('❌ Supabase non initialisé');
        return false;
    }

    try {
        const cinqMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { data: existing, error: selectError } = await supabase
            .from('humeur')
            .select('*')
            .eq('nom', humeur.nom)
            .eq('emoji', humeur.emoji)
            .eq('langage_prefere', humeur.langage_prefere)
            .eq('autre_preference', humeur.autre_preference)
            .gte('created_at', cinqMinutesAgo)
            .limit(1);

        if (selectError) throw selectError;
        
        if (existing && existing.length > 0) {
            alert('Ce code humeur a déjà été enregistré récemment. Attendez quelques minutes avant de renvoyer.');
            return false;
        }

        const { error } = await supabase
            .from('humeur')
            .insert([humeur]);
            
        if (error) throw error;
        
        console.log('✅ Humeur ajoutée à Supabase');
        return true;
        
    } catch (error) {
        console.error('❌ Erreur ajout Supabase:', error);
        alert(`Erreur lors de l'envoi: ${error.message}`);
        return false;
    }
}

function resetForm() {
    const form = document.getElementById('moodForm');
    if (form) form.reset();
    document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
    selectedEmoji = '';
}

function updateDisplay() {
    updateStats();
    updateMoodList();
    updateVisualization();
}

function updateStats() {
    const totalEl = document.getElementById('totalParticipants');
    const varietyEl = document.getElementById('moodVariety');
    const timeEl = document.getElementById('sessionTime');
    
    if (totalEl) totalEl.textContent = humeurs.length;
    if (varietyEl) {
        const uniqueEmojis = new Set(humeurs.map(h => h.emoji));
        varietyEl.textContent = uniqueEmojis.size;
    }
    if (timeEl) {
        const minutes = Math.floor((new Date() - sessionStartTime) / 60000);
        timeEl.textContent = minutes;
    }
}

function updateMoodList() {
    const listContainer = document.getElementById('moodList');
    if (!listContainer) return;

    if (humeurs.length === 0) {
        listContainer.innerHTML = `
            <div class="loading">
                <p>🤖 En attente des premiers codes humeur...</p>
                <p style="font-size: 0.9em; margin-top: 10px; color: #666;">
                    Partage ton humeur pour commencer !
                </p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = humeurs.map(humeur => {
        const codeSnippet = generateCodeSnippet(humeur);
        const timeDisplay = formatTime(humeur.created_at);
        const isRecent = new Date() - new Date(humeur.created_at) < 60000;
        
        return `
            <div class="mood-item ${isRecent ? 'new-post' : ''}">
                <div class="mood-header">
                    <div class="mood-user">
                        <span class="mood-name">${escapeHtml(humeur.nom)}</span>
                        <span class="mood-emoji">${humeur.emoji}</span>
                        <span class="mood-lang">${humeur.langage_prefere}</span>
                    </div>
                    <span class="mood-time">${timeDisplay}</span>
                </div>
                <div class="mood-content">
                    <div class="mood-code">${codeSnippet}</div>
                    ${humeur.commentaire ? `<div class="mood-comment">"${escapeHtml(humeur.commentaire)}"</div>` : ''}
                    <div class="mood-tags">
                        <span class="tag">${formatPreference(humeur.autre_preference)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function generateCodeSnippet(humeur) {
    const langagePrefere = humeur.langage_prefere || 'javascript';
    const templates = {
        javascript: `let humeur = "${humeur.emoji}";${humeur.commentaire ? ` // ${escapeHtml(humeur.commentaire)}` : ''}`,
        typescript: `const humeur: string = "${humeur.emoji}";${humeur.commentaire ? ` // ${escapeHtml(humeur.commentaire)}` : ''}`,
        python: `humeur = "${humeur.emoji}"${humeur.commentaire ? `  # ${escapeHtml(humeur.commentaire)}` : ''}`,
        java: `String humeur = "${humeur.emoji}";${humeur.commentaire ? ` // ${escapeHtml(humeur.commentaire)}` : ''}`,
        csharp: `string humeur = "${humeur.emoji}";${humeur.commentaire ? ` // ${escapeHtml(humeur.commentaire)}` : ''}`,
        php: `$humeur = "${humeur.emoji}";${humeur.commentaire ? ` // ${escapeHtml(humeur.commentaire)}` : ''}`,
        cpp: `std::string humeur = "${humeur.emoji}";${humeur.commentaire ? ` // ${escapeHtml(humeur.commentaire)}` : ''}`,
        rust: `let humeur = "${humeur.emoji}";${humeur.commentaire ? ` // ${escapeHtml(humeur.commentaire)}` : ''}`,
        go: `humeur := "${humeur.emoji}"${humeur.commentaire ? ` // ${escapeHtml(humeur.commentaire)}` : ''}`,
        kotlin: `val humeur = "${humeur.emoji}"${humeur.commentaire ? ` // ${escapeHtml(humeur.commentaire)}` : ''}`,
        swift: `let humeur = "${humeur.emoji}"${humeur.commentaire ? ` // ${escapeHtml(humeur.commentaire)}` : ''}`,
        ruby: `humeur = "${humeur.emoji}"${humeur.commentaire ? ` # ${escapeHtml(humeur.commentaire)}` : ''}`
    };
    return templates[langagePrefere] || templates.javascript;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `${diffMinutes}min`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h${diffMinutes % 60}min`;
}

function formatPreference(preference) {
    if (!preference) return '';
    const formatted = preference.replace(/-/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateVisualization() {
    const container = document.getElementById('moodVisualization');
    if (!container) return;
    if (humeurs.length === 0) {
        container.innerHTML = '';
        return;
    }
    const emojiCounts = {};
    const langageCounts = {};
    humeurs.forEach(humeur => {
        emojiCounts[humeur.emoji] = (emojiCounts[humeur.emoji] || 0) + 1;
        langageCounts[humeur.langage_prefere] = (langageCounts[humeur.langage_prefere] || 0) + 1;
    });
    container.innerHTML = `
        <div class="viz-section">
            <h4>🎭 Top Émojis</h4>
            <div class="viz-items">
                ${Object.entries(emojiCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
                    .map(([emoji, count]) => `<div class="mood-bubble"><span>${emoji}</span><span class="mood-count">${count}</span></div>`).join('')}
            </div>
        </div>
        <div class="viz-section">
            <h4>💻 Langages Populaires</h4>
            <div class="viz-items">
                ${Object.entries(langageCounts).sort((a, b) => b[1] - a[1]).slice(0, 3)
                    .map(([langage, count]) => `<div class="lang-bubble"><span>${langage}</span><span class="lang-count">${count}</span></div>`).join('')}
            </div>
        </div>
    `;
}

function toggleAdminPanel() {
    let panel = document.getElementById('hiddenAdminPanel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'hiddenAdminPanel';
        panel.className = 'hidden-admin-panel';
        panel.innerHTML = `
            <div class="admin-overlay" onclick="closeAdminPanel()"></div>
            <div class="admin-content" style="
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10001; max-width: 400px; width: 90%;
            ">
                <div class="admin-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0;">🎓 Panneau Enseignant</h3>
                    <button onclick="closeAdminPanel()" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
                </div>
                <div class="admin-body">
                    <p style="margin: 0 0 15px 0; font-size: 14px;">
                        <strong>Raccourcis :</strong><br>
                        • Ctrl+Shift+A : Ce panneau<br>
                        • Ctrl+E : Export CSV<br>
                        • Ctrl+J : Export JSON<br>
                        <strong>Stats :</strong> ${humeurs.length} participants
                    </p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button onclick="clearAllMoods()" style="background: #f44336; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">🗑️ Effacer tout</button>
                        <button onclick="exportMoods()" style="background: #4caf50; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">📄 Export CSV</button>
                        <button onclick="exportMoodsJSON()" style="background: #2196f3; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">💾 Export JSON</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    }
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

window.closeAdminPanel = function() {
    const panel = document.getElementById('hiddenAdminPanel');
    if (panel) panel.style.display = 'none';
};

window.clearAllMoods = async function() {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir effacer TOUS les codes humeur ?')) return;
    try {
        const { error } = await supabase.from('humeur').delete().neq('id', 0);
        if (error) throw error;
        setTimeout(() => loadHumeursFromSupabase(), 1000);
    } catch (error) {
        console.error('❌ Erreur suppression:', error);
        alert('Erreur lors de la suppression: ' + error.message);
    }
};

window.exportMoods = function() {
    if (humeurs.length === 0) { alert('Aucun code humeur à exporter !'); return; }
    const exportData = humeurs.map(humeur => ({
        Prénom: humeur.nom, Emoji: humeur.emoji, 'Langage Préféré': humeur.langage_prefere,
        'Autre Préférence': humeur.autre_preference || '', Commentaire: humeur.commentaire || '',
        'Date/Heure': formatTime(humeur.created_at), Timestamp: humeur.created_at
    }));
    const headers = Object.keys(exportData[0]);
    const csvContent = [headers.join(','), ...exportData.map(row => 
        headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    downloadFile(csvContent, `emoji-code-humeur-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

window.exportMoodsJSON = function() {
    if (humeurs.length === 0) { alert('Aucun code humeur à exporter !'); return; }
    const exportData = {
        metadata: { exportDate: new Date().toISOString(), mode: CONFIG.mode,
            sessionDuration: Math.floor((new Date() - sessionStartTime) / 60000),
            totalParticipants: humeurs.length, version: 'modulaire-2.2' },
        humeurs: humeurs
    };
    downloadFile(JSON.stringify(exportData, null, 2), `emoji-code-humeur-session-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
};

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType + ';charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename; link.style.display = 'none';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    if (realtimeChannel) supabase.removeChannel(realtimeChannel);
});

async function initApp() {
    console.log('🚀 Initialisation Emoji Code Humeur (version modulaire)...');
    try {
        setupEventListeners();
        const supabaseSuccess = await initSupabase();
        if (!supabaseSuccess) {
            console.warn('⚠️ Échec de la connexion Supabase');
            return;
        }
        updateDisplay();
        console.log('✅ Application initialisée avec succès');
        console.log('📊 Mode actuel: Supabase (modulaire)');
        console.log('📈 Humeurs chargées:', humeurs.length);
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        alert('Erreur lors de l\'initialisation de l\'application. Vérifiez la console.');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

window.addEventListener('load', () => {
    if (humeurs.length === 0) {
        console.log('🔄 Initialisation fallback...');
        initApp();
    }
});

console.log('✅ Fin de main.js chargée (version modulaire avec fallback)');