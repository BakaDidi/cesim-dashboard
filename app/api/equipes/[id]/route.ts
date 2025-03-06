// app/api/equipes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        const equipe = await prisma.equipe.findUnique({
            where: { id }
        });

        if (!equipe) {
            return NextResponse.json(
                { error: "Équipe non trouvée" },
                { status: 404 }
            );
        }

        return NextResponse.json(equipe);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'équipe:", error);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération de l'équipe" },
            { status: 500 }
        );
    }
}