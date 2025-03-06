// app/api/rounds/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Supprimer toutes les données liées au round (en raison des contraintes de clé étrangère)
    await prisma.$transaction([
      prisma.performance.deleteMany({
        where: { roundId: id }
      }),
      prisma.marketShare.deleteMany({
        where: { roundId: id }
      }),
      prisma.hrData.deleteMany({
        where: { roundId: id }
      }),
      prisma.production.deleteMany({
        where: { roundId: id }
      }),
      prisma.financial.deleteMany({
        where: { roundId: id }
      }),
      prisma.round.delete({
        where: { id }
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

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Récupérer le round avec toutes ses données associées
    const round = await prisma.round.findUnique({
      where: { id },
      include: {
        performances: {
          include: {
            equipe: true
          }
        },
        marketShares: {
          include: {
            equipe: true
          }
        },
        hrData: {
          include: {
            equipe: true
          }
        },
        productions: {
          include: {
            equipe: true
          }
        },
        financials: {
          include: {
            equipe: true
          }
        }
      }
    });

    if (!round) {
      return NextResponse.json(
          { error: "Round non trouvé" },
          { status: 404 }
      );
    }

    return NextResponse.json(round);
  } catch (error) {
    console.error("Erreur lors de la récupération du round:", error);
    return NextResponse.json(
        { error: "Erreur serveur lors de la récupération du round" },
        { status: 500 }
    );
  }
}