# Gestion de Tests pour le SRYEM

## Présentation du Projet

Le SRYEM (Sealand Republic Youth Education Ministry) s'engage dans une transformation numérique de la pédagogie de son principal établissement d'éducation secondaire. Dans ce cadre, ce projet vise à développer un utilitaire en invite de commande permettant aux enseignants de créer, gérer, et valider des tests d’évaluation au format GIFT.
Cet utilitaire offre une solution efficace pour la conception, la gestion et la simulation des examens en ligne à partir d'une banque de questions certifiée. En facilitant la création d’examens conformes aux standards éducatifs, ce projet contribue à moderniser les pratiques d'évaluation pédagogique.

## Objectifs

Le projet répond aux besoins exprimés par le SRYEM, dans le cadre de :
- **La transformation numérique :** Proposer des outils modernes adaptés aux nouveaux moyens d’évaluation informatique.
- **L’accompagnement des enseignants :** Faciliter l’adoption du format GIFT, un standard reconnu pour les évaluations en ligne.
- **L’amélioration de la gestion des examens :** Centraliser la création, la validation et la simulation des tests d'évaluation.

## Fonctionnalités Principales

### **1. Recherche de Questions**
- **Recherche par mot-clé :** Trouvez rapidement les questions contenant des termes spécifiques.
- **Recherche par type de question :** Filtrez les questions selon leur type (Choix Multiple, Vrai/Faux, etc.).
- **Affichage global :** Listez toutes les questions disponibles pour exploration.

### **2. Création d'Examens**
- **Sélection manuelle :** Choisissez les questions qui composeront l'examen.
- **Vérification automatique :**
  - Conformité au critère de 15-20 questions.
  - Détection et prévention des doublons.
- **Sauvegarde :** Exportez l'examen au format GIFT, prêt à être utilisé dans des plateformes éducatives.

### **3. Identification**
- **Création de fiches contact :** Collectez et enregistrez les informations des utilisateurs.
- **Génération de VCard :** Exportez les données au format standard `.vcf`.
- **Validation des données :** Assurez-vous que toutes les informations saisies sont correctes et complètes.

### **4. Simulation d'Examens**
- **Passation test :** Réalisez une simulation pour tester un examen.
- **Évaluation des réponses :** Fournissez des retours immédiats sur les bonnes et mauvaises réponses.
- **Calcul des scores :** Obtenez un score final pour évaluer les performances.

### **5. Comparaison de Profils d’Examens & Dresser le Profil d'un Examen**
- **Statistiques détaillées :** Analysez la répartition des types de questions dans l'examen.
- **Génération de graphiques :** Visualisez les données sous forme d'histogrammes clairs.
- **Comparaison :** Comparez les statistiques entre plusieurs examens pour identifier les écarts et tendances.

## Prérequis
Avant d'utiliser l'application, assurez-vous d'avoir installé :
- **Node.js** : [Télécharger Node.js](https://nodejs.org/).
- **npm** : Gestionnaire de paquets Node.js.

## Installation

Clonez le dépôt et installez les dépendances :
```bash
# Cloner le dépôt
git clone https://github.com/JulieVanHoudenhove/GL02_MACHINE_A24

# Accéder au répertoire
cd GL02_MACHINE_A24

# Installer les dépendances
npm install
```
Un répertoire `./examens` doit contenir un fichier GIFT qui est présent pour vous permettre de tester les fonctionnalités de l'application.

## Utilisation

Lancer l'application avec la commande :
```bash
node main.js
```

Une fois lancé, un menu interactif vous guidera à travers les différentes fonctionnalités. Il vous suffit d'indiquer le numéro de l'option que vous souhaitez utiliser.
```
--- Menu Principal ---
1. Rechercher une question
2. Créer un examen
3. S'identifier
4. Simuler la passation d'un examen
5. Comparer le profil d'un examen
6. Dresser le profil d'un examen
7. Quitter

Choisissez une option : 
```

## Structure des Fichiers

```bash
├── /examens             # Dossier contenant les examens créés
├── /node_modules        # Modules node nécessaires au fonctionnement du programme
├── /questions           # Questions pré-enregistrées pour les examens
├── .gitignore           # Fichier contenant les exceptions à ne pas commit sur le dépôt
├── contact.vcf          # Fichier VCard généré grâce au programme
├── fonctions.js         # Fonctions principales (création, recherche, etc.)
├── function.test.js     # Fichier contenant les tests unitaires
├── graphGenerator.js    # Générateur de graphiques
├── main.js              # Point d'entrée de l'application
├── package-lock.json    # Packages node
├── package.json         # Packages node
├── parser.js            # Parseur de fichiers GIFT
├── README.md            # Documentation
└── temp_examen.json     # Fichier temporaire créé lors de la création d'un examen via le programme
```

## Formats Pris en Charge

### Format GIFT
Les questions doivent suivre le format standard GIFT. Exemple :
```bash
::Titre de la question:: Quelle est la capitale de la France ? {
    =Paris
    ~Lyon
    ~Marseille
    ~Nice
}
```

### Format VCard
Les fiches contact sont générées au format VCard standard `(.vcf)`. Exemple :
```bash
BEGIN:VCARD
N:TORREILLES
FN:Théo TORREILLES
EMAIL:theo.torreilles@utt.fr
TEL:WORK:+33123456789
TEL:HOME:+33678901234
ADR:HOME:10 Rue des Fleurs;Paris;;75000;France
ORG:Université de Technologie de Troyes
ROOM:X007
END:VCARD
```

## Équipe du Projet

Ce projet a été conçu et développé par :
* Julie Van Houdenhove
* Théo Torreilles
* Lucie Guérin

Sur la base du travail initial disponible sur le [dépôt original](https://github.com/SAMY-EH/GL02_MACHINE_A24)

## Contribution

Pour contribuer au projet :
- Forkez le dépôt.
- Créez une branche pour votre fonctionnalité ou correctif.
- Soumettez une Pull Request avec une description claire des modifications.

Pour toute question, consultez la section [Issues](https://github.com).

## Licence

Ce projet n'est sous aucune licence. Toutefois, sans licence, les lois sur les droits d'auteur s'appliquent par défaut.

---

**Session :** GL02 Automne 2024 - Hackers
