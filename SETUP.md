# 🚀 Configuration Emoji Code Mood

## ⚠️ Configuration requise

### 1. Configurer Supabase

1. **Créez un projet Supabase** sur [supabase.com](https://supabase.com)
2. **Créez la table `moods`** avec cette structure SQL :

```sql
CREATE TABLE moods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    language VARCHAR(50) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Configuration des Secrets GitHub

**IMPORTANT :** Le fichier `private-config.js` est créé automatiquement par le workflow GitHub Actions.

1. **Dans votre repository GitHub**, allez dans **Settings → Secrets and variables → Actions**
2. **Ajoutez ces secrets :**
   - `SUPABASE_URL` : Votre URL Supabase (ex: `https://xxx.supabase.co`)
   - `SUPABASE_ANON_KEY` : Votre clé anonyme Supabase

### 3. Déploiement automatique

1. **Poussez votre code sur la branche `main`**
2. **Le workflow GitHub Actions se lance automatiquement**
3. **Il crée `private-config.js` avec vos secrets**
4. **L'application est déployée sur GitHub Pages**

## 🔧 Dépannage

### Erreur "Configuration Supabase manquante"
- Vérifiez que les secrets GitHub sont bien configurés
- Vérifiez que le workflow GitHub Actions s'est bien exécuté

### Erreur de connexion Supabase
- Vérifiez vos clés dans les secrets GitHub
- Vérifiez que la table `moods` existe dans votre projet Supabase

### Erreur "Bibliothèque Supabase non chargée"
- Vérifiez votre connexion internet
- Vérifiez que le CDN Supabase est accessible

## 📁 Structure des fichiers

```
emoji-code-mood/
├── .github/workflows/
│   └── deploy-secure.yml    # Workflow de déploiement automatique
├── index.html               # Interface utilisateur
├── main.js                  # Logique principale
├── supabaseClient.js        # Client Supabase
├── styles.css               # Styles CSS
└── SETUP.md                 # Ce fichier
```

## 🚀 Déploiement

1. **Commitez et poussez vos changements**
2. **Vérifiez l'exécution du workflow dans l'onglet Actions**
3. **Votre app sera disponible sur GitHub Pages automatiquement**

## 🔒 Sécurité

- ✅ Les clés API ne sont jamais visibles dans le code
- ✅ Configuration injectée automatiquement lors du déploiement
- ✅ Fichiers sensibles supprimés après build
- ✅ Vérifications de sécurité automatiques
