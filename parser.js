/**
 * @file parser.js
 * @description Ce fichier contient les fonctions permettant de charger, parser et manipuler des questions au format GIFT
 *              à partir de fichiers ou de dossiers. Le format GIFT est couramment utilisé pour représenter des questions
 *              d'examen ou de quiz.
 *
 * @dependencies
 *   - fs : Module Node.js pour la gestion des fichiers.
 *   - path : Module Node.js pour manipuler les chemins de fichiers.
 *
 * @functions
 *   - chargerDossier(dossier) : Charge et parse les questions depuis tous les fichiers .gift d'un dossier donné.
 *   - chargerQuestions(fichier) : Charge et parse les questions depuis un fichier .gift unique.
 *   - parserQuestion(bloc) : Parse une question individuelle et retourne ses détails (titre, énoncé, type, réponses, etc.).
 *   - infererType(reponses, question) : Détermine le type d'une question (Choix Multiple, Correspondance, Vrai/Faux, etc.).
 *   - parserCorrespondance(reponsesBrutes) : Parse les paires de correspondance des questions de type Correspondance.
 *   - parserReponsesGenerales(reponsesBrutes) : Parse les réponses pour des questions générales (Choix Multiple, Vrai/Faux).
 *   - parserMotsManquants(enonce) : Extrait les mots manquants des questions de type "Mot Manquant".
 *
 * @usage
 *   - Importer le module avec `const { chargerDossier, chargerQuestions } = require('./parser');`
 *   - Utiliser `chargerDossier` pour parser un dossier ou `chargerQuestions` pour un fichier unique.
 *
 * @example
 *   const questions = chargerDossier('./questions');
 *   console.log(questions);
 *
 * @note
 *   - Les fichiers doivent être au format GIFT pour être correctement parsés.
 *   - Les questions mal formatées seront ignorées.
 */


// Importation des modules nécessaires
const fs = require('fs');  // Pour manipuler les fichiers
const path = require('path');  // Pour manipuler les chemins de fichiers


// Fonction pour charger et parser les questions depuis tous les fichiers d'un dossier
/**
 * Charge et parse les questions depuis tous les fichiers .gift d'un dossier donné.
 * @param {*} dossier - Le chemin du dossier contenant les fichiers .gift
 * @returns {Array} - La liste des questions parsées
 */
function chargerDossier(dossier) {
    try {
        const fichiers = fs.readdirSync(dossier); // Lire tous les fichiers du dossier
        let questions = [];

        // Parcourir chaque fichier et charger les questions
        fichiers.forEach(fichier => {
            const cheminFichier = path.join(dossier, fichier);

            // Vérifier que le fichier est bien un fichier .gift
            if (fs.statSync(cheminFichier).isFile() && path.extname(fichier) === '.gift') {
                const contenu = fs.readFileSync(cheminFichier, 'utf8');  // Lire le contenu du fichier

                // Divise les questions en utilisant une regex qui trouve les blocs de questions
                const questionsBrutes = contenu.split(/(?=\n::)/);  // Sépare les questions par le début d'une nouvelle ligne `::`

                // Parse chaque question et ajoute à la liste globale
                questions = questions.concat(
                    questionsBrutes.map((bloc) => parserQuestion(bloc.trim())).filter(q => q)
                );
            }
        });

        return questions; // Retourne la liste des questions
    } catch (error) {
        console.error("Erreur lors du chargement des questions :", error.message);
        return [];  // Retourne une liste vide en cas d'erreur
    }
}


// Fonction pour charger et parser les questions depuis un seul fichier
/**
 * Charge et parse les questions depuis un fichier .gift unique.
 * @param {*} fichier - Le chemin du fichier .gift à charger
 * @returns {Array} - La liste des questions parsées
 */
function chargerQuestions(fichier) {
    try {
        const cheminFichier = path.resolve(fichier);  // Résoudre le chemin absolu du fichier

        // Vérifier que le fichier est bien un fichier .gift
        if (fs.statSync(cheminFichier).isFile() && path.extname(fichier) === '.gift') {
            const contenu = fs.readFileSync(cheminFichier, 'utf8');  // Lire le contenu du fichier

            // Divise les questions en utilisant une regex qui trouve les blocs de questions
            const questionsBrutes = contenu.split(/(?=\n::)/);  // Sépare les questions par le début d'une nouvelle ligne `::`

            // Parse chaque question et ajoute à la liste globale
            const questions = questionsBrutes.map((bloc) => parserQuestion(bloc.trim())).filter(q => q);

            return questions;  // Retourne la liste des questions
        } else {
            console.error("Le fichier spécifié n'est pas un fichier .gift valide.");
            return [];  // Retourne une liste vide si le fichier n'est pas valide
        }
    } catch (error) {
        console.error("Erreur lors du chargement de l'examen :", error.message);
        return [];  // Retourne une liste vide en cas d'erreur
    }
}


// Fonction pour parser une question individuelle
/**
 * Parse une question individuelle et retourne ses détails (titre, énoncé, type, réponses, etc.).
 * @param {*} bloc - Le bloc de texte représentant une question
 * @returns {Object} - Les détails de la question parsée
 */
function parserQuestion(bloc) {
    // Extraire le titre, l'énoncé, et les réponses (si présentes)
    const titreEtEnonce = bloc.match(/::(.*?)::([^{}]+)(\s*{[\s\S]*})?/);  // Utilise une regex pour extraire les parties de la question
    if (!titreEtEnonce) return null;  // Si la question est mal formatée, on l'ignore

    const titre = titreEtEnonce[1].trim();  // Titre de la question
    const enonce = titreEtEnonce[2] ? titreEtEnonce[2].trim() : "";  // Énoncé de la question
    const reponsesBrutes = titreEtEnonce[3] ? titreEtEnonce[3].trim() : "";  // Réponses entre `{ }`

    // Passer l'énoncé et les réponses à la fonction infererType pour déterminer le type de question
    const type = infererType(reponsesBrutes, enonce);  // Identifier le type de question

    let reponses = [];
    // En fonction du type de question, on va parser les réponses de manière spécifique
    if (type === "Correspondance") {
        reponses = parserCorrespondance(reponsesBrutes);
    } else if (type === "Choix Multiple" || type === "Vrai/Faux" || type === "Numerique") {
        reponses = parserReponsesGenerales(reponsesBrutes);
    } else if (type === "Mot Manquant") {
        reponses = parserMotsManquants(enonce);
    }

    const result = {
        titre,  // Le titre de la question
        enonce,  // L'énoncé de la question
        type,  // Le type de la question
        reponses,  // Les réponses associées à la question
        contenu: bloc.trim(),  // Contenu complet de la question
    };

    return result;  // Retourne l'objet question parsé
}


// Fonction pour inférer le type de la question en fonction des réponses
/**
 * Détermine le type d'une question (Choix Multiple, Correspondance, Vrai/Faux, etc.).
 * @param {*} reponses - Les réponses de la question
 * @param {*} question - L'énoncé de la question
 * @returns {String} - Le type de la question
 */
function infererType(reponses, question) {
    if (!reponses) {
        // Vérifier si la question contient un mot manquant (indiqué par des crochets [])
        if (/\[.*?\]/.test(question)) {
            return "Mot Manquant";  // Mot Manquant (par exemple, [Est])
        }
        return "Question Ouverte";  // Si aucune réponse détectée
    }

    // Vérification pour une question de type "Correspondance"
    if (/=\s*.*\s*->\s*.*\s*/.test(reponses)) {
        return "Correspondance";  // Correspondance
    }

    // Vérification pour une question de type "Vrai/Faux"
    if (/TRUE|FALSE/.test(reponses)) {
        return "Vrai/Faux";  // Vrai/Faux
    }

    // Vérification pour un choix multiple
    if (reponses.includes('=')) {
        return "Choix Multiple";  // Choix Multiple
    }

    // Vérification pour une réponse numérique (par exemple, {#42})
    if (/^{#\d+}/.test(reponses)) {
        return "Numerique";  // Réponse Numérique
    }

    return "Ce type de question n'est pas encore supporté";  // Si non reconnu
}


// Fonction pour parser les paires de correspondance
/**
 * Parse les paires de correspondance des questions de type Correspondance.
 * @param {*} reponsesBrutes - Les réponses brutes de la question
 * @returns {Array} - Les paires de correspondance
 */
function parserCorrespondance(reponsesBrutes) {
    const paires = [];
    const lignes = reponsesBrutes.replace(/[{}]/g, '').trim().split('\n');  // Supprime les accolades et divise en lignes

    lignes.forEach((ligne) => {
        const match = ligne.match(/=\s*(.*?)\s*->\s*(.*?)\s*(#.*)?$/);  // Capture TexteGauche et TexteDroit
        if (match) {
            paires.push({
                gauche: match[1].trim(),
                droit: match[2].trim()
            });
        }
    });

    return paires;  // Retourne les paires de correspondance
}


// Fonction générique pour parser les réponses (choix multiple, vrai/faux, etc.)
/**
 * Parse les réponses pour des questions générales (Choix Multiple, Vrai/Faux).
 * @param {*} reponsesBrutes - Les réponses brutes de la question
 * @returns {Array} - La liste des réponses
 */
function parserReponsesGenerales(reponsesBrutes) {
    const reponses = [];
    const lignes = reponsesBrutes.replace(/[{}]/g, '').trim().split('\n');  // Supprime les accolades et divise en lignes

    lignes.forEach((ligne) => {
        const correct = ligne.startsWith('=');  // Détermine si la réponse est correcte
        const texte = ligne.replace(/^=|~/, '').trim();  // Supprime le préfixe et les symboles inutiles
        reponses.push({ texte, correct });  // Ajoute la réponse à la liste
    });

    return reponses;  // Retourne la liste des réponses
}


// Fonction pour parser les mots manquants dans l'énoncé de la question
/**
 * Extrait les mots manquants des questions de type "Mot Manquant
 * @param {*} enonce - L'énoncé de la question
 * @returns {Array} - La liste des mots manquants
 */
function parserMotsManquants(enonce) {
    const motsManquants = [];
    const regex = /\[(.+?)\]/g;  // Trouver tous les mots dans les crochets `[ ]`
    let match;

    // Parcours des mots manquants trouvés dans l'énoncé
    while ((match = regex.exec(enonce)) !== null) {
        motsManquants.push({ texte: match[1].trim() });  // Extraire chaque mot et l'ajouter à la liste
    }

    return motsManquants;  // Retourne les mots manquants
}


// Exportation des fonctions pour pouvoir les utiliser dans d'autres fichiers
module.exports = { chargerDossier, chargerQuestions };
