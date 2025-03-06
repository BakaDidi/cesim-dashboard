// lib/excel-parser.ts
import * as XLSX from 'xlsx';

interface RoundData {
    equipes: string[];
    performances: any[];
    marketShares: any[];
    hrData: any[];
    productions: any[];
    financials: any[];
    logs: string[]; // Logs pour le débogage
}

export async function parseExcelRound(fileData: Uint8Array): Promise<RoundData> {
    // Collection de logs dans un tableau
    const logs: string[] = [];

    // Fonction pour ajouter des logs
    const log = (message: string) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        logs.push(logMessage);
        console.log(message);
    };

    log("=== DÉBUT PARSING EXCEL ===");

    // Charger le workbook
    const workbook = XLSX.read(fileData, {
        cellStyles: true,
        cellFormulas: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true
    });

    // Vérifier que le fichier a au moins une feuille
    if (workbook.SheetNames.length === 0) {
        log("ERREUR: Le fichier Excel ne contient aucune feuille");
        throw new Error("Le fichier Excel ne contient aucune feuille");
    }

    // Utiliser la première feuille (généralement "Results")
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    log(`Utilisation de la feuille: ${sheetName}`);

    // Extraire les équipes (noms des colonnes)
    const equipes = [];
    for (let col = 1; col <= 10; col++) { // Supposons jusqu'à 10 équipes
        const cellRef = XLSX.utils.encode_cell({ r: 2, c: col });
        const cell = sheet[cellRef];
        if (cell && cell.v) {
            equipes.push(cell.v.toString());
            log(`Équipe trouvée: ${cell.v.toString()} (colonne ${col})`);
        }
    }

    if (equipes.length === 0) {
        log("ERREUR: Aucune équipe n'a été trouvée dans le fichier");
        throw new Error("Aucune équipe n'a été trouvée dans le fichier");
    }

    log(`Total équipes trouvées: ${equipes.length}`);

    // Fonction pour extraire une valeur de cellule
    const getCellValue = (row: number, col: number) => {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        return sheet[cellRef] ? sheet[cellRef].v : null;
    };

    // Fonction pour chercher une cellule contenant un texte spécifique
    const findRowWithText = (startRow: number, endRow: number, text: string): number => {
        for (let row = startRow; row <= endRow; row++) {
            const cellValue = getCellValue(row, 0);
            if (cellValue && typeof cellValue === 'string' && cellValue.toLowerCase().includes(text.toLowerCase())) {
                log(`Texte "${text}" trouvé à la ligne ${row}`);
                return row;
            }
        }
        log(`Texte "${text}" NON trouvé entre les lignes ${startRow} et ${endRow}`);
        return -1; // Non trouvé
    };

    // Positions des données financières principales
    // Global
    const chiffreAffairesGlobalRow = 3; // Position fixe d'après l'analyse
    const ebitdaGlobalRow = 16; // Position fixe d'après l'analyse
    const ebitGlobalRow = 19; // Position fixe d'après l'analyse
    const beneficeNetGlobalRow = 25; // Position fixe d'après l'analyse

    // USA - Trouvé dans le fichier
    const chiffreAffairesUSARow = 63; // Ligne "Chiffre d'affaires total" trouvée dans l'analyse
    const ebitdaUSARow = 77; // Position trouvée dans l'analyse
    const ebitUSARow = 80; // Position trouvée dans l'analyse
    const beneficeNetUSARow = 104; // Position trouvée par l'analyse

    // Europe - Trouvé dans le fichier
    const chiffreAffairesEuropeRow = 215; // Ligne "Chiffre d'affaires" trouvée dans l'analyse
    const ebitdaEuropeRow = 136; // À ajuster
    const ebitEuropeRow = 139; // À ajuster
    const beneficeNetEuropeRow = 253; // Position exacte trouvée par l'analyse

    // Asie
    const chiffreAffairesAsieRow = 157; // Ligne "Chiffre d'affaires total" trouvée dans l'analyse
    const ebitdaAsieRow = 175; // À ajuster
    const ebitAsieRow = 178; // À ajuster
    const beneficeNetAsieRow = 185; // À ajuster

    // Positions des données RH trouvées précisément dans l'analyse
    const salaireMensuelRow = 598;      // Ligne "Salaire mensuel, USD"
    const budgetFormationRow = 599;     // Ligne "Budget Formation mensuel, USD"
    const nombrePersonnelRDRow = 601;   // Ligne "Nombre de personnel en R&D"
    const tauxRotationRow = 602;        // Ligne "Départs volontaires du personnel, %"
    const joursHommeRow = 604;          // Ligne "Allocation de Jours-homme, %"
    const coeffProductiviteRow = 606;   // Ligne "Coefficient de productivité"

    // Positions exactes des données du bilan global d'après l'analyse
    const immobilisationsRow = 32;      // Immobilisations (Actif)
    const stocksRow = 33;               // Stocks (Actif)
    const creancesClientsRow = 34;      // Créances clients (Actif)
    const tresoreireRow = 35;           // Trésorerie et équivalents (Actif)
    const totalActifRow = 36;           // Total Actif

    const capitalSocialRow = 40;        // Capital social (Capitaux propres)
    const primeEmissionRow = 41;        // Prime d'émission (Capitaux propres)
    const resultatNetRow = 42;          // Résultat net annuel (Capitaux propres)
    const reportNouveauRow = 43;        // Report à nouveau (Capitaux propres)
    const totalCapitauxPropresRow = 44; // Total des capitaux propres

    const dettesLongTermeRow = 47;      // Dettes à long terme (Dette)
    const dettesCourtTermeRow = 48;     // Dettes à court terme (Dette)
    const detteFournisseursRow = 49;    // Dette fournisseurs (Dette)
    const totalDetteRow = 50;           // Total Dette
    const totalPassifRow = 52;          // Total Passif

    // Positions des données de production (positions corrigées d'après l'analyse)
    const techno1ProductionUSARow = 444;      // Tech 1 Production interne USA
    const techno2ProductionUSARow = 445;      // Tech 2 Production interne USA
    const techno3ProductionUSARow = 446;      // Tech 3 Production interne USA
    const techno4ProductionUSARow = 447;      // Tech 4 Production interne USA

    const techno1ProductionAsieRow = 450;     // Tech 1 Production interne Asie
    const techno2ProductionAsieRow = 451;     // Tech 2 Production interne Asie
    const techno3ProductionAsieRow = 452;     // Tech 3 Production interne Asie
    const techno4ProductionAsieRow = 453;     // Tech 4 Production interne Asie

    const usinesUSARow = 511;                 // Nombre d'usines USA ce tour
    const usinesAsieRow = 520;                // Nombre d'usines Asie ce tour

    log("\n--- EXTRACTION DES PERFORMANCES ---");
    // Extraire les données de performances avec les nouvelles positions identifiées
    const performances = equipes.map((equipe, index) => {
        const colIndex = index + 1; // Les équipes commencent à la colonne B (index 1)

        // Extraire les valeurs
        const revenuGlobal = getCellValue(chiffreAffairesGlobalRow, colIndex);
        const beneficeNetGlobal = getCellValue(beneficeNetGlobalRow, colIndex);
        const ebitdaGlobal = getCellValue(ebitdaGlobalRow, colIndex);
        const ebitGlobal = getCellValue(ebitGlobalRow, colIndex);

        const revenuUSA = getCellValue(chiffreAffairesUSARow, colIndex);
        const beneficeNetUSA = getCellValue(beneficeNetUSARow, colIndex);
        const ebitdaUSA = getCellValue(ebitdaUSARow, colIndex);
        const ebitUSA = getCellValue(ebitUSARow, colIndex);

        const revenuEurope = getCellValue(chiffreAffairesEuropeRow, colIndex);
        const beneficeNetEurope = getCellValue(beneficeNetEuropeRow, colIndex);
        const ebitdaEurope = getCellValue(ebitdaEuropeRow, colIndex);
        const ebitEurope = getCellValue(ebitEuropeRow, colIndex);

        const revenuAsie = getCellValue(chiffreAffairesAsieRow, colIndex);
        const beneficeNetAsie = getCellValue(beneficeNetAsieRow, colIndex);
        const ebitdaAsie = getCellValue(ebitdaAsieRow, colIndex);
        const ebitAsie = getCellValue(ebitAsieRow, colIndex);

        const rendementCumulatif = getCellValue(202, colIndex) || 0;
        const coursAction = getCellValue(203, colIndex) || 0;

        // Logs des valeurs clés
        log(`\nÉquipe: ${equipe}`);
        log(`  Revenu Global: ${revenuGlobal}`);
        log(`  Bénéfice Net Global: ${beneficeNetGlobal}`);
        log(`  Revenu Europe: ${revenuEurope}`);
        log(`  Bénéfice Net Europe: ${beneficeNetEurope}`);
        log(`  Revenu USA: ${revenuUSA}`);
        log(`  Bénéfice Net USA: ${beneficeNetUSA}`);
        log(`  Revenu Asie: ${revenuAsie}`);
        log(`  Bénéfice Net Asie: ${beneficeNetAsie}`);

        return {
            equipe,
            // Global
            revenuGlobal,
            beneficeNetGlobal,
            ebitdaGlobal,
            ebitGlobal,

            // USA
            revenuUSA,
            beneficeNetUSA,
            ebitdaUSA,
            ebitUSA,

            // Europe
            revenuEurope,
            beneficeNetEurope,
            ebitdaEurope,
            ebitEurope,

            // Asie
            revenuAsie,
            beneficeNetAsie,
            ebitdaAsie,
            ebitAsie,

            // Rendement
            rendementCumulatif,
            coursAction
        };
    });

    log("\n--- EXTRACTION DES PARTS DE MARCHÉ ---");
    // Extraire les parts de marché (CORRIGÉ)
    const marketShares = equipes.map((equipe, index) => {
        const colIndex = index + 1;

        // Extraire les valeurs
        const partMarcheGlobal = getCellValue(298, colIndex);
        const partTechno1Global = getCellValue(300, colIndex);
        const partMarcheUSA = getCellValue(342, colIndex);
        const partTechno1USA = getCellValue(344, colIndex);
        const partMarcheEurope = getCellValue(430, colIndex);
        const partTechno1Europe = getCellValue(432, colIndex);
        const partMarcheAsie = getCellValue(386, colIndex);
        const partTechno1Asie = getCellValue(388, colIndex);

        // Logs des valeurs clés
        log(`\nÉquipe: ${equipe}`);
        log(`  Part de marché Global: ${partMarcheGlobal}`);
        log(`  Part de marché USA: ${partMarcheUSA}`);
        log(`  Part de marché Europe: ${partMarcheEurope}`);
        log(`  Part de marché Asie: ${partMarcheAsie}`);

        return {
            equipe,
            // Global
            partMarcheGlobal,
            partTechno1Global,
            partTechno2Global: getCellValue(301, colIndex) || 0,
            partTechno3Global: getCellValue(302, colIndex) || 0,
            partTechno4Global: getCellValue(303, colIndex) || 0,

            // USA
            partMarcheUSA,
            partTechno1USA,
            partTechno2USA: getCellValue(345, colIndex) || 0,
            partTechno3USA: getCellValue(346, colIndex) || 0,
            partTechno4USA: getCellValue(347, colIndex) || 0,

            // Europe - Attention: inversion Europe/Asie dans le fichier Excel!
            partMarcheEurope,
            partTechno1Europe,
            partTechno2Europe: getCellValue(433, colIndex) || 0,
            partTechno3Europe: getCellValue(434, colIndex) || 0,
            partTechno4Europe: getCellValue(435, colIndex) || 0,

            // Asie - Attention: inversion Europe/Asie dans le fichier Excel!
            partMarcheAsie,
            partTechno1Asie,
            partTechno2Asie: getCellValue(389, colIndex) || 0,
            partTechno3Asie: getCellValue(390, colIndex) || 0,
            partTechno4Asie: getCellValue(391, colIndex) || 0
        };
    });

    log("\n--- EXTRACTION DES DONNÉES RH ---");
    // Extraire les données RH avec les positions exactes trouvées
    const hrData = equipes.map((equipe, index) => {
        const colIndex = index + 1;

        // Extraire les valeurs des positions exactes
        const employesRD = getCellValue(nombrePersonnelRDRow, colIndex) || 0;
        const tauxRotation = getCellValue(tauxRotationRow, colIndex) || 0;
        const budgetFormation = getCellValue(budgetFormationRow, colIndex) || 0;
        const salairesMensuels = getCellValue(salaireMensuelRow, colIndex) || 0;
        const joursHomme = getCellValue(joursHommeRow, colIndex) || 0;
        const coeffProductivite = getCellValue(coeffProductiviteRow, colIndex) || 0;

        // Logs
        log(`\nÉquipe: ${equipe}`);
        log(`  Nombre de personnel en R&D: ${employesRD}`);
        log(`  Départs volontaires du personnel, %: ${tauxRotation}`);
        log(`  Budget Formation mensuel, USD: ${budgetFormation}`);
        log(`  Salaire mensuel, USD: ${salairesMensuels}`);
        log(`  Allocation de Jours-homme, %: ${joursHomme}`);
        log(`  Coefficient de productivité: ${coeffProductivite}`);

        return {
            equipe,
            employesRD,
            tauxRotation,
            budgetFormation,
            salairesMensuels,
            joursHomme,
            coeffProductivite
        };
    });

    log("\n--- EXTRACTION DES DONNÉES DE PRODUCTION ---");
    // Extraire les données de production avec les positions corrigées
    const productions = equipes.map((equipe, index) => {
        const colIndex = index + 1;

        // Extraire les valeurs de production
        const techno1ProductionUSA = getCellValue(techno1ProductionUSARow, colIndex) || 0;
        const techno2ProductionUSA = getCellValue(techno2ProductionUSARow, colIndex) || 0;
        const techno3ProductionUSA = getCellValue(techno3ProductionUSARow, colIndex) || 0;
        const techno4ProductionUSA = getCellValue(techno4ProductionUSARow, colIndex) || 0;

        const techno1ProductionAsie = getCellValue(techno1ProductionAsieRow, colIndex) || 0;
        const techno2ProductionAsie = getCellValue(techno2ProductionAsieRow, colIndex) || 0;
        const techno3ProductionAsie = getCellValue(techno3ProductionAsieRow, colIndex) || 0;
        const techno4ProductionAsie = getCellValue(techno4ProductionAsieRow, colIndex) || 0;

        // Extraire les nombres d'usines
        const usinesUSA = getCellValue(usinesUSARow, colIndex) || 0;
        const usinesAsie = getCellValue(usinesAsieRow, colIndex) || 0;

        // Utilisation capacité, basée sur l'image du tableau
        const capaciteUSA = 19; // Valeur estimée d'après le tableau - ajuster selon besoin
        const capaciteAsie = 0;  // Valeur estimée d'après le tableau - ajuster selon besoin
        const couvertureReseau = 0; // Valeur à déterminer dans le fichier

        // Logs
        log(`\nÉquipe: ${equipe}`);
        log(`  Production Tech1 USA: ${techno1ProductionUSA}`);
        log(`  Production Tech2 USA: ${techno2ProductionUSA}`);
        log(`  Production Tech1 Asie: ${techno1ProductionAsie}`);
        log(`  Production Tech2 Asie: ${techno2ProductionAsie}`);
        log(`  Nombre d'usines USA: ${usinesUSA}`);
        log(`  Nombre d'usines Asie: ${usinesAsie}`);

        return {
            equipe,
            // Production USA
            techno1ProductionUSA,
            techno2ProductionUSA,
            techno3ProductionUSA,
            techno4ProductionUSA,

            // Production Asie
            techno1ProductionAsie,
            techno2ProductionAsie,
            techno3ProductionAsie,
            techno4ProductionAsie,

            // Usines
            usinesUSA,
            usinesAsie,

            // Capacité
            capaciteUSA,
            capaciteAsie,

            // Couverture réseau
            couvertureReseau
        };
    });

    log("\n--- EXTRACTION DES DONNÉES FINANCIÈRES ---");
    // Extraire les données financières avec les positions exactes
    const financials = equipes.map((equipe, index) => {
        const colIndex = index + 1;

        // Extraire les valeurs du bilan global
        const immobilisations = getCellValue(immobilisationsRow, colIndex) || 0;
        const stocks = getCellValue(stocksRow, colIndex) || 0;
        const creancesClients = getCellValue(creancesClientsRow, colIndex) || 0;
        const tresorerie = getCellValue(tresoreireRow, colIndex) || 0;
        const totalActif = getCellValue(totalActifRow, colIndex) || 0;

        const capitalSocial = getCellValue(capitalSocialRow, colIndex) || 0;
        const primeEmission = getCellValue(primeEmissionRow, colIndex) || 0;
        const resultatNet = getCellValue(resultatNetRow, colIndex) || 0;
        const reportNouveau = getCellValue(reportNouveauRow, colIndex) || 0;
        const totalCapitauxPropres = getCellValue(totalCapitauxPropresRow, colIndex) || 0;

        const dettesLongTerme = getCellValue(dettesLongTermeRow, colIndex) || 0;
        const dettesCourtTerme = getCellValue(dettesCourtTermeRow, colIndex) || 0;
        const detteFournisseurs = getCellValue(detteFournisseursRow, colIndex) || 0;
        const totalDette = getCellValue(totalDetteRow, colIndex) || 0;
        const totalPassif = getCellValue(totalPassifRow, colIndex) || 0;

        // Logs
        log(`\nÉquipe: ${equipe}`);
        log(`  ACTIF:`);
        log(`    Immobilisations: ${immobilisations}`);
        log(`    Stocks: ${stocks}`);
        log(`    Créances clients: ${creancesClients}`);
        log(`    Trésorerie: ${tresorerie}`);
        log(`    Total Actif: ${totalActif}`);
        log(`  PASSIF:`);
        log(`    Capital social: ${capitalSocial}`);
        log(`    Prime d'émission: ${primeEmission}`);
        log(`    Résultat net annuel: ${resultatNet}`);
        log(`    Report à nouveau: ${reportNouveau}`);
        log(`    Total des capitaux propres: ${totalCapitauxPropres}`);
        log(`    Dettes à long terme: ${dettesLongTerme}`);
        log(`    Dettes à court terme: ${dettesCourtTerme}`);
        log(`    Dette fournisseurs: ${detteFournisseurs}`);
        log(`    Total Dette: ${totalDette}`);
        log(`    Total Passif: ${totalPassif}`);

        return {
            equipe,
            // Bilan Global - Actif
            immobilisations,
            stocks,
            creancesClients,
            tresorerie,
            totalActif,

            // Bilan Global - Passif (Capitaux Propres)
            capitalSocial,
            primeEmission,
            resultatNet,
            reportNouveau,
            totalCapitauxPropres,

            // Bilan Global - Passif (Dettes)
            dettesLongTerme,
            dettesCourtTerme,
            detteFournisseurs,
            totalDette,
            totalPassif
        };
    });

    log("=== FIN PARSING EXCEL ===");

    // Retourner tous les résultats, y compris les logs
    return {
        equipes,
        performances,
        marketShares,
        hrData,
        productions,
        financials,
        logs // Inclut les logs dans le retour
    };
}