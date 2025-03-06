"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface DashboardOverviewProps {
    equipeId: string;
}

export function DashboardOverview({ equipeId }: DashboardOverviewProps) {
    const [performance, setPerformance] = useState<any[]>([]);
    const [marketShare, setMarketShare] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
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

                // Pour chaque round, récupérer les performances et parts de marché
                const performanceData = await Promise.all(
                    rounds.map(async (round) => {
                        const response = await fetch(`/api/performances?roundId=${round.id}&equipe=${equipe.nom}`);
                        const data = await response.json();
                        return data.length > 0 ? data[0] : null;
                    })
                );

                const marketShareData = await Promise.all(
                    rounds.map(async (round) => {
                        const response = await fetch(`/api/market-shares?roundId=${round.id}&equipe=${equipe.nom}`);
                        const data = await response.json();
                        return data.length > 0 ? data[0] : null;
                    })
                );

                // Filtrer et trier les données
                const filteredPerformance = performanceData
                    .filter(p => p !== null)
                    .sort((a, b) => a.roundNumero - b.roundNumero);

                const filteredMarketShare = marketShareData
                    .filter(m => m !== null)
                    .sort((a, b) => a.roundNumero - b.roundNumero);

                setPerformance(filteredPerformance);
                setMarketShare(filteredMarketShare);
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [equipeId]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

    const formatPercent = (value: number) =>
        `${value.toFixed(2)}%`;

    const preparePerformanceData = () => {
        return performance.map(p => ({
            round: `R${p.roundNumero}`,
            revenuGlobal: p.revenuGlobal,
            beneficeNetGlobal: p.beneficeNetGlobal,
            ebitdaGlobal: p.ebitdaGlobal,
            coursAction: p.coursAction
        }));
    };

    const prepareMarketShareData = () => {
        return marketShare.map(m => ({
            round: `R${m.roundNumero}`,
            partMarcheGlobal: m.partMarcheGlobal,
            partTechno1Global: m.partTechno1Global,
            partTechno2Global: m.partTechno2Global,
            partTechno3Global: m.partTechno3Global,
            partTechno4Global: m.partTechno4Global
        }));
    };

    // Calcul des variations pour les KPIs
    const getPerformanceChange = (metric: string) => {
        if (performance.length < 2) return { value: 0, isPositive: true };

        const current = performance[performance.length - 1][metric];
        const previous = performance[performance.length - 2][metric];

        if (previous === 0) return { value: 0, isPositive: true };

        const change = ((current - previous) / previous) * 100;
        return {
            value: Math.abs(change).toFixed(1),
            isPositive: change >= 0
        };
    };

    const getMarketShareChange = () => {
        if (marketShare.length < 2) return { value: 0, isPositive: true };

        const current = marketShare[marketShare.length - 1].partMarcheGlobal;
        const previous = marketShare[marketShare.length - 2].partMarcheGlobal;

        if (previous === 0) return { value: 0, isPositive: true };

        const change = ((current - previous) / previous) * 100;
        return {
            value: Math.abs(change).toFixed(1),
            isPositive: change >= 0
        };
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (performance.length === 0 || marketShare.length === 0) {
        return <div className="text-center p-4">Aucune donnée disponible.</div>;
    }

    const performanceData = preparePerformanceData();
    const marketShareData = prepareMarketShareData();

    // Récupérer les dernières valeurs pour les KPIs
    const lastPerformance = performance[performance.length - 1];
    const lastMarketShare = marketShare[marketShare.length - 1];

    // Calculer les variations
    const revenueChange = getPerformanceChange('revenuGlobal');
    const profitChange = getPerformanceChange('beneficeNetGlobal');
    const marketShareChange = getMarketShareChange();
    const stockPriceChange = getPerformanceChange('coursAction');

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Revenu Global</p>
                            <div className="flex items-baseline justify-between">
                                <div className="text-2xl font-bold">
                                    {formatCurrency(lastPerformance.revenuGlobal)}
                                </div>
                                <div className={`text-sm font-medium ${revenueChange.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {revenueChange.isPositive ? '+' : '-'}{revenueChange.value}%
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Bénéfice Net</p>
                            <div className="flex items-baseline justify-between">
                                <div className="text-2xl font-bold">
                                    {formatCurrency(lastPerformance.beneficeNetGlobal)}
                                </div>
                                <div className={`text-sm font-medium ${profitChange.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {profitChange.isPositive ? '+' : '-'}{profitChange.value}%
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Part de Marché</p>
                            <div className="flex items-baseline justify-between">
                                <div className="text-2xl font-bold">
                                    {formatPercent(lastMarketShare.partMarcheGlobal)}
                                </div>
                                <div className={`text-sm font-medium ${marketShareChange.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {marketShareChange.isPositive ? '+' : '-'}{marketShareChange.value}%
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Cours Action</p>
                            <div className="flex items-baseline justify-between">
                                <div className="text-2xl font-bold">
                                    {formatCurrency(lastPerformance.coursAction)}
                                </div>
                                <div className={`text-sm font-medium ${stockPriceChange.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {stockPriceChange.isPositive ? '+' : '-'}{stockPriceChange.value}%
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Évolution des revenus et bénéfices</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="round" />
                                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                    <Legend />
                                    <Bar dataKey="revenuGlobal" name="Revenu Global" fill="#4f46e5" />
                                    <Bar dataKey="beneficeNetGlobal" name="Bénéfice Net" fill="#22c55e" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Parts de marché</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={marketShareData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="round" />
                                    <YAxis domain={[0, 'auto']} tickFormatter={(value) => `${value}%`} />
                                    <Tooltip formatter={(value) => formatPercent(Number(value))} />
                                    <Legend />
                                    <Line type="monotone" dataKey="partMarcheGlobal" name="Part de marché globale" stroke="#4f46e5" strokeWidth={2} />
                                    <Line type="monotone" dataKey="partTechno1Global" name="Techno 1" stroke={COLORS[0]} />
                                    <Line type="monotone" dataKey="partTechno2Global" name="Techno 2" stroke={COLORS[1]} />
                                    <Line type="monotone" dataKey="partTechno3Global" name="Techno 3" stroke={COLORS[2]} />
                                    <Line type="monotone" dataKey="partTechno4Global" name="Techno 4" stroke={COLORS[3]} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}