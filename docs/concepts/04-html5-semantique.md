# 🏗️ HTML5 Sémantique - Structure Moderne et Accessible

---
**Métadonnées**
- **Niveau :** Débutant
- **Durée :** 45 minutes
- **Prérequis :** HTML de base
---

## 🎯 Objectifs d'Apprentissage

À la fin de ce chapitre, vous saurez :
- ✅ Utiliser les balises sémantiques HTML5
- ✅ Structurer une application web accessible
- ✅ Implémenter ARIA pour l'accessibilité avancée
- ✅ Optimiser le SEO avec la sémantique
- ✅ Créer des formulaires inclusifs

---

## 🧱 Structure Sémantique d'Emoji Code Mood

### **1. Architecture HTML5 Moderne**

#### **Structure Globale**
```html
<!DOCTYPE html>
<html lang="fr"> <!-- Langue définie -->
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emoji Code Humeur 🎭 - Exprime ton humeur avec du code</title>
    
    <!-- SEO et métadonnées -->
    <meta name="description" content="Application interactive pour exprimer son humeur avec des codes de programmation">
    <meta name="keywords" content="programmation, humeur, éducation, collaboration">
    
    <!-- Open Graph pour partage social -->
    <meta property="og:title" content="Emoji Code Humeur - Expression créative">
    <meta property="og:description" content="Interface temps réel collaborative">
    <meta property="og:type" content="website">
</head>

<body>
    <!-- Skip link pour l'accessibilité -->
    <a href="#main-content" class="skip-link">Aller au contenu principal</a>

    <div class="container">
        <!-- Structure sémantique principale -->
        <header class="header" role="banner">
            <!-- En-tête de l'application -->
        </header>
        
        <main class="main-content" id="main-content" role="main">
            <!-- Contenu principal -->
        </main>
        
        <footer class="app-footer" role="contentinfo">
            <!-- Pied de page -->
        </footer>
    </div>
</body>
</html>
```

#### **Pourquoi cette Structure ?**
- `<html lang="fr">` : **Lecteurs d'écran** adaptent la prononciation
- `<main>` + `role="main"` : **Navigation clavier** directe
- Skip link : **Accessibilité** pour utilisateurs de clavier/lecteur d'écran
- Métadonnées : **SEO** et **partage social** optimisés

---

## 📋 Sections Sémantiques Détaillées

### **2. Header Structuré**

```html
<header class="header" role="banner">
    <!-- Indicateur de statut avec rôle approprié -->
    <div class="security-badge" role="status" aria-label="Statut de sécurité">
        🔐 Version Auto-Actualisante - Clés API Protégées
    </div>
    
    <!-- Groupe de titre avec hgroup -->
    <hgroup>
        <h1>🎭 Emoji Code Humeur</h1>
        <p class="subtitle">Exprime ton humeur avec tes préférences et une ligne de code !</p>
    </hgroup>
    
    <!-- Indicateur de mode avec live regions -->
    <div class="mode-indicator" id="modeIndicator" role="status" aria-live="polite">
        <span id="modeIcon" aria-hidden="true">⚡</span>
        <span id="modeText">Mode Collaboratif - Synchronisation automatique</span>
    </div>
    
    <!-- Section statistiques avec heading invisible -->
    <section class="stats" aria-labelledby="stats-heading">
        <h2 id="stats-heading" class="visually-hidden">Statistiques de participation</h2>
        
        <div class="stat-item">
            <div class="stat-number" id="totalParticipants" aria-label="Nombre total de participants">0</div>
            <div class="stat-label">Participants</div>
        </div>
        
        <div class="stat-item">
            <div class="stat-number" id="moodVariety" aria-label="Nombre d'humeurs différentes">0</div>
            <div class="stat-label">Humeurs différentes</div>
        </div>
        
        <div class="stat-item">
            <div class="stat-number" id="sessionTime" aria-label="Durée de la session en minutes">0</div>
            <div class="stat-label">Minutes</div>
        </div>
    </section>
</header>
```

**Techniques Sémantiques Utilisées :**
- `role="banner"` : Identifie l'en-tête principal
- `hgroup` : Groupe titre + sous-titre logiquement  
- `aria-live="polite"` : Annonce les changements sans interrompre
- `aria-hidden="true"` : Masque les éléments décoratifs
- `.visually-hidden` : Titre présent pour les lecteurs d'écran uniquement

---

### **3. Formulaires Accessibles**

```html
<section class="form-section" aria-labelledby="form-heading">
    <header>
        <h2 id="form-heading">📝 Code ton humeur et tes préférences</h2>
    </header>
    
    <form id="moodForm" novalidate aria-describedby="form-description">
        <p id="form-description" class="visually-hidden">
            Formulaire pour exprimer votre humeur actuelle avec vos préférences techniques
        </p>
        
        <!-- Champ nom avec fieldset -->
        <fieldset class="form-group">
            <label for="studentName">
                Ton prénom :
                <span class="required" aria-label="requis">*</span>
            </label>
            <input 
                type="text" 
                id="studentName" 
                name="studentName"
                required 
                placeholder="Ex: Alex" 
                maxlength="30"
                aria-describedby="name-help"
                autocomplete="given-name"
            >
            <small id="name-help" class="field-help">
                Entre 2 et 30 caractères
            </small>
        </fieldset>
        
        <!-- Commentaire avec datalist -->
        <fieldset class="form-group">
            <label for="comment">Mon code du moment (optionnel) :</label>
            <input 
                type="text" 
                id="comment" 
                name="comment"
                placeholder="Clique pour des idées..." 
                list="commentSuggestions" 
                maxlength="100"
                aria-describedby="comment-help"
            >
            <small id="comment-help" class="field-help">
                Maximum 100 caractères - Exprime ton état d'esprit
            </small>
            
            <!-- Liste de suggestions -->
            <datalist id="commentSuggestions">
                <option value="prêt pour attaquer les projets">
                <option value="besoin d'un deuxième café">
                <option value="cerveau en surchauffe">
                <option value="while(motivation) { code(); }">
                <option value="git commit -m 'nouvelle année'">
            </datalist>
        </fieldset>
        
        <!-- Bouton de soumission -->
        <button type="submit" class="submit-btn" id="submitBtn">
            <span class="btn-text">Envoyer mon code humeur !</span>
            <span class="btn-icon" aria-hidden="true">🚀</span>
        </button>
    </form>
</section>
```

**Techniques d'Accessibilité Avancées :**
- `fieldset` + `legend` : Regroupement logique des champs
- `role="radiogroup"` : Groupe de boutons radio customisés
- `aria-describedby` : Liens vers les descriptions d'aide
- `autocomplete` : Assistance saisie automatique
- `datalist` : Suggestions contextuelles
- `novalidate` : Validation custom JavaScript prioritaire

---

### **4. Feed Temps Réel Accessible**

```html
<section class="display-section" aria-labelledby="feed-heading">
    <header>
        <h2 id="feed-heading">💻 Feed des Humeurs</h2>
    </header>
    
    <!-- Zone d'affichage avec live regions -->
    <div class="mood-list social-feed" 
         id="moodList" 
         role="feed" 
         aria-labelledby="feed-heading"
         aria-live="polite"
         aria-describedby="feed-description">
        
        <p id="feed-description" class="visually-hidden">
            Liste des humeurs partagées par les participants, mise à jour en temps réel
        </p>
        
        <!-- Article individuel -->
        <article class="social-post" role="article" aria-labelledby="post-1-author">
            <header class="post-header">
                <div class="user-info">
                    <div class="avatar" role="img" aria-label="Avatar de Marie">
                        <div class="avatar-letter">M</div>
                    </div>
                    <div class="user-details">
                        <div class="username" id="post-1-author">
                            Marie
                            <span class="badge badge-js" aria-label="Utilise JavaScript">⚡</span>
                        </div>
                        <time class="post-time" datetime="2024-01-15T14:30:00Z">
                            il y a 2 minutes
                        </time>
                    </div>
                </div>
                <div class="post-mood" role="img" aria-label="Emoji fusée, motivée">🚀</div>
            </header>

            <div class="post-content">
                <div class="preferences-tags" role="list" aria-label="Préférences">
                    <span class="tag language-tag" role="listitem">💻 JavaScript</span>
                    <span class="tag hobby-tag" role="listitem">✨ Jeux vidéo</span>
                </div>
                
                <figure class="code-container">
                    <figcaption class="code-header">
                        <span class="code-title">Code généré :</span>
                        <button class="copy-btn" 
                                onclick="copyCode('let humeur = \"🚀\"; // prêt à décoller !')" 
                                aria-label="Copier le code">📋</button>
                    </figcaption>
                    <pre class="code-display" role="img" aria-label="Code JavaScript"><code>let humeur = "🚀"; <span class="comment">// prêt à décoller !</span></code></pre>
                </figure>

                <blockquote class="post-caption">
                    <span class="quote-icon" aria-hidden="true">💭</span>
                    "Nouvelle année, nouveaux projets, let's go !"
                </blockquote>
            </div>
        </article>
        
        <!-- État initial de chargement -->
        <div class="loading" role="status" aria-live="polite">
            <p>🤖 En attente des premiers codes humeur...</p>
            <p class="loading-subtitle">
                Partage ton humeur pour commencer !
            </p>
        </div>
    </div>
</section>
```

**Éléments Sémantiques Avancés :**
- `role="feed"` : Flux de contenu dynamique
- `<article>` : Contenu autonome et réutilisable
- `<time datetime="">` : Date machine-readable
- `<figure>` + `<figcaption>` : Code avec légende
- `<blockquote>` : Citation utilisateur
- `role="img"` + `aria-label` : Emojis descriptifs pour lecteurs d'écran

---

## ♿ Accessibilité Avancée avec ARIA

### **5. États Dynamiques**

```javascript
// Gestion ARIA pour sélection d'emoji
document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Désélectionner tous les autres (radio group)
        document.querySelectorAll('.emoji-btn').forEach(b => {
            b.setAttribute('aria-checked', 'false');
        });
        
        // Sélectionner le courant
        btn.setAttribute('aria-checked', 'true');
        selectedEmoji = btn.dataset.emoji;
        
        // Annoncer le changement
        announceToScreenReader(`Emoji sélectionné : ${btn.title}`);
    });
    
    // Navigation clavier dans le groupe
    btn.addEventListener('keydown', (e) => {
        const buttons = Array.from(document.querySelectorAll('.emoji-btn'));
        const currentIndex = buttons.indexOf(btn);
        let newIndex;
        
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                newIndex = (currentIndex + 1) % buttons.length;
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                newIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                break;
            case ' ':
            case 'Enter':
                btn.click();
                return;
            default:
                return;
        }
        
        if (newIndex !== undefined) {
            buttons[newIndex].focus();
            e.preventDefault();
        }
    });
});

// Fonction d'annonce pour lecteurs d'écran
function announceToScreenReader(message) {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'assertive');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'visually-hidden';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    setTimeout(() => {
        document.body.removeChild(announcer);
    }, 1000);
}
```

### **6. Landmarks et Navigation**

```html
<!-- Navigation par landmarks -->
<nav class="app-navigation" role="navigation" aria-label="Navigation principale">
    <ul>
        <li><a href="#main-content" aria-current="page">Formulaire</a></li>
        <li><a href="#feed-heading">Feed des humeurs</a></li>
        <li><a href="#stats-heading">Statistiques</a></li>
    </ul>
</nav>

<!-- Breadcrumb pour contexte -->
<nav aria-label="Fil d'Ariane">
    <ol class="breadcrumb">
        <li><a href="/">Accueil</a></li>
        <li><a href="/formation">Formation</a></li>
        <li aria-current="page">Emoji Code Mood</li>
    </ol>
</nav>

<!-- Régions principales clairement identifiées -->
<div class="app-layout">
    <aside class="sidebar" role="complementary" aria-labelledby="sidebar-heading">
        <h2 id="sidebar-heading" class="visually-hidden">Informations complémentaires</h2>
        <!-- Contenu sidebar -->
    </aside>
    
    <main role="main" aria-labelledby="main-heading">
        <h1 id="main-heading" class="visually-hidden">Interface principale</h1>
        <!-- Contenu principal -->
    </main>
    
    <section class="help-section" role="region" aria-labelledby="help-heading">
        <h2 id="help-heading">Aide et instructions</h2>
        <!-- Aide contextuelle -->
    </section>
</div>
```

---

## 🔍 SEO et Métadonnées Optimisées

### **7. Structured Data (JSON-LD)**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Emoji Code Mood",
  "description": "Application interactive pour exprimer son humeur avec des codes de programmation",
  "url": "https://ggaillard.github.io/emoji-code-mood/",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  },
  "creator": {
    "@type": "Person",
    "name": "Gérard Gaillard"
  },
  "educationalUse": "Formation en développement web",
  "audience": {
    "@type": "EducationalAudience",
    "educationalRole": "student"
  },
  "learningResourceType": "Interactive Application",
  "interactivityType": "active",
  "typicalAgeRange": "16-25"
}
</script>
```

### **8. Métadonnées Sociales Complètes**

```html
<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Emoji Code Mood - Exprime ton humeur avec du code">
<meta name="twitter:description" content="Interface temps réel collaborative pour cours de programmation">
<meta name="twitter:image" content="https://ggaillard.github.io/emoji-code-mood/assets/social-preview.png">

<!-- Facebook Open Graph -->
<meta property="og:title" content="Emoji Code Mood - Expression créative et programmation">
<meta property="og:description" content="Une application interactive pour exprimer son humeur à travers des codes de programmation">
<meta property="og:type" content="website">
<meta property="og:url" content="https://ggaillard.github.io/emoji-code-mood/">
<meta property="og:image" content="https://ggaillard.github.io/emoji-code-mood/assets/social-preview.png">
<meta property="og:locale" content="fr_FR">

<!-- Métadonnées éducatives -->
<meta name="educational-level" content="secondary-education">
<meta name="subject" content="Computer Science, Programming, Web Development">
<meta name="language" content="French">
```

---

## 🧪 Tests et Validation

### **9. Outils de Validation Sémantique**

```javascript
// Audit d'accessibilité automatisé
class AccessibilityAudit {
    constructor() {
        this.issues = [];
    }
    
    checkImageAlts() {
        const images = document.querySelectorAll('img:not([alt])');
        if (images.length > 0) {
            this.issues.push({
                type: 'missing-alt',
                count: images.length,
                severity: 'error'
            });
        }
    }
    
    checkHeadingHierarchy() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        
        headings.forEach(heading => {
            const currentLevel = parseInt(heading.tagName.charAt(1));
            if (currentLevel - previousLevel > 1) {
                this.issues.push({
                    type: 'heading-skip',
                    element: heading,
                    severity: 'warning'
                });
            }
            previousLevel = currentLevel;
        });
    }
    
    checkColorContrast() {
        // Simulation - en réalité utiliserait une lib dédiée
        const elementsToCheck = document.querySelectorAll('.btn, .tag, .badge');
        
        elementsToCheck.forEach(element => {
            const styles = getComputedStyle(element);
            const bg = styles.backgroundColor;
            const fg = styles.color;
            
            // Calcul de contraste simplifié
            const contrast = this.calculateContrast(bg, fg);
            
            if (contrast < 4.5) {
                this.issues.push({
                    type: 'low-contrast',
                    element: element,
                    contrast: contrast,
                    severity: 'warning'
                });
            }
        });
    }
    
    checkAriaLabels() {
        const interactiveElements = document.querySelectorAll('button, [role="button"], input, select');
        
        interactiveElements.forEach(element => {
            const hasLabel = element.getAttribute('aria-label') || 
                            element.getAttribute('aria-labelledby') ||
                            element.querySelector('label') ||
                            element.textContent.trim();
            
            if (!hasLabel) {
                this.issues.push({
                    type: 'missing-label',
                    element: element,
                    severity: 'error'
                });
            }
        });
    }
    
    runAudit() {
        console.log('🔍 Démarrage audit accessibilité...');
        
        this.checkImageAlts();
        this.checkHeadingHierarchy();
        this.checkColorContrast();
        this.checkAriaLabels();
        
        console.log(`✅ Audit terminé. ${this.issues.length} problèmes détectés.`);
        return this.issues;
    }
    
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            issues: this.issues,
            summary: {
                errors: this.issues.filter(i => i.severity === 'error').length,
                warnings: this.issues.filter(i => i.severity === 'warning').length,
                total: this.issues.length
            }
        };
        
        console.table(report.summary);
        return report;
    }
}

// Utilisation
const audit = new AccessibilityAudit();
const issues = audit.runAudit();
const report = audit.generateReport();
```

### **10. Checklist de Validation**

```markdown
## ✅ Checklist HTML5 Sémantique

### Structure de Base
- [ ] DOCTYPE HTML5 déclaré
- [ ] Langue principale définie (`<html lang="fr">`)
- [ ] Encoding UTF-8 spécifié
- [ ] Viewport meta tag présent
- [ ] Titre descriptif et unique

### Sémantique
- [ ] Balises sémantiques utilisées (`<header>`, `<main>`, `<section>`, `<article>`)
- [ ] Hiérarchie des titres respectée (H1 → H2 → H3)
- [ ] Landmarks ARIA appropriés
- [ ] Structure logique sans CSS

### Formulaires
- [ ] Labels associés aux champs (`<label for="id">`)
- [ ] Fieldsets pour grouper les champs liés
- [ ] Messages d'aide avec `aria-describedby`
- [ ] États requis indiqués (`required`, `aria-required`)
- [ ] Validation accessible

### Accessibilité
- [ ] Images avec alt text descriptif
- [ ] Éléments interactifs focusables
- [ ] Navigation clavier fonctionnelle
- [ ] Contraste suffisant (4.5:1 minimum)
- [ ] Lecteurs d'écran testés

### Performance SEO
- [ ] Métadonnées complètes
- [ ] Structured data JSON-LD
- [ ] URLs sémantiques
- [ ] Balises Open Graph
- [ ] Sitemap.xml généré
```

---

## 🎯 Exercices Pratiques

### **Exercice 1 : Audit Sémantique**

Analysez ce code HTML et identifiez les problèmes sémantiques :

```html
<div class="header">
    <div class="title">Mon App</div>
    <div class="nav">
        <div onclick="goTo('home')">Accueil</div>
        <div onclick="goTo('about')">À propos</div>
    </div>
</div>

<div class="content">
    <div class="form">
        <div>Nom :</div>
        <input type="text">
        <div style="color: red;">Requis</div>
        
        <div>Choisir :</div>
        <div onclick="select(1)">Option 1</div>
        <div onclick="select(2)">Option 2</div>
    </div>
</div>
```

**Questions :**
1. Quelles balises sémantiques manquent ?
2. Comment améliorer l'accessibilité ?
3. Quels attributs ARIA ajouter ?

### **Exercice 2 : Formulaire Accessible**

Créez un formulaire de contact entièrement accessible avec :
- Validation en temps réel
- Messages d'erreur annoncés aux lecteurs d'écran
- Navigation clavier optimisée
- Support des technologies d'assistance

### **Exercice 3 : Feed Dynamique**

Implémentez un feed de contenu avec :
- Articles sémantiquement structurés
- Live regions pour nouveaux contenus
- Navigation par landmarks
- Support des raccourcis clavier

---

## 🚀 Techniques Avancées HTML5

### **11. Web Components Sémantiques**

```javascript
// Custom Element accessible
class EmojiButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
        const emoji = this.getAttribute('emoji') || '😊';
        const label = this.getAttribute('aria-label') || 'Emoji button';
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }
                
                button {
                    border: 2px solid #e1e8ed;
                    background: white;
                    border-radius: 8px;
                    font-size: 1.8em;
                    padding: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                button:hover {
                    border-color: #3ECF8E;
                    transform: scale(1.1);
                }
                
                button:focus {
                    outline: 3px solid #3ECF8E;
                    outline-offset: 2px;
                }
            </style>
            <button role="option" 
                    aria-label="${label}" 
                    tabindex="0">${emoji}</button>
        `;
        
        this.shadowRoot.querySelector('button').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('emoji-selected', {
                detail: { emoji, label },
                bubbles: true
            }));
        });
    }
}

customElements.define('emoji-button', EmojiButton);
```

### **12. Progressive Enhancement**

```html
<!-- Base HTML fonctionnel sans JS -->
<form action="/submit" method="post" id="moodForm">
    <fieldset>
        <legend>Sélection d'humeur</legend>
        
        <!-- Fallback radio buttons -->
        <input type="radio" name="emoji" value="🚀" id="rocket">
        <label for="rocket">🚀 Motivé</label>
        
        <input type="radio" name="emoji" value="☕" id="coffee">
        <label for="coffee">☕ Besoin de caféine</label>
    </fieldset>
    
    <button type="submit">Envoyer</button>
</form>

<script>
// Enhancement progressif avec JS
document.addEventListener('DOMContentLoaded', () => {
    // Remplacer par interface avancée seulement si JS disponible
    const form = document.getElementById('moodForm');
    if (form && 'querySelector' in document) {
        enhanceFormWithEmojiSelector(form);
    }
});
</script>
```

---

## 📊 Métriques et Validation

### **Outils Recommandés :**

1. **Lighthouse** - Audit automatisé
2. **axe-core** - Tests d'accessibilité
3. **WAVE** - Évaluation visuelle
4. **Colour Contrast Analyser** - Vérification contrastes
5. **Screen Reader** (NVDA, JAWS) - Tests réels

### **Métriques de Qualité :**

| Critère | Score Cible | Outil de Mesure |
|---------|-------------|-----------------|
| **Accessibilité Lighthouse** | 95+ | Chrome DevTools |
| **Performance SEO** | 90+ | Google Search Console |
| **Validation HTML5** | 0 erreurs | W3C Validator |
| **WCAG 2.1 AA** | Conformité | axe-core |
| **Screen Reader** | Navigation fluide | Tests manuels |

---

## ✅ Récapitulatif

**HTML5 Sémantique Maîtrisé :**
- ✅ **Structure moderne** avec balises sémantiques appropriées
- ✅ **Accessibilité avancée** avec ARIA et navigation clavier
- ✅ **Formulaires inclusifs** avec labels, fieldsets et validation
- ✅ **SEO optimisé** avec métadonnées et structured data
- ✅ **Progressive enhancement** pour robustesse
- ✅ **Standards WCAG 2.1** respectés pour inclusion maximale

**Impact Utilisateur :**
- 🦽 **Accessibilité** : Application utilisable par tous
- 🔍 **SEO** : Meilleure visibilité dans les moteurs de recherche
- 📱 **Compatibilité** : Fonctionne sur tous navigateurs/dispositifs
- ⚡ **Performance** : Structure optimisée pour la vitesse
- 🛡️ **Robustesse** : Dégradation gracieuse sans JavaScript

---

**Prochaine étape :** [05. CSS Moderne](05-css-moderne.md) - Styles avancés et animations

---
