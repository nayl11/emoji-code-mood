# 🔒 HTTPS & CSP - Sécurité Transport et Contenu

---
**Métadonnées**
- **Niveau :** Avancé
- **Durée :** 45 minutes
- **Prérequis :** Concepts web, sécurité de base
---

## 🎯 Objectifs d'Apprentissage

À la fin de ce chapitre, vous saurez :
- ✅ Comprendre l'importance d'HTTPS pour les PWA
- ✅ Configurer Content Security Policy (CSP)
- ✅ Protéger contre XSS et injections de code
- ✅ Optimiser les headers de sécurité
- ✅ Tester et auditer la sécurité web

---

## 🔐 HTTPS : Fondements de la Sécurité Moderne

### **1. Pourquoi HTTPS est Obligatoire**

#### **Fonctionnalités requérant HTTPS :**
```javascript
// APIs modernes nécessitant HTTPS
const httpsOnlyFeatures = [
    'Service Workers',           // PWA, cache offline
    'WebRTC',                   // Communication P2P
    'getUserMedia',             // Caméra/microphone
    'Geolocation API',          // Position précise
    'Web Push Notifications',   // Notifications
    'Payment Request API',      // Paiements
    'Credential Management',    // Authentification
    'Web Bluetooth/USB'         // Devices externes
];

// Test de disponibilité HTTPS
function checkHTTPSFeatures() {
    const protocol = window.location.protocol;
    const isSecure = protocol === 'https:' || 
                    location.hostname === 'localhost' ||
                    location.hostname === '127.0.0.1';
    
    if (!isSecure) {
        console.warn('⚠️ HTTPS requis pour certaines fonctionnalités');
        return false;
    }
    
    // Vérification Support Service Workers (PWA)
    if ('serviceWorker' in navigator) {
        console.log('✅ Service Workers disponibles');
    }
    
    return true;
}
```

### **2. HTTPS sur GitHub Pages**

GitHub Pages force automatiquement HTTPS :
```yaml
# Configuration automatique GitHub Pages
https://username.github.io/emoji-code-mood/
├── 🔒 Certificate: Let's Encrypt (renouvelé automatiquement)
├── 🔒 TLS 1.2/1.3: Chiffrement fort
├── 🔒 HSTS: HTTP Strict Transport Security
└── 🔒 HTTP/2: Performance optimisée
```

**Avantages automatiques :**
- 🛡️ **Chiffrement** de toutes les communications
- ⚡ **HTTP/2** pour des performances supérieures
- 🔒 **HSTS** empêche les downgrades HTTP
- 📱 **PWA Compatible** pour installation mobile

---

## 🛡️ Content Security Policy (CSP)

### **3. CSP dans Emoji Code Mood**

#### **Configuration CSP optimale :**
```html
<!-- Injection CSP via meta tag -->
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 
               'unsafe-inline' 
               https://cdn.jsdelivr.net 
               https://unpkg.com;
    style-src 'self' 
              'unsafe-inline';
    connect-src 'self' 
                https://*.supabase.co 
                wss://*.supabase.co;
    img-src 'self' 
            data: 
            https:;
    font-src 'self' 
             data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    block-all-mixed-content;
">
```

#### **Explication directive par directive :**
```javascript
const cspDirectives = {
    // Politique par défaut (restrictive)
    'default-src': "'self'",                    // Seulement depuis le domaine actuel
    
    // Scripts autorisés
    'script-src': [
        "'self'",                               // Scripts locaux
        "'unsafe-inline'",                      // Scripts inline (nécessaire pour config)
        "https://cdn.jsdelivr.net",            // CDN Supabase
        "https://unpkg.com"                     // CDN alternatif
    ],
    
    // Styles autorisés
    'style-src': [
        "'self'",                               // CSS locaux
        "'unsafe-inline'"                       // Styles inline (nécessaire pour dynamic styling)
    ],
    
    // Connexions réseau autorisées
    'connect-src': [
        "'self'",                               // API locales
        "https://*.supabase.co",                // API Supabase
        "wss://*.supabase.co"                   // WebSocket Supabase
    ],
    
    // Images autorisées
    'img-src': [
        "'self'",                               // Images locales
        "data:",                                // Data URIs (avatars générés)
        "https:"                                // Toutes images HTTPS
    ],
    
    // Sécurité renforcée
    'object-src': "'none'",                     // Pas de plugins (Flash, etc.)
    'frame-ancestors': "'none'",                // Pas d'iframe externe
    'upgrade-insecure-requests': true,          // Force HTTPS
    'block-all-mixed-content': true            // Bloque HTTP sur HTTPS
};
```

---

## 🚨 Protection XSS et Injections

### **4. Patterns de Protection XSS**

#### **Échappement sécurisé dans l'app :**
```javascript
// Utilitaires d'échappement HTML
const SecurityUtils = {
    // Échappement basique HTML
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },
    
    // Échappement pour attributs
    escapeAttribute(unsafe) {
        return unsafe.replace(/['"<>&]/g, (char) => ({
            "'": "&#x27;",
            '"': "&quot;",
            '<': "&lt;",
            '>': "&gt;",
            '&': "&amp;"
        }[char]));
    },
    
    // Validation des URLs
    isValidUrl(string) {
        try {
            const url = new URL(string);
            return ['http:', 'https:', 'mailto:'].includes(url.protocol);
        } catch {
            return false;
        }
    },
    
    // Sanitization pour contenu utilisateur
    sanitizeUserInput(input) {
        // Supprime les scripts et événements dangereux
        return input
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/javascript:/gi, '')
            .trim();
    }
};

// Usage sécurisé dans generateSocialPost
function generateSocialPost(humeur) {
    const safeNom = SecurityUtils.escapeHtml(humeur.nom);
    const safeCommentaire = SecurityUtils.escapeHtml(humeur.commentaire || '');
    const safeEmoji = SecurityUtils.escapeHtml(humeur.emoji);
    
    // Construction sécurisée du HTML
    return `
        <article class="social-post" data-mood-id="${humeur.id}">
            <div class="user-info">
                <div class="avatar">${generateAvatar(safeNom)}</div>
                <div class="post-meta">
                    <span class="username">${safeNom}</span>
                    <span class="timestamp">${formatTime(humeur.created_at)}</span>
                </div>
            </div>
            <div class="post-content">
                <div class="code-snippet">
                    <code>${generateCodeSnippet(humeur)}</code>
                </div>
                ${safeCommentaire ? `<p class="comment">${safeCommentaire}</p>` : ''}
            </div>
        </article>
    `;
}
```

### **5. Validation Côté Client (UX) + Serveur (Sécurité)**

#### **Double validation défensive :**
```javascript
// Validation côté client (expérience utilisateur)
function validateMoodInput(data) {
    const errors = [];
    
    // Longueur nom
    if (!data.nom || data.nom.trim().length < 2) {
        errors.push('Le nom doit contenir au moins 2 caractères');
    }
    
    if (data.nom.length > 50) {
        errors.push('Le nom ne peut pas dépasser 50 caractères');
    }
    
    // Commentaire optionnel mais limité
    if (data.commentaire && data.commentaire.length > 200) {
        errors.push('Le commentaire ne peut pas dépasser 200 caractères');
    }
    
    // Emoji requis
    if (!data.emoji || data.emoji.trim().length === 0) {
        errors.push('Veuillez sélectionner un emoji');
    }
    
    // Patterns dangereux basiques (client-side seulement)
    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i
    ];
    
    const allText = `${data.nom} ${data.commentaire || ''}`;
    dangerousPatterns.forEach(pattern => {
        if (pattern.test(allText)) {
            errors.push('Contenu non autorisé détecté');
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Usage avec feedback UX immédiat
async function submitMood() {
    const formData = collectFormData();
    
    // 1. Validation côté client (UX)
    const clientValidation = validateMoodInput(formData);
    if (!clientValidation.isValid) {
        showValidationErrors(clientValidation.errors);
        return;
    }
    
    try {
        // 2. Envoi serveur (validation Supabase RLS + contraintes DB)
        const success = await addHumeur(formData);
        
        if (success) {
            showSuccessMessage('Humeur partagée avec succès !');
            resetForm();
        }
    } catch (error) {
        // Erreur serveur = validation échouée côté sécurisé
        showErrorMessage('Données invalides ou problème de connexion');
    }
}
```

---

## 🔧 Headers de Sécurité Avancés

### **6. Configuration Headers Complémentaires**

#### **Headers idéaux (via serveur ou meta tags) :**
```html
<!-- Headers de sécurité via meta tags -->
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">

<!-- CSP déjà défini plus haut -->
<meta http-equiv="Content-Security-Policy" content="...">
```

#### **Explication des protections :**
```javascript
const securityHeaders = {
    // Empêche l'affichage en iframe (clickjacking)
    'X-Frame-Options': 'DENY',
    
    // Force le bon Content-Type (empêche MIME sniffing)
    'X-Content-Type-Options': 'nosniff',
    
    // Contrôle les informations de référent
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Désactive les APIs sensibles
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    
    // Force HTTPS (si servi via serveur)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    
    // Protection XSS legacy browser
    'X-XSS-Protection': '1; mode=block'
};
```

---

## 🧪 Tests et Audit Sécurité

### **7. Audit Automatisé de Sécurité**

#### **Script de test sécurité :**
```javascript
// security-audit.js - Test complet sécurité
async function auditWebSecurity() {
    console.log('🔍 === AUDIT SÉCURITÉ WEB ===');
    
    const results = {
        https: false,
        csp: false,
        headers: {},
        vulnerabilities: []
    };
    
    // 1. Test HTTPS
    results.https = location.protocol === 'https:';
    console.log('🔒 HTTPS:', results.https ? '✅' : '❌');
    
    // 2. Test CSP
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    results.csp = !!cspMeta;
    console.log('🛡️ CSP:', results.csp ? '✅' : '❌');
    
    if (cspMeta) {
        console.log('📋 CSP Policy:', cspMeta.content);
    }
    
    // 3. Test injection XSS basique
    const testPayload = '<script>alert("XSS")</script>';
    const testElement = document.createElement('div');
    testElement.innerHTML = testPayload;
    
    if (testElement.innerHTML.includes('<script>')) {
        results.vulnerabilities.push('XSS: innerHTML sans échappement');
        console.warn('⚠️ Vulnérabilité XSS détectée');
    }
    
    // 4. Test mixed content
    const resources = Array.from(document.querySelectorAll('[src], [href]'));
    const httpResources = resources.filter(el => {
        const url = el.src || el.href;
        return url && url.startsWith('http:');
    });
    
    if (httpResources.length > 0) {
        results.vulnerabilities.push('Mixed Content détecté');
        console.warn('⚠️ Ressources HTTP sur page HTTPS:', httpResources);
    }
    
    // 5. Test localStorage
    try {
        localStorage.setItem('security-test', testPayload);
        const stored = localStorage.getItem('security-test');
        if (stored === testPayload) {
            console.log('💾 LocalStorage: Fonctionne (attention aux données sensibles)');
        }
        localStorage.removeItem('security-test');
    } catch (e) {
        console.log('💾 LocalStorage: Restreint ou indisponible');
    }
    
    // 6. Rapport final
    const score = calculateSecurityScore(results);
    console.log(`🏆 Score sécurité: ${score}/100`);
    
    return results;
}

function calculateSecurityScore(results) {
    let score = 0;
    
    if (results.https) score += 30;
    if (results.csp) score += 25;
    if (results.vulnerabilities.length === 0) score += 30;
    if (Object.keys(results.headers).length > 0) score += 15;
    
    return score;
}

// Exécution automatique
auditWebSecurity();
```

### **8. Outils d'Audit Externes**

#### **Tests recommandés :**
```bash
# Audit Lighthouse (DevTools)
# Score Sécurité → Best Practices

# Test CSP en ligne
# https://csp-evaluator.withgoogle.com/

# Test headers sécurité
# https://securityheaders.com/

# Test SSL/TLS
# https://www.ssllabs.com/ssltest/
```

---

## ✅ Récapitulatif

**Sécurité Transport & Contenu maîtrisée :**
- ✅ **HTTPS obligatoire** pour PWA et APIs modernes
- ✅ **CSP configuré** contre XSS et injections
- ✅ **Headers sécurisés** pour protection en profondeur
- ✅ **Validation double** client (UX) + serveur (sécurité)
- ✅ **Audit automatisé** pour surveillance continue

**Protection multicouche :**
- 🔒 **Transport** : HTTPS avec TLS 1.3
- 🛡️ **Contenu** : CSP bloque scripts malveillants
- 🧹 **Données** : Échappement HTML systématique
- 🔍 **Monitoring** : Tests automatisés de vulnérabilités

---

**Prochaine étape :** [13. GitHub Actions](13-github-actions.md) - Pipeline CI/CD sécurisé

---

*💡 **Astuce Pédagogique :** Utilisez les DevTools → Security tab pour analyser en temps réel le niveau de sécurité de votre application et celle de sites populaires.*
