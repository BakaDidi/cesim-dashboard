"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PerformanceChart } from "@/components/PerformanceChart";
import { MarketShareChart } from "@/components/MarketShareChart";
import { FinancialMetrics } from "@/components/FinancialMetrics";
import { HrMetrics } from "@/components/HrMetrics";
import { ArrowLeft } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Round {
    id: number;
    numero: number;
    date: string;
    commentaires: string;
}

export default function RoundDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [round, setRound] = useState<Round | null>(null);
    const [equipes, setEquipes] = useState([]);
    const [selectedEquipe, setSelectedEquipe] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Charger les détails du round
                const roundResponse = await fetch(`/api/rounds/${params.id}`);
                if (!roundResponse.ok) {
                    throw new Error("Impossible de charger les détails du round");
                }
                const roundData = await roundResponse.json();
                setRound(roundData);

                // Charger les équipes
                const equipesResponse = await fetch("/api/equipes");
                const equipesData = await equipesResponse.json();
                setEquipes(equipesData);

                // Définir l'équipe par défaut (mon équipe)
                const monEquipe = equipesData.find((e: { estMonEquipe: any; }) => e.estMonEquipe);
                if (monEquipe) {
                    setSelectedEquipe(monEquipe.id.toString());
                } else if (equipesData.length > 0) {
                    setSelectedEquipe(equipesData[0].id.toString());
                }
            } catch (error) {
                console.error("Erreur lors du chargement des données:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.id]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!round) {
        return (
            <div className="flex flex-col items-center justify-center p-10">
                <h1 className="text-2xl font-bold mb-4">Round non trouvé</h1>
                <Button onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour au dashboard
                </Button>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                    </Button>
                    <h1 className="text-3xl font-bold">Round {round.numero}</h1>
                    <p className="text-muted-foreground">{formatDate(round.date)}</p>
                    {round.commentaires && (
                        <p className="mt-2">{round.commentaires}</p>
                    )}
                </div>
            </div>

            <Tabs defaultValue="performance">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="performance">Performances</TabsTrigger>
                    <TabsTrigger value="market">Parts de marché</TabsTrigger>
                    <TabsTrigger value="financial">Finances</TabsTrigger>
                    <TabsTrigger value="hr">Ressources Humaines</TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performances du Round {round.numero}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedEquipe && (
                                <PerformanceChart equipeId={selectedEquipe} detailed />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="market" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Parts de Marché du Round {round.numero}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedEquipe && (
                                <MarketShareChart equipeId={selectedEquipe} detailed />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="financial" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Finances du Round {round.numero}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedEquipe && (
                                <FinancialMetrics equipeId={selectedEquipe} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hr" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ressources Humaines du Round {round.numero}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedEquipe && (
                                <HrMetrics equipeId={selectedEquipe} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}