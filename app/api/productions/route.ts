// app/api/productions/route.ts
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

        const productions = await prisma.production.findMany({
            where: whereClause,
            include: {
                equipe: true,
                round: true
            }
        });

        // Transformer les données pour correspondre à l'interface attendue
        const formattedProductions = productions.map(prod => ({
            id: prod.id,
            equipe: prod.equipe.nom,
            roundId: prod.roundId,
            roundNumero: prod.round.numero,

            // Production USA
            techno1ProductionUSA: prod.techno1ProductionUSA,
            techno2ProductionUSA: prod.techno2ProductionUSA,
            techno3ProductionUSA: prod.techno3ProductionUSA,
            techno4ProductionUSA: prod.techno4ProductionUSA,

            // Production Asie
            techno1ProductionAsie: prod.techno1ProductionAsie,
            techno2ProductionAsie: prod.techno2ProductionAsie,
            techno3ProductionAsie: prod.techno3ProductionAsie,
            techno4ProductionAsie: prod.techno4ProductionAsie,

            // Capacité
            capaciteUSA: prod.capaciteUSA,
            capaciteAsie: prod.capaciteAsie,

            // Couverture réseau
            couvertureReseau: prod.couvertureReseau
        }));

        return NextResponse.json(formattedProductions);
    } catch (error) {
        console.error("Erreur lors de la récupération des données de production:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des données de production" },
            { status: 500 }
        );
    }
}