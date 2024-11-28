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
    // Extrait l'énoncé et les réponses de chaque bloc
    const titreEtEnonce = bloc.match(/::(.*?)::(.*?)\s*(\{[\s\S]* \})?/);
    if (!titreEtEnonce) return null; // Si la question est mal formatée, on l ignore

    const titre = titreEtEnonce[1].trim();
    const enonce = titreEtEnonce[2].trim();
    const reponsesBrutes = titreEtEnonce[3] ? titreEtEnonce[3].trim() : ""; // Réponses entre { } si présentes

    const type = infererType(reponsesBrutes);

    return {
        titre,
        enonce,
        type,
        contenu: bloc.trim()
};
}

// Fonction pour inférer le type de la question en fonction des réponses
function infererType(reponses) {
    if (!reponses) return "Question Ouverte"; // Si aucune réponse, c'est une question ouverte
    if (reponses.includes('TRUE') || reponses.includes('FALSE')) return "Vrai/Faux"; // Vrai/Faux
    if (reponses.includes('=')) return "Choix Multiple"; // Choix Multiple
    if (reponses.includes('#')) return "Numérique"; // Réponse Numérique
    if (reponses.includes('[')) return "Mot Manquant"; // Mot Manquant
    return "Inconnu"; // Par défaut, on marque comme inconnu
}

module.exports = { chargerQuestions };
