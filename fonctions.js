const fs = require('fs');
const { chargerQuestions } = require('./parser');
const { generateGraph } = require('./graphGenerator'); // Supposons qu'il existe un module pour générer des graphiques

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



// Fonction pour simuler la passation d'un test
function simulerPassation(rl, callbackMenu) {
    // Charger les questions depuis le fichier GIFT
    const questions = chargerQuestions('./examen.gift');
    if (questions.length === 0) {
        // Message si aucun examen n'est trouvé
        console.log("\nAucun examen trouvé. Veuillez d'abord créer un examen.");
        callbackMenu();
        return;
    }

    let currentQuestionIndex = 0; // Index de la question actuelle
    let responses = []; // Liste pour stocker les réponses de l'utilisateur

    // Fonction pour poser une question
    function askQuestion() {
        if (currentQuestionIndex < questions.length) {
            const question = questions[currentQuestionIndex];
            // Afficher la question et son contenu
            console.log(`\nQuestion ${currentQuestionIndex + 1}: ${question.titre}`);
            console.log(question.contenu);

            // Demander une réponse à l'utilisateur
            rl.question("\nVotre réponse : ", (reponse) => {
                // Ajouter la réponse de l'utilisateur à la liste des réponses
                responses.push({ question, reponse });
                currentQuestionIndex++; // Passer à la question suivante
                askQuestion(); // Appeler la fonction pour la question suivante
            });
        } else {
            // Une fois toutes les questions posées, valider les réponses
            validateResponses();
        }
    }

    // Fonction pour valider les réponses de l'utilisateur
    function validateResponses() {
        // Filtrer les questions auxquelles l'utilisateur n'a pas répondu
        const unansweredQuestions = responses.filter(r => !r.reponse);
        if (unansweredQuestions.length > 0) {
            console.log("\nAttention, vous n'avez pas répondu à toutes les questions.");
            // Demander à l'utilisateur s'il souhaite confirmer ses réponses incomplètes
            rl.question("Voulez-vous confirmer vos réponses ? (oui/non) : ", (confirmation) => {
                if (confirmation.toLowerCase() === 'oui') {
                    // Si l'utilisateur confirme, générer les résultats
                    generateResults();
                } else {
                    // Sinon, reprendre à la première question sans réponse
                    currentQuestionIndex = responses.findIndex(r => !r.reponse);
                    askQuestion();
                }
            });
        } else {
            // Si toutes les questions ont une réponse, générer les résultats
            generateResults();
        }
    }

    // Fonction pour générer les résultats du test
    function generateResults() {
        let correctAnswers = 0; // Compteur de réponses correctes
        responses.forEach(({ question, reponse }) => {
            // Comparer la réponse de l'utilisateur avec la réponse correcte
            if (question.correctAnswer === reponse) {
                correctAnswers++;
            }
        });

        // Calculer le score final en pourcentage
        const score = (correctAnswers / questions.length) * 100;
        console.log("\n--- Bilan des réponses ---");
        console.log(`Bonnes réponses : ${correctAnswers}`);
        console.log(`Mauvaises réponses : ${questions.length - correctAnswers}`);
        console.log(`Score obtenu : ${score.toFixed(2)}%`);

        // Retourner au menu principal
        callbackMenu();
    }

    // Commencer le processus de passation du test
    askQuestion();
}

// Fonction pour comparer le profil d'un examen
function comparerProfilExamen(rl, callbackMenu) {
    // Charger la liste des examens
    const exams = chargerExams('./exams'); // Supposons que cette fonction charge tous les examens depuis un répertoire
    if (exams.length === 0) {
        console.log("\nAucun examen trouvé. Veuillez d'abord créer un examen.");
        callbackMenu(); // Retour au menu principal
        return;
    }

    console.log("\n--- Comparer le profil d'un examen ---");
    // Afficher tous les examens disponibles avec leur index
    exams.forEach((exam, index) => {
        console.log(`${index + 1}. ${exam.nom}`);
    });

    // Demander à l'utilisateur de choisir un examen à comparer
    rl.question("\nChoisissez un examen à comparer : ", (choixExamen) => {
        const examIndex = parseInt(choixExamen) - 1;
        // Vérifier si l'indice sélectionné est valide
        if (examIndex < 0 || examIndex >= exams.length) {
            console.log("Choix invalide.");
            return comparerProfilExamen(rl, callbackMenu); // Relancer la sélection en cas d'erreur
        }

        const selectedExam = exams[examIndex];
        console.log(`\nExamen sélectionné : ${selectedExam.nom}`);

        // Demander les chemins des fichiers GIFT de référence pour comparaison
        rl.question("Entrez les chemins des fichiers GIFT de référence (séparés par des virgules) : ", (fichiers) => {
            const fichiersPaths = fichiers.split(',').map(f => f.trim()); // Transformer les chemins en tableau
            const referenceQuestions = fichiersPaths.flatMap(path => chargerQuestions(path)); // Charger toutes les questions de référence

            // Analyser le profil des questions de l'examen sélectionné
            const examProfile = analyserProfil(selectedExam.questions);
            // Analyser le profil des questions de référence
            const referenceProfile = analyserProfil(referenceQuestions);

            // Comparer les deux profils
            const comparison = comparerProfils(examProfile, referenceProfile);
            console.log("\n--- Rapport de comparaison ---");
            console.log(comparison);

            // Générer un graphique pour visualiser la comparaison
            generateGraph(examProfile, referenceProfile);

            callbackMenu(); // Retour au menu principal après la comparaison
        });
    });
}

// Fonction pour analyser le profil des questions d'un examen ou d'une référence
function analyserProfil(questions) {
    const profile = {
        choixMultiples: 0, // Nombre de questions à choix multiples
        vraiFaux: 0,       // Nombre de questions vrai/faux
        correspondance: 0, // Nombre de questions de type correspondance
        // Ajouter d'autres types si nécessaire
    };

    // Parcourir chaque question pour compter les types
    questions.forEach(question => {
        if (question.type === 'choixMultiples') profile.choixMultiples++;
        else if (question.type === 'vraiFaux') profile.vraiFaux++;
        else if (question.type === 'correspondance') profile.correspondance++;
        // Ajouter d'autres types si nécessaire
    });

    return profile; // Retourner le profil des questions
}

// Fonction pour comparer deux profils d'examen
function comparerProfils(profil1, profil2) {
    const comparison = [];
    for (const type in profil1) {
        // Calculer la différence entre les deux profils pour chaque type de question
        const diff = profil1[type] - profil2[type];
        comparison.push(`L'examen contient ${diff} ${type} de plus que la référence.`);
    }
    return comparison.join('\n'); // Retourner la comparaison sous forme de chaîne de caractères
}


// Fonction principale pour l'identification
function identification(rl, callbackMenu) {
    const contact = {};  // Objet pour stocker les informations
    askNom(rl, contact, callbackMenu);  // Démarrer le processus avec la fonction 'askNom'
}

// Fonction pour demander le nom
function askNom(rl, contact, callbackMenu) {
    rl.question("Entrez votre nom : ", (nom) => {
        if (!nom) {
            console.log("Le nom ne peut pas être vide.");
            return askNom(rl, contact, callbackMenu);  // Redemander le nom uniquement
        }
        contact.nom = nom;
        askPrenom(rl, contact, callbackMenu);  // Passer à la prochaine question
    });
}

// Fonction pour demander le prénom
function askPrenom(rl, contact, callbackMenu) {
    rl.question("Entrez votre prénom : ", (prenom) => {
        if (!prenom) {
            console.log("Le prénom ne peut pas être vide.");
            return askPrenom(rl, contact, callbackMenu);  // Redemander le prénom uniquement
        }
        contact.prenom = prenom;
        askEmail(rl, contact, callbackMenu);  // Passer à la prochaine question
    });
}

// Fonction pour demander l'email
function askEmail(rl, contact, callbackMenu) {
    rl.question("Entrez votre email : ", (email) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
            console.log("L'email fourni n'est pas valide.");
            return askEmail(rl, contact, callbackMenu);  // Redemander l'email uniquement
        }
        contact.email = email;
        askTelephonePro(rl, contact, callbackMenu);  // Passer à la prochaine question
    });
}

// Fonction pour demander le téléphone professionnel
function askTelephonePro(rl, contact, callbackMenu) {
    rl.question("Entrez votre téléphone professionnel sous format +33 : ", (telephonePro) => {
        // Regex pour vérifier que le numéro commence par +33 suivi de 9 chiffres
        const telRegex = /^\+33[0-9]{9}$/;
        if (!telRegex.test(telephonePro)) {
            console.log("Le numéro de téléphone professionnel est invalide. Il doit commencer par +33 et être suivi de 9 chiffres.");
            return askTelephonePro(rl, contact, callbackMenu);  // Redemander le téléphone pro uniquement
        }
        contact.telephonePro = telephonePro;
        askTelephonePerso(rl, contact, callbackMenu);  // Passer à la prochaine question
    });
}

// Fonction pour demander le téléphone personnel
function askTelephonePerso(rl, contact, callbackMenu) {
    rl.question("Entrez votre téléphone personnel : ", (telephonePerso) => {
        // Regex pour accepter les numéros commençant par +33 ou un numéro local à 10 chiffres (ex : 06XXXXXXXX)
        const telRegex = /^(?:\+33[0-9]{9}|0[1-9][0-9]{8})$/;
        if (!telRegex.test(telephonePerso)) {
            console.log("Le numéro de téléphone personnel est invalide. Il doit commencer par +33 suivi de 9 chiffres ou un numéro local valide.");
            return askTelephonePerso(rl, contact, callbackMenu);  // Redemander le téléphone perso uniquement
        }
        contact.telephonePerso = telephonePerso;
        askAdressePerso(rl, contact, callbackMenu);  // Passer à la prochaine question
    });
}


// Fonction pour demander l'adresse personnelle
function askAdressePerso(rl, contact, callbackMenu) {
    rl.question("Entrez votre adresse personnelle (format : rue;code postal;ville;pays) : ", (adressePerso) => {
        const adresseRegex = /^[^;]+;[^;]+;[^;]+;[^;]+$/;
        if (!adresseRegex.test(adressePerso)) {
            console.log("L'adresse fournie n'est pas valide. Le format attendu est : rue;code postal;ville;pays");
            return askAdressePerso(rl, contact, callbackMenu);  // Redemander l'adresse uniquement
        }
        contact.adressePerso = adressePerso;
        askLieuTravail(rl, contact, callbackMenu);  // Passer à la prochaine question
    });
}

// Fonction pour demander le lieu de travail
function askLieuTravail(rl, contact, callbackMenu) {
    rl.question("Entrez le lieu de travail : ", (lieuTravail) => {
        if (!lieuTravail) {
            console.log("Le lieu de travail ne peut pas être vide.");
            return askLieuTravail(rl, contact, callbackMenu);  // Redemander le lieu de travail uniquement
        }
        contact.lieuTravail = lieuTravail;
        askBureau(rl, contact, callbackMenu);  // Passer à la prochaine question
    });
}

// Fonction pour demander le bureau
function askBureau(rl, contact, callbackMenu) {
    rl.question("Entrez votre numéro de bureau : ", (bureau) => {
        if (!bureau) {
            console.log("Le numéro de bureau ne peut pas être vide.");
            return askBureau(rl, contact, callbackMenu);  // Redemander le bureau uniquement
        }
        contact.bureau = bureau;
        generateVCard(rl, contact, callbackMenu);  // Passer à la génération de la VCard
    });
}

// Fonction pour générer la VCard
function generateVCard(rl, contact, callbackMenu) {
    // Générer le contenu de la VCard
    const vcardContent = generateVCardContent(contact);

    // Demander où sauvegarder le fichier VCard
    rl.question("Entrez le chemin où sauvegarder la fiche contact (ex : ./contact.vcf) : ", (cheminFichier) => {
        try {
            // Sauvegarder la VCard dans un fichier
            fs.writeFileSync(cheminFichier, vcardContent);
            console.log("La fiche contact a été générée avec succès.");
        } catch (error) {
            console.error("Erreur lors de la sauvegarde du fichier : ", error.message);
        }

        // Retour au menu principal
        callbackMenu();
    });
}

// Fonction pour générer le contenu de la VCard (à adapter selon les besoins)
function generateVCardContent(contact) {
    return `BEGIN:VCARD
NOM ${contact.nom}
PRENOM ${contact.prenom}
FN:${contact.prenom} ${contact.nom}
EMAIL:${contact.email}
TEL;WORK:${contact.telephonePro}
TEL;HOME:${contact.telephonePerso}
ADR;HOME:${contact.adressePerso}
ORG:${contact.lieuTravail}
TEL;WORK:${contact.bureau}
END:VCARD`;
}

module.exports = {
    comparerProfilExamen,
    simulerPassation,
    identification,
    rechercherQuestion,
    creerExamen
};

