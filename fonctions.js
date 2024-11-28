const { chargerQuestions } = require('./parser');

// Fonction pour rechercher des questions
function rechercherQuestion(rl, callbackMenu) {
    const questions = chargerQuestions('./questions.gift');
    console.log(questions.map(q => ({ titre: q.titre, type: q.type })));

    console.log("\n--- Recherche de questions ---");

    console.log("\nChoisissez un critère de recherche :");
    console.log("1. Mot-clé (par exemple : 'Mathématiques')");
    console.log("2. Type de question (Choix Multiple, Vrai/Faux, Mot Manquant, Numérique, Question Ouverte)");
    console.log("3. Afficher toutes les questions");

    rl.question("\nEntrez le numéro de votre choix : ", (choixCritere) => {
        switch (choixCritere) {
            case '1':
                // Recherche par mot-clé
                rl.question("Entrez un mot-clé pour rechercher : ", (motCle) => {
                    motCle = motCle.trim().toLowerCase(); // Nettoyer le mot-clé et le convertir en minuscule
                    const resultats = questions.filter(q => q.enonce.toLowerCase().includes(motCle));
                    afficherResultats(resultats, rl, callbackMenu);
                });
                break;
            case '2':
                // Recherche par type de question
                rl.question("Entrez un type de question (Choix Multiple, Vrai/Faux, Mot Manquant, Numérique, Question Ouverte) : ", (type) => {
                    type = type.trim().toLowerCase(); // Nettoyer le type et le convertir en minuscule
                    const resultats = questions.filter(q => q.type.toLowerCase() === type);
                    afficherResultats(resultats, rl, callbackMenu);
                });
                break;
            case '3':
                // Afficher toutes les questions
                afficherResultats(questions, rl, callbackMenu);
                break;
            default:
                console.log("\nOption invalide. Retour au menu principal.");
                callbackMenu();
        }
    });
}

// Fonction pour afficher les résultats de recherche
function afficherResultats(resultats, rl, callbackMenu) {
    if (resultats.length > 0) {
        console.log("\n--- Résultats ---");
        resultats.forEach((q, index) => {
            console.log(`${index + 1}. ${q.titre} (Type : ${q.type})`);
        });

        rl.question("\nEntrez le numéro pour voir les détails ou 'exit' pour revenir : ", (choix) => {
            if (choix.toLowerCase() === 'exit') {
                callbackMenu();
            } else {
                const index = parseInt(choix) - 1;
                if (index >= 0 && index < resultats.length) {
                    console.log("\n--- Détails de la question ---");
                    console.log(resultats[index].contenu);
                } else {
                    console.log("\nOption invalide.");
                }
                callbackMenu();
            }
        });
    } else {
        console.log("\nAucune question ne correspond aux critères.");
        callbackMenu();
    }
}

module.exports = { rechercherQuestion };
