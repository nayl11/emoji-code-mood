# ⚡ Module 01 : Prise en Main 
*Durée : 45 minutes*

## 🎯 Objectifs de ce module

À la fin de cette session, vous aurez :
- ✅ Votre propre version de l'application en ligne
- ✅ Compris le workflow de développement moderne
- ✅ Testé la synchronisation temps réel
- ✅ Maîtrisé les bases de GitHub et du déploiement

---

## 🚀 Étape 1 : Découverte de l'application (5 min)

### **🔍 Exploration guidée**
Rendez-vous directement sur l'[application](https://ggaillard.github.io/emoji-code-mood/) (désormais à la racine) ou, si besoin, sur l'[ancien tableau de bord](https://ggaillard.github.io/emoji-code-mood/dashboard.html) puis testez :

1. **Interface utilisateur** 👆
   - Sélectionnez votre humeur avec un emoji
   - Choisissez votre langage de programmation préféré
   - Ajoutez un commentaire personnel
   - Cliquez sur "Envoyer"

2. **Temps réel** ⚡
   - Ouvrez l'app dans un 2ème onglet
   - Ajoutez une humeur dans le premier
   - Observez l'affichage instantané dans le second

3. **Génération de code** 💻
   - Regardez comment votre humeur devient une ligne de code
   - Notez la variété des syntaxes selon les langages

### **💭 Questions de réflexion**
- Quelles technologies permettent cette synchronisation ?
- Comment l'interface s'adapte-t-elle aux différents écrans ?
- Quel est l'intérêt pédagogique de cette approche ?

---

## 🔧 Étape 2 : Configuration de votre environnement (15 min)

### **A. Fork du projet (2 min)**
1. Connectez-vous à [GitHub](https://github.com)
2. Allez sur [emoji-code-mood](https://github.com/ggaillard/emoji-code-mood)
3. Cliquez sur **"Fork"** en haut à droite
4. Sélectionnez votre compte personnel

💡 **Astuce** : Le fork crée une copie indépendante que vous pouvez modifier librement.

### **B. Activation du déploiement automatique (3 min)**
1. Dans votre fork : **Settings** → **Pages**
2. Source : Sélectionnez **"GitHub Actions"**
3. Sauvegardez

🎯 **Résultat** : Votre app sera automatiquement déployée à chaque modification !

### **C. Configuration de la base de données (8 min)**

#### **Création du compte Supabase**
1. Allez sur [supabase.com](https://supabase.com)
2. **"Start your project"** → Connectez-vous avec GitHub
3. **"New project"** → Nommez-le `emoji-code-mood-[votre-nom]`
4. Choisissez une région proche (Europe West par exemple)
5. Générez un mot de passe fort et notez-le !

#### **Configuration de la table**
1. Dans Supabase : **SQL Editor** → **"New query"**
2. Copiez-collez ce script :

```sql
-- Création de la table pour stocker les humeurs
CREATE TABLE public.moods (
    id BIGSERIAL PRIMARY KEY,
    emoji TEXT NOT NULL,
    language TEXT NOT NULL,
    category TEXT,
    comment TEXT,
    code_line TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activer Row Level Security
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;

-- Politique : lecture publique
CREATE POLICY "Public read access" ON public.moods FOR SELECT USING (true);

-- Politique : écriture publique  
CREATE POLICY "Public write access" ON public.moods FOR INSERT WITH CHECK (true);

-- Index pour optimiser les performances
CREATE INDEX idx_moods_created_at ON public.moods(created_at DESC);
```

3. Cliquez **"Run"** ▶️

#### **Récupération des clés d'API**
1. **Settings** → **API**
2. Notez votre **Project URL** (commence par `https://`)
3. Notez votre **anon public key** (commence par `eyJ`)

### **D. Configuration des secrets GitHub (2 min)**
1. Dans votre fork GitHub : **Settings** → **Secrets and variables** → **Actions**
2. **"New repository secret"** :
   - Name : `SUPABASE_URL`
   - Secret : Votre Project URL
3. **"New repository secret"** :
   - Name : `SUPABASE_ANON_KEY`  
   - Secret : Votre clé publique

---

## 🧪 Étape 3 : Premier test (10 min)

### **🔗 Accès à votre application**
Votre app sera disponible à l'adresse :
`https://[votre-nom-github].github.io/emoji-code-mood/`

⏰ **Patience** : Le premier déploiement prend 5-10 minutes.

### **✅ Tests de validation**

#### **Test 1 : Fonctionnement de base**
- [ ] L'application se charge sans erreur
- [ ] Vous pouvez sélectionner un emoji
- [ ] Vous pouvez choisir un langage
- [ ] Le bouton "Envoyer" fonctionne
- [ ] Votre humeur s'affiche dans la liste

#### **Test 2 : Synchronisation temps réel**
- [ ] Ouvrez votre app dans 2 onglets différents
- [ ] Ajoutez une humeur dans le premier onglet
- [ ] Elle apparaît automatiquement dans le second
- [ ] Demandez à un collègue de tester avec l'URL de votre app

#### **Test 3 : Responsive design**
- [ ] Ouvrez l'app sur votre smartphone
- [ ] L'interface s'adapte correctement
- [ ] Vous pouvez ajouter une humeur depuis mobile
- [ ] La synchronisation fonctionne cross-device

---

## 🛠️ Étape 4 : Exploration du code (10 min)

### **📁 Structure du projet**
Ouvrez votre repository GitHub et explorez :

```
emoji-code-mood/
├── index.html          # Tableau de bord (navigation principale)
├── index.html          # Application temps réel (interface principale)
├── dashboard.html      # Tableau de bord (optionnel)
├── styles.css          # Styles et responsive design  
├── main.js             # Logique JavaScript
├── supabaseClient.js   # Client Supabase
└── docs/               # Documentation et formation
```

### **🔍 Analyse guidée**

#### **Dans `index.html` :**
- Trouvez le formulaire de saisie (ligne ~50)
- Identifiez les sections d'affichage (ligne ~80)
- Observez les attributs `data-*` pour JavaScript

#### **Dans `style.css` :**
- Cherchez les media queries (@media)
- Identifiez le système de grille CSS Grid
- Observez les animations CSS (transition, transform)

#### **Dans `script.js` :**
- Trouvez la fonction `addMood()` 
- Identifiez la gestion des événements
- Observez l'intégration Supabase

### **💡 Questions de compréhension**
1. Comment le CSS rend-il l'app responsive ?
2. Quel événement JavaScript déclenche l'ajout d'une humeur ?
3. Comment Supabase synchronise-t-il les données ?

---

## 🆘 Résolution de problèmes

### **❌ "Mon app ne se charge pas"**
- Vérifiez l'URL : `https://votre-nom.github.io/emoji-code-mood/`
- **Actions** tab → Vérifiez que le déploiement est ✅
- Attendez 10 minutes après la première activation

### **❌ "Erreur de connexion Supabase"**
- Vérifiez les noms des secrets : `SUPABASE_URL` et `SUPABASE_ANON_KEY`
- Re-exécutez le script SQL dans Supabase
- Consultez la console (F12) pour les détails d'erreur

### **❌ "Pas de synchronisation temps réel"**
- Vérifiez que RLS est activé sur la table `moods`
- Testez avec 2 navigateurs différents (pas seulement 2 onglets)
- Regardez l'onglet Network dans les DevTools

---

## 🎉 Récapitulatif

### **🏆 Ce que vous avez accompli :**
- ✅ **Forké** et configuré un projet GitHub
- ✅ **Déployé** automatiquement une application web
- ✅ **Configuré** une base de données cloud moderne
- ✅ **Testé** la synchronisation temps réel
- ✅ **Analysé** la structure d'un projet web moderne

### **🧠 Concepts techniques découverts :**
- **Git/GitHub** : Versioning et collaboration
- **GitHub Actions** : CI/CD automatisé
- **Supabase** : Backend-as-a-Service
- **Architecture web** : Client-serveur moderne
- **API REST** : Communication client-serveur

### **🔑 Compétences développées :**
- Configuration d'environnement de développement
- Déploiement automatisé d'applications
- Intégration de services tiers (Supabase)
- Test et validation d'applications web
- Lecture et compréhension de code existant

---

## 🚀 Prochaine étape

**Module 02 : Interface HTML/CSS Moderne**
- Comprendre la structure HTML5 sémantique
- Maîtriser le CSS Grid et Flexbox
- Modifier l'apparence de votre application
- Créer un design responsive avancé

---

## 📚 Ressources pour aller plus loin

### **Documentation officielle :**
- [GitHub Pages](https://pages.github.com/) - Hébergement gratuit
- [Supabase Docs](https://supabase.com/docs) - Base de données et API
- [GitHub Actions](https://docs.github.com/en/actions) - Automatisation

### **Tutoriels recommandés :**
- [Git et GitHub pour débutants](https://www.youtube.com/watch?v=USjZcfj8yxE)
- [Supabase en 100 secondes](https://www.youtube.com/watch?v=zBZgdTb-dns)

### **Exercices bonus :**
1. Personnalisez le titre de votre application
2. Modifiez la couleur principale dans le CSS
3. Ajoutez votre emoji préféré à la liste
4. Changez le message de bienvenue

*💡 Chaque modification sera automatiquement déployée grâce à GitHub Actions !*
