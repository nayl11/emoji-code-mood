// main.js - Version avec auto-actualisation et préférences étendues
// ========================================
// CONFIGURATION ET INITIALISATION
// ========================================

console.log('🎭 Emoji Code Humeur - Version Auto v2.1 (Français)');

// Vérification stricte de la configuration Supabase
if (!window.PRIVATE_CONFIG || !window.PRIVATE_CONFIG.supabaseUrl || !window.PRIVATE_CONFIG.supabaseAnonKey) {
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

// Configuration auto-actualisation
const AUTO_REFRESH_INTERVAL = 30000; // 30 secondes
const CONNECTION_CHECK_INTERVAL = 10000; // 10 secondes

// ========================================
// INITIALISATION SUPABASE VIA MODULE
// ========================================
import { getSupabaseClient } from './supabaseClient.js';

async function initSupabase() {
    // Charger dynamiquement la lib si besoin (pour navigateur)
    if (!window.supabaseLib) {
        window.supabaseLib = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
    }
    try {
        supabase = getSupabaseClient();
        // Test de connexion avec la table "humeur"
        const { error } = await supabase.from('humeur').select('count').limit(1);
        if (error) {
            throw error;
        }
        console.log('🚀 Supabase connecté avec succès (table humeur)');
        isConnected = true;
        updateConnectionStatus(true);
        await loadHumeursFromSupabase();
        setupRealtimeSubscription();
        startAutoRefresh();
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion Supabase :', error.message || error);
        isConnected = false;
        updateConnectionStatus(false);
        alert('Connexion à Supabase impossible. Vérifiez la configuration et que la table "humeur" existe.');
        return false;
    }
}

function updateConnectionStatus(connected) {
    const indicator = document.getElementById('modeIndicator');
    const icon = document.getElementById('modeIcon');
    const text = document.getElementById('modeText');
    
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
        
        // Réactiver la connexion si elle était en erreur
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

    supabase
        .channel('humeur_realtime')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'humeur' },
            (payload) => {
                console.log('🔄 Changement temps réel:', payload.eventType);

                if (payload.eventType === 'INSERT') {
                    humeurs.unshift(payload.new);
                    updateDisplay();

                    // Animation d'arrivée
                    setTimeout(() => {
                        const newItem = document.querySelector('.mood-item');
                        if (newItem) {
                            newItem.style.animation = 'slideIn 0.5s ease, glow 2s ease';
                            // Supprimer l'animation après
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
    // Actualisation automatique périodique
    autoRefreshInterval = setInterval(async () => {
        console.log('🔄 Actualisation automatique...');
        await loadHumeursFromSupabase();
    }, AUTO_REFRESH_INTERVAL);

    // Vérification de connexion
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
// GESTION DES CODES HUMEUR
// ========================================

<<<<<<< HEAD
async function addMood(mood) {
    // Vérifier si un mood similaire a déjà été soumis récemment (protection anti-doublon)
    const recentMood = moods.find(m => 
        m.name === mood.name && 
        m.emoji === mood.emoji && 
        m.language === mood.language &&
        Date.now() - new Date(m.created_at).getTime() < 30000 // 30 secondes
    );
    
    if (recentMood) {
        console.warn('⚠️ Mood similaire déjà soumis récemment, évitons le doublon');
        return false;
    }
    
    mood.created_at = new Date().toISOString();
=======
async function addHumeur(humeur) {
    humeur.created_at = new Date().toISOString();
>>>>>>> 57e3340f1ac7654842fa49c482a8fa317a6ae8dc

    // Mode Supabase
    if (supabase) {
        try {
            // Vérifier si une humeur identique existe déjà récemment (dernières 5 minutes)
            const cinqMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            
            const { data: existing, error: selectError } = await supabase
                .from('humeur')
                .select('*')
                .eq('nom', humeur.nom)
                .eq('emoji', humeur.emoji)
                .eq('langage_prefere', humeur.langage_prefere)
                .eq('autre_preference', humeur.autre_preference)
                .eq('commentaire', humeur.commentaire || null)
                .gte('created_at', cinqMinutesAgo)
                .limit(1);

            if (selectError) throw selectError;
            if (existing && existing.length > 0) {
                alert('Ce code humeur a déjà été enregistré récemment. Attendez quelques minutes avant de renvoyer.');
                return false;
            }

            const { data, error } = await supabase
                .from('humeur')
                .insert([humeur])
                .select();

            if (error) throw error;
            console.log('✅ Humeur ajoutée à Supabase');
            return true;
        } catch (error) {
            console.error('❌ Erreur ajout Supabase:', error);
            // Fallback vers le mode local seulement si c'est une erreur de réseau
            if (error.code === 'NETWORK_ERROR' || error.message.includes('fetch')) {
                console.log('🔄 Basculement vers le mode local (erreur réseau)');
                return addMoodLocal(mood);
            }
            return false;
        }
    }
    
    // Mode local (fallback)
    return addMoodLocal(mood);
}

function addMoodLocal(mood) {
    try {
        // Vérifier si un mood identique existe déjà en local
        const existingMood = moods.find(m => 
            m.name === mood.name && 
            m.emoji === mood.emoji && 
            m.language === mood.language &&
            m.comment === mood.comment
        );
        
        if (existingMood) {
            console.warn('⚠️ Mood identique déjà présent en local');
            return false;
        }
        
        mood.id = Date.now(); // ID unique simple
        moods.unshift(mood);
        
        // Sauvegarder en localStorage
        localStorage.setItem('emojiMoodLocal', JSON.stringify(moods));
        
        console.log('✅ Mood ajouté en local');
        return true;
    } catch (error) {
        console.error('❌ Erreur ajout local:', error);
        return false;
    }
}

// ========================================
// INTERFACE UTILISATEUR
// ========================================

function setupEventListeners() {
    console.log('🔧 Configuration des event listeners...');
    
    // Gestion de la sélection d'emoji
    const emojiButtons = document.querySelectorAll('.emoji-btn');
    console.log(`🎯 ${emojiButtons.length} boutons emoji trouvés`);
    
    emojiButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            console.log(`🎯 Emoji cliqué: ${btn.dataset.emoji}`);
            document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedEmoji = btn.dataset.emoji;
            console.log(`✅ Emoji sélectionné: ${selectedEmoji}`);
        });
    });

    // Timer de session
    setInterval(() => {
        const minutes = Math.floor((new Date() - sessionStartTime) / 60000);
        document.getElementById('sessionTime').textContent = minutes;
    }, 60000);

    // Timer de session
    setInterval(() => {
        const minutes = Math.floor((new Date() - sessionStartTime) / 60000);
        document.getElementById('sessionTime').textContent = minutes;
    }, 60000);

    // Raccourci clavier pour panneau de contrôle (Ctrl+Shift+A)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            toggleAdminPanel();
        }
    });
}

// Gestion du panneau d'administration caché
function toggleAdminPanel() {
    let panel = document.getElementById('hiddenAdminPanel');
    
    if (!panel) {
        // Créer le panneau s'il n'existe pas
        panel = document.createElement('div');
        panel.id = 'hiddenAdminPanel';
        panel.className = 'hidden-admin-panel';
        panel.innerHTML = `
            <div class="admin-overlay" onclick="closeAdminPanel()"></div>
            <div class="admin-content">
                <div class="admin-header">
                    <h3>🎓 Panneau Enseignant</h3>
                    <button class="close-btn" onclick="closeAdminPanel()">✕</button>
                </div>
                <div class="admin-body">
                    <p class="admin-info">
                        <strong>Raccourci :</strong> Ctrl+Shift+A<br>
                        <strong>Stats :</strong> ${humeurs.length} participants
                    </p>
                    <div class="admin-actions">
                        <button class="admin-btn danger" onclick="clearAllMoods()">🗑️ Effacer tout</button>
                        <button class="admin-btn success" onclick="exportMoods()">📄 Export CSV</button>
                        <button class="admin-btn info" onclick="exportMoodsJSON()">💾 Export JSON</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    }
    
    panel.classList.toggle('active');
}

window.closeAdminPanel = function() {
    const panel = document.getElementById('hiddenAdminPanel');
    if (panel) {
        panel.classList.remove('active');
    }
};

async function submitMood() {
    const nom = document.getElementById('studentName').value.trim();
    const langage_prefere = document.getElementById('favoriteLanguage').value; // Nouveau champ
    const autre_preference = document.getElementById('otherPreference').value; // Nouveau champ
    const commentaire = document.getElementById('comment').value.trim();
    const submitBtn = document.getElementById('submitBtn');

    // Empêcher double soumission
    if (submitBtn.disabled) return;
    
    // Désactiver le bouton et tous les champs du formulaire
    submitBtn.disabled = true;
    document.getElementById('studentName').disabled = true;
    document.getElementById('language').disabled = true;
    document.getElementById('comment').disabled = true;
    document.querySelectorAll('.emoji-btn').forEach(btn => btn.disabled = true);

    // Validations
    if (!selectedEmoji) {
        alert('N\'oublie pas de choisir un emoji ! 😊');
        submitBtn.disabled = false;
        return;
    }

    if (nom.length < 2) {
        alert('Le prénom doit contenir au moins 2 caractères');
        submitBtn.disabled = false;
        return;
    }

    if (!langage_prefere) {
        alert('Choisis ton langage préféré !');
        submitBtn.disabled = false;
        return;
    }

    if (!autre_preference) {
        alert('Choisis ta préférence additionnelle !');
        submitBtn.disabled = false;
        return;
    }

    const humeur = {
        nom: nom,
        emoji: selectedEmoji,
        langage_prefere: langage_prefere,    // Nouveau champ
        autre_preference: autre_preference,   // Nouveau champ
        commentaire: commentaire || null
    };

    // Animation de chargement
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '🔄 Envoi en cours...';

    const success = await addHumeur(humeur);

    if (success) {
        resetForm();
        submitBtn.textContent = '✅ Envoyé avec succès !';
        setTimeout(() => {
            submitBtn.textContent = originalText;
            enableForm();
        }, 2500);
    } else {
        submitBtn.textContent = '❌ Erreur - Réessayer';
        setTimeout(() => {
            submitBtn.textContent = originalText;
            enableForm();
        }, 3000);
    }
}

function resetForm() {
    document.getElementById('moodForm').reset();
    document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
    selectedEmoji = '';
}

function enableForm() {
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('studentName').disabled = false;
    document.getElementById('language').disabled = false;
    document.getElementById('comment').disabled = false;
    document.querySelectorAll('.emoji-btn').forEach(btn => btn.disabled = false);
}

// ========================================
// AFFICHAGE ET VISUALISATION
// ========================================

function updateDisplay() {
    updateStats();
    updateMoodList();
    updateVisualization();
    // Suppression de updateLastUpdateTime()
}

// Fonction supprimée - plus d'indicateur de mise à jour
// function updateLastUpdateTime() { ... }

function updateStats() {
    document.getElementById('totalParticipants').textContent = humeurs.length;

    const uniqueEmojis = new Set(humeurs.map(h => h.emoji));
    document.getElementById('moodVariety').textContent = uniqueEmojis.size;

    const minutes = Math.floor((new Date() - sessionStartTime) / 60000);
    document.getElementById('sessionTime').textContent = minutes;
}

function updateMoodList() {
    const listContainer = document.getElementById('moodList');

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

    // Affichage unique compact pour tous les participants
    listContainer.innerHTML = humeurs.map((humeur, index) => {
        const codeSnippet = generateCodeSnippet(humeur);
        const timeDisplay = formatTime(humeur.created_at);
        const isRecent = new Date() - new Date(humeur.created_at) < 60000;
        const avatar = generateAvatar(humeur.nom);
        const badge = getBadge(humeur.langage_prefere);
        return `
            <div class="social-post compact ${isRecent ? 'new-post' : ''}">
                <div class="compact-header">
                    <div class="compact-user">
                        <div class="mini-avatar">${avatar}</div>
                        <span class="compact-name">${escapeHtml(humeur.nom)}</span>
                        <span class="mini-badge ${badge.class}">${badge.icon}</span>
                        <span class="compact-mood">${humeur.emoji}</span>
                    </div>
                    <span class="compact-time">${timeDisplay}</span>
                </div>
                <div class="compact-content">
                    <div class="compact-tags">
                        <span class="mini-tag lang">${humeur.langage_prefere}</span>
                        <span class="mini-tag pref">${formatPreference(humeur.autre_preference)}</span>
                    </div>
                    <div class="compact-code">
                        <span class="compact-code-text">${codeSnippet.replace(/<span class=\"comment\">.*?<\/span>/g, '')}</span>
                        <button class="mini-copy" onclick="copyCode('${escapeForJs(codeSnippet)}')" title="Copier">📋</button>
                    </div>
                    ${humeur.commentaire ? `<div class="compact-comment"> "${escapeHtml(humeur.commentaire)}"</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function generateCodeSnippet(humeur) {
    const langagePrefere = humeur.langage_prefere || humeur.langage || 'javascript';
    
    const templates = {
        javascript: `let humeur = "${humeur.emoji}";${humeur.commentaire ? ` <span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,
        
        typescript: `const humeur: string = "${humeur.emoji}";${humeur.commentaire ? ` <span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,
        
        python: `humeur = "${humeur.emoji}"${humeur.commentaire ? `  <span class="comment"># ${escapeHtml(humeur.commentaire)}</span>` : ''}`,
        
        java: `String humeur = "${humeur.emoji}";${humeur.commentaire ? ` <span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,
        
        csharp: `string humeur = "${humeur.emoji}";${humeur.commentaire ? ` <span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,
        
        php: `$humeur = "${humeur.emoji}";${humeur.commentaire ? ` <span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,
        
        cpp: `std::string humeur = "${humeur.emoji}";${humeur.commentaire ? ` <span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,
        
        rust: `let humeur = "${humeur.emoji}";${humeur.commentaire ? ` <span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,
        
        go: `humeur := "${humeur.emoji}"${humeur.commentaire ? ` <span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,

        kotlin: `val humeur = "${humeur.emoji}"${humeur.commentaire ? ` <span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,

        swift: `let humeur = "${humeur.emoji}"${humeur.commentaire ? ` <span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,

        ruby: `humeur = "${humeur.emoji}"${humeur.commentaire ? ` <span class="comment"># ${escapeHtml(humeur.commentaire)}</span>` : ''}`
    };

    return templates[langagePrefere] || templates.javascript;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);

    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `${diffMinutes}min`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h${diffMinutes % 60 > 0 ? diffMinutes % 60 + 'min' : ''}`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// ========================================
// FONCTIONS STYLE RÉSEAUX SOCIAUX
// ========================================

function generateAvatar(nom) {
    const firstLetter = nom.charAt(0).toUpperCase();
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const colorIndex = nom.charCodeAt(0) % colors.length;
    return `<div class="avatar-letter" style="background-color: ${colors[colorIndex]}">${firstLetter}</div>`;
}

function getBadge(langage) {
    const badges = {
        javascript: { icon: '⚡', class: 'badge-js' },
        typescript: { icon: '🔷', class: 'badge-ts' },
        python: { icon: '🐍', class: 'badge-python' },
        java: { icon: '☕', class: 'badge-java' },
        csharp: { icon: '💎', class: 'badge-csharp' },
        php: { icon: '🐘', class: 'badge-php' },
        cpp: { icon: '⚙️', class: 'badge-cpp' },
        rust: { icon: '🦀', class: 'badge-rust' },
        go: { icon: '🚀', class: 'badge-go' },
        kotlin: { icon: '🎯', class: 'badge-kotlin' },
        swift: { icon: '🍎', class: 'badge-swift' },
        ruby: { icon: '💎', class: 'badge-ruby' }
    };
    return badges[langage] || { icon: '💻', class: 'badge-default' };
}

function formatPreference(preference) {
    const formatted = preference.replace(/-/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function escapeForJs(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// Fonction de copie de code simplifiée
window.copyCode = function(code) {
    // Nettoyer le code HTML pour ne garder que le texte
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = code;
    const cleanCode = tempDiv.textContent || tempDiv.innerText || '';
    
    navigator.clipboard.writeText(cleanCode).then(() => {
        showNotification('Code copié ! 📋', 'success');
    }).catch(() => {
        showNotification('Erreur lors de la copie', 'error');
    });
};

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateVisualization() {
    const container = document.getElementById('moodVisualization');

    if (humeurs.length === 0) {
        container.innerHTML = '';
        return;
    }

    const emojiCounts = {};
    const langageCounts = {};
    const preferenceCounts = {};
    
    humeurs.forEach(humeur => {
        emojiCounts[humeur.emoji] = (emojiCounts[humeur.emoji] || 0) + 1;
        langageCounts[humeur.langage_prefere] = (langageCounts[humeur.langage_prefere] || 0) + 1;
        preferenceCounts[humeur.autre_preference] = (preferenceCounts[humeur.autre_preference] || 0) + 1;
    });

    container.innerHTML = `
        <div class="viz-section">
            <h4>🎭 Top Émojis</h4>
            <div class="viz-items">
                ${Object.entries(emojiCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([emoji, count]) => `
                        <div class="mood-bubble">
                            <span>${emoji}</span>
                            <span class="mood-count">${count}</span>
                        </div>
                    `).join('')}
            </div>
        </div>
        <div class="viz-section">
            <h4>💻 Langages Populaires</h4>
            <div class="viz-items">
                ${Object.entries(langageCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([langage, count]) => `
                        <div class="lang-bubble">
                            <span>${langage}</span>
                            <span class="lang-count">${count}</span>
                        </div>
                    `).join('')}
            </div>
        </div>
    `;
}

// ========================================
// CONTRÔLES ENSEIGNANT SIMPLIFIÉS
// ========================================

// Suppression du bouton actualiser - tout est automatique maintenant !

window.clearAllMoods = async function() {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir effacer TOUS les codes humeur ?')) {
        return;
    }

    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '🗑️ Suppression...';
    btn.disabled = true;

    try {
        const { error } = await supabase
            .from('humeur')
            .delete()
            .neq('id', 0);

        if (error) throw error;
        btn.textContent = '✅ Effacé';
        
        // Actualisation automatique après suppression
        setTimeout(() => {
            loadHumeursFromSupabase();
        }, 1000);
        
    } catch (error) {
        btn.textContent = '❌ Erreur';
        console.error('Erreur suppression:', error);
    }

    setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
    }, 2000);
};

window.exportMoods = function() {
    if (humeurs.length === 0) {
        alert('Aucun code humeur à exporter !');
        return;
    }

    const exportData = humeurs.map(humeur => ({
        Prénom: humeur.nom,
        Emoji: humeur.emoji,
        'Langage Préféré': humeur.langage_prefere || humeur.langage,
        'Autre Préférence': humeur.autre_preference || '',
        Commentaire: humeur.commentaire || '',
        'Date/Heure': formatTime(humeur.created_at),
        Timestamp: humeur.created_at,
        Mode: CONFIG.mode
    }));

    const headers = Object.keys(exportData[0]);
    const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
            headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(',')
        )
    ].join('\n');

    downloadFile(csvContent, `emoji-code-humeur-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

window.exportMoodsJSON = function() {
    if (humeurs.length === 0) {
        alert('Aucun code humeur à exporter !');
        return;
    }

    const exportData = {
        metadata: {
            exportDate: new Date().toISOString(),
            mode: CONFIG.mode,
            sessionDuration: Math.floor((new Date() - sessionStartTime) / 60000),
            totalParticipants: humeurs.length,
            uniqueEmojis: new Set(humeurs.map(h => h.emoji)).size,
            version: 'auto-refresh-2.1-fr',
            autoRefreshEnabled: true
        },
        humeurs: humeurs,
        analytics: generateAnalytics()
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, `emoji-code-humeur-session-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
};

function generateAnalytics() {
    const emojiStats = {};
    const languageStats = {};
    const preferenceStats = {};

    humeurs.forEach(humeur => {
        emojiStats[humeur.emoji] = (emojiStats[humeur.emoji] || 0) + 1;
        languageStats[humeur.langage_prefere || humeur.langage] = (languageStats[humeur.langage_prefere || humeur.langage] || 0) + 1;
        preferenceStats[humeur.autre_preference] = (preferenceStats[humeur.autre_preference] || 0) + 1;
    });

    return {
        emojiDistribution: emojiStats,
        languagePreferences: languageStats,
        otherPreferences: preferenceStats,
        topEmojis: Object.entries(emojiStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([emoji, count]) => ({ emoji, count, percentage: Math.round(count / humeurs.length * 100) })),
        topLanguages: Object.entries(languageStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([langage, count]) => ({ langage, count, percentage: Math.round(count / humeurs.length * 100) }))
    };
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType + ';charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ========================================
// NETTOYAGE À LA FERMETURE
// ========================================

window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
});

// ========================================
// INITIALISATION DE L'APPLICATION
// ========================================

async function initApp() {
    console.log('🚀 Initialisation Emoji Code Humeur (auto-actualisation)...');

    try {
        // Configuration des event listeners d'abord (toujours nécessaire)
        setupEventListeners();

        // Initialisation Supabase obligatoire
        const supabaseSuccess = await initSupabase();
        
        if (!supabaseSuccess) {
            console.warn('⚠️ Mode développement local activé (Supabase non disponible)');
            // Mode local pour le développement
            setupLocalMode();
        }

        // Mise à jour initiale de l'affichage
        updateDisplay();

        console.log('✅ Application initialisée avec succès');
        console.log('📊 Mode actuel:', supabaseSuccess ? 'Supabase' : 'Local');
        console.log('📈 Mood codes chargés:', moods.length);
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        console.log('🔄 Tentative de récupération en mode local...');
        
        // En cas d'erreur, essayer au moins de configurer le mode local
        try {
            setupLocalMode();
            updateDisplay();
            console.log('✅ Récupération en mode local réussie');
        } catch (localError) {
            console.error('❌ Échec de la récupération en mode local:', localError);
            alert('Erreur lors de l\'initialisation de l\'application. Vérifiez la console.');
        }
    }
}

// Mode local pour le développement
function setupLocalMode() {
    console.log('🔧 Mode local activé - Données stockées en localStorage');
    
    // Charger les moods depuis localStorage
    const savedMoods = localStorage.getItem('emojiMoodLocal');
    if (savedMoods) {
        try {
            moods = JSON.parse(savedMoods);
            console.log(`📊 ${moods.length} mood codes chargés depuis localStorage`);
        } catch (error) {
            console.error('Erreur chargement localStorage:', error);
            moods = [];
        }
    }
    
    // Modifier la fonction addMood pour le mode local
    window.addMoodLocal = function(mood) {
        mood.id = Date.now(); // ID unique simple
        mood.created_at = new Date().toISOString();
        moods.unshift(mood);
        
        // Sauvegarder en localStorage
        localStorage.setItem('emojiMoodLocal', JSON.stringify(moods));
        
        updateDisplay();
        return true;
    };
    
    // S'assurer que les event listeners sont configurés en mode local
    console.log('🔧 Configuration des event listeners en mode local...');
    setupEventListeners();
<<<<<<< HEAD
=======

    // Initialisation Supabase obligatoire
    await initSupabase();

    // Mise à jour initiale de l'affichage
    updateDisplay();

    console.log('✅ Application initialisée avec succès');
    console.log('📊 Mode actuel:', CONFIG.mode);
    console.log('🔄 Auto-actualisation activée');
    console.log('📈 Codes humeur chargés:', humeurs.length);
>>>>>>> 57e3340f1ac7654842fa49c482a8fa317a6ae8dc
}

// Démarrage automatique - Multiple méthodes pour assurer le chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // Le DOM est déjà chargé
    initApp();
}

// Fallback supplémentaire
window.addEventListener('load', () => {
    // Vérifier si l'app n'est pas encore initialisée
    if (humeurs.length === 0 && !document.querySelector('.mood-item')) {
        console.log('🔄 Initialisation fallback...');
        initApp();
    }
});
