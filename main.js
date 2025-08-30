// main.js
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

async function addHumeur(humeur) {
    humeur.created_at = new Date().toISOString();

    if (CONFIG.mode === 'supabase' && supabase) {
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
            return false;
        }
    }
    return false;
}

// ========================================
// INTERFACE UTILISATEUR
// ========================================

function setupEventListeners() {
    // Gestion de la sélection d'emoji
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedEmoji = btn.dataset.emoji;
        });
    });

    // Gestion du formulaire
    document.getElementById('moodForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitMood();
    });

    // Timer de session
    setInterval(() => {
        const minutes = Math.floor((new Date() - sessionStartTime) / 60000);
        document.getElementById('sessionTime').textContent = minutes;
    }, 60000);

    // Plus d'indicateur de mise à jour - interface plus clean
}

async function submitMood() {
    const nom = document.getElementById('studentName').value.trim();
    const langage_prefere = document.getElementById('favoriteLanguage').value; // Nouveau champ
    const autre_preference = document.getElementById('otherPreference').value; // Nouveau champ
    const commentaire = document.getElementById('comment').value.trim();
    const submitBtn = document.getElementById('submitBtn');

    // Empêcher double soumission
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;

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
            submitBtn.disabled = false;
        }, 2500);
    } else {
        submitBtn.textContent = '❌ Erreur - Réessayer';
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 3000);
    }
}

function resetForm() {
    document.getElementById('moodForm').reset();
    document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
    selectedEmoji = '';
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

    listContainer.innerHTML = humeurs.map((humeur, index) => {
        const codeSnippet = generateCodeSnippet(humeur);
        const timeDisplay = formatTime(humeur.created_at);
        const isRecent = new Date() - new Date(humeur.created_at) < 60000; // Moins d'1 minute

        // Générer des réactions aléatoires style réseaux sociaux
        const reactions = generateRandomReactions();
        const avatar = generateAvatar(humeur.nom);
        const badge = getBadge(humeur.langage_prefere);

        return `
            <div class="social-post ${isRecent ? 'new-post' : ''}">
                <div class="post-header">
                    <div class="user-info">
                        <div class="avatar">${avatar}</div>
                        <div class="user-details">
                            <div class="username">
                                ${escapeHtml(humeur.nom)}
                                <span class="badge ${badge.class}">${badge.icon}</span>
                            </div>
                            <div class="post-time">${timeDisplay}</div>
                        </div>
                    </div>
                    <div class="post-mood">${humeur.emoji}</div>
                </div>

                <div class="post-content">
                    <div class="preferences-tags">
                        <span class="tag language-tag">💻 ${humeur.langage_prefere}</span>
                        <span class="tag hobby-tag">✨ ${formatPreference(humeur.autre_preference)}</span>
                    </div>
                    
                    <div class="code-container">
                        <div class="code-header">
                            <span class="code-title">Mon code du moment :</span>
                            <button class="copy-btn" onclick="copyCode('${escapeForJs(codeSnippet)}')" title="Copier le code">📋</button>
                        </div>
                        <div class="code-display">
                            ${codeSnippet}
                        </div>
                    </div>

                    ${humeur.commentaire ? `
                        <div class="post-caption">
                            <span class="quote-icon">💭</span>
                            "${escapeHtml(humeur.commentaire)}"
                        </div>
                    ` : ''}
                </div>

                <div class="post-actions">
                    <div class="reactions">
                        ${reactions.map(r => `<span class="reaction" onclick="addReaction(${index}, '${r.emoji}')">${r.emoji} ${r.count}</span>`).join('')}
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn like-btn" onclick="likePost(${index})">
                            <span class="icon">❤️</span>
                            <span class="label">J'aime</span>
                        </button>
                        <button class="action-btn comment-btn" onclick="commentPost(${index})">
                            <span class="icon">💬</span>
                            <span class="label">Commenter</span>
                        </button>
                        <button class="action-btn share-btn" onclick="sharePost(${index})">
                            <span class="icon">📤</span>
                            <span class="label">Partager</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function generateCodeSnippet(humeur) {
    const langagePrefere = humeur.langage_prefere || humeur.langage || 'javascript';
    const autrePreference = humeur.autre_preference || 'inconnue';
    
    const templates = {
        javascript: `let humeur = "${humeur.emoji}";
let preference = "${autrePreference}";${humeur.commentaire ? `\n<span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,
        
        typescript: `const humeur: string = "${humeur.emoji}";
const preference: string = "${autrePreference}";${humeur.commentaire ? `\n<span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,
        
        python: `humeur = "${humeur.emoji}"
preference = "${autrePreference}"${humeur.commentaire ? `\n<span class="comment"># ${escapeHtml(humeur.commentaire)}</span>` : ''}`,
        
        java: `String humeur = "${humeur.emoji}";
String preference = "${autrePreference}";${humeur.commentaire ? `\n<span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,
        
        csharp: `string humeur = "${humeur.emoji}";
string preference = "${autrePreference}";${humeur.commentaire ? `\n<span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,
        
        php: `$humeur = "${humeur.emoji}";
$preference = "${autrePreference}";${humeur.commentaire ? `\n<span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,
        
        cpp: `std::string humeur = "${humeur.emoji}";
std::string preference = "${autrePreference}";${humeur.commentaire ? `\n<span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,
        
        rust: `let humeur = "${humeur.emoji}";
let preference = "${autrePreference}";${humeur.commentaire ? `\n<span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`,
        
        go: `humeur := "${humeur.emoji}"
preference := "${autrePreference}"${humeur.commentaire ? `\n<span class="comment">// ${escapeHtml(humeur.commentaire)}</span>` : ''}`
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

function generateRandomReactions() {
    const possibleReactions = [
        { emoji: '❤️', baseCount: 3 },
        { emoji: '😍', baseCount: 2 },
        { emoji: '🔥', baseCount: 4 },
        { emoji: '👏', baseCount: 2 },
        { emoji: '💯', baseCount: 1 },
        { emoji: '🚀', baseCount: 2 },
        { emoji: '😂', baseCount: 1 },
        { emoji: '🤯', baseCount: 1 }
    ];
    
    return possibleReactions
        .filter(() => Math.random() > 0.4) // 60% de chance d'apparaître
        .slice(0, 4) // Max 4 réactions
        .map(r => ({
            emoji: r.emoji,
            count: r.baseCount + Math.floor(Math.random() * 5)
        }));
}

function escapeForJs(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// Fonctions d'interaction style réseaux sociaux
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

window.addReaction = function(postIndex, emoji) {
    // Animation de réaction
    const reactionBtn = event.target;
    reactionBtn.style.animation = 'reactionPop 0.3s ease';
    setTimeout(() => {
        reactionBtn.style.animation = '';
    }, 300);
    
    showNotification(`Réaction ajoutée ! ${emoji}`, 'success');
};

window.likePost = function(postIndex) {
    const btn = event.target.closest('.like-btn');
    btn.classList.toggle('liked');
    
    if (btn.classList.contains('liked')) {
        btn.querySelector('.icon').textContent = '💖';
        btn.style.animation = 'heartBeat 0.5s ease';
        createHeartParticles(btn);
    } else {
        btn.querySelector('.icon').textContent = '❤️';
    }
    
    setTimeout(() => {
        btn.style.animation = '';
    }, 500);
};

window.commentPost = function(postIndex) {
    showNotification('💬 Fonctionnalité bientôt disponible !', 'info');
};

window.sharePost = function(postIndex) {
    const humeur = humeurs[postIndex];
    const text = `${humeur.nom} code avec ${humeur.emoji} en ${humeur.langage_prefere} ! 🚀`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Emoji Code Humeur',
            text: text,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(text + ' ' + window.location.href).then(() => {
            showNotification('Lien copié ! 📤', 'success');
        });
    }
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

function createHeartParticles(element) {
    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.className = 'heart-particle';
        particle.textContent = '💖';
        particle.style.position = 'absolute';
        particle.style.left = (element.offsetLeft + Math.random() * 50) + 'px';
        particle.style.top = (element.offsetTop + Math.random() * 50) + 'px';
        particle.style.fontSize = (0.8 + Math.random() * 0.4) + 'em';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        
        element.parentElement.appendChild(particle);
        
        // Animation
        particle.style.animation = `heartFloat 2s ease-out forwards`;
        
        setTimeout(() => {
            particle.remove();
        }, 2000);
    }
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

    // Configuration des event listeners d'abord
    setupEventListeners();

    // Initialisation Supabase obligatoire
    await initSupabase();

    // Mise à jour initiale de l'affichage
    updateDisplay();

    console.log('✅ Application initialisée avec succès');
    console.log('📊 Mode actuel:', CONFIG.mode);
    console.log('🔄 Auto-actualisation activée');
    console.log('📈 Codes humeur chargés:', humeurs.length);
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
