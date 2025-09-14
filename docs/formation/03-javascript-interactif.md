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
export class M
