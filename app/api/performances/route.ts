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

        const performances = await prisma.performance.findMany({
            where: whereClause,
            include: {
                equipe: true,
                round: true
            }
        });

        // Transformer les données pour correspondre à l'interface attendue
        const formattedPerformances = performances.map(perf => ({
            id: perf.id,
            equipe: perf.equipe.nom,
            roundId: perf.roundId,
            roundNumero: perf.round.numero,
            revenuGlobal: perf.revenuGlobal,
            beneficeNetGlobal: perf.beneficeNetGlobal,
            ebitdaGlobal: perf.ebitdaGlobal,
            ebitGlobal: perf.ebitGlobal,
            revenuUSA: perf.revenuUSA,
            beneficeNetUSA: perf.beneficeNetUSA,
            ebitdaUSA: perf.ebitdaUSA,
            ebitUSA: perf.ebitUSA,
            revenuEurope: perf.revenuEurope,
            beneficeNetEurope: perf.beneficeNetEurope,
            ebitdaEurope: perf.ebitdaEurope,
            ebitEurope: perf.ebitEurope,
            revenuAsie: perf.revenuAsie,
            beneficeNetAsie: perf.beneficeNetAsie,
            ebitdaAsie: perf.ebitdaAsie,
            ebitAsie: perf.ebitAsie,
            rendementCumulatif: perf.rendementCumulatif,
            coursAction: perf.coursAction
        }));

        return NextResponse.json(formattedPerformances);
    } catch (error) {
        console.error("Erreur lors de la récupération des performances:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des performances" },
            { status: 500 }
        );
    }
}