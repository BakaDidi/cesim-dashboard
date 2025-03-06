"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoundsTable } from "@/components/RoundsTable";
import { PerformanceChart } from "@/components/PerformanceChart";
import { MarketShareChart } from "@/components/MarketShareChart";
import { FinancialMetrics } from "@/components/FinancialMetrics";
import { HrMetrics } from "@/components/HrMetrics";
import { ProductionMetrics } from "@/components/ProductionMetrics";
import { DashboardOverview } from "@/components/DashboardOverview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function DashboardPage() {
    const [rounds, setRounds] = useState([]);
    const [equipes, setEquipes] = useState([]);
    const [selectedEquipe, setSelectedEquipe] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Charger les rounds
                const roundsResponse = await fetch("/api/rounds");
                const roundsData = await roundsResponse.json();
                setRounds(roundsData);

                // Charger les équipes
                const equipesResponse = await fetch("/api/equipes");
                const equipesData = await equipesResponse.json();
                setEquipes(equipesData);

                // Définir l'équipe par défaut (mon équipe)
                const monEquipe = equipesData.find(e => e.estMonEquipe);
                if (monEquipe) {
                    setSelectedEquipe(monEquipe.id.toString());
                } else if (equipesData.length > 0) {
                    setSelectedEquipe(equipesData[0].id.toString());
                }
            } catch (error) {
                console.error("Erreur lors du chargement des données initiales:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard CESIM</h1>
                <div className="flex items-center gap-4">
                    <span>Équipe:</span>
                    <Select
                        value={selectedEquipe}
                        onValueChange={setSelectedEquipe}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sélectionner une équipe" />
                        </SelectTrigger>
                        <SelectContent>
                            {equipes.map((equipe) => (
                                <SelectItem
                                    key={equipe.id}
                                    value={equipe.id.toString()}
                                    className={equipe.estMonEquipe ? "font-bold" : ""}
                                >
                                    {equipe.nom} {equipe.estMonEquipe ? "(Ma team)" : ""}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                    <TabsTrigger value="performance">Performances</TabsTrigger>
                    <TabsTrigger value="market">Parts de marché</TabsTrigger>
                    <TabsTrigger value="production">Production</TabsTrigger>
                    <TabsTrigger value="financial">Finances</TabsTrigger>
                    <TabsTrigger value="hr">Ressources Humaines</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 pt-4">
                    {selectedEquipe && (
                        <DashboardOverview equipeId={selectedEquipe} />
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Rounds</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RoundsTable />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="performance" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Détails des Performances</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedEquipe && (
                                <PerformanceChart equipeId={selectedEquipe} detailed={true} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="market" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analyse des Parts de Marché</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedEquipe && (
                                <MarketShareChart equipeId={selectedEquipe} detailed={true} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="production" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Métriques de Production</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedEquipe && (
                                <ProductionMetrics equipeId={selectedEquipe} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="financial" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Métriques Financières</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedEquipe && (
                                <FinancialMetrics equipeId={selectedEquipe} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hr" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Métriques RH</CardTitle>
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