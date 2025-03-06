// app/api/hr/route.ts
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

        const hrData = await prisma.hrData.findMany({
            where: whereClause,
            include: {
                equipe: true,
                round: true
            }
        });

        // Transformer les données pour correspondre à l'interface attendue
        const formattedHrData = hrData.map(hr => ({
            id: hr.id,
            equipe: hr.equipe.nom,
            roundId: hr.roundId,
            roundNumero: hr.round.numero,
            employesRD: hr.employesRD,
            tauxRotation: hr.tauxRotation,
            budgetFormation: hr.budgetFormation,
            salairesMensuels: hr.salairesMensuels
        }));

        return NextResponse.json(formattedHrData);
    } catch (error) {
        console.error("Erreur lors de la récupération des données RH:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des données RH" },
            { status: 500 }
        );
    }
}