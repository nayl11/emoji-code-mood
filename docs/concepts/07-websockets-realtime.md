# ⚡ WebSockets et Temps Réel - Communication Bidirectionnelle

---
**Métadonnées**
- **Niveau :** Intermédiaire
- **Durée :** 60 minutes
- **Prérequis :** JavaScript ES6+, API REST, concepts client-serveur
---

## 🎯 Objectifs d'Apprentissage

À la fin de ce chapitre, vous saurez :
- ✅ Comprendre les limitations du HTTP traditionnel
- ✅ Maîtriser les WebSockets pour la communication temps réel
- ✅ Analyser l'implémentation Supabase Realtime
- ✅ Gérer les reconnexions et la résilience
- ✅ Optimiser les performances des connexions persistantes

---

## 🔄 HTTP vs WebSockets - Évolution Nécessaire

### **1. Problèmes du HTTP Classique**

#### **Polling inefficace :**
```javascript
// ❌ POLLING - Inefficace et gourmand
function pollForUpdates() {
    setInterval(async () => {
        // Requête HTTP toutes les 5 secondes
        const response = await fetch('/api/humeurs');
        const newData = await response.json();
        
        if (JSON.stringify(newData) !== JSON.stringify(oldData)) {
            updateUI(newData);
            oldData = newData;
        }
        // Problèmes :
        // - 99% des requêtes inutiles si pas de changement
        // - Latence de 0-5 secondes selon timing
        // - Charge serveur importante
        // - Consommation bande passante
    }, 5000);
}

// ✅ WEBSOCKETS - Efficient et instantané
const socket = new WebSocket('wss://api.example.com/realtime');

socket.onmessage = (event) => {
    const newData = JSON.parse(event.data);
    updateUI(newData); // Mise à jour INSTANTANÉE
    // Avantages :
    // - Pas de requêtes inutiles
    // - Latence < 100ms
    // - Charge serveur minimale
    // - Économie de bande passante
};
```

### **2. Comparaison des Approches Temps Réel**

| Critère | HTTP Polling | Long Polling | Server-Sent Events | WebSockets |
|---------|-------------|--------------|-------------------|------------|
| **Direction** | Client → Serveur | Client → Serveur | Serveur → Client | ↔️ Bidirectionnel |
| **Connexions** | Multiples | Hold | Persistent | Persistent |
| **Overhead** | Très élevé | Élevé | Moyen | Faible |
| **Complexité** | Faible | Moyenne | Moyenne | Élevée |
| **Latence** | 0-5s | 0.5-2s | <500ms | <100ms |
| **Support** | 100% | 100% | 95%+ | 99%+ |
| **Reconnexion** | N/A | Auto | Manuel | Manuel |
| **Cas d'usage** | API REST | Notifications | Updates | Chat, Gaming |

---

## 🔧 Supabase Realtime dans Emoji Code Mood

### **3. Architecture Supabase Realtime**

```javascript
// Configuration de la connexion temps réel
async function initSupabase() {
    if (!window.PRIVATE_CONFIG || !window.PRIVATE_CONFIG.supabaseUrl) {
        console.error('❌ Configuration Supabase manquante');
        return false;
    }

    try {
        supabase = createClient(
            window.PRIVATE_CONFIG.supabaseUrl,
            window.PRIVATE_CONFIG.supabaseAnonKey
        );

        // Test de connexion
        const { error } = await supabase.from('humeur').select('*').limit(1);
        
        if (error) {
            throw error;
        }

        // ✅ Activation du temps réel
        setupRealtimeSubscription();
        isConnected = true;
        updateConnectionStatus(true);
        
        return true;
    } catch (error) {
        console.error('❌ Erreur connexion Supabase:', error);
        isConnected = false;
        updateConnectionStatus(false);
        return false;
    }
}

// Souscription aux événements temps réel
function setupRealtimeSubscription() {
    const channel = supabase
        .channel('humeur_realtime') // Nom du canal
        .on(
            'postgres_changes',  // Type d'événement
            { 
                event: '*',           // Tous les événements (INSERT, UPDATE, DELETE)
                schema: 'public',     // Schema PostgreSQL
                table: 'humeur'       // Table à surveiller
            },
            handleRealtimeChange     // Fonction de callback
        )
        .subscribe((status) => {
            console.log('📡 Realtime status:', status);
            handleRealtimeStatus(status);
        });
}
```

### **4. Gestion des Événements Temps Réel**

```javascript
// Handler principal des changements temps réel
function handleRealtimeChange(payload) {
    console.log('🔄 Changement temps réel reçu:', payload);
    
    const { eventType, new: newRecord, old: oldRecord, table } = payload;
    
    switch (eventType) {
        case 'INSERT':
            handleNewHumeur(newRecord);
            break;
        case 'UPDATE':
            handleUpdatedHumeur(newRecord, oldRecord);
            break;
        case 'DELETE':
            handleDeletedHumeur(oldRecord);
            break;
        default:
            console.warn('⚠️ Événement non géré:', eventType);
    }
    
    // Mettre à jour les statistiques
    updateStats();
}

// Traitement d'une nouvelle humeur
function handleNewHumeur(newHumeur) {
    console.log('✨ Nouvelle humeur reçue:', newHumeur);
    
    // Éviter les doublons (au cas où)
    if (humeurs.find(h => h.id === newHumeur.id)) {
        console.log('🔄 Humeur déjà présente, ignorée');
        return;
    }
    
    // Ajouter en début de liste (plus récent en premier)
    humeurs.unshift(newHumeur);
    
    // Limiter le nombre d'éléments affichés pour les performances
    if (humeurs.length > 100) {
        humeurs = humeurs.slice(0, 100);
    }
    
    // Mettre à jour l'interface
    updateDisplay();
    
    // Animation pour attirer l'attention
    highlightNewPost(newHumeur.id);
    
    // Notification sonore/visuelle (optionnelle)
    showNewPostNotification(newHumeur);
}

// Mise à jour d'une humeur existante
function handleUpdatedHumeur(updatedHumeur, oldHumeur) {
    console.log('🔄 Humeur mise à jour:', { old: oldHumeur, new: updatedHumeur });
    
    const index = humeurs.findIndex(h => h.id === updatedHumeur.id);
    if (index !== -1) {
        humeurs[index] = updatedHumeur;
        updateDisplay();
        
        // Indiquer visuellement la modification
        highlightUpdatedPost(updatedHumeur.id);
    }
}

// Suppression d'une humeur
function handleDeletedHumeur(deletedHumeur) {
    console.log('🗑️ Humeur supprimée:', deletedHumeur);
    
    humeurs = humeurs.filter(h => h.id !== deletedHumeur.id);
    updateDisplay();
    
    // Animation de suppression
    animatePostRemoval(deletedHumeur.id);
}
```

---

## 🛡️ Gestion de la Résilience

### **5. Pattern Reconnexion Intelligente**

```javascript
class RealtimeManager {
    constructor(supabase) {
        this.supabase = supabase;
        this.channel = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.baseReconnectDelay = 1000; // 1 seconde
        this.heartbeatInterval = null;
    }
    
    connect() {
        if (this.channel) {
            this.disconnect();
        }
        
        this.channel = this.supabase
            .channel('humeur_realtime')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'humeur' },
                (payload) => this.handleMessage(payload)
            )
            .subscribe((status) => this.handleStatusChange(status));
    }
    
    handleStatusChange(status) {
        console.log('📡 Status change:', status);
        
        switch(status) {
            case 'SUBSCRIBED':
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateUI('connected');
                this.startHeartbeat();
                break;
                
            case 'CHANNEL_ERROR':
            case 'TIMED_OUT':
                this.isConnected = false;
                this.updateUI('error');
                this.scheduleReconnect();
                break;
                
            case 'CLOSED':
                this.isConnected = false;
                this.updateUI('disconnected');
                this.stopHeartbeat();
                break;
        }
    }
    
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('🚫 Nombre maximum de tentatives de reconnexion atteint');
            this.updateUI('failed');
            return;
        }
        
        // Backoff exponentiel avec jitter
        const delay = Math.min(
            this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts) + 
            Math.random() * 1000, // Jitter pour éviter thundering herd
            30000 // Maximum 30 secondes
        );
        
        this.reconnectAttempts++;
        console.log(`🔄 Reconnexion dans ${Math.round(delay/1000)}s (tentative ${this.reconnectAttempts})`);
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }
    
    startHeartbeat() {
        // Ping périodique pour vérifier la connexion
        this.heartbeatInterval = setInterval(() => {
            if (this.channel && this.isConnected) {
                // Supabase gère automatiquement les heartbeats
                // mais on peut vérifier l'état de la connexion
                const state = this.channel.state;
                if (state !== 'joined') {
                    console.warn('⚠️ Connexion dans un état inattendu:', state);
                    this.scheduleReconnect();
                }
            }
        }, 30000); // Vérification toutes les 30 secondes
    }
    
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    
    disconnect() {
        if (this.channel) {
            this.supabase.removeChannel(this.channel);
            this.channel = null;
        }
        this.stopHeartbeat();
        this.isConnected = false;
    }
    
    updateUI(status) {
        const indicator = document.getElementById('modeIndicator');
        const icon = document.getElementById('modeIcon');
        const text = document.getElementById('modeText');
        
        const statusConfig = {
            connected: { 
                bg: '#e3f2fd', color: '#1976d2', 
                icon: '⚡', text: 'Connecté - Synchronisation temps réel' 
            },
            error: { 
                bg: '#ffebee', color: '#d32f2f', 
                icon: '❌', text: 'Erreur de connexion' 
            },
            disconnected: { 
                bg: '#f5f5f5', color: '#616161', 
                icon: '🔌', text: 'Déconnecté' 
            },
            failed: { 
                bg: '#ffebee', color: '#d32f2f', 
                icon: '💀', text: 'Connexion échouée' 
            }
        };
        
        const config = statusConfig[status];
        if (indicator && config) {
            indicator.style.background = config.bg;
            indicator.style.color = config.color;
            icon.textContent = config.icon;
            text.textContent = config.text;
        }
    }
}

// Instance globale
const realtimeManager = new RealtimeManager(supabase);
```

---

## 🚀 Optimisations Avancées

### **6. Gestion de la Performance**

#### **Throttling et Debouncing des événements :**
```javascript
class PerformantRealtimeHandler {
    constructor() {
        this.eventQueue = [];
        this.batchTimeout = null;
        this.batchInterval = 100; // 100ms
        this.maxBatchSize = 10;
    }
    
    // Batching des événements pour éviter spam UI
    addEvent(event) {
        this.eventQueue.push(event);
        
        // Traitement immédiat si batch plein
        if (this.eventQueue.length >= this.maxBatchSize) {
            this.processBatch();
            return;
        }
        
        // Sinon attendre la fin du batch timeout
        if (!this.batchTimeout) {
            this.batchTimeout = setTimeout(() => {
                this.processBatch();
            }, this.batchInterval);
        }
    }
    
    processBatch() {
        if (this.eventQueue.length === 0) return;
        
        const events = [...this.eventQueue];
        this.eventQueue = [];
        this.batchTimeout = null;
        
        console.log(`🔄 Processing ${events.length} events in batch`);
        
        // Déduplication des événements sur la même entité
        const deduplicated = this.deduplicateEvents(events);
        
        // Traitement des événements dédupliqués
        deduplicated.forEach(event => this.processEvent(event));
        
        // Une seule mise à jour UI à la fin
        this.updateUIOnce();
    }
    
    deduplicateEvents(events) {
        const eventMap = new Map();
        
        events.forEach(event => {
            const key = `${event.table}_${event.record_id}`;
            
            // Garder seulement le dernier événement pour chaque entité
            eventMap.set(key, event);
        });
        
        return Array.from(eventMap.values());
    }
    
    // Mise à jour UI optimisée
    updateUIOnce() {
        // Utiliser requestAnimationFrame pour optimiser le rendu
        requestAnimationFrame(() => {
            updateDisplay();
            updateStats();
        });
    }
}

// Usage
const performantHandler = new PerformantRealtimeHandler();

function handleRealtimeChange(payload) {
    performantHandler.addEvent({
        table: payload.table,
        record_id: payload.new?.id || payload.old?.id,
        payload: payload
    });
}
```

### **7. Monitoring et Debugging**

#### **Outils de diagnostic temps réel :**
```javascript
class RealtimeDebugger {
    constructor() {
        this.events = [];
        this.maxEvents = 100;
        this.startTime = Date.now();
    }
    
    logEvent(type, data) {
        const event = {
            timestamp: Date.now(),
            relativeTime: Date.now() - this.startTime,
            type,
            data
        };
        
        this.events.push(event);
        
        // Garder seulement les N derniers événements
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }
        
        // Log en console avec timestamp
        const timeStr = new Date(event.timestamp).toLocaleTimeString();
        console.log(`[${timeStr}] 🔄 ${type}:`, data);
    }
    
    getConnectionStats() {
        const now = Date.now();
        const last5min = now - 5 * 60 * 1000;
        
        const recentEvents = this.events.filter(e => e.timestamp > last5min);
        
        const stats = {
            totalEvents: this.events.length,
            recentEvents: recentEvents.length,
            eventsPerMinute: recentEvents.length / 5,
            eventTypes: this.groupBy(recentEvents, 'type'),
            uptime: Math.round((now - this.startTime) / 1000),
            averageLatency: this.calculateAverageLatency()
        };
        
        return stats;
    }
    
    calculateAverageLatency() {
        const latencyEvents = this.events
            .filter(e => e.type === 'message_received' && e.data.serverTime)
            .slice(-10); // Derniers 10 messages
            
        if (latencyEvents.length === 0) return null;
        
        const totalLatency = latencyEvents.reduce((sum, event) => {
            return sum + (event.timestamp - event.data.serverTime);
        }, 0);
        
        return Math.round(totalLatency / latencyEvents.length);
    }
    
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = (groups[group] || 0) + 1;
            return groups;
        }, {});
    }
    
    // Console command pour debug
    printDebugInfo() {
        console.group('🔍 Realtime Debug Info');
        console.log('Stats:', this.getConnectionStats());
        console.log('Recent Events:', this.events.slice(-10));
        console.log('Connection State:', realtimeManager.isConnected);
        console.groupEnd();
    }
}

// Instance globale
const realtimeDebugger = new RealtimeDebugger();

// Intégration dans les handlers existants
const originalHandleRealtimeChange = handleRealtimeChange;
handleRealtimeChange = function(payload) {
    realtimeDebugger.logEvent('postgres_change', {
        eventType: payload.eventType,
        table: payload.table,
        recordId: payload.new?.id || payload.old?.id
    });
    
    return originalHandleRealtimeChange(payload);
};

// Commande debug disponible dans console
window.debugRealtime = () => realtimeDebugger.printDebugInfo();
```

---

## 🎮 Animations et Feedback Utilisateur

### **8. Indicateurs Visuels Temps Réel**

```javascript
// Animation d'apparition des nouveaux posts
function highlightNewPost(postId) {
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (!postElement) return;
    
    // Animation CSS avec classe temporaire
    postElement.classList.add('new-post-highlight');
    
    // Retirer la classe après l'animation
    setTimeout(() => {
        postElement.classList.remove('new-post-highlight');
    }, 2000);
}

// Notification discrète de nouvel élément
function showNewPostNotification(humeur) {
    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    notification.innerHTML = `
        <div class="toast-content">
            <span class="toast-emoji">${humeur.emoji}</span>
            <span class="toast-text">
                Nouveau code mood de <strong>${escapeHtml(humeur.nom)}</strong>
            </span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    requestAnimationFrame(() => {
        notification.classList.add('toast-show');
    });
    
    // Suppression automatique après 3 secondes
    setTimeout(() => {
        notification.classList.remove('toast-show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300); // Attendre fin animation
    }, 3000);
}

// Indicateur de statut de connexion
function updateConnectionStatus(connected) {
    const indicator = document.getElementById('connectionStatus');
    if (!indicator) return;
    
    if (connected) {
        indicator.innerHTML = `
            <span class="status-dot connected"></span>
            <span>Temps réel actif</span>
        `;
        indicator.className = 'connection-indicator connected';
    } else {
        indicator.innerHTML = `
            <span class="status-dot disconnected"></span>
            <span>Déconnecté</span>
        `;
        indicator.className = 'connection-indicator disconnected';
    }
}
```

### **9. Gestion des États de Connection**

```javascript
// État global de la connexion
const ConnectionState = {
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    RECONNECTING: 'reconnecting',
    DISCONNECTED: 'disconnected',
    ERROR: 'error'
};

class ConnectionManager {
    constructor() {
        this.state = ConnectionState.DISCONNECTED;
        this.listeners = [];
    }
    
    setState(newState, data = {}) {
        const oldState = this.state;
        this.state = newState;
        
        console.log(`🔄 Connection state: ${oldState} → ${newState}`, data);
        
        // Notifier tous les listeners
        this.listeners.forEach(listener => {
            try {
                listener(newState, oldState, data);
            } catch (error) {
                console.error('Erreur dans listener de connexion:', error);
            }
        });
        
        // Mettre à jour l'UI
        this.updateUI(newState, data);
    }
    
    addListener(listener) {
        this.listeners.push(listener);
        
        // Retourner fonction pour supprimer le listener
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
    
    updateUI(state, data) {
        const statusElement = document.getElementById('realtimeStatus');
        if (!statusElement) return;
        
        const stateConfig = {
            [ConnectionState.CONNECTING]: {
                icon: '🔄', text: 'Connexion...', class: 'connecting'
            },
            [ConnectionState.CONNECTED]: {
                icon: '⚡', text: 'Connecté', class: 'connected'
            },
            [ConnectionState.RECONNECTING]: {
                icon: '🔄', text: `Reconnexion... (${data.attempt}/${data.maxAttempts})`, class: 'reconnecting'
            },
            [ConnectionState.DISCONNECTED]: {
                icon: '🔌', text: 'Déconnecté', class: 'disconnected'
            },
            [ConnectionState.ERROR]: {
                icon: '❌', text: `Erreur: ${data.message || 'Inconnue'}`, class: 'error'
            }
        };
        
        const config = stateConfig[state];
        if (config) {
            statusElement.innerHTML = `${config.icon} ${config.text}`;
            statusElement.className = `realtime-status ${config.class}`;
        }
    }
}

// Instance globale
const connectionManager = new ConnectionManager();

// Utilisation dans la gestion de la connexion
function handleRealtimeStatus(status) {
    switch(status) {
        case 'CONNECTING':
            connectionManager.setState(ConnectionState.CONNECTING);
            break;
        case 'SUBSCRIBED':
            connectionManager.setState(ConnectionState.CONNECTED);
            break;
        case 'CHANNEL_ERROR':
        case 'TIMED_OUT':
            connectionManager.setState(ConnectionState.ERROR, { 
                message: status === 'TIMED_OUT' ? 'Timeout' : 'Erreur canal' 
            });
            break;
        case 'CLOSED':
            connectionManager.setState(ConnectionState.DISCONNECTED);
            break;
    }
}
```

---

## 🔬 Exercices Pratiques

### **10. Implémentation Progressive**

1. **Exercice 1 : Comparaison Polling vs WebSocket**
   ```javascript
   // Implémentez les deux approches et comparez :
   // - Nombre de requêtes HTTP en 1 minute
   // - Latence moyenne de mise à jour
   // - Consommation réseau
   
   async function compareMethods() {
       // Votre implémentation ici
   }
   ```

2. **Exercice 2 : Système de Reconnexion**
   ```javascript
   // Créez un système de reconnexion avec :
   // - Backoff exponentiel
   // - Jitter pour éviter thundering herd
   // - Limite de tentatives
   // - Indicateur visuel d'état
   ```

3. **Exercice 3 : Optimisation Performance**
   ```javascript
   // Implémentez :
   // - Batching d'événements
   // - Déduplication des messages
   // - Throttling des mises à jour UI
   ```

---

## ✅ Récapitulatif

**WebSockets et Temps Réel maîtrisés :**
- ✅ **Protocole WebSocket** vs HTTP pour temps réel
- ✅ **Supabase Realtime** configuration et usage
- ✅ **Gestion d'erreurs** et reconnexion automatique
- ✅ **Optimisation performance** avec batching et throttling
- ✅ **Debugging** et monitoring des connexions

**Impact sur l'expérience utilisateur :**
- ⚡ **Temps réel** : Mises à jour instantanées (<100ms)
- 🔄 **Résilience** : Reconnexion transparente automatique
- 📊 **Performance** : UI fluide même avec beaucoup d'événements
- 🛠️ **Maintenance** : Outils de debug intégrés

---

**Prochaine étape :** [08. Supabase & PostgreSQL](08-supabase-postgresql.md) - Architecture BaaS moderne

---

*💡 **Astuce Pédagogique :** Utilisez `window.debugRealtime()` dans la console pour voir l'activité temps réel en direct pendant vos démonstrations.*
