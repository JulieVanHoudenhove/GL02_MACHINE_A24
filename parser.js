const fs = require('fs');

// Fonction pour charger et parser les questions depuis le fichier texte
function chargerQuestions(fichier) {
    try {
        const contenu = fs.readFileSync(fichier, 'utf8');

        // Divise les questions en utilisant une regex qui trouve les blocs de questions
        const questionsBrutes = contenu.split(/(?=::Question \d+)/); // Assure qu'on garde le séparateur intact

        // Parse chaque question et renvoie un tableau de questions valides
        const questions = questionsBrutes.map((bloc) => {
            const question = parserQuestion(bloc.trim());
            return question; // renvoie la question si elle est valide
        }).filter(q => q); // Filtrer les entrées invalides (par exemple, questions mal formatées)

        return questions;
    } catch (error) {
        console.error("Erreur lors du chargement des questions :", error.message);
        return [];
    }
}

// Fonction pour parser une question individuelle
function parserQuestion(bloc) {
    // Extraire le titre, l'énoncé, et les réponses (si présentes)


    // Modifier l'expression régulière pour mieux capturer l'énoncé et gérer les espaces
    const titreEtEnonce = bloc.match(/::(.*?)::([^{}]+)(\s*{[\s\S]*})?/);



    if (!titreEtEnonce) return null; // Si la question est mal formatée, on l'ignore

    const titre = titreEtEnonce[1].trim(); // Titre de la question
    const enonce = titreEtEnonce[2] ? titreEtEnonce[2].trim() : ""; // Énoncé de la question
    const reponsesBrutes = titreEtEnonce[3] ? titreEtEnonce[3].trim() : ""; // Réponses entre `{ }`

    // Passer l'énoncé en plus des réponses à la fonction infererType
    const type = infererType(reponsesBrutes, enonce); // Identifier le type de question

    const result = {
        titre,
        enonce,
        type,
        contenu: bloc.trim(), // Contenu complet de la question
    };



    return result;
}





// Fonction pour inférer le type de la question en fonction des réponses
// Fonction pour inférer le type de la question en fonction des réponses
function infererType(reponses, question) {
    if (!reponses) {
        // Vérifier si la question contient un mot manquant (indiqué par des crochets [])
        if (/\[.*?\]/.test(question)) {
            return "Mot Manquant"; // Mot Manquant (par exemple, [Est])
        }
        return "Question Ouverte"; // Si aucune réponse détectée
    }

    // Vérification pour une question de type "Vrai/Faux"
    if (/TRUE|FALSE/.test(reponses)) {
        return "Vrai/Faux"; // Vrai/Faux (Réponses de type TRUE ou FALSE)
    }

    // Vérification pour un choix multiple
    if (reponses.includes('=')) {
        return "Choix Multiple"; // Choix Multiple
    }

    // Vérification pour une réponse numérique (par exemple, {#42})
    if (/^{#\d+}/.test(reponses)) {
        return "Numérique"; // Réponse Numérique (par exemple, {#42})
    }

    return "Inconnu"; // Si non reconnu
}







module.exports = { chargerQuestions };
