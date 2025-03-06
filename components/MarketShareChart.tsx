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
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from "recharts";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface MarketShare {
    id: number;
    equipe: string;
    roundId: number;
    roundNumero: number;
    // Global
    partMarcheGlobal: number;
    partTechno1Global: number;
    partTechno2Global: number;
    partTechno3Global: number;
    partTechno4Global: number;
    // USA
    partMarcheUSA: number;
    partTechno1USA: number;
    partTechno2USA: number;
    partTechno3USA: number;
    partTechno4USA: number;
    // Europe
    partMarcheEurope: number;
    partTechno1Europe: number;
    partTechno2Europe: number;
    partTechno3Europe: number;
    partTechno4Europe: number;
    // Asie
    partMarcheAsie: number;
    partTechno1Asie: number;
    partTechno2Asie: number;
    partTechno3Asie: number;
    partTechno4Asie: number;
}

interface MarketShareChartProps {
    equipeId: string;
    detailed?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function MarketShareChart({ equipeId, detailed = false }: MarketShareChartProps) {
    const [marketShares, setMarketShares] = useState<MarketShare[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [region, setRegion] = useState("global");

    useEffect(() => {
        const fetchMarketShares = async () => {
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

                // Pour chaque round, récupérer les parts de marché de l'équipe
                const marketSharesData = await Promise.all(
                    rounds.map(async (round) => {
                        const response = await fetch(`/api/market-shares?roundId=${round.id}&equipe=${equipe.nom}`);
                        const data = await response.json();
                        return data.length > 0 ? data[0] : null;
                    })
                );

                // Filtrer les données nulles et trier par numéro de round
                const filteredMarketShares = marketSharesData
                    .filter(ms => ms !== null)
                    .sort((a, b) => a.roundNumero - b.roundNumero);

                setMarketShares(filteredMarketShares);
            } catch (error) {
                console.error("Erreur lors de la récupération des parts de marché:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMarketShares();
    }, [equipeId]);

    const formatPercent = (value: number) =>
        `${value.toFixed(2)}%`;

    const prepareChartData = () => {
        return marketShares.map(ms => ({
            round: `Round ${ms.roundNumero}`,
            partMarche: getMarketShareByRegion(ms, region),
            partTechno1: getTechnoShareByRegion(ms, region, 1),
            partTechno2: getTechnoShareByRegion(ms, region, 2),
            partTechno3: getTechnoShareByRegion(ms, region, 3),
            partTechno4: getTechnoShareByRegion(ms, region, 4)
        }));
    };

    const getMarketShareByRegion = (marketShare: MarketShare, region: string) => {
        switch (region) {
            case "usa": return marketShare.partMarcheUSA;
            case "europe": return marketShare.partMarcheEurope;
            case "asie": return marketShare.partMarcheAsie;
            default: return marketShare.partMarcheGlobal;
        }
    };

    const getTechnoShareByRegion = (marketShare: MarketShare, region: string, techno: number) => {
        switch (region) {
            case "usa":
                return techno === 1 ? marketShare.partTechno1USA :
                    techno === 2 ? marketShare.partTechno2USA :
                        techno === 3 ? marketShare.partTechno3USA :
                            marketShare.partTechno4USA;
            case "europe":
                return techno === 1 ? marketShare.partTechno1Europe :
                    techno === 2 ? marketShare.partTechno2Europe :
                        techno === 3 ? marketShare.partTechno3Europe :
                            marketShare.partTechno4Europe;
            case "asie":
                return techno === 1 ? marketShare.partTechno1Asie :
                    techno === 2 ? marketShare.partTechno2Asie :
                        techno === 3 ? marketShare.partTechno3Asie :
                            marketShare.partTechno4Asie;
            default:
                return techno === 1 ? marketShare.partTechno1Global :
                    techno === 2 ? marketShare.partTechno2Global :
                        techno === 3 ? marketShare.partTechno3Global :
                            marketShare.partTechno4Global;
        }
    };

    const preparePieData = () => {
        if (marketShares.length === 0) return [];

        // Utiliser les dernières données disponibles
        const latestData = marketShares[marketShares.length - 1];

        return [
            { name: "Techno 1", value: getTechnoShareByRegion(latestData, region, 1) },
            { name: "Techno 2", value: getTechnoShareByRegion(latestData, region, 2) },
            { name: "Techno 3", value: getTechnoShareByRegion(latestData, region, 3) },
            { name: "Techno 4", value: getTechnoShareByRegion(latestData, region, 4) }
        ].filter(item => item.value > 0); // Ne montrer que les technologies avec des parts de marché
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (marketShares.length === 0) {
        return <div className="text-center p-4">Aucune donnée de part de marché disponible.</div>;
    }

    const chartData = prepareChartData();
    const pieData = preparePieData();

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
                            <h3 className="text-lg font-medium mb-4">Évolution des parts de marché - {region.toUpperCase()}</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="round" />
                                        <YAxis domain={[0, 'auto']} tickFormatter={(value) => `${value}%`} />
                                        <Tooltip formatter={(value) => formatPercent(Number(value))} />
                                        <Legend />
                                        <Line type="monotone" dataKey="partMarche" name="Part de marché" stroke="#4f46e5" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-medium mb-4">Répartition par technologie - {region.toUpperCase()}</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={true}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(2)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatPercent(Number(value))} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-medium mb-4">Parts de marché par technologie - {region.toUpperCase()}</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="round" />
                                            <YAxis tickFormatter={(value) => `${value}%`} />
                                            <Tooltip formatter={(value) => formatPercent(Number(value))} />
                                            <Legend />
                                            <Bar dataKey="partTechno1" name="Techno 1" fill={COLORS[0]} />
                                            <Bar dataKey="partTechno2" name="Techno 2" fill={COLORS[1]} />
                                            <Bar dataKey="partTechno3" name="Techno 3" fill={COLORS[2]} />
                                            <Bar dataKey="partTechno4" name="Techno 4" fill={COLORS[3]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="round" />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value) => formatPercent(Number(value))} />
                        <Legend />
                        <Line type="monotone" dataKey="partMarche" name="Part de marché" stroke="#4f46e5" />
                        <Line type="monotone" dataKey="partTechno1" name="Techno 1" stroke={COLORS[0]} />
                        {pieData.length > 1 && <Line type="monotone" dataKey="partTechno2" name="Techno 2" stroke={COLORS[1]} />}
                        {pieData.length > 2 && <Line type="monotone" dataKey="partTechno3" name="Techno 3" stroke={COLORS[2]} />}
                        {pieData.length > 3 && <Line type="monotone" dataKey="partTechno4" name="Techno 4" stroke={COLORS[3]} />}
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}