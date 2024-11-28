const fs = require('fs');
const { chargerQuestions } = require('./parser');

let questionsSelectionnees = []; // Stock temporaire des questions sélectionnées

// Fonction pour rechercher des questions
function rechercherQuestion(rl, callbackMenu) {
    const questions = chargerQuestions('./questions.gift');

    console.log("\n--- Recherche de questions ---");
    console.log("1. Mot-clé (par exemple : 'Mathématiques')");
    console.log("2. Type de question (Choix Multiple, Vrai/Faux, Correspondance, Mot Manquant, Numérique, Question Ouverte)");
    console.log("3. Afficher toutes les questions");

    rl.question("\nEntrez le numéro de votre choix : ", (choixCritere) => {
        switch (choixCritere) {
            case '1':
                rl.question("Entrez un mot-clé pour rechercher : ", (motCle) => {
                    const resultats = questions.filter(q => q.enonce.toLowerCase().includes(motCle.toLowerCase()));
                    afficherResultats(resultats, rl, callbackMenu);
                });
                break;
            case '2':
                rl.question("Entrez un type de question : ", (type) => {
                    const resultats = questions.filter(q => q.type.toLowerCase() === type.toLowerCase());
                    afficherResultats(resultats, rl, callbackMenu);
                });
                break;
            case '3':
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
        resultats.forEach((q, index) => {
            console.log(`${index + 1}. ${q.titre} (Type : ${q.type})`);
        });

        rl.question("\nEntrez le numéro pour voir les détails ou 'exit' pour revenir : ", (choix) => {
            if (choix.toLowerCase() === 'exit') {
                callbackMenu();
            } else {
                const index = parseInt(choix) - 1;
                if (index >= 0 && index < resultats.length) {
                    const question = resultats[index];
                    console.log("\n--- Détails de la question ---");
                    console.log(question.contenu);

                    rl.question("\nVoulez-vous ajouter cette question à l'examen ? (oui/non) : ", (reponse) => {
                        if (reponse.toLowerCase() === 'oui') {
                            questionsSelectionnees.push(question);
                            fs.writeFileSync('./temp_examen.json', JSON.stringify(questionsSelectionnees, null, 2));
                            console.log("\nQuestion ajoutée à l'examen !");
                        }
                        callbackMenu();
                    });
                } else {
                    console.log("\nOption invalide.");
                    callbackMenu();
                }
            }
        });
    } else {
        console.log("\nAucune question ne correspond aux critères.");
        callbackMenu();
    }
}

// Fonction pour créer un examen
function creerExamen(rl, callbackMenu) {
    // Charger les questions sélectionnées depuis le fichier temporaire
    if (fs.existsSync('./temp_examen.json')) {
        questionsSelectionnees = JSON.parse(fs.readFileSync('./temp_examen.json', 'utf8'));
    } else {
        console.log("\nAucune question n'a été ajoutée à l'examen. Veuillez d'abord ajouter des questions.");
        callbackMenu();
        return;
    }

    // Vérification de l'examen
    verifierExamen(rl, callbackMenu);
}

// Fonction pour vérifier l'examen et proposer des corrections
function verifierExamen(rl, callbackMenu) {
    if (questionsSelectionnees.length < 15 || questionsSelectionnees.length > 20) {
        console.log(`\nVotre examen doit contenir entre 15 et 20 questions. Actuellement : ${questionsSelectionnees.length}`);
        modifierQuestions(rl, callbackMenu);
        return;
    }

    // Vérifier les doublons
    const titres = new Set();
    for (const question of questionsSelectionnees) {
        if (titres.has(question.titre)) {
            console.log(`\nDoublon détecté : ${question.titre}`);
            modifierQuestions(rl, callbackMenu);
            return;
        }
        titres.add(question.titre);
    }

    // Demander le nom du fichier GIFT
    rl.question("\nEntrez le nom du fichier GIFT (sans extension) : ", (nomFichier) => {
        if (!nomFichier.trim()) { // Vérifier si le nom est vide
            console.log("\nLe nom du fichier ne peut pas être vide. Veuillez entrer un nom valide.");
            return verifierExamen(rl, callbackMenu); // Redemander le nom du fichier
        }

        const cheminComplet = `./${nomFichier}.gift`;

        // Vérifier si le fichier existe déjà
        if (fs.existsSync(cheminComplet)) {
            rl.question(`\nLe fichier '${cheminComplet}' existe déjà. Voulez-vous l'écraser ? (oui/non) : `, (reponse) => {
                if (reponse.toLowerCase() === 'oui') {
                    sauvegarderExamen(cheminComplet, callbackMenu);
                } else {
                    console.log("\nCréation annulée. Vous pouvez choisir un autre nom.");
                    callbackMenu();
                }
            });
        } else {
            sauvegarderExamen(cheminComplet, callbackMenu);
        }
    });
}

// Fonction pour sauvegarder l'examen GIFT
function sauvegarderExamen(cheminComplet, callbackMenu) {
    try {
        // Générer le fichier GIFT
        const giftData = questionsSelectionnees.map(q => q.contenu).join('\n\n');
        fs.writeFileSync(cheminComplet, giftData);
        console.log(`\nExamen GIFT créé avec succès : ${cheminComplet}`);

        // Supprimer le fichier temporaire après la création
        fs.unlinkSync('./temp_examen.json');
        console.log("\nFichier temporaire supprimé. Vous pouvez créer un nouvel examen.");
    } catch (error) {
        console.error(`\nErreur lors de la sauvegarde du fichier : ${error.message}`);
    }
    callbackMenu();
}

// Fonction pour permettre la modification des questions
function modifierQuestions(rl, callbackMenu) {
    console.log("\n--- Modification des questions ---");
    console.log("1. Supprimer une question");
    console.log("2. Ajouter une question");
    console.log("3. Retourner à la vérification");
    console.log("4. Quitter (annuler la création de l'examen)");

    rl.question("\nChoisissez une option : ", (choix) => {
        switch (choix) {
            case '1':
                supprimerQuestion(rl, callbackMenu);
                break;
            case '2':
                rechercherQuestion(rl, callbackMenu); // Permet d'ajouter une question
                break;
            case '3':
                verifierExamen(rl, callbackMenu); // Recommence la vérification
                break;
            case '4':
                console.log("\nCréation de l'examen annulée.");
                callbackMenu();
                break;
            default:
                console.log("\nOption invalide.");
                modifierQuestions(rl, callbackMenu);
        }
    });
}

// Fonction pour supprimer une question de l'examen
function supprimerQuestion(rl, callbackMenu) {
    questionsSelectionnees.forEach((q, index) => {
        console.log(`${index + 1}. ${q.titre}`);
    });

    rl.question("\nEntrez le numéro de la question à supprimer : ", (choix) => {
        const index = parseInt(choix) - 1;
        if (index >= 0 && index < questionsSelectionnees.length) {
            console.log(`\nQuestion supprimée : ${questionsSelectionnees[index].titre}`);
            questionsSelectionnees.splice(index, 1);
            fs.writeFileSync('./temp_examen.json', JSON.stringify(questionsSelectionnees, null, 2));
        } else {
            console.log("\nOption invalide.");
        }
        verifierExamen(rl, callbackMenu); // Recommence la vérification après modification
    });
}

module.exports = { rechercherQuestion, creerExamen };

