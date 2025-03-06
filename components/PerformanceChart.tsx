"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Performance {
    id: number;
    equipe: string;
    roundId: number;
    roundNumero: number;
    revenuGlobal: number;
    beneficeNetGlobal: number;
    ebitdaGlobal: number;
    ebitGlobal: number;
    revenuUSA: number;
    beneficeNetUSA: number;
    ebitdaUSA: number;
    ebitUSA: number;
    revenuEurope: number;
    beneficeNetEurope: number;
    ebitdaEurope: number;
    ebitEurope: number;
    revenuAsie: number;
    beneficeNetAsie: number;
    ebitdaAsie: number;
    ebitAsie: number;
    rendementCumulatif: number;
    coursAction: number;
}

interface PerformanceChartProps {
    equipeId: string;
    detailed?: boolean;
}

export function PerformanceChart({ equipeId, detailed = false }: PerformanceChartProps) {
    const [performances, setPerformances] = useState<Performance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [region, setRegion] = useState("global");

    useEffect(() => {
        const fetchPerformances = async () => {
            if (!equipeId) return;

            setIsLoading(true);
            try {
                // Récupérer l'équipe
                const equipeResponse = await fetch(`/api/equipes/${equipeId}`);
                const equipe = await equipeResponse.json();

                if (!equipe) return;

                // Récupérer tous les rounds
                const roundsResponse = await fetch("/api/rounds");
                const rounds = await roundsResponse.json();

                if (!rounds || rounds.length === 0) {
                    setIsLoading(false);
                    return;
                }

                // Pour chaque round, récupérer les performances de l'équipe
                const performancesData = await Promise.all(
                    rounds.map(async (round) => {
                        const response = await fetch(`/api/performances?roundId=${round.id}&equipe=${equipe.nom}`);
                        const data = await response.json();
                        return data.length > 0 ? data[0] : null;
                    })
                );

                // Filtrer les performances nulles et trier par numéro de round
                const filteredPerformances = performancesData
                    .filter(p => p !== null)
                    .sort((a, b) => a.roundNumero - b.roundNumero);

                setPerformances(filteredPerformances);
            } catch (error) {
                console.error("Erreur lors de la récupération des performances:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPerformances();
    }, [equipeId]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

    const prepareChartData = () => {
        return performances.map(p => ({
            round: `Round ${p.roundNumero}`,
            revenu: getRevenueByRegion(p, region),
            benefice: getProfitByRegion(p, region),
            ebitda: getEbitdaByRegion(p, region),
            coursAction: p.coursAction
        }));
    };

    const getRevenueByRegion = (performance: Performance, region: string) => {
        switch (region) {
            case "usa": return performance.revenuUSA;
            case "europe": return performance.revenuEurope;
            case "asie": return performance.revenuAsie;
            default: return performance.revenuGlobal;
        }
    };

    const getProfitByRegion = (performance: Performance, region: string) => {
        switch (region) {
            case "usa": return performance.beneficeNetUSA;
            case "europe": return performance.beneficeNetEurope;
            case "asie": return performance.beneficeNetAsie;
            default: return performance.beneficeNetGlobal;
        }
    };

    const getEbitdaByRegion = (performance: Performance, region: string) => {
        switch (region) {
            case "usa": return performance.ebitdaUSA;
            case "europe": return performance.ebitdaEurope;
            case "asie": return performance.ebitdaAsie;
            default: return performance.ebitdaGlobal;
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (performances.length === 0) {
        return <div className="text-center p-4">Aucune donnée de performance disponible.</div>;
    }

    const chartData = prepareChartData();

    return (
        <div className="space-y-4">
            <Tabs value={region} onValueChange={setRegion}>
                <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="global">Global</TabsTrigger>
                    <TabsTrigger value="usa">USA</TabsTrigger>
                    <TabsTrigger value="europe">Europe</TabsTrigger>
                    <TabsTrigger value="asie">Asie</TabsTrigger>
                </TabsList>
            </Tabs>

            {detailed ? (
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Revenus par round - {region.toUpperCase()}</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="round" />
                                        <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                        <Legend />
                                        <Bar dataKey="revenu" name="Revenus" fill="#4f46e5" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Bénéfices par round - {region.toUpperCase()}</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="round" />
                                        <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                        <Legend />
                                        <Bar dataKey="benefice" name="Bénéfice Net" fill="#22c55e" />
                                        <Bar dataKey="ebitda" name="EBITDA" fill="#6366f1" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Cours de l'action</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="round" />
                                        <YAxis domain={['auto', 'auto']} />
                                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                        <Legend />
                                        <Line type="monotone" dataKey="coursAction" name="Cours Action" stroke="#f97316" strokeWidth={2} dot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="round" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="revenu" name="Revenus" stroke="#4f46e5" activeDot={{ r: 8 }} />
                        <Line yAxisId="left" type="monotone" dataKey="benefice" name="Bénéfice Net" stroke="#22c55e" />
                        <Line yAxisId="right" type="monotone" dataKey="coursAction" name="Cours Action" stroke="#f97316" />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}