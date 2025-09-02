# 📊 Monitoring & Analytics - Suivi d'Usage Pédagogique

---
**Métadonnées**
- **Niveau :** Intermédiaire/Avancé
- **Durée :** 50 minutes
- **Prérequis :** JavaScript ES6+, concepts d'analyse de données
---

## 🎯 Objectifs d'Apprentissage

À la fin de ce chapitre, vous saurez :
- ✅ Implémenter des métriques éducatives pertinentes
- ✅ Créer un système de monitoring d'erreurs
- ✅ Analyser les données d'usage pédagogique
- ✅ Construire des tableaux de bord enseignant
- ✅ Respecter la privacy et le RGPD

---

## 📈 Métriques Éducatives Pertinentes

### **1. Analytics Intégrées dans l'Application**

#### **Collecte d'événements pédagogiques :**
```javascript
// Analytics éducatif lightweight et privacy-friendly
class EducationalAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.events = [];
        this.batchInterval = 30000; // 30 secondes
        this.maxBatchSize = 10;
        
        // Démarrage automatique de la collecte
        this.initTracking();
    }
    
    generateSessionId() {
        // ID unique par session, pas de tracking entre sessions
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Tracking des événements pédagogiques importants
    track(eventName, properties = {}) {
        const event = {
            name: eventName,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.startTime,
            
            // Métadonnées techniques (anonymes)
            userAgent: navigator.userAgent.substring(0, 50), // Tronqué
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            
            // Propriétés spécifiques à l'événement
            ...properties
        };
        
        this.events.push(event);
        console.log('📊 Event tracked:', eventName, properties);
        
        // Envoi par batch pour performance
        if (this.events.length >= this.maxBatchSize) {
            this.sendBatch();
        }
    }
    
    // Événements spécialisés éducation
    trackMoodSubmission(data) {
        this.track('mood_submitted', {
            emoji: data.emoji,
            language: data.langage_prefere,
            hasComment: !!data.commentaire,
            commentLength: data.commentaire ? data.commentaire.length : 0,
            preference: data.autre_preference || 'none'
        });
    }
    
    trackEngagement(action) {
        this.track('user_engagement', {
            action: action, // 'emoji_selected', 'language_changed', 'comment_added'
            timestamp: Date.now()
        });
    }
    
    trackError(error, context) {
        this.track('app_error', {
            errorMessage: error.message,
            errorType: error.name,
            context: context,
            stack: error.stack ? error.stack.substring(0, 200) : null
        });
    }
    
    trackPerformance(metric, value) {
        this.track('performance_metric', {
            metric: metric, // 'page_load', 'supabase_response', 'ui_render'
            value: value,
            unit: 'ms'
        });
    }
}

// Instance globale
const analytics = new EducationalAnalytics();
```

### **2. Intégration dans les Fonctions Existantes**

#### **Tracking non-intrusif dans l'app :**
```javascript
// Enrichissement de la fonction submitMood existante
async function submitMood() {
    const startTime = performance.now();
    
    try {
        const formData = collectFormData();
        
        // Validation
        if (!selectedEmoji) {
            analytics.track('validation_error', { field: 'emoji', type: 'missing' });
            alert('N\'oublie pas de choisir un emoji ! 😊');
            return;
        }
        
        // Tracking de la soumission
        analytics.trackMoodSubmission(formData);
        
        // Envoi
        const success = await addHumeur(formData);
        
        if (success) {
            const duration = performance.now() - startTime;
            analytics.trackPerformance('mood_submission', duration);
            analytics.track('mood_success');
            
            resetForm();
        } else {
            analytics.track('mood_failure', { reason: 'server_error' });
        }
        
    } catch (error) {
        analytics.trackError(error, 'submitMood');
        console.error('Erreur lors de la soumission:', error);
    }
}

// Tracking des sélections d'emojis
document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const emoji = btn.dataset.emoji;
        selectedEmoji = emoji;
        
        // Analytics engagement
        analytics.trackEngagement('emoji_selected');
        analytics.track('emoji_choice', { emoji: emoji });
        
        updateEmojiSelection();
    });
});
```

---

## 🔍 Monitoring d'Erreurs Avancé

### **3. Système de Détection d'Erreurs**

#### **Error Boundary JavaScript :**
```javascript
class ErrorMonitor {
    constructor() {
        this.errorCount = 0;
        this.errorTypes = new Map();
        this.criticalErrors = [];
        
        // Capturer les erreurs globales
        this.setupGlobalErrorHandling();
    }
    
    setupGlobalErrorHandling() {
        // Erreurs JavaScript non catchées
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });
        
        // Promesses rejetées non catchées
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'unhandled_promise',
                message: event.reason?.message || String(event.reason),
                promise: event.promise
            });
        });
        
        // Erreurs de ressources (images, scripts, CSS)
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError({
                    type: 'resource_error',
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    message: 'Failed to load resource'
                });
            }
        }, true);
    }
    
    handleError(errorInfo) {
        this.errorCount++;
        
        // Categoriser les erreurs
        const errorType = errorInfo.type;
        const count = this.errorTypes.get(errorType) || 0;
        this.errorTypes.set(errorType, count + 1);
        
        // Erreurs critiques (qui cassent l'app)
        const criticalKeywords = [
            'supabase',
            'configuration',
            'network',
            'permission'
        ];
        
        const isCritical = criticalKeywords.some(keyword => 
            errorInfo.message.toLowerCase().includes(keyword)
        );
        
        if (isCritical) {
            this.criticalErrors.push({
                ...errorInfo,
                timestamp: new Date().toISOString(),
                sessionId: analytics.sessionId
            });
            
            // Notification immédiate pour erreurs critiques
            this.notifyCriticalError(errorInfo);
        }
        
        // Logging et analytics
        console.error('🚨 Error detected:', errorInfo);
        analytics.trackError(errorInfo, 'global_handler');
        
        // Auto-recovery pour certains types d'erreurs
        this.attemptAutoRecovery(errorInfo);
    }
    
    notifyCriticalError(errorInfo) {
        // En dev : alert pour debug immédiat
        if (window.PRIVATE_CONFIG?.mode === 'development') {
            console.error('🚨 CRITICAL ERROR:', errorInfo);
        }
        
        // En production : logging discret + métrique
        analytics.track('critical_error', {
            type: errorInfo.type,
            message: errorInfo.message.substring(0, 100)
        });
    }
    
    attemptAutoRecovery(errorInfo) {
        switch (errorInfo.type) {
            case 'resource_error':
                // Retry loading failed resources
                if (errorInfo.element === 'SCRIPT') {
                    this.retryScriptLoad(errorInfo.source);
                }
                break;
                
            case 'unhandled_promise':
                // Retry Supabase connections
                if (errorInfo.message.includes('supabase')) {
                    console.log('🔄 Tentative de reconnexion Supabase...');
                    setTimeout(() => initSupabase(), 2000);
                }
                break;
        }
    }
    
    getErrorReport() {
        return {
            totalErrors: this.errorCount,
            errorsByType: Object.fromEntries(this.errorTypes),
            criticalErrors: this.criticalErrors.length,
            sessionId: analytics.sessionId,
            uptime: Date.now() - analytics.startTime
        };
    }
}

// Instance globale
const errorMonitor = new ErrorMonitor();
```

---

## 📊 Tableau de Bord Enseignant

### **4. Dashboard Analytics en Temps Réel**

#### **Interface de monitoring pour formateur :**
```javascript
class TeacherDashboard {
    constructor() {
        this.stats = {
            totalSubmissions: 0,
            uniqueStudents: new Set(),
            emojiDistribution: new Map(),
            languagePreferences: new Map(),
            sessionDuration: [],
            errors: []
        };
        
        this.isVisible = false;
        this.setupKeyboardShortcut();
    }
    
    setupKeyboardShortcut() {
        // Ctrl + Shift + D pour ouvrir le dashboard
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggle();
            }
        });
    }
    
    toggle() {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            this.render();
        } else {
            this.hide();
        }
    }
    
    updateStats(data) {
        // Mise à jour des statistiques en temps réel
        this.stats.totalSubmissions++;
        this.stats.uniqueStudents.add(data.nom);
        
        // Distribution des emojis
        const emojiCount = this.stats.emojiDistribution.get(data.emoji) || 0;
        this.stats.emojiDistribution.set(data.emoji, emojiCount + 1);
        
        // Préférences langages
        const langCount = this.stats.languagePreferences.get(data.langage_prefere) || 0;
        this.stats.languagePreferences.set(data.langage_prefere, langCount + 1);
        
        // Refresh dashboard si visible
        if (this.isVisible) {
            this.render();
        }
    }
    
    render() {
        const dashboard = this.createDashboardHTML();
        
        // Injecter dans le DOM
        let container = document.getElementById('teacher-dashboard');
        if (!container) {
            container = document.createElement('div');
            container.id = 'teacher-dashboard';
            container.className = 'teacher-dashboard-overlay';
            document.body.appendChild(container);
        }
        
        container.innerHTML = dashboard;
        container.style.display = 'block';
        
        // Event listeners
        this.attachDashboardEvents(container);
    }
    
    createDashboardHTML() {
        const errorReport = errorMonitor.getErrorReport();
        const topEmojis = Array.from(this.stats.emojiDistribution.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        const topLanguages = Array.from(this.stats.languagePreferences.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);
        
        return `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h2>📊 Tableau de Bord Enseignant</h2>
                    <button class="close-btn" data-action="close">×</button>
                </div>
                
                <div class="dashboard-grid">
                    <!-- Métriques générales -->
                    <div class="metric-card">
                        <h3>👥 Participation</h3>
                        <div class="metric-value">${this.stats.uniqueStudents.size}</div>
                        <div class="metric-label">Étudiants actifs</div>
                    </div>
                    
                    <div class="metric-card">
                        <h3>💬 Soumissions</h3>
                        <div class="metric-value">${this.stats.totalSubmissions}</div>
                        <div class="metric-label">Humeurs partagées</div>
                    </div>
                    
                    <!-- Top emojis -->
                    <div class="chart-card">
                        <h3>🎭 Humeurs Populaires</h3>
                        <div class="emoji-chart">
                            ${topEmojis.map(([emoji, count]) => `
                                <div class="emoji-bar">
                                    <span class="emoji">${emoji}</span>
                                    <div class="bar" style="width: ${(count / this.stats.totalSubmissions) * 100}%"></div>
                                    <span class="count">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Langages préférés -->
                    <div class="chart-card">
                        <h3>💻 Langages Préférés</h3>
                        <div class="language-chart">
                            ${topLanguages.map(([lang, count]) => `
                                <div class="lang-item">
                                    <span class="lang-name">${lang}</span>
                                    <span class="lang-count">${count}</span>
                                    <div class="lang-bar" style="width: ${(count / this.stats.totalSubmissions) * 100}%"></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Monitoring technique -->
                    <div class="status-card ${errorReport.criticalErrors > 0 ? 'error' : 'success'}">
                        <h3>🔧 État Technique</h3>
                        <div class="status-metrics">
                            <div>Erreurs: ${errorReport.totalErrors}</div>
                            <div>Critiques: ${errorReport.criticalErrors}</div>
                            <div>Uptime: ${Math.round((Date.now() - analytics.startTime) / 1000)}s</div>
                        </div>
                    </div>
                    
                    <!-- Actions rapides -->
                    <div class="actions-card">
                        <h3>⚡ Actions Rapides</h3>
                        <div class="action-buttons">
                            <button data-action="export-csv">📊 Export CSV</button>
                            <button data-action="clear-data">🗑️ Effacer Données</button>
                            <button data-action="restart-session">🔄 Nouvelle Session</button>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-footer">
                    <small>Mise à jour temps réel • Session: ${analytics.sessionId.substring(0, 8)}...</small>
                </div>
            </div>
        `;
    }
    
    attachDashboardEvents(container) {
        container.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            
            switch(action) {
                case 'close':
                    this.hide();
                    break;
                case 'export-csv':
                    this.exportToCSV();
                    break;
                case 'clear-data':
                    if (confirm('Effacer toutes les données de la session ?')) {
                        this.clearSessionData();
                    }
                    break;
                case 'restart-session':
                    if (confirm('Démarrer une nouvelle session ?')) {
                        location.reload();
                    }
                    break;
            }
        });
    }
    
    exportToCSV() {
        const csvData = [
            ['Étudiant', 'Emoji', 'Langage', 'Commentaire', 'Timestamp'],
            ...humeurs.map(h => [
                h.nom,
                h.emoji,
                h.langage_prefere,
                h.commentaire || '',
                new Date(h.created_at).toLocaleString()
            ])
        ];
        
        const csvContent = csvData.map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `emoji-mood-session-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        analytics.track('data_export', { format: 'csv', rows: humeurs.length });
    }
    
    hide() {
        const container = document.getElementById('teacher-dashboard');
        if (container) {
            container.style.display = 'none';
        }
        this.isVisible = false;
    }
}

// Instance globale
const teacherDashboard = new TeacherDashboard();

// Intégration avec les soumissions existantes
const originalAddHumeur = addHumeur;
window.addHumeur = async function(humeur) {
    const result = await originalAddHumeur(humeur);
    if (result) {
        teacherDashboard.updateStats(humeur);
    }
    return result;
};
```

---

## 🔒 Privacy et RGPD

### **5. Respect de la Vie Privée**

#### **Collecte de données minimale et anonyme :**
```javascript
class PrivacyManager {
    constructor() {
        this.consentGiven = this.checkConsent();
        this.dataRetentionDays = 7; // Courte durée pour usage éducatif
    }
    
    checkConsent() {
        // Pour usage éducatif, consentement implicite
        // mais données anonymisées et temporaires
        return true;
    }
    
    anonymizeData(data) {
        // Anonymisation des données personnelles
        return {
            ...data,
            nom: this.hashName(data.nom), // Hash irréversible
            timestamp: Math.floor(data.timestamp / 3600000) * 3600000, // Heure arrondie
            sessionId: data.sessionId.substring(0, 8) // ID tronqué
        };
    }
    
    hashName(name) {
        // Hash simple pour anonymiser (ne pas utiliser en prod réelle)
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            const char = name.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return `Student_${Math.abs(hash).toString(36)}`;
    }
    
    cleanupOldData() {
        // Nettoyage automatique des données anciennes
        const cutoffTime = Date.now() - (this.dataRetentionDays * 24 * 60 * 60 * 1000);
        
        // Nettoyer localStorage si utilisé
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('emoji_mood_analytics_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data.timestamp < cutoffTime) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    // Supprimer en cas d'erreur de parsing
                    localStorage.removeItem(key);
                }
            }
        });
    }
}

// Intégration avec analytics existant
const privacyManager = new PrivacyManager();

// Surcharge de la méthode track pour respecter la privacy
const originalTrack = analytics.track;
analytics.track = function(eventName, properties = {}) {
    if (privacyManager.consentGiven) {
        const anonymizedProperties = privacyManager.anonymizeData(properties);
        return originalTrack.call(this, eventName, anonymizedProperties);
    }
};

// Nettoyage automatique au démarrage
privacyManager.cleanupOldData();
```

---

## ✅ Récapitulatif

**Monitoring & Analytics maîtrisés :**
- ✅ **Métriques éducatives** pertinentes et non-intrusives
- ✅ **Monitoring d'erreurs** avec auto-recovery
- ✅ **Dashboard enseignant** temps réel avec raccourci secret
- ✅ **Export de données** pour analyse post-cours
- ✅ **Privacy-first** avec anonymisation et rétention limitée

**Bénéfices pédagogiques :**
- 📊 **Insights temps réel** sur l'engagement étudiant
- 🔧 **Détection proactive** des problèmes techniques
- 📈 **Métriques d'apprentissage** pour amélioration continue
- 🎯 **Adaptation dynamique** selon les réactions de la classe

---

**Documentation complète !** Vous avez maintenant une base documentaire de niveau professionnel  pour Emoji Code Mood.

---

*💡 **Astuce Pédagogique :** Utilisez le dashboard enseignant (Ctrl+Shift+D) pendant le cours pour adapter votre rythme selon l'engagement observé en temps réel.*
