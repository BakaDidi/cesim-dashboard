"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PerformanceComparison } from "@/components/comparison/PerformanceComparison";
import { MarketShareComparison } from "@/components/comparison/MarketShareComparison";
import { ProductionComparison } from "@/components/comparison/ProductionComparison";
import { FinancialComparison } from "@/components/comparison/FinancialComparison";
import { HrComparison } from "@/components/comparison/HrComparison";
import { RankingTable } from "@/components/comparison/RankingTable";
import { Equipe } from "@/types/types";

export default function ComparePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [activeTab, setActiveTab] = useState("performances");

    useEffect(() => {
        const fetchEquipes = async () => {
            try {
                const response = await fetch("/api/equipes");
                const data = await response.json();
                setEquipes(data);
            } catch (error) {
                console.error("Erreur lors du chargement des équipes:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEquipes();
    }, []);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full space-y-6">
            <h1 className="text-2xl font-bold mb-4">Comparaison des équipes</h1>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="performances">Performances</TabsTrigger>
                    <TabsTrigger value="marketShare">Parts de marché</TabsTrigger>
                    <TabsTrigger value="production">Production</TabsTrigger>
                    <TabsTrigger value="financials">Finances</TabsTrigger>
                    <TabsTrigger value="hr">RH</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Classement des équipes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RankingTable
                                equipes={equipes}
                                category={activeTab}
                            />
                        </CardContent>
                    </Card>
                </div>

                <TabsContent value="performances" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Comparaison des performances</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PerformanceComparison equipes={equipes} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="marketShare" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Comparaison des parts de marché</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MarketShareComparison equipes={equipes} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="production" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Comparaison de la production</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProductionComparison equipes={equipes} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="financials" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Comparaison des finances</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FinancialComparison equipes={equipes} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hr" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Comparaison des données RH</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <HrComparison equipes={equipes} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}