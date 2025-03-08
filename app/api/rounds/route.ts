import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fonction utilitaire pour convertir les valeurs en nombre
const toFloat = (value: any): number => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

// Fonction utilitaire pour convertir en entier
const toInt = (value: any): number => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const num = parseInt(value, 10);
  return isNaN(num) ? 0 : num;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roundNumber, roundDate, data } = body;

    if (!roundNumber || !roundDate || !data) {
      return NextResponse.json(
          { error: "Données manquantes" },
          { status: 400 }
      );
    }

    // Créer le round
    const round = await prisma.round.create({
      data: {
        numero: roundNumber,
        date: roundDate,
        commentaires: `Round ${roundNumber} importé le ${new Date().toISOString()}`
      }
    });

    // Traiter toutes les équipes
    for (const equipeName of data.equipes) {
      // Vérifier si l'équipe existe, sinon la créer
      let equipe = await prisma.equipe.findUnique({
        where: { nom: equipeName }
      });

      if (!equipe) {
        equipe = await prisma.equipe.create({
          data: {
            nom: equipeName,
            estMonEquipe: equipeName === "Corpo'mate" // Mon équipe est Corpo'mate
          }
        });
      }

      // Trouver les données pour cette équipe
      const performanceData = data.performances.find((p: any) => p.equipe === equipeName);
      const marketShareData = data.marketShares.find((m: any) => m.equipe === equipeName);
      const hrData = data.hrData.find((h: any) => h.equipe === equipeName);
      const productionData = data.productions.find((p: any) => p.equipe === equipeName);
      const financialData = data.financials.find((f: any) => f.equipe === equipeName);

      // Créer les entrées dans la base de données
      if (performanceData) {
        await prisma.performance.create({
          data: {
            equipeId: equipe.id,
            roundId: round.id,
            revenuGlobal: toFloat(performanceData.revenuGlobal),
            beneficeNetGlobal: toFloat(performanceData.beneficeNetGlobal),
            ebitdaGlobal: toFloat(performanceData.ebitdaGlobal),
            ebitGlobal: toFloat(performanceData.ebitGlobal),

            revenuUSA: toFloat(performanceData.revenuUSA),
            beneficeNetUSA: toFloat(performanceData.beneficeNetUSA),
            ebitdaUSA: toFloat(performanceData.ebitdaUSA),
            ebitUSA: toFloat(performanceData.ebitUSA),

            revenuEurope: toFloat(performanceData.revenuEurope),
            beneficeNetEurope: toFloat(performanceData.beneficeNetEurope),
            ebitdaEurope: toFloat(performanceData.ebitdaEurope),
            ebitEurope: toFloat(performanceData.ebitEurope),

            revenuAsie: toFloat(performanceData.revenuAsie),
            beneficeNetAsie: toFloat(performanceData.beneficeNetAsie),
            ebitdaAsie: toFloat(performanceData.ebitdaAsie),
            ebitAsie: toFloat(performanceData.ebitAsie),

            rendementCumulatif: toFloat(performanceData.rendementCumulatif),
            coursAction: toFloat(performanceData.coursAction)
          }
        });
      }

      if (marketShareData) {
        await prisma.marketShare.create({
          data: {
            equipeId: equipe.id,
            roundId: round.id,
            partMarcheGlobal: toFloat(marketShareData.partMarcheGlobal),
            partTechno1Global: toFloat(marketShareData.partTechno1Global),
            partTechno2Global: toFloat(marketShareData.partTechno2Global),
            partTechno3Global: toFloat(marketShareData.partTechno3Global),
            partTechno4Global: toFloat(marketShareData.partTechno4Global),

            partMarcheUSA: toFloat(marketShareData.partMarcheUSA),
            partTechno1USA: toFloat(marketShareData.partTechno1USA),
            partTechno2USA: toFloat(marketShareData.partTechno2USA),
            partTechno3USA: toFloat(marketShareData.partTechno3USA),
            partTechno4USA: toFloat(marketShareData.partTechno4USA),

            partMarcheEurope: toFloat(marketShareData.partMarcheEurope),
            partTechno1Europe: toFloat(marketShareData.partTechno1Europe),
            partTechno2Europe: toFloat(marketShareData.partTechno2Europe),
            partTechno3Europe: toFloat(marketShareData.partTechno3Europe),
            partTechno4Europe: toFloat(marketShareData.partTechno4Europe),

            partMarcheAsie: toFloat(marketShareData.partMarcheAsie),
            partTechno1Asie: toFloat(marketShareData.partTechno1Asie),
            partTechno2Asie: toFloat(marketShareData.partTechno2Asie),
            partTechno3Asie: toFloat(marketShareData.partTechno3Asie),
            partTechno4Asie: toFloat(marketShareData.partTechno4Asie)
          }
        });
      }

      if (hrData) {
        await prisma.hrData.create({
          data: {
            equipeId: equipe.id,
            roundId: round.id,
            employesRD: toInt(hrData.employesRD),
            tauxRotation: toFloat(hrData.tauxRotation),
            budgetFormation: toInt(hrData.budgetFormation),
            salairesMensuels: toInt(hrData.salairesMensuels)
          }
        });
      }

      if (productionData) {
        await prisma.production.create({
          data: {
            equipeId: equipe.id,
            roundId: round.id,
            techno1ProductionUSA: toInt(productionData.techno1ProductionUSA),
            techno2ProductionUSA: toInt(productionData.techno2ProductionUSA),
            techno3ProductionUSA: toInt(productionData.techno3ProductionUSA),
            techno4ProductionUSA: toInt(productionData.techno4ProductionUSA),

            techno1ProductionAsie: toInt(productionData.techno1ProductionAsie),
            techno2ProductionAsie: toInt(productionData.techno2ProductionAsie),
            techno3ProductionAsie: toInt(productionData.techno3ProductionAsie),
            techno4ProductionAsie: toInt(productionData.techno4ProductionAsie),

            capaciteUSA: toFloat(productionData.capaciteUSA),
            capaciteAsie: toFloat(productionData.capaciteAsie),
            couvertureReseau: toFloat(productionData.couvertureReseau)
          }
        });
      }

      if (financialData) {
        await prisma.financial.create({
          data: {
            equipeId: equipe.id,
            roundId: round.id,
            immobilisations: toFloat(financialData.immobilisations),
            stocks: toFloat(financialData.stocks),
            creancesClients: toFloat(financialData.creancesClients),
            tresorerie: toFloat(financialData.tresorerie),
            totalActif: toFloat(financialData.totalActif),

            capitalSocial: toFloat(financialData.capitalSocial),
            primeEmission: toFloat(financialData.primeEmission),
            resultatNet: toFloat(financialData.resultatNet),
            reportNouveau: toFloat(financialData.reportNouveau),
            totalCapitauxPropres: toFloat(financialData.totalCapitauxPropres),

            dettesLongTerme: toFloat(financialData.dettesLongTerme),
            dettesCourtTerme: toFloat(financialData.dettesCourtTerme),
            detteFournisseurs: toFloat(financialData.detteFournisseurs),
            totalDette: toFloat(financialData.totalDette)
          }
        });
      }
    }

    return NextResponse.json({ success: true, roundId: round.id });
  } catch (error) {
    console.error("Erreur lors de l'import des données:", error);
    return NextResponse.json(
        { error: "Erreur serveur lors de l'import des données" },
        { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 1. D'abord, trouvons l'équipe Corpo'Mate peu importe la casse
    const monEquipe = await prisma.equipe.findFirst({
      where: {
        OR: [
          { nom: "Corpo'Mate" },
          { nom: "Corpo'mate" },
          { estMonEquipe: true }
        ]
      }
    });

    if (!monEquipe) {
      console.warn("Équipe Corpo'Mate non trouvée");
    }

    // 2. Récupérer les rounds sans filtrer les relations
    const rounds = await prisma.round.findMany({
      orderBy: {
        numero: 'asc'
      },
      include: {
        performances: true,
        marketShares: true
      }
    });

    // 3. Filtrer manuellement pour trouver les données de l'équipe
    const formattedRounds = rounds.map(round => {
      // Trouver les performances pour mon équipe
      const performance = round.performances.find((p: any) =>
          monEquipe && p.equipeId === monEquipe.id
      );

      // Trouver les parts de marché pour mon équipe
      const marketShare = round.marketShares.find((ms: any) =>
          monEquipe && ms.equipeId === monEquipe.id
      );

      return {
        id: round.id,
        numero: round.numero,
        date: round.date,
        commentaires: round.commentaires,
        performance: performance || null,
        marketShare: marketShare || null
      };
    });

    return NextResponse.json(formattedRounds);
  } catch (error) {
    console.error("Erreur lors de la récupération des rounds:", error);
    return NextResponse.json(
        { error: "Erreur serveur lors de la récupération des rounds" },
        { status: 500 }
    );
  }
}

// Ajout de la méthode DELETE pour supprimer un round
export async function DELETE(request: NextRequest) {
  try {
    // Extraire l'ID du round de l'URL
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const roundId = parts[parts.length - 1];

    if (!roundId) {
      return NextResponse.json(
          { error: "ID du round manquant" },
          { status: 400 }
      );
    }

    // Supprimer d'abord les données liées
    await prisma.$transaction([
      prisma.performance.deleteMany({
        where: { roundId: parseInt(roundId) }
      }),
      prisma.marketShare.deleteMany({
        where: { roundId: parseInt(roundId) }
      }),
      prisma.hrData.deleteMany({
        where: { roundId: parseInt(roundId) }
      }),
      prisma.production.deleteMany({
        where: { roundId: parseInt(roundId) }
      }),
      prisma.financial.deleteMany({
        where: { roundId: parseInt(roundId) }
      }),
      // Enfin, supprimer le round lui-même
      prisma.round.delete({
        where: { id: parseInt(roundId) }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du round:", error);
    return NextResponse.json(
        { error: "Erreur serveur lors de la suppression du round" },
        { status: 500 }
    );
  }
}