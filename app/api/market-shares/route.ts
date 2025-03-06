// app/api/market-shares/route.ts
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

        const marketShares = await prisma.marketShare.findMany({
            where: whereClause,
            include: {
                equipe: true,
                round: true
            }
        });

        // Transformer les données pour correspondre à l'interface attendue
        const formattedMarketShares = marketShares.map(share => ({
            id: share.id,
            equipe: share.equipe.nom,
            roundId: share.roundId,
            roundNumero: share.round.numero,
            // Global
            partMarcheGlobal: share.partMarcheGlobal,
            partTechno1Global: share.partTechno1Global,
            partTechno2Global: share.partTechno2Global,
            partTechno3Global: share.partTechno3Global,
            partTechno4Global: share.partTechno4Global,

            // USA
            partMarcheUSA: share.partMarcheUSA,
            partTechno1USA: share.partTechno1USA,
            partTechno2USA: share.partTechno2USA,
            partTechno3USA: share.partTechno3USA,
            partTechno4USA: share.partTechno4USA,

            // Europe
            partMarcheEurope: share.partMarcheEurope,
            partTechno1Europe: share.partTechno1Europe,
            partTechno2Europe: share.partTechno2Europe,
            partTechno3Europe: share.partTechno3Europe,
            partTechno4Europe: share.partTechno4Europe,

            // Asie
            partMarcheAsie: share.partMarcheAsie,
            partTechno1Asie: share.partTechno1Asie,
            partTechno2Asie: share.partTechno2Asie,
            partTechno3Asie: share.partTechno3Asie,
            partTechno4Asie: share.partTechno4Asie
        }));

        return NextResponse.json(formattedMarketShares);
    } catch (error) {
        console.error("Erreur lors de la récupération des parts de marché:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des parts de marché" },
            { status: 500 }
        );
    }
}