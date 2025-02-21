/**
 * @file function.test.js
 * @description Ce fichier contient des tests unitaires pour valider les fonctions principales de manipulation de profils,
 *              de génération de contenu VCard et d'analyse de questions.
 *
 * @dependencies
 *   - Jest : Framework de tests pour JavaScript (https://jestjs.io/)
 *
 * @tests
 *   - comparerProfils : Compare deux profils de questions et vérifie les différences entre eux.
 *   - generateVCardContent : Génère un contenu de carte de visite au format vCard à partir d'un profil utilisateur.
 *   - analyserProfil : Analyse une liste de questions pour générer un profil statistique des types de questions.
 *
 * @usage
 *   - Exécuter les tests avec la commande `jest` ou `npm test` si Jest est configuré dans le projet.
 */


const {
    comparerProfils,
    generateVCardContent,
    analyserProfil,
} = require('./fonctions'); // Chemin vers votre fichier de fonctions


/**
 * Test : comparerProfils - profils identiques
 * Vérifie que les différences sont correctement détectées lorsque les profils sont identiques.
 */
test('comparerProfils - profils identiques', () => {
    const profil1 = {
        choixMultiples: 5,
        vraiFaux: 3,
        correspondance: 2,
        motManquant: 4,
        numerique: 1,
        questionOuverte: 0,
    };
    const profil2 = { ...profil1 }; // Copie identique de profil1

    const result = comparerProfils(profil1, profil2);
    expect(result).toContain("Nombre de questions choix multiples identique.");
    expect(result).toContain("Nombre de questions vrai faux identique.");
});


/**
 * Test : comparerProfils - profils différents
 * Vérifie que les différences sont correctement détectées lorsque les profils sont différents.
 */
test('comparerProfils - profils différents', () => {
    const profil1 = {
        choixMultiples: 5,
        vraiFaux: 3,
        correspondance: 2,
        motManquant: 4,
        numerique: 1,
        questionOuverte: 0,
    };
    const profil2 = {
        choixMultiples: 3,
        vraiFaux: 4,
        correspondance: 2,
        motManquant: 5,
        numerique: 2,
        questionOuverte: 1,
    };

    const result = comparerProfils(profil1, profil2);
    expect(result).toContain("L'examen sélectionné contient 2 choix multiples de plus que la référence.");
    expect(result).toContain("L'examen sélectionné contient 1 vrai faux de moins que la référence.");
});


/**
 * Test : generateVCardContent - génération correcte
 * Vérifie que le contenu d'une carte de visite est généré correctement au format vCard.
 */
test('generateVCardContent - génération correcte', () => {
    const contact = {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        telephonePro: '+33123456789',
        telephonePerso: '+33698765432',
        adressePerso: '1 rue des Lilas;75001;Paris;France',
        lieuTravail: 'Bureau A',
        bureau: '42',
    };

    const expectedContent = `BEGIN:VCARD
NOM Dupont
PRENOM Jean
FN:Jean Dupont
EMAIL:jean.dupont@example.com
TEL;WORK:+33123456789
TEL;HOME:+33698765432
ADR;HOME:1 rue des Lilas;75001;Paris;France
ORG:Bureau A
TEL;WORK:42
END:VCARD`;

    const result = generateVCardContent(contact);
    expect(result.trim()).toBe(expectedContent.trim());
});


/**
 * Test : analyserProfil - profil correct
 * Vérifie que le profil généré à partir d'une liste de questions correspond aux attentes.
 */
test('analyserProfil - profil correct', () => {
    const questions = [
        { type: 'Choix Multiple' },
        { type: 'Vrai/Faux' },
        { type: 'Choix Multiple' },
        { type: 'Mot Manquant' },
        { type: 'Numerique' },
    ];

    const expectedProfile = {
        choixMultiples: 2,  // On a 2 questions de type 'Choix Multiple'
        vraiFaux: 1,        // 1 question de type 'Vrai/Faux'
        correspondance: 0,  // Pas de question de type 'Correspondance'
        motManquant: 1,     // 1 question de type 'Mot Manquant'
        numerique: 1,       // 1 question de type 'Numérique'
        questionOuverte: 0, // Pas de question de type 'Question Ouverte'
    };

    const result = analyserProfil(questions);
    expect(result).toEqual(expectedProfile);
});
