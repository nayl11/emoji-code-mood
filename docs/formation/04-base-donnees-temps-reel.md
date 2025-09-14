# 🗄️ Module 04 : Base de Données Temps Réel
*Durée : 40 minutes*

## 🎯 Objectifs de ce module

À la fin de cette session, vous maîtriserez :
- ✅ L'architecture Supabase et PostgreSQL
- ✅ La conception de schéma de base de données optimisé
- ✅ Les requêtes SQL pour l'analyse de données
- ✅ La configuration du temps réel avec les WebSockets
- ✅ Les règles de sécurité (Row Level Security)
- ✅ L'optimisation des performances de base de données

---

## 🏗️ Étape 1 : Architecture Supabase (10 min)

### **🔍 Vue d'ensemble de la stack**

```
Frontend (JavaScript)
        ↕️ API REST + WebSocket
Supabase (Backend-as-a-Service)
        ↕️ SQL + Real-time
PostgreSQL (Base de données)
```

### **📊 Structure de notre base de données**

#### **Table principale : `moods`**
```sql
CREATE TABLE public.moods (
    id BIGSERIAL PRIMARY KEY,              -- Clé primaire auto-incrémentée
    emoji TEXT NOT NULL,                   -- Emoji sélectionné (🎭, 😊, etc.)
    language TEXT NOT NULL,               -- Langage de programmation
    category TEXT,                        -- Catégorie d'humeur (optionnel)
    comment TEXT,                         -- Commentaire utilisateur (optionnel)
    code_line TEXT NOT NULL,             -- Ligne de code générée
    user_session TEXT,                   -- Session utilisateur pour stats
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Contraintes pour assurer la qualité des données
    CONSTRAINT valid_emoji CHECK (char_length(emoji) <= 10),
    CONSTRAINT valid_language CHECK (char_length(language) <= 50),
    CONSTRAINT valid_comment CHECK (char_length(comment) <= 200)
);
```

#### **Index pour optimiser les performances :**
```sql
-- Index sur la date de création (requêtes récentes)
CREATE INDEX idx_moods_created_at ON public.moods(created_at DESC);

-- Index composite pour les requêtes filtrées
CREATE INDEX idx_moods_language_category ON public.moods(language, category);

-- Index pour les statistiques par session
CREATE INDEX idx_moods_session ON public.moods(user_session);
```

### **🔧 Exercice pratique : Exploration de la base**

Connectez-vous à votre Supabase et explorez votre base de données :

1. **Table Editor** → Visualisez vos données
2. **SQL Editor** → Exécutez des requêtes
3. **Logs** → Observez l'activité en temps réel

---

## 📊 Étape 2 : Requêtes SQL avancées (15 min)

### **🔍 Requêtes d'analyse des données**

#### **1. Statistiques générales :**
```sql
-- Nombre total d'humeurs par langage
SELECT 
    language,
    COUNT(*) as total_moods,
    COUNT(DISTINCT user_session) as unique_users,
    ROUND(COUNT(*)::numeric / COUNT(DISTINCT user_session), 2) as moods_per_user
FROM public.moods 
GROUP BY language 
ORDER BY total_moods DESC;
```

#### **2. Analyse temporelle :**
```sql
-- Humeurs par heure de la journée
SELECT 
    EXTRACT(HOUR FROM created_at) as hour_of_day,
    COUNT(*) as mood_count,
    ARRAY_AGG(DISTINCT emoji) as popular_emojis
FROM public.moods 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour_of_day;
```

#### **3. Top emojis avec tendances :**
```sql
-- Emojis les plus populaires avec évolution
WITH emoji_stats AS (
    SELECT 
        emoji,
        COUNT(*) as total_count,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 hour' THEN 1 END) as recent_count
    FROM public.moods 
    GROUP BY emoji
)
SELECT 
    emoji,
    total_count,
    recent_count,
    CASE 
        WHEN recent_count > total_count * 0.2 THEN '📈 En hausse'
        WHEN recent_count < total_count * 0.05 THEN '📉 En baisse' 
        ELSE '➡️ Stable'
    END as trend
FROM emoji_stats 
WHERE total_count > 5
ORDER BY total_count DESC;
```

#### **4. Analyse des commentaires :**
```sql
-- Analyse des mots-clés dans les commentaires
SELECT 
    unnest(string_to_array(lower(comment), ' ')) as word,
    COUNT(*) as frequency
FROM public.moods 
WHERE comment IS NOT NULL 
    AND comment != ''
    AND char_length(comment) > 3
GROUP BY word
HAVING COUNT(*) > 2
ORDER BY frequency DESC
LIMIT 20;
```

### **🔧 Exercice pratique : Créez vos requêtes**

Créez des requêtes pour analyser :
1. **Les langages préférés** par catégorie d'humeur
2. **L'évolution des humeurs** dans la journée
3. **Les utilisateurs les plus actifs** (par session)

```sql
-- Votre requête 1 : Langages par catégorie
SELECT category, language, COUNT(*) as count
FROM public.moods 
WHERE category IS NOT NULL
GROUP BY category, language
ORDER BY category, count DESC;

-- Votre requête 2 : Évolution temporelle
-- (À compléter)

-- Votre requête 3 : Utilisateurs actifs  
-- (À compléter)
```

---

## ⚡ Étape 3 : Configuration du temps réel (10 min)

### **🔄 Architecture temps réel Supabase**

```
Client JavaScript
        ↕️ WebSocket Connection
Supabase Realtime Server
        ↕️ PostgreSQL Triggers
PostgreSQL Database
        ↕️ NOTIFY/LISTEN
Tous les clients connectés
```

### **⚙️ Configuration côté base de données**

#### **1. Activation du temps réel sur la table :**
```sql
-- Activer la réplication temps réel
ALTER TABLE public.moods REPLICA IDENTITY FULL;

-- Vérifier l'activation
SELECT schemaname, tablename, replication
FROM pg_tables 
WHERE tablename = 'moods';
```

#### **2. Configuration des triggers personnalisés :**
```sql
-- Fonction pour enrichir les données en temps réel
CREATE OR REPLACE FUNCTION enrich_mood_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Ajouter des métadonnées automatiques
    NEW.code_line = CASE NEW.language
        WHEN 'JavaScript' THEN 'const mood = "' || NEW.emoji || '"; // ' || COALESCE(NEW.comment, 'No comment')
        WHEN 'Python' THEN 'mood = "' || NEW.emoji || '"  # ' || COALESCE(NEW.comment, 'No comment')
        WHEN 'Java' THEN 'String mood = "' || NEW.emoji || '"; // ' || COALESCE(NEW.comment, 'No comment')
        ELSE NEW.language || ': mood = "' || NEW.emoji || '"'
    END;
    
    -- Générer une session unique si non fournie
    IF NEW.user_session IS NULL THEN
        NEW.user_session = 'session_' || extract(epoch from now())::bigint || '_' || (random() * 1000)::int;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attacher le trigger
CREATE TRIGGER mood_enrichment_trigger
    BEFORE INSERT ON public.moods
    FOR EACH ROW
    EXECUTE FUNCTION enrich_mood_data();
```

### **📡 Configuration côté client**

#### **Connexion WebSocket optimisée :**
```javascript
// Configuration avancée de la subscription
function setupAdvancedRealtime() {
    const channel = supabase
        .channel('moods_channel')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'moods'
        }, (payload) => {
            console.log('📡 Nouvelle humeur:', payload.new);
            handleNewMood(payload.new);
        })
        .on('postgres_changes', {
            event: 'UPDATE', 
            schema: 'public',
            table: 'moods'
        }, (payload) => {
            console.log('📝 Humeur modifiée:', payload.new);
            handleMoodUpdate(payload.new);
        })
        .subscribe((status) => {
            console.log('🔌 Statut connexion temps réel:', status);
            updateConnectionStatus(status);
        });
    
    return channel;
}

// Gestion des déconnexions et reconnexions
function handleConnectionStatus(status) {
    const statusIndicator = document.getElementById('connection-status');
    
    switch(status) {
        case 'SUBSCRIBED':
            statusIndicator.textContent = '🟢 Connecté';
            statusIndicator.className = 'status-connected';
            break;
        case 'CHANNEL_ERROR':
        case 'TIMED_OUT':
            statusIndicator.textContent = '🔴 Déconnecté';
            statusIndicator.className = 'status-error';
            // Tentative de reconnexion automatique
            setTimeout(() => {
                console.log('🔄 Tentative de reconnexion...');
                setupAdvancedRealtime();
            }, 5000);
            break;
        case 'CONNECTING':
            statusIndicator.textContent = '🟡 Connexion...';
            statusIndicator.className = 'status-connecting';
            break;
    }
}
```

### **🔧 Exercice pratique : Test du temps réel**

1. **Ouvrez plusieurs onglets** de votre application
2. **Ajoutez une humeur** dans un onglet
3. **Observez la synchronisation** dans les autres onglets
4. **Vérifiez les logs** dans la console (F12)

---

## 🔒 Étape 4 : Sécurité avec Row Level Security (10 min)

### **🛡️ Configuration RLS (Row Level Security)**

#### **1. Activation et politiques de base :**
```sql
-- Activer RLS sur la table
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique (tout le monde peut voir)
CREATE POLICY "Public read access" ON public.moods 
FOR SELECT USING (true);

-- Politique d'écriture publique (tout le monde peut ajouter)
CREATE POLICY "Public write access" ON public.moods 
FOR INSERT WITH CHECK (true);
```

#### **2. Politiques avancées pour un système avec authentification :**
```sql
-- Si vous ajoutez l'authentification plus tard
CREATE POLICY "Users can insert their own moods" ON public.moods
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can view all moods" ON public.moods
FOR SELECT USING (true);

-- Politique pour les administrateurs
CREATE POLICY "Admins can do everything" ON public.moods
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.uid() = id 
        AND raw_user_meta_data->>'role' = 'admin'
    )
);
```

### **🔍 Validation de la sécurité**

#### **Test des politiques :**
```sql
-- Vérifier les politiques actives
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'moods';

-- Tester l'accès avec différents utilisateurs
SET ROLE anon; -- Simuler un utilisateur anonyme
SELECT * FROM public.moods LIMIT 5;
RESET ROLE;
```

---

## ⚡ Étape 5 : Optimisation des performances (5 min)

### **📈 Analyse des performances**

#### **1. Analyse du plan d'exécution :**
```sql
-- Analyser une requête complexe
EXPLAIN ANALYZE
SELECT 
    language,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/3600) as avg_hours_ago
FROM public.moods 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY language
ORDER BY count DESC;
```

#### **2. Optimisations recommandées :**
```sql
-- Index partiel pour les requêtes récentes (plus efficace)
CREATE INDEX idx_moods_recent 
ON public.moods(created_at DESC, language) 
WHERE created_at >= NOW() - INTERVAL '7 days';

-- Index sur les expressions calculées
CREATE INDEX idx_moods_hour 
ON public.moods(EXTRACT(HOUR FROM created_at));

-- Statistiques pour l'optimiseur
ANALYZE public.moods;
```

### **💾 Stratégies de cache et archivage**

#### **1. Vue matérialisée pour les statistiques :**
```sql
-- Créer une vue matérialisée pour les stats populaires
CREATE MATERIALIZED VIEW mood_stats_hourly AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    language,
    COUNT(*) as mood_count,
    ARRAY_AGG(DISTINCT emoji ORDER BY emoji) as emojis_used
FROM public.moods 
GROUP BY DATE_TRUNC('hour', created_at), language;

-- Index sur la vue matérialisée
CREATE INDEX idx_mood_stats_hour ON mood_stats_hourly(hour DESC);

-- Rafraîchissement automatique (à configurer avec une fonction cron)
REFRESH MATERIALIZED VIEW mood_stats_hourly;
```

#### **2. Archivage des anciennes données :**
```sql
-- Table d'archive pour les données anciennes
CREATE TABLE public.moods_archive (LIKE public.moods INCLUDING ALL);

-- Fonction d'archivage (à exécuter périodiquement)
CREATE OR REPLACE FUNCTION archive_old_moods(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $
DECLARE
    archived_count INTEGER;
BEGIN
    -- Déplacer les anciennes données
    WITH moved_rows AS (
        DELETE FROM public.moods 
        WHERE created_at < NOW() - INTERVAL '1 day' * days_to_keep
        RETURNING *
    )
    INSERT INTO public.moods_archive 
    SELECT * FROM moved_rows;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    RETURN archived_count;
END;
$ LANGUAGE plpgsql;
```

---

## 📊 Exercices pratiques avancés

### **🎯 Exercice 1 : Dashboard de statistiques (15 min)**

Créez une vue complète des statistiques :

```sql
-- Vue dashboard complète
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    -- Statistiques générales
    (SELECT COUNT(*) FROM public.moods) as total_moods,
    (SELECT COUNT(DISTINCT user_session) FROM public.moods) as total_users,
    (SELECT COUNT(*) FROM public.moods WHERE created_at >= NOW() - INTERVAL '24 hours') as moods_today,
    
    -- Top langages
    (SELECT json_agg(json_build_object('language', language, 'count', count) ORDER BY count DESC)
     FROM (SELECT language, COUNT(*) as count FROM public.moods GROUP BY language LIMIT 5) t
    ) as top_languages,
    
    -- Émojis populaires
    (SELECT json_agg(json_build_object('emoji', emoji, 'count', count) ORDER BY count DESC)
     FROM (SELECT emoji, COUNT(*) as count FROM public.moods GROUP BY emoji LIMIT 10) t
    ) as popular_emojis,
    
    -- Activité par heure
    (SELECT json_agg(json_build_object('hour', hour, 'count', count) ORDER BY hour)
     FROM (
         SELECT EXTRACT(HOUR FROM created_at) as hour, COUNT(*) as count 
         FROM public.moods 
         WHERE created_at >= NOW() - INTERVAL '24 hours'
         GROUP BY EXTRACT(HOUR FROM created_at)
     ) t
    ) as hourly_activity;
```

### **🔄 Exercice 2 : Système de notifications (10 min)**

Implémentez des triggers pour des notifications automatiques :

```sql
-- Fonction pour détecter les pics d'activité
CREATE OR REPLACE FUNCTION detect_activity_spike()
RETURNS TRIGGER AS $
DECLARE
    recent_count INTEGER;
    avg_count NUMERIC;
BEGIN
    -- Compter l'activité récente (dernière heure)
    SELECT COUNT(*) INTO recent_count
    FROM public.moods 
    WHERE created_at >= NOW() - INTERVAL '1 hour';
    
    -- Moyenne sur les 24 dernières heures
    SELECT AVG(hourly_count) INTO avg_count
    FROM (
        SELECT COUNT(*) as hourly_count
        FROM public.moods 
        WHERE created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY DATE_TRUNC('hour', created_at)
    ) hourly_stats;
    
    -- Si activité > 2x la moyenne, déclencher une notification
    IF recent_count > avg_count * 2 THEN
        -- Ici vous pourriez appeler une fonction de notification
        RAISE NOTICE 'Pic d''activité détecté: % humeurs dans la dernière heure (moyenne: %)', 
                     recent_count, round(avg_count, 2);
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger pour détecter les pics
CREATE TRIGGER activity_spike_detector
    AFTER INSERT ON public.moods
    FOR EACH ROW
    EXECUTE FUNCTION detect_activity_spike();
```

### **📈 Exercice 3 : Requêtes analytiques (15 min)**

Créez des requêtes pour analyser les patterns d'usage :

```sql
-- 1. Corrélation entre emoji et langage
SELECT 
    emoji,
    language,
    COUNT(*) as occurrences,
    ROUND(
        COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER (PARTITION BY emoji) * 100, 
        2
    ) as percentage_for_emoji
FROM public.moods 
GROUP BY emoji, language
HAVING COUNT(*) > 2
ORDER BY emoji, occurrences DESC;

-- 2. Analyse des sessions utilisateur
WITH user_sessions AS (
    SELECT 
        user_session,
        COUNT(*) as mood_count,
        MIN(created_at) as first_mood,
        MAX(created_at) as last_mood,
        EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at)))/60 as session_duration_minutes
    FROM public.moods 
    WHERE user_session IS NOT NULL
    GROUP BY user_session
)
SELECT 
    CASE 
        WHEN mood_count = 1 THEN 'Utilisateur unique'
        WHEN mood_count BETWEEN 2 AND 5 THEN 'Utilisateur occasionnel'
        WHEN mood_count BETWEEN 6 AND 15 THEN 'Utilisateur régulier'
        ELSE 'Utilisateur très actif'
    END as user_type,
    COUNT(*) as user_count,
    AVG(mood_count) as avg_moods_per_user,
    AVG(session_duration_minutes) as avg_session_duration
FROM user_sessions
GROUP BY 1
ORDER BY avg_moods_per_user DESC;

-- 3. Tendances temporelles
SELECT 
    DATE_TRUNC('day', created_at) as day,
    COUNT(*) as daily_moods,
    COUNT(DISTINCT user_session) as daily_users,
    ROUND(COUNT(*)::NUMERIC / COUNT(DISTINCT user_session), 2) as moods_per_user,
    
    -- Comparaison avec le jour précédent
    LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', created_at)) as previous_day_moods,
    ROUND(
        (COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', created_at)))::NUMERIC / 
        NULLIF(LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', created_at)), 0) * 100,
        2
    ) as growth_percentage
FROM public.moods 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY day DESC;
```

---

## 🆘 Problèmes courants et solutions

### **❌ "Temps réel ne fonctionne pas"**
- Vérifiez que RLS est correctement configuré
- Assurez-vous que la table a `REPLICA IDENTITY FULL`
- Contrôlez les politiques de sécurité
- Vérifiez la connexion WebSocket dans les DevTools

### **❌ "Requêtes lentes"**
- Utilisez `EXPLAIN ANALYZE` pour diagnostiquer
- Ajoutez des index appropriés
- Considérez les vues matérialisées pour les agrégations
- Limitez les résultats avec `LIMIT`

### **❌ "Erreurs de permissions"**
- Vérifiez les politiques RLS
- Assurez-vous que l'utilisateur anon a les bonnes permissions
- Testez avec `SET ROLE anon` dans l'éditeur SQL

---

## 🎉 Récapitulatif

### **🏆 Compétences base de données acquises :**
- ✅ **Architecture Supabase** : Compréhension du stack complet
- ✅ **PostgreSQL avancé** : Requêtes, index, optimisation
- ✅ **Temps réel** : Configuration WebSocket et triggers
- ✅ **Sécurité RLS** : Politiques d'accès granulaires
- ✅ **Performance** : Analyse et optimisation des requêtes

### **🧠 Concepts avancés maîtrisés :**
- **ACID properties** : Transactions et cohérence des données
- **Real-time subscriptions** : Synchronisation automatique
- **Query optimization** : Plans d'exécution et index
- **Data modeling** : Conception de schéma efficace
- **Scalability patterns** : Archivage et partitioning

### **📊 Compétences analytiques :**
- Requêtes SQL complexes avec agrégations
- Analyse de tendances et patterns temporels
- Statistiques et métriques de performance
- Détection d'anomalies et alertes automatiques

---

## 🚀 Aller plus loin

### **🔬 Sujets avancés à explorer :**

1. **Partitioning** pour les gros volumes de données
2. **Full-text search** avec PostgreSQL
3. **Géolocalisation** avec PostGIS
4. **Machine Learning** avec PostgreSQL
5. **Backup et disaster recovery**

### **🛠️ Extensions Supabase utiles :**
- **Edge Functions** : Logique serveur personnalisée
- **Storage** : Gestion des fichiers et images
- **Auth** : Authentification complète
- **Realtime** : Fonctionnalités temps réel avancées

---

## 📚 Ressources pour approfondir

### **Documentation :**
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Référence complète
- [Supabase Database Guide](https://supabase.com/docs/guides/database) - Spécifique Supabase
- [SQL Performance Explained](https://use-the-index-luke.com/) - Optimisation SQL

### **Outils d'analyse :**
- [pgAdmin](https://www.pgadmin.org/) - Interface graphique PostgreSQL
- [Supabase Dashboard](https://app.supabase.com/) - Interface Supabase
- [DataGrip](https://www.jetbrains.com/datagrip/) - IDE base de données

### **Monitoring et performance :**
- [PostgreSQL EXPLAIN](https://explain.depesz.com/) - Visualiseur de plans d'exécution
- [Supabase Logs](https://supabase.com/docs/guides/platform/logs) - Logs et monitoring
- [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html) - Statistiques requêtes

*💡 Votre application dispose maintenant d'une base de données robuste, sécurisée et optimisée ! Vous maîtrisez les concepts essentiels pour gérer des données en temps réel à grande échelle.*
