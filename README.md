# 🎭 Emoji Code Humeur

*Un brise-glace moderne pour vos cours de programmation*

👉 **Accéder à l'application :** [https://ggaillard.github.io/emoji-code-mood/](https://ggaillard.github.io/emoji-code-mood/)
[![Licence](https://img.shields.io/badge/Licence-GNU_GPL_v3-blue)](LICENSE)

---

## ✨ L'idée

Transformez votre ritual de début de cours ! Au lieu du classique "Comment ça va ?", vos étudiants partagent leur humeur avec une ligne de code personnalisée et leurs préférences tech.

Interface moderne style **réseaux sociaux** qui s'adapte automatiquement selon le nombre de participants.

## 🌟 Comment ça marche

1. **L'étudiant** choisit un emoji qui représente son humeur
2. **Il sélectionne** son langage de programmation préféré  
3. **Il choisit** sa préférence tech (gaming, musique, IA, sport...)
4. **Il peut ajouter** un commentaire personnel
5. **Tout apparaît** instantanément pour toute la classe dans un feed social

**Résultat :** Une ambiance détendue et une classe connectée ! 🚀

## 📱 Interface Adaptative

### Mode Normal (< 10 participants)
```
┌─────────────────────────────────┐
│ 👤 Marie 🐍        2min    🚀   │
│ 💻 Python  ✨ Jeux vidéo        │
│ ┌─────────────────────────────┐ │
│ │ Mon code: humeur = "🚀"     │ │
│ │ // prêt pour les projets    │ │
│ └─────────────────────────────┘ │
│ 💭 "prêt pour les projets"      │
└─────────────────────────────────┘
```

### Mode Compact (10+ participants)
```
┌─────────────────────────────────┐
│ 🅜 Marie 🐍 🚀            2min  │
│ Python | Jeux vidéo             │  
│ humeur = "🚀" // projet    📋   │
└─────────────────────────────────┘
```

## 🎯 Fonctionnalités Clés

### Pour vos étudiants
- **Interface sociale moderne** avec avatars colorés
- **70+ emojis** organisés par catégories (énergie, fatigue, cool...)
- **12 langages** de programmation supportés
- **32 préférences tech** (Gaming, IA, Musique, Sport, Netflix...)
- **Auto-actualisation** invisible en arrière-plan
- **Copie de code** en un clic
- **Compatible** mobile/tablette/ordinateur

### Pour vous, enseignant
- **Feed temps réel** style Instagram/Twitter
- **Affichage adaptatif** selon le nombre de participants
- **Badges langages** avec icônes (⚡ JS, 🐍 Python, ☕ Java...)
- **Panneau de contrôle caché** (Ctrl+Shift+A)
- **Export CSV/JSON** pour analyse
- **Aucune installation** requise

### Préférences Disponibles
- 🎮 **Gaming & Fun** : Jeux vidéo, Streaming, YouTube, Twitch
- 🎨 **Design** : Graphisme, Photoshop, Montage vidéo, UI/UX  
- 🎵 **Musique** : Écoute, Spotify, Production, Podcasts
- 🤖 **Tech & IA** : Intelligence Artificielle, ChatGPT, Robotique
- 📱 **Mobile** : Apps mobiles, TikTok, Instagram, Snapchat
- 🏃 **Sport** : Fitness, Course, Vélo, Activités physiques
- 🎬 **Divertissement** : Netflix, Séries, Cinéma, Disney+
- 📚 **Apprentissage** : Lecture, Cours en ligne, Langues
- 🍔 **Lifestyle** : Cuisine, Voyage, Shopping, Nature

## 🚀 Installation Rapide

### Option 1: Fork Simple (2 minutes)
1. **Fork** ce repository
2. **Settings** → **Pages** → **Source: GitHub Actions**
3. Votre version : `https://votre-nom.github.io/emoji-code-mood`

### Option 2: Mode Collaboratif Temps Réel
Pour la synchronisation entre tous vos étudiants :

1. **Créez un compte** [Supabase](https://supabase.com) (gratuit)
2. **Nouveau projet** + récupérez URL et clé API
3. **Repository Settings** → **Secrets** → Ajoutez :
   - `SUPABASE_URL` : `https://xxx.supabase.co`
   - `SUPABASE_ANON_KEY` : `eyJhbGciO...`
4. **Workflow automatique** injecte les clés de façon sécurisée
5. **Guide complet** : [docs/supabase-setup.md](docs/supabase-setup.md)

## 🎓 Panneau Enseignant

**Accès secret :** `Ctrl + Shift + A`

- 🗑️ **Effacer tout** - Reset rapide entre les classes
- 📄 **Export CSV** - Analyse des données avec Excel
- 💾 **Export JSON** - Données complètes avec métadonnées
- 📊 **Stats temps réel** - Nombre de participants, tendances

*Panneau totalement caché des étudiants pour éviter les distractions.*

## 💡 Idées d'utilisation

- **🎒 Rentrée scolaire** : Apprendre à connaître sa nouvelle classe
- **☕ Lundi matin** : Prendre la température après le weekend  
- **📝 Avant un contrôle** : Gérer le stress et motiver
- **🚀 Nouveau projet** : Mesurer l'enthousiasme de l'équipe
- **🎯 Formation d'équipes** : Regrouper par affinités tech
- **📈 Suivi pédagogique** : Identifier les tendances d'humeur

## 🛠️ Technologies

- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Temps réel** : Supabase (PostgreSQL + WebSockets)
- **Déploiement** : GitHub Actions + Pages
- **Sécurité** : Secrets GitHub, Row Level Security
- **Design** : CSS Grid, Flexbox, animations CSS

## 📊 Exemples de Code Générés

```javascript
let humeur = "🚀"; // prêt pour les projets
```

```python  
humeur = "☕"  # besoin de caféine pour démarrer
```

```java
String humeur = "🤯"; // cerveau en surchauffe
```

```rust
let humeur = "😎"; // maître de l'univers aujourd'hui
```

## 🔒 Sécurité & Confidentialité

- **Clés API** injectées automatiquement via GitHub Secrets
- **Jamais de données** sensibles dans le code source
- **Base de données** avec Row Level Security
- **HTTPS** obligatoire pour toutes les connexions
- **Données** automatiquement supprimées après 30 jours

## 📈 Analytics Intégrées

L'export JSON inclut :
- **Distribution des emojis** avec pourcentages
- **Langages populaires** par classe
- **Préférences tech** tendances
- **Évolution temporelle** de l'humeur
- **Métadonnées** de session complètes

## 🤝 Contribution

Des idées d'amélioration ? Un nouveau langage à ajouter ? Un emoji manquant ?

- 🐛 **[Signaler un bug](../../issues)**
- 💡 **[Proposer une fonctionnalité](../../issues)**  
- 🔧 **[Contribuer au code](CONTRIBUTING.md)**
- 🌍 **[Aider à traduire](docs/translation.md)**



