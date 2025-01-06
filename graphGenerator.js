/**
 * @file graphGenerator.js
 * @description Ce fichier contient une fonction pour générer un graphique de comparaison entre deux profils à l'aide de Chart.js
 *              et pour sauvegarder ce graphique sous forme d'image PNG.
 *
 * @dependencies
 *   - chartjs-node-canvas : Librairie pour générer des graphiques Chart.js côté serveur.
 *   - fs : Module Node.js pour manipuler les fichiers.
 *
 * @functions
 *   - generateGraph(examProfile, referenceProfile) : Génère un graphique comparant deux profils et l'enregistre en tant qu'image PNG.
 *
 * @usage
 *   - Importer le module avec `const { generateGraph } = require('./generateGraph');`
 *   - Appeler `generateGraph(examProfile, referenceProfile)` avec deux profils sous forme d'objets.
 *
 * @example
 *   const examProfile = { Math: 85, Science: 90, History: 75 };
 *   const referenceProfile = { Math: 80, Science: 85, History: 70 };
 *   generateGraph(examProfile, referenceProfile);
 *
 * @note
 *   - Les clés des objets examProfile et referenceProfile doivent correspondre.
 *   - Le graphique généré est sauvegardé sous le nom `profile_comparison.png` dans le répertoire courant.
 */


// Importation des modules nécessaires
const { ChartJSNodeCanvas } = require('chartjs-node-canvas'); // Pour générer des graphiques Chart.js côté serveur
const fs = require('fs'); // Pour manipuler les fichiers


// Dimensions du graphique
const width = 800; // Largeur en pixels
const height = 600; // Hauteur en pixels


// Initialisation de ChartJSNodeCanvas avec les dimensions spécifiées
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });


/**
 * Génère un graphique comparant deux profils et l'enregistre en tant qu'image PNG.
 * @param {Object} examProfile - Profil de l'examen (exemple : { Math: 85, Science: 90 }).
 * @param {Object} referenceProfile - Profil de référence (exemple : { Math: 80, Science: 85 }).
 * @returns {Promise<void>} - Une promesse qui se résout une fois que le fichier PNG est généré et sauvegardé.
 */
async function generateGraph(examProfile, referenceProfile) {
    // Extraction des labels et des données des profils
    const labels = Object.keys(examProfile); // Noms des catégories (exemple : Math, Science)
    const examData = Object.values(examProfile); // Données pour le profil d'examen
    const referenceData = Object.values(referenceProfile); // Données pour le profil de référence

    // Configuration du graphique
    const configuration = {
        type: 'bar', // Type de graphique : barres
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Exam Profile', // Légende pour le profil d'examen
                    data: examData, // Données pour ce jeu
                    backgroundColor: 'rgba(75, 192, 192, 0.2)', // Couleur de remplissage
                    borderColor: 'rgba(75, 192, 192, 1)', // Couleur des bordures
                    borderWidth: 1 // Largeur des bordures
                },
                {
                    label: 'Reference Profile', // Légende pour le profil de référence
                    data: referenceData, // Données pour ce jeu
                    backgroundColor: 'rgba(153, 102, 255, 0.2)', // Couleur de remplissage
                    borderColor: 'rgba(153, 102, 255, 1)', // Couleur des bordures
                    borderWidth: 1 // Largeur des bordures
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true // Commencer l'axe Y à zéro
                }
            }
        }
    };

    // Génération de l'image à partir de la configuration du graphique
    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

    // Sauvegarde de l'image générée dans un fichier PNG
    fs.writeFileSync('./profile_comparison.png', imageBuffer);
    console.log('Graph généré: profile_comparison.png');
}


// Exportation de la fonction pour pouvoir l'utiliser dans d'autres fichiers
module.exports = { generateGraph };
