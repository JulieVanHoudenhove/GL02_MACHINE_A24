const readline = require('readline');
const { rechercherQuestion } = require('./fonctions');

// Interface utilisateur
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Menu principal
function afficherMenu() {
    console.log("\n--- Menu Principal ---");
    console.log("1. Rechercher une question");
    console.log("2. Quitter");

    rl.question("\nChoisissez une option : ", (choix) => {
        switch (choix) {
            case '1':
                rechercherQuestion(rl, afficherMenu); // Appelle la fonction dans fonctions.js
                break;
            case '2':
                console.log("\nMerci d'avoir utilisé l'utilitaire. À bientôt !");
                rl.close();
                break;
            default:
                console.log("\nOption invalide. Veuillez choisir une option valide.");
                afficherMenu();
        }
    });
}

// Lancer le programme
afficherMenu();
