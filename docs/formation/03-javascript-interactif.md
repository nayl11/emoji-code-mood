# 💻 Module 03 : JavaScript Interactif
*Durée : 50 minutes*

## 🎯 Objectifs de ce module

À la fin de cette session, vous maîtriserez :
- ✅ La logique JavaScript moderne (ES6+) de l'application
- ✅ La manipulation du DOM et la gestion des événements
- ✅ L'intégration avec l'API Supabase pour le CRUD
- ✅ La programmation asynchrone avec async/await
- ✅ L'ajout de nouvelles fonctionnalités interactives

---

## 🔍 Étape 1 : Analyse de la structure JavaScript (15 min)

### **📁 Vue d'ensemble des fichiers JS**

```
├── script.js          # Logique principale de l'application
├── config.js          # Configuration Supabase et constantes
└── modules/
    ├── supabase.js     # Client Supabase et opérations DB
    └── utils.js        # Fonctions utilitaires
```

### **🔧 Architecture modulaire moderne**

#### **1. Configuration centralisée (`config.js`) :**
```javascript
// Configuration Supabase avec variables d'environnement
const SUPABASE_CONFIG = {
    url: process.env.SUPABASE_URL || 'your-project-url',
    anonKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key'
};

// Constantes de l'application
const APP_CONFIG = {
    maxMoods: 100,
    refreshInterval: 1000,
    languages: [
        'JavaScript', 'Python', 'Java', 'C++', 'PHP', 
        'Ruby', 'Go', 'Rust', 'TypeScript', 'Swift'
    ],
    categories: [
        'travail', 'personnel', 'apprentissage', 'projet',
        'detente', 'stress', 'motivation', 'fatigue'
    ]
};
```

#### **2. Client Supabase (`modules/supabase.js`) :**
```javascript
import { createClient } from '@supabase/supabase-js';

// Initialisation du client Supabase
export const supabase = createClient(
    SUPABASE_CONFIG.url, 
    SUPABASE_CONFIG.anonKey
);

// Opérations CRUD encapsulées
export class MoodService {
    // Créer une nouvelle humeur
    static async createMood(moodData) {
        try {
            const { data, error } = await supabase
                .from('moods')
                .insert([moodData])
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Erreur création humeur:', error);
            throw error;
        }
    }
    
    // Récupérer les humeurs récentes
    static async getMoods(limit = 50) {
        try {
            const { data, error } = await supabase
                .from('moods')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erreur récupération humeurs:', error);
            return [];
        }
    }
    
    // Écouter les changements en temps réel
    static subscribeToMoods(callback) {
        return supabase
            .channel('moods')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'moods'
            }, callback)
            .subscribe();
    }
}
```

#### **3. Logique principale (`script.js`) :**
```javascript
// Import des modules
import { MoodService } from './modules/supabase.js';
import { generateCodeLine, formatTimestamp } from './modules/utils.js';

// Variables globales
let currentMoods = [];
let subscription = null;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    try {
        // Chargement initial des données
        await loadInitialMoods();
        
        // Configuration des événements
        setupEventListeners();
        
        // Abonnement temps réel
        setupRealtimeSubscription();
        
        console.log('✅ Application initialisée avec succès');
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        showError('Impossible de charger l\'application');
    }
}
```

### **🔧 Exercice pratique : Analyse du code**

Ouvrez `script.js` et identifiez :
1. **Les fonctions principales** et leur rôle
2. **Les événements écoutés** (click, submit, change)
3. **Les interactions avec le DOM** (querySelector, innerHTML)
4. **Les appels API Supabase** (insert, select, subscribe)

---

## ⚡ Étape 2 : Gestion des événements et DOM (15 min)

### **🎯 Système d'événements moderne**

#### **Configuration des écouteurs d'événements :**
```javascript
function setupEventListeners() {
    // Formulaire principal
    const moodForm = document.getElementById('moodForm');
    moodForm.addEventListener('submit', handleMoodSubmit);
    
    // Sélection d'emoji
    const emojiButtons = document.querySelectorAll('.emoji-btn');
    emojiButtons.forEach(btn => {
        btn.addEventListener('click', handleEmojiSelect);
    });
    
    // Sélection de langage
    const languageSelect = document.getElementById('language');
    languageSelect.addEventListener('change', handleLanguageChange);
    
    // Auto-suggestions de commentaires
    const commentInput = document.getElementById('comment');
    commentInput.addEventListener('focus', showCommentSuggestions);
    
    // Raccourcis clavier
    document.addEventListener('keydown', handleKeyboardShortcuts);
}
```

#### **Manipulation du DOM efficace :**
```javascript
// Sélection d'emoji avec feedback visuel
function handleEmojiSelect(event) {
    const selectedEmoji = event.target;
    
    // Retirer la sélection précédente
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Ajouter la nouvelle sélection
    selectedEmoji.classList.add('selected');
    
    // Mettre à jour le formulaire
    const emojiInput = document.getElementById('emoji');
    emojiInput.value = selectedEmoji.textContent;
    
    // Animation de feedback
    selectedEmoji.style.transform = 'scale(1.2)';
    setTimeout(() => {
        selectedEmoji.style.transform = '';
    }, 200);
    
    // Validation en temps réel
    validateForm();
}

// Affichage dynamique des humeurs
function displayMood(mood) {
    const moodList = document.getElementById('moodList');
    
    // Création de l'élément avec template literal
    const moodElement = document.createElement('div');
    moodElement.className = 'mood-item';
    moodElement.innerHTML = `
        <div class="mood-header">
            <span class="mood-emoji">${mood.emoji}</span>
            <span class="mood-language">${mood.language}</span>
            <span class="mood-time">${formatTimestamp(mood.created_at)}</span>
        </div>
        <div class="mood-code">
            <code>${mood.code_line}</code>
        </div>
        ${mood.comment ? `<div class="mood-comment">${mood.comment}</div>` : ''}
    `;
    
    // Insertion avec animation
    moodElement.style.opacity = '0';
    moodElement.style.transform = 'translateY(20px)';
    moodList.insertBefore(moodElement, moodList.firstChild);
    
    // Animation d'apparition
    requestAnimationFrame(() => {
        moodElement.style.transition = 'all 0.5s ease';
        moodElement.style.opacity = '1';
        moodElement.style.transform = 'translateY(0)';
    });
    
    // Limitation du nombre d'éléments affichés
    const moodItems = moodList.querySelectorAll('.mood-item');
    if (moodItems.length > APP_CONFIG.maxMoods) {
        moodItems[moodItems.length - 1].remove();
    }
}
```

### **🔧 Exercice pratique : Ajout d'une fonctionnalité**

Ajoutez un compteur de participants en temps réel :

```javascript
// Fonction pour mettre à jour les statistiques
function updateStats() {
    const userCount = document.getElementById('userCount');
    const moodCount = document.getElementById('moodCount');
    
    // Compter les utilisateurs uniques (basé sur l'IP ou session)
    const uniqueUsers = new Set(currentMoods.map(mood => mood.user_session)).size;
    
    // Animation du compteur
    animateCounter(userCount, uniqueUsers);
    animateCounter(moodCount, currentMoods.length);
}

function animateCounter(element, targetValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const increment = Math.ceil((targetValue - currentValue) / 10);
    
    if (currentValue < targetValue) {
        element.textContent = currentValue + increment;
        setTimeout(() => animateCounter(element, targetValue), 50);
    } else {
        element.textContent = targetValue;
    }
}
```

---

## 🗄️ Étape 3 : Intégration API Supabase (15 min)

### **📡 Opérations CRUD modernes**

#### **Création d'une humeur (Create) :**
```javascript
async function handleMoodSubmit(event) {
    event.preventDefault();
    
    // Validation des données
    const formData = new FormData(event.target);
    const moodData = {
        emoji: formData.get('emoji'),
        language: formData.get('language'),
        category: formData.get('category'),
        comment: formData.get('comment') || null,
        code_line: generateCodeLine(
            formData.get('emoji'), 
            formData.get('language')
        ),
        user_session: getUserSession() // Session unique par utilisateur
    };
    
    // Validation côté client
    if (!validateMoodData(moodData)) {
        showError('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    try {
        // Désactiver le bouton pendant l'envoi
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
        
        // Appel API
        const newMood = await MoodService.createMood(moodData);
        
        // Succès : réinitialiser le formulaire
        event.target.reset();
        clearFormSelection();
        showSuccess('Humeur partagée avec succès ! 🎉');
        
        // La nouvelle humeur sera affichée via la subscription temps réel
        
    } catch (error) {
        console.error('Erreur ajout humeur:', error);
        showError('Impossible d\'envoyer votre humeur. Réessayez !');
    } finally {
        // Réactiver le bouton
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Envoyer mon code humeur ! 🚀';
    }
}
```

#### **Récupération des humeurs (Read) :**
```javascript
async function loadInitialMoods() {
    try {
        // Afficher un indicateur de chargement
        showLoadingState(true);
        
        // Récupérer les humeurs récentes
        const moods = await MoodService.getMoods(50);
        
        // Sauvegarder et afficher
        currentMoods = moods;
        displayMoods(moods);
        updateStats();
        
        console.log(`✅ ${moods.length} humeurs chargées`);
        
    } catch (error) {
        console.error('❌ Erreur chargement humeurs:', error);
        showError('Impossible de charger les humeurs existantes');
    } finally {
        showLoadingState(false);
    }
}

function displayMoods(moods) {
    const moodList = document.getElementById('moodList');
    
    // Vider la liste actuelle
    moodList.innerHTML = '';
    
    // Afficher chaque humeur
    moods.forEach(mood => displayMood(mood));
    
    // Message si aucune humeur
    if (moods.length === 0) {
        moodList.innerHTML = `
            <div class="empty-state">
                <p>🤖 En attente des premiers codes humeur...</p>
                <p>Partage ton humeur pour commencer !</p>
            </div>
        `;
    }
}
```

#### **Synchronisation temps réel (Subscribe) :**
```javascript
function setupRealtimeSubscription() {
    subscription = MoodService.subscribeToMoods((payload) => {
        console.log('📡 Nouvelle humeur reçue:', payload);
        
        if (payload.eventType === 'INSERT') {
            const newMood = payload.new;
            
            // Ajouter à la liste locale
            currentMoods.unshift(newMood);
            
            // Afficher avec animation
            displayMood(newMood);
            
            // Mettre à jour les stats
            updateStats();
            
            // Notification discrète
            showNotification(`Nouvelle humeur: ${newMood.emoji}`);
        }
    });
    
    // Gérer la déconnexion
    window.addEventListener('beforeunload', () => {
        if (subscription) {
            subscription.unsubscribe();
        }
    });
}
```

### **🔧 Exercice pratique : Fonctionnalité de filtre**

Ajoutez un système de filtrage des humeurs :

```javascript
// Interface de filtrage
function createFilterInterface() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    filterContainer.innerHTML = `
        <div class="filter-group">
            <label>Filtrer par langage :</label>
            <select id="languageFilter">
                <option value="">Tous les langages</option>
                ${APP_CONFIG.languages.map(lang => 
                    `<option value="${lang}">${lang}</option>`
                ).join('')}
            </select>
        </div>
        <div class="filter-group">
            <label>Filtrer par catégorie :</label>
            <select id="categoryFilter">
                <option value="">Toutes les catégories</option>
                ${APP_CONFIG.categories.map(cat => 
                    `<option value="${cat}">${cat}</option>`
                ).join('')}
            </select>
        </div>
    `;
    
    // Ajouter avant la liste des humeurs
    const displaySection = document.querySelector('.display-section');
    displaySection.insertBefore(filterContainer, document.getElementById('moodList'));
    
    // Écouter les changements
    document.getElementById('languageFilter').addEventListener('change', applyFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
}

function applyFilters() {
    const languageFilter = document.getElementById('languageFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    // Filtrer les humeurs
    const filteredMoods = currentMoods.filter(mood => {
        const matchLanguage = !languageFilter || mood.language === languageFilter;
        const matchCategory = !categoryFilter || mood.category === categoryFilter;
        return matchLanguage && matchCategory;
    });
    
    // Afficher les résultats filtrés
    displayMoods(filteredMoods);
    
    // Mettre à jour le compteur
    document.getElementById('moodCount').textContent = filteredMoods.length;
}
```

---

## 🚀 Étape 4 : Fonctionnalités avancées (5 min)

### **⌨️ Raccourcis clavier**

```javascript
function handleKeyboardShortcuts(event) {
    // Ctrl + Enter pour envoyer rapidement
    if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('moodForm').dispatchEvent(new Event('submit'));
    }
    
    // Échap pour réinitialiser le formulaire
    if (event.key === 'Escape') {
        clearFormSelection();
    }
    
    // Chiffres 1-9 pour sélection rapide d'emoji
    if (event.key >= '1' && event.key <= '9') {
        const emojiIndex = parseInt(event.key) - 1;
        const emojiButtons = document.querySelectorAll('.emoji-btn');
        if (emojiButtons[emojiIndex]) {
            emojiButtons[emojiIndex].click();
        }
    }
}
```

### **💾 Persistance locale (fallback)**

```javascript
// Sauvegarde locale en cas de problème réseau
function saveToLocalStorage(mood) {
    try {
        const localMoods = JSON.parse(localStorage.getItem('offline_moods') || '[]');
        localMoods.push(mood);
        localStorage.setItem('offline_moods', JSON.stringify(localMoods));
    } catch (error) {
        console.warn('Impossible de sauvegarder localement:', error);
    }
}

// Synchronisation des données hors ligne
async function syncOfflineMoods() {
    try {
        const offlineMoods = JSON.parse(localStorage.getItem('offline_moods') || '[]');
        
        for (const mood of offlineMoods) {
            await MoodService.createMood(mood);
        }
        
        // Nettoyer après synchronisation
        localStorage.removeItem('offline_moods');
        console.log(`✅ ${offlineMoods.length} humeurs hors ligne synchronisées`);
        
    } catch (error) {
        console.error('Erreur synchronisation hors ligne:', error);
    }
}
```

---

## 🧪 Exercices de mise en pratique

### **🎯 Exercice 1 : Système de réactions (15 min)**
Ajoutez la possibilité de "liker" les humeurs des autres :

```javascript
// Structure de données pour les réactions
async function addReaction(moodId, reactionType = '👍') {
    // Votre code ici : créer une table reactions
    // et implémenter l'ajout/suppression de réactions
}
```

### **📊 Exercice 2 : Graphique d'humeurs (15 min)**
Créez un graphique simple des langages les plus populaires :

```javascript
// Analyse des données et création de graphique
function generateLanguageStats() {
    // Votre code ici : compter les langages
    // et créer un graphique avec Chart.js ou Canvas
}
```

### **🔔 Exercice 3 : Notifications push (10 min)**
Implémentez des notifications navigateur :

```javascript
// Demander permission et envoyer notifications
async function setupNotifications() {
    // Votre code ici : Notification API
}
```

---

## 🆘 Problèmes courants et solutions

### **❌ "Fonction asynchrone ne fonctionne pas"**
- Vérifiez l'utilisation d'`await` avec `async`
- Gérez les erreurs avec `try/catch`
- Assurez-vous que Supabase est bien initialisé

### **❌ "Événements ne se déclenchent pas"**
- Vérifiez que le DOM est chargé (`DOMContentLoaded`)
- Utilisez `addEventListener` et non `onclick`
- Vérifiez les sélecteurs CSS (`querySelector`)

### **❌ "Données temps réel ne s'affichent pas"**
- Vérifiez la configuration RLS dans Supabase
- Contrôlez la connexion réseau
- Regardez la console pour les erreurs WebSocket

---

## 🎉 Récapitulatif

### **🏆 Compétences JavaScript acquises :**
- ✅ **ES6+ moderne** : Arrow functions, async/await, modules
- ✅ **Manipulation DOM** : Sélection, modification, événements
- ✅ **API intégration** : CRUD avec Supabase, gestion d'erreurs
- ✅ **Programmation asynchrone** : Promises, temps réel
- ✅ **Architecture modulaire** : Séparation des responsabilités

### **🧠 Concepts avancés maîtrisés :**
- **Event-driven programming** : Gestion des interactions utilisateur
- **Real-time synchronization** : WebSocket et subscriptions
- **Error handling** : Gestion robuste des erreurs
- **Performance optimization** : Limitation des re-renders
- **User experience** : Feedback visuel et animations

### **🛠️ Bonnes pratiques appliquées :**
- Code modulaire et réutilisable
- Gestion des états de l'application
- Validation côté client et serveur
- Accessibilité et raccourcis clavier
- Fallback hors ligne

---

## 🚀 Prochaine étape

**Module 04 : Base de Données Temps Réel**
- Comprendre l'architecture Supabase
- Maîtriser PostgreSQL et les requêtes SQL
- Optimiser les performances de la base de données
- Configurer les règles de sécurité (RLS)

---

## 📚 Ressources pour approfondir

### **Documentation JavaScript :**
- [MDN JavaScript](https://developer.mozilla.org/fr/docs/Web/JavaScript) - Référence complète
- [JavaScript.info](https://javascript.info/) - Tutoriel moderne
- [ES6 Features](https://github.com/lukehoban/es6features) - Nouvelles fonctionnalités

### **Supabase & API :**
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/) - Documentation officielle
- [Real-time Guide](https://supabase.com/docs/guides/realtime) - Temps réel
- [Authentication](https://supabase.com/docs/guides/auth) - Authentification

### **Outils de développement :**
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools) - Debug JavaScript
- [VS Code](https://code.visualstudio.com/) - Éditeur recommandé
- [Postman](https://www.postman.com/) - Test d'API

*💡 Votre application est maintenant entièrement interactive ! Le prochain module vous permettra de comprendre en profondeur la gestion des données et la synchronisation temps réel.*
