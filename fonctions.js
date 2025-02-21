/**
 * @file fonctions.js
 * @description Fichier contenant les fonctions pour les différentes fonctionnalités du programme
 * 
 * @dependencies
 *  - fs : pour la gestion des fichiers
 *  - path : pour la gestion des chemins de fichiers  
 *  - parser.js : pour les fonctions de chargement et de traitement des questions
 *  - graphGenerator.js : pour la génération de graphiques
 * 
 * @functions
 * - rechercherQuestion : fonction pour rechercher des questions
 * - afficherResultats : fonction pour afficher les résultats de recherche
 * - creerExamen : fonction pour créer un examen
 * - verifierExamen : fonction pour vérifier l'examen et proposer des corrections
 * - sauvegarderExamen : fonction pour sauvegarder l'examen GIFT
 * - modifierQuestions : fonction pour permettre la modification des questions
 * - supprimerQuestion : fonction pour supprimer une question de l'examen
 * - simulerPassation : fonction pour simuler la passation d'un test
 * - comparerProfilExamen : fonction pour comparer le profil d'un examen
 * - chargerExam : fonction pour charger les examens depuis un dossier
 * - analyserProfil : fonction pour analyser le profil des questions d'un examen ou d'une référence
 * - comparerProfils : fonction pour comparer deux profils d'examen
 * - identification : fonction principale pour l'identification
 * - askNom : fonction pour demander le nom
 * - askPrenom : fonction pour demander le prénom
 * - askEmail : fonction pour demander l'email
 * - askTelephonePro : fonction pour demander le téléphone professionnel
 * - askTelephonePerso : fonction pour demander le téléphone personnel
 * - askAdressePerso : fonction pour demander l'adresse personnelle
 * - askLieuTravail : fonction pour demander le lieu de travail
 * - askBureau : fonction pour demander le numéro de bureau
 * - generateVCard : fonction pour générer la VCard
 * - askForValidPath : fonction récursive pour demander un chemin valide
 * - dresserProfil : fonction pour analyser le profil d'un examen
 * - afficherQuestion : fonction pour afficher une question selon son type
 * - validerReponse : fonction pour valider la réponse en fonction du type de question
 * - getBonneReponse : fonction pour afficher la bonne réponse
 * - askQuestion : fonction pour poser une question
 * - chargerDossier : fonction pour charger un dossier de questions
 * - nettoyerCorrespondances : fonction pour nettoyer les correspondances
 * - comparerCorrespondances : fonction pour comparer les correspondances
 * - generateVCardContent : fonction pour générer le contenu de la VCard
 * 
 * @note
 * - Ce fichier contient les fonctions pour les différentes fonctionnalités du programme
 * - Les fonctions sont exportées pour être utilisées dans le fichier principal (main.js)
 * - Les fonctions sont organisées par fonctionnalité
 * - Les fonctions sont commentées pour expliquer leur rôle et leur utilisation
 */


// Importation des modules
const fs = require("fs");
const { chargerDossier, chargerQuestions} = require("./parser");
const { generateGraph } = require("./graphGenerator");
const {join, basename} = require("path");


// Stockage temporaires des questions sélectionnées
let questionsSelectionnees = [];


// Fonction pour rechercher des questions
/**
 * Fonction pour rechercher des questions 
 * @param {*} rl - Interface de ligne de commande
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function rechercherQuestion(rl, callbackMenu) {
  const questions = chargerDossier("./questions");

  console.log("\n--- Recherche de questions ---");
  console.log("1. Mot-clé (par exemple : 'Mathématiques')");
  console.log(
    "2. Type de question (Choix Multiple, Vrai/Faux, Correspondance, Mot Manquant, Numerique, Question Ouverte)",
  );
  console.log("3. Afficher toutes les questions");

  rl.question("\nEntrez le numéro de votre choix : ", (choixCritere) => {
    switch (choixCritere) {
      case "1":
        rl.question("Entrez un mot-clé pour rechercher : ", (motCle) => {
          const resultats = questions.filter((q) =>
            q.enonce.toLowerCase().includes(motCle.toLowerCase()),
          );
          afficherResultats(resultats, rl, callbackMenu);
        });
        break;
      case "2":
        rl.question("Entrez un type de question : ", (type) => {
          const resultats = questions.filter(
            (q) => q.type.toLowerCase() === type.toLowerCase(),
          );
          afficherResultats(resultats, rl, callbackMenu);
        });
        break;
      case "3":
        afficherResultats(questions, rl, callbackMenu);
        break;
      default:
        console.log("\nOption invalide. Retour au menu principal.");
        callbackMenu();
    }
  });
}


// Fonction pour afficher les résultats de recherche
/**
 * Fonction pour afficher les résultats de recherche
 * @param {*} resultats - Liste des questions trouvées
 * @param {*} rl - Interface de ligne de commande
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function afficherResultats(resultats, rl, callbackMenu) {
  if (resultats.length > 0) {
    resultats.forEach((q, index) => {
      console.log(`${index + 1}. ${q.titre} (Type : ${q.type})`);
    });

    rl.question(
      "\nEntrez le numéro pour voir les détails ou 'exit' pour revenir : ",
      (choix) => {
        if (choix.toLowerCase() === "exit") {
          callbackMenu();
        } else {
          const index = parseInt(choix) - 1;
          if (index >= 0 && index < resultats.length) {
            const question = resultats[index];
            console.log("\n--- Détails de la question ---");
            console.log(question.contenu);
            rl.question(
              "\nVoulez-vous ajouter cette question à l'examen ? (oui/non) : ",
              (reponse) => {
                if (reponse.toLowerCase() === "oui") {
                  // Vérifier si la question existe déjà
                  const existeDeja = questionsSelectionnees.some(
                    (q) => q.titre === question.titre
                  );
                  if (existeDeja) {
                    console.log(
                      "\nCette question fait déjà partie de l'examen en cours de création, veuillez sélectionner une autre question."
                    );
                  } else {
                    questionsSelectionnees.push(question);
                    fs.writeFileSync(
                      "./temp_examen.json",
                      JSON.stringify(questionsSelectionnees, null, 2)
                    );
                    console.log("\nQuestion ajoutée à l'examen !");
                  }
                }
                // Retour à la liste des résultats après le choix
                afficherResultats(resultats, rl, callbackMenu);
              }
            );
          } else {
            console.log("\nOption invalide.");
            afficherResultats(resultats, rl, callbackMenu); // Retour à la liste
          }
        }
      }
    );
  } else {
    console.log("\nAucune question ne correspond aux critères.");
    rl.question("\nEntrez un nouveau mot-clé pour relancer la recherche : ", (nouveauMotCle) => {
      const questions = chargerDossier("./questions");
      const resultats = questions.filter((q) =>
        q.enonce.toLowerCase().includes(nouveauMotCle.toLowerCase())
      );
      afficherResultats(resultats, rl, callbackMenu); // Relancer avec le nouveau mot-clé
    });
  }
}


// Fonction pour créer un examen
/**
 * Fonction pour créer un examen
 * @param {*} rl - Interface de ligne de commande
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 * @returns - Rien
 */
function creerExamen(rl, callbackMenu) {
  // Charger les questions sélectionnées depuis le fichier temporaire
  if (fs.existsSync("./temp_examen.json")) {
    questionsSelectionnees = JSON.parse(
      fs.readFileSync("./temp_examen.json", "utf8"),
    );
  } else {
    console.log(
      "\nAucune question n'a été ajoutée à l'examen. Veuillez d'abord ajouter des questions.",
    );
    callbackMenu();
    return;
  }
  // Vérification de l'examen
  verifierExamen(rl, callbackMenu);
}


// Fonction pour vérifier l'examen et proposer des corrections
/**
 * Fonction pour vérifier l'examen et proposer des corrections
 * @param {*} rl - Interface de ligne de commande
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 * @returns - Rien
 */
function verifierExamen(rl, callbackMenu) {
  if (
    questionsSelectionnees.length < 15 ||
    questionsSelectionnees.length > 20
  ) {
    console.log(
      `\nVotre examen ne contient pas entre 15 et 20 questions, veuillez corriger cela. Actuellement : ${questionsSelectionnees.length}`,
    );
    modifierQuestions(rl, callbackMenu);
    return;
  }
  // Vérifier les doublons
  const titres = new Set();
  for (const question of questionsSelectionnees) {
    if (titres.has(question.titre)) {
      console.log(`\nAu moins une question est en double, veuillez vérifier vos données. Doublon détecté: ${question.titre}`);
      modifierQuestions(rl, callbackMenu);
      return;
    }
    titres.add(question.titre);
  }
  // Demander le nom du fichier GIFT
  rl.question(
    "\nEntrez le nom du fichier GIFT (sans extension) (il sera créé dans le dossier examens) : ",
    (nomFichier) => {
      if (!nomFichier.trim()) {
        // Vérifier si le nom est vide
        console.log(
          "\nLe nom du fichier ne peut pas être vide. Veuillez entrer un nom valide.",
        );
        return verifierExamen(rl, callbackMenu); // Redemander le nom du fichier
      }
      const cheminComplet = `./examens/${nomFichier}.gift`;
      // Vérifier si le fichier existe déjà
      if (fs.existsSync(cheminComplet)) {
        rl.question(
          `\nLe fichier '${cheminComplet}' existe déjà. Voulez-vous l'écraser ? (oui/non) : `,
          (reponse) => {
            if (reponse.toLowerCase() === "oui") {
              sauvegarderExamen(cheminComplet, callbackMenu);
            } else {
              console.log(
                "\nCréation annulée. Vous pouvez choisir un autre nom.",
              );
              callbackMenu();
            }
          },
        );
      } else {
        sauvegarderExamen(cheminComplet, callbackMenu);
      }
    },
  );
}


// Fonction pour sauvegarder l'examen GIFT
/**
 * Fonction pour sauvegarder l'examen GIFT
 * @param {*} cheminComplet - Chemin complet du fichier GIFT
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function sauvegarderExamen(cheminComplet, callbackMenu) {
  try {
    // Générer le fichier GIFT
    const giftData = questionsSelectionnees.map((q) => q.contenu).join("\n\n");
    fs.writeFileSync(cheminComplet, giftData);
    console.log(`\nVotre fichier a été généré avec succès : ${cheminComplet}`);
    // Supprimer le fichier temporaire après la création
    fs.unlinkSync("./temp_examen.json");
    console.log(
      "\nFichier temporaire supprimé. Vous pouvez créer un nouvel examen.",
    );
  } catch (error) {
    console.error(
      `\nErreur lors de la sauvegarde du fichier : ${error.message}`,
    );
  }
  callbackMenu();
}


// Fonction pour permettre la modification des questions
/**
 * Fonction pour permettre la modification des questions
 * @param {*} rl - Interface de ligne de commande
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function modifierQuestions(rl, callbackMenu) {
  console.log("\n--- Modification des questions ---");
  console.log("1. Supprimer une question");
  console.log("2. Ajouter une question");
  console.log("3. Retourner à la vérification");
  console.log("4. Quitter (annuler la création de l'examen)");

  rl.question("\nChoisissez une option : ", (choix) => {
    switch (choix) {
      case "1":
        supprimerQuestion(rl, callbackMenu);
        break;
      case "2":
        rechercherQuestion(rl, callbackMenu); // Permet d'ajouter une question
        break;
      case "3":
        verifierExamen(rl, callbackMenu); // Recommence la vérification
        break;
      case "4":
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
/**
 * Fonction pour supprimer une question de l'examen
 * @param {*} rl - Interface de ligne de commande
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function supprimerQuestion(rl, callbackMenu) {
  questionsSelectionnees.forEach((q, index) => {
    console.log(`${index + 1}. ${q.titre}`);
  });

  rl.question("\nEntrez le numéro de la question à supprimer : ", (choix) => {
    const index = parseInt(choix) - 1;
    if (index >= 0 && index < questionsSelectionnees.length) {
      console.log(
        `\nQuestion supprimée : ${questionsSelectionnees[index].titre}`,
      );
      questionsSelectionnees.splice(index, 1);
      fs.writeFileSync(
        "./temp_examen.json",
        JSON.stringify(questionsSelectionnees, null, 2),
      );
    } else {
      console.log("\nOption invalide.");
    }
    verifierExamen(rl, callbackMenu); // Recommence la vérification après modification
  });
}


// Fonction pour simuler la passation d'un test
/**
 * Fonction pour simuler la passation d'un test
 * @param {*} rl - Interface de ligne de commande
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function simulerPassation(rl, callbackMenu) {
  rl.question("\nEntrez le chemin du fichier d'examen à passer (./examens/nomFichier.gift) : ", (cheminExamen) => {
    const questions = chargerQuestions(cheminExamen);
    if (questions.length === 0) {
      console.log("\nAucun examen trouvé. Veuillez vérifier le chemin du fichier.");
      callbackMenu();
      return;
    }
    let currentQuestionIndex = 0;
    let correctAnswers = 0;

    // Fonction pour poser une question
    /**
     * Fonction pour poser une question
     */
    function askQuestion() {
      if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        afficherQuestion(question);
        rl.question("\nVotre réponse : ", (reponse) => {
          if (reponse.trim() === "") {
            // Avertir l'utilisateur qu'il n'a pas répondu
            console.log("\n⚠️ Vous n'avez pas répondu à cette question.");
            rl.question(
              "Confirmez-vous que vous ne souhaitez pas répondre à cette question ? (Oui/Non) : ",
              (confirmation) => {
                if (confirmation.toLowerCase() === "non") {
                  console.log("Veuillez entrer votre réponse.");
                  return askQuestion(); // Relancer la question
                }
                console.log("Réponse non fournie enregistrée comme incorrecte.");
                currentQuestionIndex++;
                askQuestion(); // Passer à la question suivante
              }
            );
          } else {
            // Validation de la réponse en fonction du type de question
            const isCorrect = validerReponse(question, reponse.trim());
            if (isCorrect) {
              if (question.type === "Question Ouverte") {
                console.log("Question Ouverte, pas de bonne réponse prédéfinie");
              } else {
                console.log("✅ Bonne réponse !");
                correctAnswers++;
              }
            } else {
              console.log(
                  `❌ Mauvaise réponse. La bonne réponse était : ${getBonneReponse(question)}`
              );
            }
            currentQuestionIndex++;
            askQuestion(); // Passer à la question suivante
          }
        });
      } else {
        afficherResultats();
      }
    }

    // Fonction pour afficher une question selon son type
    /**
     * Fonction pour afficher une question selon son type
     * @param {*} question - Question à afficher
     */
    function afficherQuestion(question) {
      if (question.type === "Mot Manquant") {
        console.log(`\nQuestion ${currentQuestionIndex + 1}`);
      }
      else if(question.type === "Numerique") {
        console.log(`\nQuestion ${currentQuestionIndex + 1}`);
      }
      else if(question.type === "Question Ouverte") {
        console.log(`\nQuestion ${currentQuestionIndex + 1}`);
      }
      else {
        console.log(`\nQuestion ${currentQuestionIndex + 1}: ${question.enonce}`);
      }

      switch (question.type) {
        case "Choix Multiple":
          console.log("\nVeuillez choisir la bonne réponse :");
          question.reponses.forEach((r, i) => {
            console.log(`${i + 1}. ${r.texte.split('#')[0].trim()}`); // Affiche les choix sans les symboles = ou ~ et cache les commentaires
          });
          break;

        case "Vrai/Faux":
          console.log("\nVeuillez choisir la bonne réponse :");
          console.log("1. TRUE");
          console.log("2. FALSE");
          break;

        case "Correspondance":
          console.log("\nAssociez les éléments (entrez vos réponses séparées par des ;) :");
          question.reponses.forEach((r, i) => {
            console.log(`${i + 1}. ${r.gauche.split('#')[0].trim()} -> ?`); // Affiche uniquement la partie gauche et cache les commentaires
          });
          break;

        case "Mot Manquant":
          console.log("\nDonnez tous les mot manquant séparés par des; :");
          const questionSansCrochets = question.enonce.replace(/\[.*?\]/g, '____');
          console.log(questionSansCrochets);
          break;

        case "Numérique":
          console.log("\nVeuillez entrer la réponse numérique correcte :");
          break;

        default: // Question Ouverte
          console.log(question.enonce);
      }
    }

    // Fonction pour valider la réponse en fonction du type de question
    /**
     * Fonction pour valider la réponse en fonction du type de question
     * @param {*} question - Question à valider
     * @param {*} reponse - Réponse fournie par l'utilisateur
     * @returns - Vrai si la réponse est correcte, faux sinon
     */
    function validerReponse(question, reponse) {
      switch (question.type) {
        case "Choix Multiple":
          const choixIndex = parseInt(reponse) - 1;
          return question.reponses[choixIndex]?.correct;

        case "Vrai/Faux":
          const vraiFauxReponse = reponse.toLowerCase();
          const texteReponse1 = question.reponses[0].texte.split('#')[0].trim(); // Extrait 'TRUE'
          return (vraiFauxReponse === "1" && texteReponse1== "TRUE") || (vraiFauxReponse === "2" && texteReponse1== "FALSE");

        case "Correspondance":
          // Nettoyer les correspondances pour enlever le #Bonne réponse
          const correspondancesNettoyees = nettoyerCorrespondances(question.reponses);
          return comparerCorrespondances(correspondancesNettoyees, reponse.split(';'));

        case "Mot Manquant":
          // Extraire toutes les réponses correctes en minuscules
          const reponsesCorrectes = question.reponses.map(r => r.texte.toLowerCase());
          // Diviser la réponse utilisateur par les espaces ou séparateurs (ex. ';')
          const reponsesUtilisateur = reponse.split(';').map(r => r.trim().toLowerCase());
          // Vérifier que toutes les réponses utilisateur correspondent exactement
          return (reponsesUtilisateur.length === reponsesCorrectes.length && reponsesUtilisateur.every((r, index) => r === reponsesCorrectes[index]));

        case "Numerique":
          return question.reponses[0].texte.replace(/^#/, '') === String(reponse);

        default:
          return reponse.trim().length > 0; // Question ouverte : toujours correcte si réponse fournie
      }
    }

    // Fonction pour afficher la bonne réponse
    /**
     * Fonction pour afficher la bonne réponse
     * @param {*} question - Question pour laquelle afficher la bonne réponse
     * @returns - La bonne réponse à afficher
     */
    function getBonneReponse(question) {
      if (!question || !question.type) {
        return "Type de question inconnu ou question mal formatée.";
      }

      switch (question.type) {
        case "Choix Multiple":

        case "Vrai/Faux":
          const texteReponse = question.reponses[0].texte.split('#')[0].trim() || "Réponse inconnue";
          return texteReponse;

        case "Correspondance":
          // Nettoyer les correspondances, ou donner une valeur par défaut si aucune réponse
          const correspondancesNettoyees = nettoyerCorrespondances(question.reponses) || "Réponse inconnue";
          // Formatage des paires pour les questions de correspondance
          const correspondancesAffichables = correspondancesNettoyees.map(correspondance => {
            return `${correspondance.gauche} -> ${correspondance.droit}`;
          }).join(", "); // Join les paires en une seule chaîne séparée par des virgules
          return correspondancesAffichables;

        case "Mot Manquant":
          const reponsesCorrectes = question.reponses.map(r => r.texte.toLowerCase());
          // Retourner tous les mots manquants
          return reponsesCorrectes|| "Réponse inconnue";

        case "Numerique":
          // Retourner la réponse numérique sans le #
          return question.reponses.length > 0 ? question.reponses[0].texte.replace(/^#/, '') : "Réponse inconnue";

        case "Question Ouverte":
          return "Question ouverte - pas de bonne réponse prédéfinie.";

        default:
          return "Type de question non supporté.";
      }
    }

    // Fonction pour afficher les résultats finaux
    /**
     * Fonction pour afficher les résultats finaux
     */
    function afficherResultats() {
      const score = (correctAnswers / questions.length) * 100;
      console.log("\n--- Bilan des réponses ---");
      console.log(`Bonnes réponses : ${correctAnswers}`);
      console.log(`Mauvaises réponses : ${questions.length - correctAnswers}`);
      console.log(`Score obtenu : ${score.toFixed(2)}%`);
      callbackMenu();
    }

    // Commencer le processus de passation du test
    console.log("\n--- Passation de l'examen ---");
    console.log("Veuillez répondre aux questions suivantes par le numéro quand il est indiqué:");
    askQuestion();
  });
}


// Fonction pour comparer le profil d'un examen
/**
 * Fonction pour comparer le profil d'un examen
 * @param {*} rl - Interface de ligne de commande
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 * @returns - Rien
 */
function comparerProfilExamen(rl, callbackMenu) {
  // Charger la liste des examens dans le dossier "./examens"
  const exams = chargerExam("./examens"); // Cette fonction doit renvoyer un tableau d'examens avec leurs questions
  if (exams.length === 0) {
    console.log("\nAucun examen trouvé. Veuillez d'abord créer un examen.");
    callbackMenu();
    return;
  }

  console.log("\n--- Comparer le profil d'un examen ---");
  // Afficher tous les examens disponibles avec leur index
  exams.forEach((exam, index) => {
    console.log(`${index + 1}. ${exam.nom}`);
  });

  // Demander à l'utilisateur de choisir un examen à comparer
  rl.question("\nChoisissez un examen à comparer (numéro) : ", (choixExamen) => {
    const examIndex = parseInt(choixExamen) - 1;

    // Vérifier si l'indice sélectionné est valide
    if (isNaN(examIndex) || examIndex < 0 || examIndex >= exams.length) {
      console.log("Choix invalide. Veuillez entrer un numéro valide.");
      return comparerProfilExamen(rl, callbackMenu); // Relancer la sélection en cas d'erreur
    }

    const selectedExam = exams[examIndex];
    console.log(`\nExamen sélectionné : ${selectedExam.nom}`);

    // Demander les chemins des fichiers GIFT de référence pour comparaison
    rl.question(
      "Entrez les chemins des fichiers GIFT de référence (séparés par des virgules, max 3) : ",
      (fichiers) => {
        const fichiersPaths = fichiers.split(",").map((f) => f.trim());

        // Vérification du nombre de fichiers sélectionnés
        if (fichiersPaths.length > 3) {
          console.log("\nErreur : Vous ne pouvez comparer qu'un maximum de 3 fichiers.");
          return comparerProfilExamen(rl, callbackMenu); // Relancer la sélection en cas d'erreur
        }

        // Charger les questions de référence à partir des fichiers GIFT
        const referenceQuestions = fichiersPaths.flatMap((chemin) => {
          if (!fs.existsSync(chemin)) {
            console.log(`\nLe fichier '${chemin}' n'existe pas.`);
            return [];
          }
          return chargerQuestions(chemin); // Charger les questions depuis chaque fichier
        });

        if (referenceQuestions.length === 0) {
          console.log("\nAucune question de référence chargée. Vérifiez les fichiers sélectionnés.");
          callbackMenu();
          return;
        }

        // Analyser le profil des questions de l'examen sélectionné
        const examProfile = analyserProfil(selectedExam.questions);
        // Analyser le profil des questions de référence
        const referenceProfile = analyserProfil(referenceQuestions);

        // Comparer les deux profils
        const comparison = comparerProfils(examProfile, referenceProfile);
        console.log("\n--- Rapport de comparaison ---");
        console.log(comparison);

        // Générer un graphique pour visualiser la comparaison (si la fonction existe)
        generateGraph(examProfile, referenceProfile);

        callbackMenu(); // Retour au menu principal après la comparaison
      }
    );
  });
}


// Fonction pour charger les examens depuis un dossier
/**
 * Fonction pour charger les examens depuis un dossier
 * @param {*} dossier - Dossier contenant les fichiers d'examen
 * @returns - Tableau d'examens avec leurs questions
 */
function chargerExam(dossier) {
  try {
    const fichiers = fs.readdirSync(dossier);
    return fichiers.map((fichier) => {
      const cheminFichier = join(dossier, fichier);
      const contenu = fs.readFileSync(cheminFichier, 'utf8');
      const questions = chargerQuestions(cheminFichier); // Charger les questions de chaque examen
      return { nom: basename(fichier, '.gift'), questions };
    });
  } catch (error) {
    console.error("Erreur lors du chargement des examens :", error.message);
    return [];
  }
}


// Fonction pour analyser le profil des questions d'un examen ou d'une référence
/**
 * Fonction pour analyser le profil des questions d'un examen ou d'une référence
 * @param {*} questions - Liste des questions à analyser
 * @returns - Profil des questions sous forme d'objet
 */
function analyserProfil(questions) {
  const profile = {
    choixMultiples: 0,
    vraiFaux: 0,
    correspondance: 0,
    motManquant: 0,
    numerique: 0,
    questionOuverte: 0
  };

  // Parcourir chaque question pour compter les types
  questions.forEach((question) => {
    switch (question.type) {
      case "Choix Multiple":
        profile.choixMultiples++;
        break;
      case "Vrai/Faux":
        profile.vraiFaux++;
        break;
      case "Correspondance":
        profile.correspondance++;
        break;
      case "Mot Manquant":
        profile.motManquant++;
        break;
      case "Numerique":
        profile.numerique++;
        break;
      case "Question Ouverte":
        profile.questionOuverte++;
        break;
      default:
        break; // Ignorer les types inconnus
    }
  });

  return profile; // Retourner le profil des questions
}


// Fonction pour comparer deux profils d'examen
/**
 * Fonction pour comparer deux profils d'examen
 * @param {*} profil1 - Profil de l'examen à comparer
 * @param {*} profil2 - Profil de l'examen de référence
 * @returns - Résultat de la comparaison sous forme de chaîne de caractères
 */
function comparerProfils(profil1, profil2) {
  const comparison = [];
  for (const type in profil1) {
    const diff = profil1[type] - profil2[type];
    const message = diff === 0
        ? `Nombre de questions ${type.replace(/([A-Z])/g, ' $1').toLowerCase()} identique.`
        : `L'examen sélectionné contient ${Math.abs(diff)} ${type.replace(/([A-Z])/g, ' $1').toLowerCase()} ${diff > 0 ? 'de plus' : 'de moins'} que la référence.`;
    comparison.push(message);
  }
  return comparison.join("\n"); // Retourner la comparaison sous forme de chaîne de caractères
}


// Fonction principale pour l'identification
/**
 * Fonction principale pour l'identification
 * @param {*} rl - Interface de ligne de commande
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function identification(rl, callbackMenu) {
  const contact = {}; // Objet pour stocker les informations
  askNom(rl, contact, callbackMenu); // Démarrer le processus avec la fonction 'askNom'
}


// Fonction pour demander le nom
/**
 * Fonction pour demander le nom
 * @param {*} rl - Interface de ligne de commande
 * @param {*} contact - Objet pour stocker les informations du contact
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function askNom(rl, contact, callbackMenu) {
  rl.question("Entrez votre nom : ", (nom) => {
    if (!nom) {
      console.log("Le nom ne peut pas être vide. Veuillez compléter les informations manquantes.");
      return askNom(rl, contact, callbackMenu); // Redemander le nom uniquement
    }
    contact.nom = nom;
    askPrenom(rl, contact, callbackMenu); // Passer à la prochaine question
  });
}


// Fonction pour demander le prénom
/**
 * Fonction pour demander le prénom
 * @param {*} rl - Interface de ligne de commande
 * @param {*} contact - Objet pour stocker les informations du contact
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function askPrenom(rl, contact, callbackMenu) {
  rl.question("Entrez votre prénom : ", (prenom) => {
    if (!prenom) {
      console.log("Le prénom ne peut pas être vide. Veuillez compléter les informations manquantes.");
      return askPrenom(rl, contact, callbackMenu); // Redemander le prénom uniquement
    }
    contact.prenom = prenom;
    askEmail(rl, contact, callbackMenu); // Passer à la prochaine question
  });
}


// Fonction pour demander l'email
/**
 * Fonction pour demander l'email
 * @param {*} rl - Interface de ligne de commande
 * @param {*} contact - Objet pour stocker les informations du contact
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function askEmail(rl, contact, callbackMenu) {
  rl.question("Entrez votre email : ", (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      console.log("L'email fourni n'est pas valide.Veuillez compléter les informations manquantes.");
      return askEmail(rl, contact, callbackMenu); // Redemander l'email uniquement
    }
    contact.email = email;
    askTelephonePro(rl, contact, callbackMenu); // Passer à la prochaine question
  });
}


// Fonction pour demander le téléphone professionnel
/**
 * Fonction pour demander le téléphone professionnel
 * @param {*} rl - Interface de ligne de commande
 * @param {*} contact - Objet pour stocker les informations du contact
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function askTelephonePro(rl, contact, callbackMenu) {
  rl.question(
    "Entrez votre téléphone professionnel sous format +33 : ",
    (telephonePro) => {
      // Regex pour vérifier que le numéro commence par +33 suivi de 9 chiffres
      const telRegex = /^\+33[0-9]{9}$/;
      if (!telRegex.test(telephonePro)) {
        console.log(
          "Le numéro de téléphone professionnel est invalide. Il doit commencer par +33 et être suivi de 9 chiffres.",
        );
        return askTelephonePro(rl, contact, callbackMenu); // Redemander le téléphone pro uniquement
      }
      contact.telephonePro = telephonePro;
      askTelephonePerso(rl, contact, callbackMenu); // Passer à la prochaine question
    },
  );
}


// Fonction pour demander le téléphone personnel
/**
 * Fonction pour demander le téléphone personnel
 * @param {*} rl - Interface de ligne de commande
 * @param {*} contact - Objet pour stocker les informations du contact
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function askTelephonePerso(rl, contact, callbackMenu) {
  rl.question("Entrez votre téléphone personnel : ", (telephonePerso) => {
    // Regex pour accepter les numéros commençant par +33 ou un numéro local à 10 chiffres (ex : 06XXXXXXXX)
    const telRegex = /^(?:\+33[0-9]{9}|0[1-9][0-9]{8})$/;
    if (!telRegex.test(telephonePerso)) {
      console.log(
        "Le numéro de téléphone personnel est invalide. Il doit commencer par +33 suivi de 9 chiffres ou un numéro local valide.",
      );
      return askTelephonePerso(rl, contact, callbackMenu); // Redemander le téléphone perso uniquement
    }
    contact.telephonePerso = telephonePerso;
    askAdressePerso(rl, contact, callbackMenu); // Passer à la prochaine question
  });
}


// Fonction pour demander l'adresse personnelle
/**
 * Fonction pour demander l'adresse personnelle
 * @param {*} rl - Interface de ligne de commande
 * @param {*} contact - Objet pour stocker les informations du contact
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function askAdressePerso(rl, contact, callbackMenu) {
  rl.question(
    "Entrez votre adresse personnelle (format : rue;code postal;ville;pays) : ",
    (adressePerso) => {
      const adresseRegex = /^[^;]+;[^;]+;[^;]+;[^;]+$/;
      if (!adresseRegex.test(adressePerso)) {
        console.log(
          "L'adresse fournie n'est pas valide. Le format attendu est : rue;code postal;ville;pays. \n Veuillez compléter les informations manquantes.",
        );
        return askAdressePerso(rl, contact, callbackMenu); // Redemander l'adresse uniquement
      }
      contact.adressePerso = adressePerso;
      askLieuTravail(rl, contact, callbackMenu); // Passer à la prochaine question
    },
  );
}


// Fonction pour demander le lieu de travail
/**
 * Fonction pour demander le lieu de travail
 * @param {*} rl - Interface de ligne de commande
 * @param {*} contact - Objet pour stocker les informations du contact
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function askLieuTravail(rl, contact, callbackMenu) {
  rl.question("Entrez le lieu de travail : ", (lieuTravail) => {
    if (!lieuTravail) {
      console.log("Le lieu de travail ne peut pas être vide. \n Veuillez compléter les informations manquantes.");
      return askLieuTravail(rl, contact, callbackMenu); // Redemander le lieu de travail uniquement
    }
    contact.lieuTravail = lieuTravail;
    askBureau(rl, contact, callbackMenu); // Passer à la prochaine question
  });
}


// Fonction pour demander le bureau
/**
 * Fonction pour demander le bureau
 * @param {*} rl - Interface de ligne de commande
 * @param {*} contact - Objet pour stocker les informations du contact
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function askBureau(rl, contact, callbackMenu) {
  rl.question("Entrez votre numéro de bureau : ", (bureau) => {
    if (!bureau) {
      console.log("Le numéro de bureau ne peut pas être vide. \n Veuillez compléter les informations manquantes.");
      return askBureau(rl, contact, callbackMenu); // Redemander le bureau uniquement
    }
    contact.bureau = bureau;
    generateVCard(rl, contact, callbackMenu); // Passer à la génération de la VCard
  });
}


// Fonction pour générer la VCard
/**
 * Fonction pour générer la VCard
 * @param {*} rl - Interface de ligne de commande
 * @param {*} contact - Objet contenant les informations du contact
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function generateVCard(rl, contact, callbackMenu) {
  // Générer le contenu de la VCard
  const vcardContent = generateVCardContent(contact);

  // Fonction récursive pour demander un chemin valide
  function askForValidPath() {
    rl.question(
      "Entrez le chemin où sauvegarder la fiche contact (ex : ./contact.vcf) : ",
      (cheminFichier) => {
        try {
          // Tenter de sauvegarder la VCard dans un fichier
          fs.writeFileSync(cheminFichier, vcardContent);
          console.log("La fiche contact a été générée avec succès.");
          // Retour au menu principal après une sauvegarde réussie
          callbackMenu();
        } catch (error) {
          console.error(
            `Le chemin "${cheminFichier}" n'est pas valide ou accessible. Veuillez entrer un chemin correct.`
          );
          // Relancer la demande de chemin en cas d'erreur
          askForValidPath();
        }
      }
    );
  }

  // Lancer la demande initiale de chemin
  askForValidPath();
}


// Function pour analyser le profil d'un examen
/**
 * Fonction pour analyser le profil d'un examen
 * @param {*} rl - Interface de ligne de commande
 * @param {*} callbackMenu - Fonction de rappel pour le menu principal
 */
function dresserProfil(rl, callbackMenu) {
  console.log("\n--- Dresser le profil d'un examen ---");
  rl.question("Entrez le chemin du fichier GIFT à analyser : (./examens/nomFichier.gift) ", (filePath) => {
    try {
      // Load et validation du fichier
      const questions = chargerQuestions(filePath);
      if (!questions || questions.length === 0) {
        throw new Error("Le fichier est vide ou mal formaté");
      }

      // Questions types
      const profile = {
        choixMultiples: 0,
        vraiFaux: 0,
        correspondance: 0,
        motManquant: 0,
        numerique: 0,
        questionOuverte: 0,
      };

      questions.forEach((question) => {
        switch (question.type.toLowerCase()) {
          case "choix multiple":
            profile.choixMultiples++;
            break;
          case "vrai/faux":
            profile.vraiFaux++;
            break;
          case "correspondance":
            profile.correspondance++;
            break;
          case "mot manquant":
            profile.motManquant++;
            break;
          case "numerique":
            profile.numerique++;
            break;
          case "question ouverte":
            profile.questionOuverte++;
            break;
        }
      });

      console.log("\nInformations générales:");
      console.log(`Nombre total de questions: ${questions.length}`);

      console.log("\nRépartition des types de questions:");
      Object.entries(profile).forEach(([type, count]) => {
        console.log(
          `${type}: ${count} (${((count / questions.length) * 100).toFixed(2)}%)`,
        );
      });

      generateHistogram(profile);
    } catch (error) {
      console.error(`\nErreur: ${error.message}`);
      console.log(
        "Le fichier ne peut pas être analysé, veuillez choisir un autre fichier ou corriger l'erreur de format.",
      );
    }
    callbackMenu();
  });
}


// Function pour générer un histogramme des types de questions
/**
 * Function pour générer un histogramme des types de questions
 * @param {*} profile - Profil des questions
 */
function generateHistogram(profile) {
  console.log("\nHistogramme des types de questions:");
  const maxBars = 50;
  const maxCount = Math.max(...Object.values(profile));
  Object.entries(profile).forEach(([type, count]) => {
    const bars = Math.round((count / maxCount) * maxBars);
    console.log(`${type.padEnd(20)} ${"█".repeat(bars)} (${count})`);
  });
}


// Fonction pour générer le contenu de la VCard (à adapter selon les besoins)
/**
 * Fonction pour générer le contenu de la VCard (à adapter selon les besoins)
 * @param {*} contact - Objet contenant les informations du contact
 * @returns - Contenu de la VCard au format texte
 */
function generateVCardContent(contact) {
  // Séparer les champs de l'adresse
  const [rue, codePostal, ville, pays] = contact.adressePerso.split(";");
  return `BEGIN:VCARD
N:${contact.nom}
FN:${contact.prenom} ${contact.nom}
EMAIL:${contact.email}
TEL:WORK:${contact.telephonePro}
TEL:HOME:${contact.telephonePerso}
ADR:HOME:${rue};${ville};;${codePostal};${pays}
ORG:${contact.lieuTravail}
ROOM:${contact.bureau}
END:VCARD`;
}

// Fonction pour charger les questions d'un fichier GIFT
/**
 * Fonction pour charger les questions d'un fichier GIFT
 * @param {*} reponses - Réponses de l'utilisateur
 * @returns - Réponses nettoyées
 */
function nettoyerCorrespondances(reponses) {
  return reponses.map((item) => ({
    gauche: item.gauche.trim(),
    droit: item.droit.split('#')[0].trim(), // Supprime la partie après le #
  }));
}


// Fonction pour comparer les correspondances
/**
 * Fonction pour comparer les correspondances
 * @param {*} reponsesAttendues - Réponses attendues
 * @param {*} reponsesUtilisateur - Réponses de l'utilisateur
 * @returns - Vrai si les réponses correspondent, faux sinon
 */
function comparerCorrespondances(reponsesAttendues, reponsesUtilisateur) {
  // Diviser et nettoyer les réponses utilisateur
  const reponsesDroitesUtilisateur = reponsesUtilisateur.map(reponse => reponse.trim());
  
  // Vérifier que toutes les réponses utilisateur correspondent exactement aux réponses attendues (droit)
  if (reponsesAttendues.length !== reponsesDroitesUtilisateur.length) {
    return false; // Si le nombre de réponses est différent, la réponse est incorrecte
  }

  // Comparer chaque réponse droite attendue avec celle de l'utilisateur
  return reponsesAttendues.every((attendue, index) => {
    const reponseUtilisateur = reponsesDroitesUtilisateur[index];
    return attendue.droit === reponseUtilisateur;
  });
}


// Export des fonctions
module.exports = {
  comparerProfilExamen,
  simulerPassation,
  identification,
  rechercherQuestion,
  creerExamen,
  dresserProfil,
  comparerProfils,
  generateVCardContent,
  analyserProfil,
};
