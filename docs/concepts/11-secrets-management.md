# 🔐 Secrets Management - Variables d'Environnement Sécurisées

---
**Métadonnées**
- **Niveau :** Intermédiaire/Avancé
- **Durée :** 40 minutes
- **Prérequis :** GitHub Actions, concepts de sécurité
---

## 🎯 Objectifs d'Apprentissage

À la fin de ce chapitre, vous saurez :
- ✅ Distinguer variables client vs serveur
- ✅ Sécuriser les clés API avec GitHub Secrets
- ✅ Implémenter l'injection automatique de configuration
- ✅ Appliquer les bonnes pratiques de sécurité
- ✅ Gérer les environnements multiples (dev/prod)

---

## 🔒 Théorie des Secrets - Client vs Serveur

### **1. Classification des Données Sensibles**

#### **Variables côté CLIENT (Frontend) :**
```javascript
// ✅ SÛRES à exposer (avec protections)
const PUBLIC_CONFIG = {
    supabaseUrl: 'https://xxx.supabase.co',         // URL publique
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIs...',    // Clé anonyme
    appVersion: '1.0.0',                           // Métadonnées
    apiEndpoint: 'https://api.monapp.com',         // Endpoints publics
    cdnUrl: 'https://cdn.jsdelivr.net'            // URLs externes
};
```

**Pourquoi ces données sont "sûres" :**
- 🛡️ **Protection RLS** : Supabase Row Level Security limite l'accès
- 🔍 **Visibilité contrôlée** : Clé anonyme = permissions limitées
- 📖 **Public par design** : URLs destinées à être connues

#### **Variables côté SERVEUR (Backend) :**
```javascript
// ❌ JAMAIS exposer côté client
const PRIVATE_CONFIG = {
    supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIs...',  // Clé admin totale
    databaseUrl: 'postgres://user:pass@host/db',     // Accès direct DB
    jwtSecret: 'super-secret-jwt-key',               // Signature tokens
    emailApiKey: 'key-sendgrid-or-mailgun',         // APIs tierces
    encryptionKey: 'aes-256-encryption-key'         // Chiffrement données
};
```

**Dangers d'exposition :**
- 💥 **Accès total** à la base de données
- 🔓 **Bypass** de toutes les sécurités
- 💸 **Utilisation frauduleuse** d'APIs payantes

---

## 🏗️ Architecture Sécurisée d'Emoji Code Mood

### **2. Flux de Configuration Sécurisée**

#### **Injection automatique par GitHub Actions :**
```mermaid
graph TB
    A[🔐 GitHub Secrets] --> B[🏗️ Build Action]
    B --> C[📝 private-config.js]
    C --> D[🌐 Déploiement Pages]
    E[👨‍💻 Développeur] --> F[📁 Code Source]
    F --> G[❌ Pas de secrets hardcodés]
    
    style A fill:#4caf50
    style G fill:#ff6b6b
    style C fill:#ffc107
```

### **3. Implémentation Pratique**

#### **Template de configuration (NON committé) :**
```javascript
// private-config.template.js (exemple, jamais en production)
window.PRIVATE_CONFIG = {
    mode: 'development',
    supabaseUrl: 'VOTRE_SUPABASE_URL',
    supabaseAnonKey: 'VOTRE_SUPABASE_ANON_KEY',
    useRealtime: true,
    debugMode: true
};
```

#### **Configuration réelle générée automatiquement :**
```yaml
# .github/workflows/deploy-secure.yml
- name: 🔒 Injection des secrets (Configuration Supabase)
  run: |
    echo "🔑 Création du fichier de configuration sécurisé..."
    
    # Création sécurisée avec heredoc
    cat > private-config.js << 'EOF'
    // 🔒 Généré automatiquement - Ne sera jamais dans Git
    window.PRIVATE_CONFIG = {
      mode: 'production',
      supabaseUrl: '${{ secrets.SUPABASE_URL }}',
      supabaseAnonKey: '${{ secrets.SUPABASE_ANON_KEY }}',
      useRealtime: true,
      
      // Métadonnées du build
      deployedAt: '${{ github.event.head_commit.timestamp }}',
      deployedBy: 'GitHub Actions',
      commitSha: '${{ github.sha }}',
      version: '1.0.0-secure'
    };
    
    console.log('🎭 Emoji Code Mood - Configuration automatique chargée');
    EOF
```

---

## 🛡️ Bonnes Pratiques de Sécurité

### **4. Validation et Vérification**

#### **Tests de sécurité automatisés :**
```yaml
# Vérifications de sécurité dans le workflow
- name: 📋 Vérification de sécurité
  run: |
    echo "🔍 Audit sécurité automatique..."
    
    # 1. Vérifier absence de secrets hardcodés
    if grep -r "supabaseUrl.*https://" . --exclude-dir=.git --exclude-dir=.github; then
      echo "❌ ERREUR: URL Supabase hardcodée détectée!"
      exit 1
    fi
    
    # 2. Vérifier absence de clés en dur
    if grep -r "eyJhbGciOiJIUzI1NiIs" . --exclude-dir=.git; then
      echo "❌ ERREUR: Clé JWT hardcodée détectée!"
      exit 1
    fi
    
    # 3. Vérifier que la config est bien injectée
    if ! grep -q "window.PRIVATE_CONFIG" private-config.js; then
      echo "❌ ERREUR: Configuration non injectée!"
      exit 1
    fi
    
    # 4. Vérifier permissions du fichier
    if [ -f private-config.js ]; then
      echo "✅ Configuration générée avec succès"
    fi
    
    echo "✅ Audit sécurité réussi"
```

### **5. Environnements Multiples**

#### **Gestion dev/staging/production :**
```yaml
# Configuration par environnement
- name: 🔧 Configuration environnement-spécifique
  run: |
    # Détection automatique de l'environnement
    if [ "${{ github.ref }}" = "refs/heads/main" ]; then
      ENVIRONMENT="production"
      SUPABASE_URL="${{ secrets.PROD_SUPABASE_URL }}"
      SUPABASE_KEY="${{ secrets.PROD_SUPABASE_ANON_KEY }}"
    elif [ "${{ github.ref }}" = "refs/heads/staging" ]; then
      ENVIRONMENT="staging"  
      SUPABASE_URL="${{ secrets.STAGING_SUPABASE_URL }}"
      SUPABASE_KEY="${{ secrets.STAGING_SUPABASE_ANON_KEY }}"
    else
      ENVIRONMENT="development"
      SUPABASE_URL="${{ secrets.DEV_SUPABASE_URL }}"
      SUPABASE_KEY="${{ secrets.DEV_SUPABASE_ANON_KEY }}"
    fi
    
    echo "🌍 Environnement détecté: $ENVIRONMENT"
    
    # Injection avec variables d'environnement
    cat > private-config.js << EOF
    window.PRIVATE_CONFIG = {
      mode: '${ENVIRONMENT}',
      supabaseUrl: '${SUPABASE_URL}',
      supabaseAnonKey: '${SUPABASE_KEY}',
      debugMode: ${ENVIRONMENT !== 'production'},
      useRealtime: true
    };
    EOF
```

---

## 🔐 Configuration GitHub Secrets

### **6. Organisation des Secrets**

#### **Hiérarchie recommandée :**
```markdown
📁 Repository Secrets (Accès: Ce repo seulement)
├── SUPABASE_URL                 # URL du projet Supabase
├── SUPABASE_ANON_KEY           # Clé anonyme (RLS protégée)
├── STAGING_SUPABASE_URL        # Environnement de test
└── STAGING_SUPABASE_ANON_KEY   # Clé test

🏢 Organization Secrets (Accès: Tous les repos)
├── DOCKER_REGISTRY_TOKEN       # Partagé entre projets
├── NOTIFICATION_WEBHOOK        # Notifications équipe
└── COMPANY_API_KEY            # APIs communes

🌍 Environment Secrets (Accès: Environnement spécifique)
├── production/PROD_SUPABASE_URL
├── staging/STAGING_SUPABASE_URL  
└── development/DEV_SUPABASE_URL
```

#### **Configuration via GitHub CLI :**
```bash
# Configuration locale pour développement
gh secret set SUPABASE_URL --body "https://xxx.supabase.co"
gh secret set SUPABASE_ANON_KEY --body "eyJhbGciOiJIUzI1NiIs..."

# Vérification
gh secret list
```

### **7. Rotation des Secrets**

#### **Stratégie de renouvellement :**
```javascript
// Détection de clé expirée côté client
function validateApiKey() {
    try {
        // Décoder le JWT pour vérifier l'expiration
        const payload = JSON.parse(atob(CONFIG.supabaseAnonKey.split('.')[1]));
        const expiry = payload.exp * 1000; // Conversion en milliseconds
        const now = Date.now();
        
        if (expiry - now < 7 * 24 * 60 * 60 * 1000) { // 7 jours
            console.warn('⚠️ Clé API expire bientôt, renouvellement nécessaire');
            // Notification automatique pour l'admin
        }
        
        return expiry > now;
        
    } catch (error) {
        console.error('❌ Clé API invalide:', error);
        return false;
    }
}

// Utilisation défensive
async function initSupabase() {
    if (!validateApiKey()) {
        throw new Error('Configuration API invalide ou expirée');
    }
    
    // Initialisation normale si clé valide
    const { createClient } = window.supabase;
    return createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
}
```

---

## 🚨 Anti-Patterns à Éviter

### **8. Erreurs de Sécurité Communes**

#### **❌ Ce qu'il ne faut JAMAIS faire :**
```javascript
// ERREUR 1: Secrets hardcodés
const supabase = createClient(
    'https://abcdefg.supabase.co',           // ❌ URL en dur
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // ❌ Clé en dur
);

// ERREUR 2: Variables d'environnement côté client  
const config = {
    apiKey: process.env.REACT_APP_SECRET_KEY // ❌ Exposé au build
};

// ERREUR 3: Clés dans localStorage/sessionStorage
localStorage.setItem('apiKey', 'secret-key'); // ❌ Accessible via DevTools

// ERREUR 4: Clés dans URLs ou logs
console.log('Config:', { apiKey: secretKey }); // ❌ Visible dans DevTools
fetch(`/api/data?key=${apiKey}`);            // ❌ Visible network tab

// ERREUR 5: Validation côté client uniquement
if (apiKey === 'expected-key') {            // ❌ Bypassable
    // Code "sécurisé"
}
```

#### **✅ Bonnes pratiques :**
```javascript
// ✅ Configuration injectée automatiquement
if (!window.PRIVATE_CONFIG) {
    throw new Error('Configuration manquante - vérifiez le déploiement');
}

// ✅ Validation défensive
const config = window.PRIVATE_CONFIG;
if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error('Configuration Supabase incomplète');
}

// ✅ Utilisation sécurisée
const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

// ✅ Logs sanitisés
console.log('Supabase configuré pour:', config.supabaseUrl.replace(/https:\/\/([^.]+).*/, 'https://$1.***'));
```

---

## 🔬 Tests de Sécurité

### **9. Audit Manuel et Automatique**

#### **Script d'audit sécurité :**
```javascript
// audit-security.js - À exécuter dans DevTools
function auditSecrets() {
    console.log('🔍 === AUDIT SÉCURITÉ EMOJI CODE MOOD ===');
    
    // 1. Vérifier exposition de secrets
    const exposedSecrets = [];
    
    // Recherche dans window
    Object.keys(window).forEach(key => {
        if (key.toLowerCase().includes('secret') || 
            key.toLowerCase().includes('key') ||
            key.toLowerCase().includes('token')) {
            exposedSecrets.push({ type: 'window', key, value: typeof window[key] });
        }
    });
    
    // Recherche dans localStorage
    Object.keys(localStorage).forEach(key => {
        if (key.toLowerCase().includes('secret') ||
            key.toLowerCase().includes('key')) {
            exposedSecrets.push({ type: 'localStorage', key, value: '***' });
        }
    });
    
    // 2. Vérifier configuration
    const config = window.PRIVATE_CONFIG;
    if (config) {
        console.log('✅ Configuration détectée');
        console.log('🌍 Environnement:', config.mode || 'non défini');
        console.log('🔗 URL Supabase:', config.supabaseUrl ? '✅ Configuré' : '❌ Manquant');
        console.log('🔑 Clé anonyme:', config.supabaseAnonKey ? '✅ Configuré' : '❌ Manquant');
    } else {
        console.warn('⚠️ Aucune configuration détectée');
    }
    
    // 3. Rapport final
    if (exposedSecrets.length > 0) {
        console.warn('🚨 Secrets potentiellement exposés:', exposedSecrets);
    } else {
        console.log('✅ Aucun secret exposé détecté');
    }
    
    // 4. Test de fonctionnalité sécurisée
    if (window.supabase && config) {
        console.log('🧪 Test de connexion Supabase...');
        const client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
        // Test basique de connectivité
    }
}

// Exécution
auditSecrets();
```

---

## ✅ Récapitulatif

**Secrets Management maîtrisé :**
- ✅ **Distinction claire** client vs serveur pour les variables
- ✅ **GitHub Secrets** pour injection sécurisée automatique
- ✅ **Validation automatisée** anti-hardcoding dans CI/CD
- ✅ **Environnements multiples** dev/staging/prod
- ✅ **Audit sécurité** manuel et automatisé

**Sécurité en profondeur :**
- 🔒 **Zéro secret** dans le code source
- 🔄 **Injection dynamique** à l'exécution seulement
- 🛡️ **Validation défensive** côté client
- 📋 **Tests automatisés** anti-régression
- 🔍 **Audit régulier** des expositions potentielles

---

**Prochaine étape :** [12. HTTPS & CSP](12-https-csp.md) - Sécurité transport et contenu

---

*💡 **Astuce Pédagogique :** Demandez aux étudiants de faire un audit sécurité sur d'autres sites avec les DevTools pour identifier les mauvaises pratiques courantes.*
