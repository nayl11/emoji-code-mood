# 🚀 Session 1 : Prise en Main (45min)

## 🎯 Objectif
**Avoir votre propre version de l'application en ligne et fonctionnelle**

---

## 🔍 Étape 1 : Découvrir l'application (10min)

### **📱 Testez l'app de démonstration**
👉 Ouvrez : https://ggaillard.github.io/emoji-code-mood/

### **🎮 Actions à faire :**
1. **Ajoutez votre humeur :**
   - Choisissez votre prénom
   - Sélectionnez un emoji
   - Choisissez votre langage préféré
   - Ajoutez une préférence tech
   - Écrivez un commentaire (optionnel)
   - Cliquez "Envoyer"

2. **Observez le résultat :**
   - Votre humeur apparaît dans le feed
   - Un code est généré automatiquement
   - D'autres participations s'affichent

### **❓ Questions de compréhension :**
- À quoi ressemble le code généré ?
- Combien de participants y a-t-il ?
- L'interface change-t-elle sur mobile ?

---

## 🍴 Étape 2 : Créer votre version (25min)

### **A. Fork du projet (5min)**
1. Allez sur : https://github.com/ggaillard/emoji-code-mood
2. Cliquez sur **"Fork"** (bouton en haut à droite)
3. Laissez le nom par défaut
4. Cliquez **"Create fork"**

*➡️ Vous avez maintenant votre copie du projet !*

### **B. Activer l'hébergement (3min)**
1. Dans **votre** repository, allez dans **Settings**
2. Menu de gauche : cliquez **Pages**
3. Source : sélectionnez **"GitHub Actions"**
4. Pas besoin de sauvegarder, c'est automatique

### **C. Créer la base de données (10min)**
1. **Créez un compte** sur https://supabase.com (gratuit)
2. **New Project** :
   - Name : `emoji-mood-[votre-nom]`
   - Password : Cliquez "Generate a password"
   - Region : West EU (Ireland)
   - Cliquez **"Create new project"**
3. **Attendez 2 minutes** que le projet se crée

### **D. Configurer la table (5min)**
1. Dans Supabase, cliquez **"SQL Editor"**
2. Cliquez **"New Query"**
3. **Copiez-collez ce code exactement :**

```sql
CREATE TABLE public.humeur (
  id BIGSERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  emoji TEXT NOT NULL,
  langage_prefere TEXT NOT NULL,
  autre_preference TEXT NOT NULL,
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.humeur ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique" ON public.humeur FOR SELECT TO public USING (true);
CREATE POLICY "Écriture publique" ON public.humeur FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Suppression publique" ON public.humeur FOR DELETE TO public USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.humeur;
```

4. Cliquez **"Run"** ▶️
5. Vérifiez qu'il n'y a pas d'erreur

### **E. Configurer les secrets (2min)**
1. **Copiez vos clés Supabase :**
   - Allez dans **Settings** → **API**
   - Copiez **URL** (commence par `https://`)
   - Copiez **anon public key** (commence par `eyJ`)

2. **Dans votre GitHub :**
   - **Settings** → **Secrets and variables** → **Actions**
   - **New repository secret** :
     - Name: `SUPABASE_URL`
     - Secret: Collez votre URL
   - **New repository secret** :
     - Name: `SUPABASE_ANON_KEY`
     - Secret: Collez votre clé

---

## ✅ Étape 3 : Tester votre version (10min)

### **🔗 Accès à votre app**
Votre app sera disponible à :  
`https://[votre-nom-github].github.io/emoji-code-mood/`

*⏰ Attention : Première fois = 5-10 minutes d'attente*

### **🧪 Tests à faire :**
1. **Test basique :**
   - Ajoutez votre première humeur
   - Vérifiez qu'elle s'affiche

2. **Test temps réel :**
   - Demandez à un voisin d'ouvrir votre app
   - Ajoutez une humeur chacun
   - Vérifiez que vous voyez les deux

3. **Test mobile :**
   - Ouvrez sur votre téléphone
   - Testez l'ajout d'une humeur

### **✅ Checklist de validation :**
- [ ] Mon app est accessible en ligne
- [ ] Je peux ajouter des humeurs
- [ ] Elles s'affichent bien
- [ ] La synchronisation fonctionne
- [ ] Ça marche sur mobile

---

## 🆘 Problèmes courants

### **❌ "Mon app ne se charge pas"**
- Attendez 10 minutes après la première activation
- Vérifiez l'URL : `https://votre-nom.github.io/emoji-code-mood/`
- Regardez dans Actions si le déploiement est terminé

### **❌ "Erreur Supabase"**
- Vérifiez que les secrets GitHub sont bien configurés
- Noms exacts : `SUPABASE_URL` et `SUPABASE_ANON_KEY`
- Re-exécutez le script SQL si nécessaire

### **❌ "Rien ne se synchronise"**
- Testez avec 2 navigateurs différents
- Vérifiez la console (F12) pour voir les erreurs

---

## 🎉 Bravo !

**✅ Vous avez maintenant :**
- Votre propre application web en ligne
- Une base de données configurée
- La synchronisation temps réel qui fonctionne

**🔗 Partagez l'URL** de votre app avec vos voisins pour tester ensemble !

---

**Prochaine étape :** [02 - Comprendre l'Interface](02-interface-simple.md)
