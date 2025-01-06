/**
 * @file main.js
 * @description Ce fichier constitue le point d'entrée principal de l'application. Il fournit une interface utilisateur en ligne
 *              de commande (CLI) pour effectuer diverses opérations liées aux examens, comme rechercher des questions, 
 *              créer des examens, simuler une passation ou dresser des profils.
 *
 * @dependencies
 *   - readline : Module Node.js pour gérer l'entrée et la sortie via la ligne de commande.
 *   - fs : Module Node.js pour manipuler les fichiers.
 *   - fonctions.js : Fichier contenant les fonctions principales utilisées pour les opérations sur les examens.
 *
 * @functions
 *   - afficherMenu() : Affiche le menu principal et gère la navigation entre les différentes options.
 *
 * @imports
 *   - rechercherQuestion : Fonction pour rechercher une question spécifique.
 *   - creerExamen : Fonction pour créer un examen.
 *   - identification : Fonction pour gérer l'identification d'un utilisateur.
 *   - simulerPassation : Fonction pour simuler la passation d'un examen.
 *   - comparerProfilExamen : Fonction pour comparer les profils d'examens.
 *   - dresserProfil : Fonction pour dresser le profil d'un examen.
 *
 * @usage
 *   - Lancer le fichier avec `node main.js` pour accéder au menu principal.
 *
 * @example
 *   - Choisissez une option en tapant son numéro et en appuyant sur Entrée.
 *
 * @note
 *   - Le fichier temporaire `temp_examen.json` est supprimé à chaque démarrage.
 *   - Les fichiers liés aux examens doivent être présents dans le dossier approprié pour certaines fonctionnalités.
 */


// Importation des modules nécessaires
const readline = require("readline"); // Module pour gérer les entrées/sorties en ligne de commande
const fs = require("fs"); // Module pour la gestion des fichiers


// Importation des fonctions principales depuis le fichier fonctions.js
const {
  rechercherQuestion,
  creerExamen,
  identification,
  simulerPassation,
  comparerProfilExamen,
  dresserProfil,
} = require("./fonctions");


// Supprimer le fichier temporaire au démarrage
// Cela garantit que le fichier temporaire créé lors de précédentes utilisations n'interfère pas avec le programme actuel
if (fs.existsSync("./temp_examen.json")) {
  fs.unlinkSync("./temp_examen.json");
}


// Création de l'interface utilisateur en ligne de commande
const rl = readline.createInterface({
  input: process.stdin, // Entrée standard (clavier)
  output: process.stdout, // Sortie standard (console)
});


// Fonction pour afficher le menu principal
/**
 * Affiche le menu principal et gère la navigation entre les différentes options.
 */
function afficherMenu() {
  console.log("\n--- Menu Principal ---"); // En-tête du menu
  console.log("1. Rechercher une question"); // Option 1
  console.log("2. Créer un examen"); // Option 2
  console.log("3. S'identifier"); // Option 3
  console.log("4. Simuler la passation d'un examen"); // Option 4
  console.log("5. Comparer le profil d'un examen"); // Option 5
  console.log("6. Dresser le profil d'un examen"); // Option 6
  console.log("7. Quitter"); // Option pour quitter le programme

  // Demander à l'utilisateur de choisir une option
  rl.question("\nChoisissez une option : ", (choix) => {
    // Gestion des choix utilisateurs à l'aide d'un switch
    switch (choix) {
      case "1":
        // Appelle la fonction pour rechercher une question
        rechercherQuestion(rl, afficherMenu);
        break;
      case "2":
        // Appelle la fonction pour créer un examen
        creerExamen(rl, afficherMenu);
        break;
      case "3":
        // Appelle la fonction pour gérer l'identification d'un utilisateur
        identification(rl, afficherMenu);
        break;
      case "4":
        // Appelle la fonction pour simuler la passation d'un examen
        simulerPassation(rl, afficherMenu);
        break;
      case "5":
        // Appelle la fonction pour comparer les profils d'examens
        comparerProfilExamen(rl, afficherMenu);
        break;
      case "6":
        // Appelle la fonction pour dresser le profil d'un examen
        dresserProfil(rl, afficherMenu);
        break;
      case "7":
        // Message de fin et fermeture de l'application
        console.log("\nMerci d'avoir utilisé l'utilitaire. À bientôt !");
        rl.close(); // Ferme l'interface utilisateur
        break;
      default:
        // Gestion des choix invalides
        console.log("\nOption invalide. Veuillez choisir une option valide.");
        afficherMenu(); // Réaffiche le menu
    }
  });
}


// Début du programme
// Affiche le menu principal lorsque le programme est lancé
afficherMenu();
