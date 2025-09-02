# 🚀 Configuration GitHub Actions pour Emoji Code Mood

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer le déploiement automatique de votre application Emoji Code Mood avec GitHub Actions. Cette méthode est **recommandée** car elle :

- ✅ **Sécurise automatiquement** vos clés Supabase
- ✅ **Déploie automatiquement** sur GitHub Pages
- ✅ **Évite la configuration manuelle** côté client
- ✅ **Maintient la sécurité** de vos données

## 🔑 Étape 1 : Configuration des Secrets GitHub

### 1.1 Accéder aux Secrets
1. **Ouvrez votre repository** sur GitHub
2. **Cliquez sur l'onglet `Settings`**
3. **Dans le menu de gauche, cliquez sur `Secrets and variables` → `Actions`**

### 1.2 Ajouter les Secrets Supabase
Vous devez ajouter **2 secrets** :

#### Secret 1 : `SUPABASE_URL`
- **Cliquez sur `New repository secret`**
- **Nom :** `SUPABASE_URL`
- **Valeur :** Votre URL Supabase (ex: `https://abcdefghijklm.supabase.co`)
- **Cliquez sur `Add secret`**

#### Secret 2 : `SUPABASE_ANON_KEY`
- **Cliquez sur `New repository secret`**
- **Nom :** `SUPABASE_ANON_KEY`
- **Valeur :** Votre clé anonyme Supabase (commence par `eyJ...`)
- **Cliquez sur `Add secret`**

> 🔒 **Important :** Ces secrets ne sont jamais visibles dans votre code. Ils sont injectés automatiquement lors du déploiement.

## 🚀 Étape 2 : Déploiement automatique

### 2.1 Pousser votre code
Une fois les secrets configurés, poussez simplement votre code :

```bash
git add .
git commit -m "🚀 Configuration GitHub Actions"
git push origin main
```

### 2.2 Vérifier le déploiement
1. **Allez dans l'onglet `Actions`** de votre repository
2. **Vous verrez le workflow `Deploy to GitHub Pages`** en cours d'exécution
3. **Attendez qu'il se termine** (environ 1-2 minutes)

### 2.3 Vérifier le succès
Le workflow est réussi quand vous voyez :
- ✅ **Tous les jobs sont verts**
- ✅ **Le message "Deploy to GitHub Pages" est vert**
- ✅ **Votre app est accessible** sur GitHub Pages

## 🔍 Étape 3 : Vérification de la configuration

### 3.1 Vérifier le fichier généré
Après le déploiement, vérifiez que `private-config.js` a été créé :

1. **Allez dans l'onglet `Code`** de votre repository
2. **Cherchez le fichier `private-config.js`**
3. **Vérifiez qu'il contient** vos vraies clés Supabase (pas des placeholders)

### 3.2 Tester l'application
1. **Ouvrez votre app** sur GitHub Pages
2. **Vérifiez la console** du navigateur
3. **Vous devriez voir** :
   ```
   ✅ Configuration Supabase détectée - Mode Supabase activé
   🚀 Supabase connecté avec succès
   ```

## 🛠️ Dépannage

### ❌ Erreur "Configuration Supabase manquante"
**Cause :** Les secrets GitHub ne sont pas configurés ou mal nommés
**Solution :**
1. Vérifiez que les secrets sont exactement nommés `SUPABASE_URL` et `SUPABASE_ANON_KEY`
2. Vérifiez que les valeurs sont correctes
3. Relancez le workflow en poussant à nouveau votre code

### ❌ Erreur "Workflow failed"
**Cause :** Problème dans l'exécution du workflow
**Solution :**
1. Cliquez sur le workflow échoué dans l'onglet Actions
2. Regardez les logs d'erreur
3. Vérifiez que tous les fichiers sont présents dans votre repository

### ❌ Erreur "Secrets not found"
**Cause :** Les secrets ne sont pas accessibles au workflow
**Solution :**
1. Vérifiez que vous êtes dans le bon repository
2. Vérifiez que les secrets sont bien dans `Secrets and variables` → `Actions`
3. Vérifiez que vous avez les permissions d'administrateur

## 📊 Structure du Workflow

Le workflow `deploy-secure.yml` fait automatiquement :

1. **🔍 Vérification** de la structure du projet
2. **🔑 Injection** des secrets Supabase dans `private-config.js`
3. **✅ Vérification** de sécurité (pas de placeholders restants)
4. **🚀 Déploiement** sur GitHub Pages
5. **🧹 Nettoyage** des fichiers temporaires

## 🔒 Sécurité

### Ce qui est sécurisé :
- ✅ Vos clés Supabase ne sont jamais visibles dans le code
- ✅ Les secrets sont chiffrés dans GitHub
- ✅ Le fichier `private-config.js` est généré automatiquement
- ✅ Vérifications automatiques contre les fuites de secrets

### Ce qui n'est pas sécurisé :
- ❌ Commiter manuellement `private-config.js` avec vos clés
- ❌ Partager vos clés Supabase publiquement
- ❌ Utiliser des variables d'environnement côté client

## 📚 Ressources supplémentaires

- 📖 **[Guide Supabase](supabase-setup.md)** - Configuration de la base de données
- 🎓 **[Guide enseignant](../README.md)** - Utilisation pédagogique
- 🔧 **[Dépannage général](../SETUP.md)** - Résolution des problèmes

## 🎯 Prochaines étapes

Une fois GitHub Actions configuré :

1. **Testez votre application** avec le fichier `test-supabase.html`
2. **Configurez GitHub Pages** si ce n'est pas déjà fait
3. **Partagez l'URL** avec vos étudiants
4. **Profitez** de la synchronisation temps réel ! 🎉

---

**Besoin d'aide ?** Ouvrez une issue sur GitHub ou consultez la documentation Supabase.
