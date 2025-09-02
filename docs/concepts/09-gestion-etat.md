# 🔄 Gestion d'État - State Management Côté Client

---
**Métadonnées**
- **Niveau :** Intermédiaire
- **Durée :** 50 minutes  
- **Prérequis :** JavaScript ES6+, Async/Await
---

## 🎯 Objectifs d'Apprentissage

À la fin de ce chapitre, vous saurez :
- ✅ Analyser la gestion d'état dans main.js
- ✅ Comprendre la synchronisation local/distant
- ✅ Implémenter des patterns de gestion d'erreurs
- ✅ Optimiser la persistence des données
- ✅ Gérer les états de chargement et erreurs

---

## 📊 Architecture de l'État Global

### **1. Variables d'État Principales**

#### **État global dans main.js :**
```javascript
// ========================================
// ÉTAT GLOBAL DE L'APPLICATION
// ========================================

// Configuration et connexion
const CONFIG = { ...window.PRIVATE_CONFIG };
let supabase = null;
let isConnected = false;

// État des données
let humeurs = [];                    // Cache local des humeurs
let selectedEmoji = '';              // Emoji sélectionné par l'utilisateur
let sessionStartTime = new Date();   // Début de session

// État de l'interface  
let autoRefreshInterval = null;      // Timer auto-refresh
let isSubmitting = false;            // Prévention double soumission
let lastUpdateTime = null;           // Dernière synchronisation

// Configuration temps réel
const AUTO_REFRESH_INTERVAL = 30000; // 30 secondes
const CONNECTION_CHECK_INTERVAL = 10000; // 10 secondes
```

**Avantages de cette approche :**
- 🎯 **Centralisation** : État global accessible partout
- 🔍 **Lisibilité** : Variables explicites et documentées
- ⚡ **Performance** : Cache local évite les requêtes répétées
- 🛡️ **Robustesse** : États d'erreur et de chargement gérés

---

## 🔄 Patterns de Synchronisation

### **2. Synchronisation Local ↔ Distant**

#### **Pattern : Local-First avec Sync**
```javascript
// État local comme source de vérité temporaire
async function addHumeur(humeur) {
    // 1. OPTIMISTIC UPDATE - Mise à jour locale immédiate
    const tempId = Date.now();
    const localHumeur = { ...humeur, id: tempId, _isPending: true };
    
    // Mise à jour UI immédiate (UX responsive)
    humeurs.unshift(localHumeur);
    updateDisplay();
    
    try {
        // 2. REMOTE SYNC - Synchronisation serveur
        const { data, error } = await supabase
            .from('humeur')
            .insert([humeur])
            .select();
            
        if (error) throw error;
        
        // 3. RECONCILIATION - Remplacement par données serveur
        const serverHumeur = data[0];
        const index = humeurs.findIndex(h => h.id === tempId);
        if (index !== -1) {
            humeurs[index] = serverHumeur; // Remplace temporaire par final
            updateDisplay();
        }
        
        console.log('✅ Humeur sauvegardée:', serverHumeur);
        return true;
        
    } catch (error) {
        // 4. ROLLBACK - Annulation si échec
        humeurs = humeurs.filter(h => h.id !== tempId);
        updateDisplay();
        
        console.error('❌ Erreur sauvegarde:', error);
        showErrorMessage('Impossible de sauvegarder. Réessayez.');
        return false;
    }
}
```

### **3. Pattern de Réconciliation Temps Réel**

#### **WebSocket + État Local :**
```javascript
// Gestion des conflits temps réel
function handleRealtimeChange(payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
        case 'INSERT':
            // Éviter les doublons (propre insertion vs autres)
            if (!humeurs.find(h => h.id === newRecord.id)) {
                humeurs.unshift(newRecord);
                animateNewPost(newRecord); // Animation d'apparition
            }
            break;
            
        case 'UPDATE':
            const updateIndex = humeurs.findIndex(h => h.id === newRecord.id);
            if (updateIndex !== -1) {
                humeurs[updateIndex] = newRecord;
                highlightUpdatedPost(newRecord.id); // Visual feedback
            }
            break;
            
        case 'DELETE':
            humeurs = humeurs.filter(h => h.id !== oldRecord.id);
            animatePostRemoval(oldRecord.id); // Animation de sortie
            break;
    }
    
    updateDisplay();
    updateStats();
}
```

---

## 🛡️ Gestion d'Erreurs et État Resilient

### **4. États d'Erreur et Recovery**

#### **Pattern Circuit Breaker :**
```javascript
class ConnectionManager {
    constructor() {
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.circuitState = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failureThreshold = 3;
        this.recoveryTimeout = 30000; // 30 secondes
    }
    
    async executeWithCircuit(operation) {
        if (this.circuitState === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
                this.circuitState = 'HALF_OPEN';
                console.log('🔄 Circuit en mode test - tentative de récupération');
            } else {
                throw new Error('Circuit ouvert - service temporairement indisponible');
            }
        }
        
        try {
            const result = await operation();
            
            // Succès : réinitialiser le circuit
            if (this.circuitState === 'HALF_OPEN') {
                this.circuitState = 'CLOSED';
                this.failureCount = 0;
                console.log('✅ Circuit fermé - service récupéré');
            }
            
            return result;
            
        } catch (error) {
            this.failureCount++;
            this.lastFailureTime = Date.now();
            
            if (this.failureCount >= this.failureThreshold) {
                this.circuitState = 'OPEN';
                console.log('⚡ Circuit ouvert - trop d\'échecs consécutifs');
            }
            
            throw error;
        }
    }
}

// Usage
const connectionManager = new ConnectionManager();

async function safeSupabaseCall(operation) {
    try {
        return await connectionManager.executeWithCircuit(operation);
    } catch (error) {
        handleConnectionError(error);
        return null;
    }
}
```

### **5. État d'Interface Réactif**

#### **Pattern Observer pour UI State :**
```javascript
class UIState {
    constructor() {
        this.state = {
            isLoading: false,
            isConnected: true,
            errorMessage: null,
            selectedEmoji: '',
            formData: {},
            lastSync: null
        };
        this.observers = [];
    }
    
    // Pattern Observer pour réactivité
    subscribe(callback) {
        this.observers.push(callback);
    }
    
    setState(newState) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        // Notifier tous les observers des changements
        this.observers.forEach(callback => {
            callback(this.state, prevState);
        });
    }
    
    // Actions spécialisées
    setLoading(isLoading) {
        this.setState({ isLoading });
        updateLoadingUI(isLoading);
    }
    
    setError(errorMessage) {
        this.setState({ errorMessage });
        if (errorMessage) {
            showErrorToast(errorMessage);
        }
    }
    
    setConnectionStatus(isConnected) {
        this.setState({ isConnected });
        updateConnectionIndicator(isConnected);
    }
}

// Instance globale
const uiState = new UIState();

// Réactivité automatique
uiState.subscribe((newState, prevState) => {
    console.log('🔄 État changé:', { from: prevState, to: newState });
});
```

---

## 💾 Persistence et Cache Local

### **6. Local Storage Strategy**

#### **Cache intelligent avec TTL :**
```javascript
class CacheManager {
    constructor() {
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes
        this.maxCacheSize = 50; // Maximum 50 humeurs en cache
    }
    
    // Sauvegarde avec métadonnées
    saveToCache(key, data) {
        try {
            const cacheItem = {
                data: data,
                timestamp: Date.now(),
                version: '1.0'
            };
            
            localStorage.setItem(`emoji_mood_${key}`, JSON.stringify(cacheItem));
            
        } catch (error) {
            console.warn('⚠️ Cache localStorage plein:', error);
            this.cleanupCache(); // Nettoyage automatique
        }
    }
    
    // Récupération avec validation TTL
    loadFromCache(key) {
        try {
            const cached = localStorage.getItem(`emoji_mood_${key}`);
            if (!cached) return null;
            
            const cacheItem = JSON.parse(cached);
            const age = Date.now() - cacheItem.timestamp;
            
            // Vérifier expiration
            if (age > this.cacheTTL) {
                localStorage.removeItem(`emoji_mood_${key}`);
                return null;
            }
            
            console.log(`📦 Cache hit pour ${key} (âge: ${Math.round(age/1000)}s)`);
            return cacheItem.data;
            
        } catch (error) {
            console.warn('⚠️ Erreur lecture cache:', error);
            return null;
        }
    }
    
    // Nettoyage intelligent
    cleanupCache() {
        const keys = Object.keys(localStorage)
            .filter(key => key.startsWith('emoji_mood_'));
            
        // Supprimer les plus anciens si > maxCacheSize
        if (keys.length > this.maxCacheSize) {
            keys.slice(this.maxCacheSize).forEach(key => {
                localStorage.removeItem(key);
            });
        }
    }
}

// Usage
const cache = new CacheManager();

// Récupération intelligente : cache → serveur
async function loadHumeursIntelligent() {
    // 1. Tentative cache local
    let cachedHumeurs = cache.loadFromCache('recent_humeurs');
    if (cachedHumeurs) {
        humeurs = cachedHumeurs;
        updateDisplay();
        console.log('📦 Humeurs chargées depuis le cache');
    }
    
    // 2. Synchronisation serveur en arrière-plan
    try {
        const freshHumeurs = await loadHumeursFromSupabase();
        if (freshHumeurs && freshHumeurs.length > 0) {
            cache.saveToCache('recent_humeurs', freshHumeurs);
        }
    } catch (error) {
        // Si erreur serveur, on garde le cache
        if (!cachedHumeurs) {
            showErrorMessage('Impossible de charger les données');
        }
    }
}
```

---

## ⚡ Optimisations Performance

### **7. Debouncing et Throttling**

#### **Optimisation des mises à jour :**
```javascript
// Debounce pour les recherches
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle pour les événements fréquents
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Usage pour optimiser les mises à jour
const debouncedSearch = debounce((query) => {
    filterHumeurs(query);
}, 300);

const throttledScroll = throttle(() => {
    updateVisiblePosts();
}, 100);

// Auto-save des brouillons
const debouncedSave = debounce((formData) => {
    cache.saveToCache('draft_mood', formData);
}, 1000);
```

---

## 🔬 Exercices Pratiques

### **Implémentation State Manager Simple**

1. **Créez un mini state manager :**
   ```javascript
   class MoodAppState {
     constructor() {
       this.state = {
         humeurs: [],
         ui: { loading: false, error: null },
         user: { selectedEmoji: '', formData: {} }
       };
       this.listeners = [];
     }
     
     // Votre implémentation ici
     dispatch(action) {
       // Pattern Redux simplifié
     }
   }
   ```

2. **Testez la persistence :**
   - Fermez/rouvrez l'onglet
   - Vérifiez la récupération du cache
   - Simulez des erreurs réseau

---

## ✅ Récapitulatif

**Gestion d'État maîtrisée :**
- ✅ **État global centralisé** avec variables explicites
- ✅ **Synchronisation optimiste** local → distant
- ✅ **Gestion d'erreurs** robuste avec circuit breaker
- ✅ **Cache intelligent** avec TTL et cleanup
- ✅ **Performance optimisée** avec debouncing/throttling

**Patterns appliqués dans l'app :**
- 🔄 **Local-First** : UI réactive avant confirmation serveur
- 🛡️ **Resilience** : Fallback cache en cas d'erreur réseau  
- ⚡ **Optimistic Updates** : Feedback utilisateur immédiat
- 📦 **Smart Caching** : Réduction des appels serveur

---

**Prochaine étape :** [10. Row Level Security](10-row-level-security.md) - Sécurité au niveau base

---

*💡 **Astuce Pédagogique :** Utilisez les DevTools → Application → LocalStorage pour observer l'état du cache en temps réel durant les tests.*
