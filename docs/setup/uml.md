# 📊 Documentation UML - Brise-glace Interactif pour Cours de Programmation

## 🎯 Vue d'ensemble du Projet

**Emoji Code Mood** est un brise-glace interactif conçu pour les cours de programmation. Il permet aux étudiants d'exprimer leur humeur du jour via du code personnalisé tout en découvrant différents langages de programmation et domaines technologiques.

---

## 1️⃣ Diagramme de Cas d'Utilisation - Fonctionnel

```mermaid
@startuml
!theme cerulean-outline

left to right direction

actor "👨‍🎓 Étudiant" as Student
actor "👩‍🏫 Enseignant" as Teacher
actor "🖥️ Système" as System

package "Gestion des Humeurs" {
  usecase "Saisir prénom" as UC1
  usecase "Sélectionner humeur" as UC2
  usecase "Choisir langage" as UC3
  usecase "Définir intérêt" as UC4
  usecase "Ajouter commentaire" as UC5
  usecase "Générer code" as UC6
  usecase "Visualiser feed" as UC7
}

package "Administration" {
  usecase "Consulter tableau de bord" as UC8
  usecase "Analyser statistiques" as UC9
  usecase "Exporter données" as UC10
  usecase "Modérer contenu" as UC11
  usecase "Réinitialiser session" as UC12
}

package "Traitement Automatique" {
  usecase "Valider données" as UC13
  usecase "Sauvegarder réponses" as UC14
  usecase "Synchroniser temps réel" as UC15
  usecase "Calculer statistiques" as UC16
}

Student --> UC1
Student --> UC2
Student --> UC3
Student --> UC4
Student --> UC5
Student --> UC6
Student --> UC7

Teacher --> UC8
Teacher --> UC9
Teacher --> UC10
Teacher --> UC11
Teacher --> UC12

System --> UC13
System --> UC14
System --> UC15
System --> UC16

UC1 ..> UC6 : <<include>>
UC2 ..> UC6 : <<include>>
UC3 ..> UC6 : <<include>>
UC6 ..> UC14 : <<include>>
UC14 ..> UC15 : <<include>>
UC15 ..> UC16 : <<include>>

@enduml
```

---

## 2️⃣ Diagramme de Cas d'Utilisation - Technique

```mermaid
@startuml
!theme cerulean-outline

left to right direction

actor "🌐 Navigateur" as Browser
actor "⚙️ Serveur API" as Server
actor "🗄️ Base de Données" as Database
actor "☁️ CDN" as CDN

package "Frontend - Interface Client" {
  usecase "Charger interface HTML5" as TC1
  usecase "Initialiser composants CSS" as TC2
  usecase "Gérer événements DOM" as TC3
  usecase "Valider formulaires" as TC4
  usecase "Animer transitions" as TC5
  usecase "Gérer responsive design" as TC6
}

package "Backend - Logique Serveur" {
  usecase "Authentifier connexions" as TC7
  usecase "Valider données serveur" as TC8
  usecase "Exécuter requêtes SQL" as TC9
  usecase "Gérer transactions" as TC10
  usecase "Maintenir WebSocket" as TC11
  usecase "Optimiser performances" as TC12
}

package "Infrastructure - Déploiement" {
  usecase "Builder application" as TC13
  usecase "Minifier assets" as TC14
  usecase "Déployer sur CDN" as TC15
  usecase "Servir fichiers statiques" as TC16
  usecase "Gérer cache navigateur" as TC17
  usecase "Monitorer disponibilité" as TC18
}

package "Persistance - Données" {
  usecase "Créer schéma PostgreSQL" as TC19
  usecase "Indexer requêtes" as TC20
  usecase "Backup automatique" as TC21
  usecase "Nettoyer données expirées" as TC22
  usecase "Chiffrer données sensibles" as TC23
  usecase "Auditer accès" as TC24
}

Browser --> TC1
Browser --> TC2
Browser --> TC3
Browser --> TC4
Browser --> TC5
Browser --> TC6

Server --> TC7
Server --> TC8
Server --> TC9
Server --> TC10
Server --> TC11
Server --> TC12

CDN --> TC13
CDN --> TC14
CDN --> TC15
CDN --> TC16
CDN --> TC17
CDN --> TC18

Database --> TC19
Database --> TC20
Database --> TC21
Database --> TC22
Database --> TC23
Database --> TC24

TC3 ..> TC8 : <<include>>
TC8 ..> TC9 : <<include>>
TC9 ..> TC11 : <<include>>
TC13 ..> TC15 : <<include>>

@enduml
```

---

## 3️⃣ Diagramme de Composants

```mermaid
@startuml
!theme cerulean-outline

package "Couche Présentation" {
  [📱 Interface Utilisateur] as UI
  [📝 Composant Formulaire] as Form
  [📊 Feed Temps Réel] as Feed
  [📈 Tableau de Bord] as Dashboard
  [💻 Générateur Code] as CodeDisplay
  [🔧 Composants Modaux] as Modal
}

package "Couche Logique Métier" {
  [🎯 Contrôleur Application] as AppController
  [✅ Service Validation] as Validator
  [⚙️ Moteur Génération Code] as CodeEngine
  [📊 Service Statistiques] as StatService
  [🔄 Gestionnaire Événements] as EventManager
  [🛡️ Service Sécurité] as SecurityService
}

package "Couche Accès Données" {
  [💾 Gestionnaire Stockage] as StorageManager
  [🌐 Client API REST] as ApiClient
  [⚡ Gestionnaire Cache] as CacheManager
  [🔄 Service Synchronisation] as SyncService
  [📡 Client WebSocket] as WebSocketClient
}

package "Services Externes" {
  [🗃️ Supabase Database] as Supabase
  [🐙 GitHub Pages] as GitHubPages
  [🔌 Serveur WebSocket] as WSServer
  [📊 Service Analytics] as Analytics
}

package "Utilitaires Transversaux" {
  [🔧 Fonctions Utilitaires] as Utils
  [📅 Helper Dates] as DateHelper
  [📝 Service Formatage] as Formatter
  [📋 Service Logging] as Logger
  [🔒 Helper Cryptographie] as CryptoHelper
}

' Relations Présentation
UI --> Form
UI --> Feed
UI --> Dashboard
UI --> Modal
Form --> CodeDisplay

' Relations Logique Métier
Form --> AppController
Feed --> AppController
Dashboard --> AppController

AppController --> Validator
AppController --> CodeEngine
AppController --> StatService
AppController --> EventManager
AppController --> SecurityService

' Relations Données
AppController --> StorageManager
AppController --> ApiClient
AppController --> CacheManager

ApiClient --> SyncService
SyncService --> WebSocketClient
StorageManager --> CacheManager

' Relations Services Externes
ApiClient --> Supabase
WebSocketClient --> WSServer
GitHubPages --> UI
StatService --> Analytics

' Relations Utilitaires
Validator --> Utils
CodeEngine --> Formatter
StatService --> DateHelper
EventManager --> Logger
SecurityService --> CryptoHelper

' Interfaces
interface "IValidator" as IVal
interface "ICodeGenerator" as ICodeGen
interface "IStorage" as IStorage
interface "IApiClient" as IApi

Validator .up.|> IVal
CodeEngine .up.|> ICodeGen
StorageManager .up.|> IStorage
ApiClient .up.|> IApi

@enduml
```

---

## 4️⃣ Diagramme de Séquence - Scénario Principal

```mermaid
@startuml
!theme cerulean-outline

participant "👨‍🎓 Étudiant" as Student
participant "📱 Interface Web" as UI
participant "🎯 Contrôleur App" as Controller
participant "✅ Validateur" as Validator
participant "💻 Générateur Code" as CodeGen
participant "🌐 Client API" as ApiClient
participant "🗄️ Base Supabase" as Database
participant "🔌 WebSocket" as WebSocket
participant "📊 Service Stats" as StatsService

== Phase Initialisation ==

Student -> UI : Accède à l'application
activate UI

UI -> Controller : initializeApp()
activate Controller

Controller -> ApiClient : loadRecentEntries()
activate ApiClient

ApiClient -> Database : SELECT * FROM moods\nORDER BY created_at DESC\nLIMIT 10
activate Database
Database --> ApiClient : List<MoodEntry>
deactivate Database

ApiClient --> Controller : recentEntries
deactivate ApiClient

Controller -> StatsService : calculateStats(recentEntries)
activate StatsService
StatsService --> Controller : Statistics
deactivate StatsService

Controller --> UI : displayInitialData(entries, stats)
UI --> Student : Page chargée avec données
deactivate Controller

== Phase Saisie Utilisateur ==

Student -> UI : Saisit informations personnelles
Student -> UI : Sélectionne emoji humeur
Student -> UI : Choisit langage programmation
Student -> UI : Définit domaine d'intérêt
Student -> UI : Ajoute commentaire (optionnel)
Student -> UI : Clique "Partager humeur"

== Phase Validation et Traitement ==

UI -> Controller : submitMoodEntry(formData)
activate Controller

Controller -> Validator : validateMoodData(formData)
activate Validator

alt Données invalides
    Validator --> Controller : ValidationError
    Controller --> UI : displayValidationErrors()
    UI --> Student : "Veuillez corriger les erreurs"
else Données valides
    Validator --> Controller : ValidationSuccess
    deactivate Validator
    
    == Phase Génération Code ==
    
    Controller -> CodeGen : generateCode(formData)
    activate CodeGen
    
    CodeGen -> CodeGen : selectTemplate(language)
    CodeGen -> CodeGen : injectUserData(template, data)
    CodeGen --> Controller : generatedCode
    deactivate CodeGen
    
    Controller --> UI : displayGeneratedCode(code)
    UI --> Student : Affiche code personnalisé
    
    == Phase Sauvegarde ==
    
    Controller -> ApiClient : saveMoodEntry(moodEntry)
    activate ApiClient
    
    ApiClient -> Database : INSERT INTO moods\n(name, mood, language, interest, comment, created_at)\nVALUES (?, ?, ?, ?, ?, NOW())
    activate Database
    Database --> ApiClient : insertedId
    deactivate Database
    
    ApiClient --> Controller : saveSuccess(entryId)
    deactivate ApiClient
    
    == Phase Notification Temps Réel ==
    
    Database -> WebSocket : triggerRealtimeNotification(newEntry)
    activate WebSocket
    
    par Notification broadcast
        WebSocket -> UI : broadcastNewEntry(entry)
        UI -> UI : updateFeedDisplay()
        UI -> StatsService : updateStatistics()
        activate StatsService
        StatsService --> UI : updatedStats
        deactivate StatsService
        UI --> Student : Affichage mis à jour temps réel
    and Confirmation locale
        Controller --> UI : showSuccessMessage()
        UI -> UI : resetForm()
        UI --> Student : "Humeur partagée avec succès! 🎉"
    end
    
    deactivate WebSocket
end

deactivate Controller
deactivate UI

== Gestion d'Erreurs ==

opt Erreur réseau
    ApiClient -X Database : Échec connexion
    ApiClient --> Controller : NetworkError
    Controller --> UI : enableOfflineMode()
    UI --> Student : "Mode hors ligne activé"
end

opt Erreur serveur
    Database -X ApiClient : Erreur SQL
    ApiClient --> Controller : ServerError
    Controller --> UI : displayErrorMessage()
    UI --> Student : "Erreur temporaire, veuillez réessayer"
end

@enduml
```

---

## 📚 Annexes

### **Technologies Utilisées**
- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Backend** : Supabase (PostgreSQL + API REST)
- **Déploiement** : GitHub Pages + GitHub Actions
- **Temps Réel** : WebSocket natif

### **Patterns Architecturaux**
- **MVC** : Séparation Modèle-Vue-Contrôleur
- **Observer** : Notifications temps réel
- **Strategy** : Génération de code selon langage
- **Repository** : Abstraction accès données

### **Principes de Conception**
- **Single Responsibility** : Chaque composant a une responsabilité unique
- **Open/Closed** : Extension sans modification
- **Dependency Injection** : Faible couplage entre composants
- **Interface Segregation** : Interfaces spécialisées

### **Métriques Qualité**
- **Couverture de tests** : > 80%
- **Performance** : < 2s temps de chargement
- **Accessibilité** : WCAG 2.1 AA
- **Sécurité** : Validation côté client et serveur

---

**📝 Document généré le :** `2025-09-15`  
**🔄 Version :** `1.0`  
**👨‍💻 Auteur :** Assistant IA  
**🎯 Contexte :** Formation développement web
