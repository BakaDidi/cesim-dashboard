// app/api/financials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const roundId = searchParams.get('roundId');
        const equipeName = searchParams.get('equipe');

        let whereClause: any = {};

        if (roundId) {
            whereClause.roundId = parseInt(roundId);
        }

        if (equipeName) {
            const equipe = await prisma.equipe.findUnique({
                where: { nom: equipeName }
            });

            if (equipe) {
                whereClause.equipeId = equipe.id;
            } else {
                return NextResponse.json([], { status: 200 });
            }
        }

        const financials = await prisma.financial.findMany({
            where: whereClause,
            include: {
                equipe: true,
                round: true
            }
        });

        // Transformer les données pour correspondre à l'interface attendue
        const formattedFinancials = financials.map(financial => ({
            id: financial.id,
            equipe: financial.equipe.nom,
            roundId: financial.roundId,
            roundNumero: financial.round.numero,

            // Bilan Global - Actif
            immobilisations: financial.immobilisations,
            stocks: financial.stocks,
            creancesClients: financial.creancesClients,
            tresorerie: financial.tresorerie,
            totalActif: financial.totalActif,

            // Bilan Global - Passif (Capitaux Propres)
            capitalSocial: financial.capitalSocial,
            primeEmission: financial.primeEmission,
            resultatNet: financial.resultatNet,
            reportNouveau: financial.reportNouveau,
            totalCapitauxPropres: financial.totalCapitauxPropres,

            // Bilan Global - Passif (Dettes)
            dettesLongTerme: financial.dettesLongTerme,
            dettesCourtTerme: financial.dettesCourtTerme,
            detteFournisseurs: financial.detteFournisseurs,
            totalDette: financial.totalDette
        }));

        return NextResponse.json(formattedFinancials);
    } catch (error) {
        console.error("Erreur lors de la récupération des données financières:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des données financières" },
            { status: 500 }
        );
    }
}