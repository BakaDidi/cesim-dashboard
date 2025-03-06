// app/api/equipes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const equipes = await prisma.equipe.findMany({
            orderBy: [
                { estMonEquipe: 'desc' }, // Mon équipe en premier
                { nom: 'asc' } // Puis par ordre alphabétique
            ]
        });

        return NextResponse.json(equipes);
    } catch (error) {
        console.error("Erreur lors de la récupération des équipes:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération des équipes" },
            { status: 500 }
        );
    }
}