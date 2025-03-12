"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface Financial {
    id: number;
    equipe: string;
    roundId: number;
    roundNumero: number;
    // Bilan Global - Actif
    immobilisations: number;
    stocks: number;
    creancesClients: number;
    tresorerie: number;
    totalActif: number;
    // Bilan Global - Passif (Capitaux Propres)
    capitalSocial: number;
    primeEmission: number;
    resultatNet: number;
    reportNouveau: number;
    totalCapitauxPropres: number;
    // Bilan Global - Passif (Dettes)
    dettesLongTerme: number;
    dettesCourtTerme: number;
    detteFournisseurs: number;
    totalDette: number;
}

interface FinancialMetricsProps {
    equipeId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function FinancialMetrics({ equipeId }: FinancialMetricsProps) {
    const [financials, setFinancials] = useState<Financial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState("bilan");

    useEffect(() => {
        const fetchFinancials = async () => {
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

                // Pour chaque round, récupérer les données financières de l'équipe
                const financialsData = await Promise.all(
                    rounds.map(async (round: { id: any; }) => {
                        const response = await fetch(`/api/financials?roundId=${round.id}&equipe=${equipe.nom}`);
                        const data = await response.json();
                        return data.length > 0 ? data[0] : null;
                    })
                );

                // Filtrer les données nulles et trier par numéro de round
                const filteredFinancials = financialsData
                    .filter(f => f !== null)
                    .sort((a, b) => a.roundNumero - b.roundNumero);

                setFinancials(filteredFinancials);
            } catch (error) {
                console.error("Erreur lors de la récupération des données financières:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFinancials();
    }, [equipeId]);

    const formatCurrency = (value: any) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value ?? 0);

    const prepareBilanChartData = () => {
        return financials.map(f => ({
            round: `Round ${f.roundNumero}`,
            immobilisations: f.immobilisations,
            stocks: f.stocks,
            creancesClients: f.creancesClients,
            tresorerie: f.tresorerie,
            capitalSocial: f.capitalSocial,
            primeEmission: f.primeEmission,
            resultatNet: f.resultatNet,
            reportNouveau: f.reportNouveau,
            dettesLongTerme: f.dettesLongTerme,
            dettesCourtTerme: f.dettesCourtTerme,
            detteFournisseurs: f.detteFournisseurs,
            totalActif: f.totalActif,
            totalCapitauxPropres: f.totalCapitauxPropres,
            totalDette: f.totalDette,
        }));
    };

    const prepareActifPieData = () => {
        if (financials.length === 0) return [];

        // Utiliser les dernières données disponibles
        const latestData = financials[financials.length - 1];

        return [
            { name: "Immobilisations", value: latestData.immobilisations },
            { name: "Stocks", value: latestData.stocks },
            { name: "Créances Clients", value: latestData.creancesClients },
            { name: "Trésorerie", value: latestData.tresorerie }
        ];
    };

    const preparePassifPieData = () => {
        if (financials.length === 0) return [];

        // Utiliser les dernières données disponibles
        const latestData = financials[financials.length - 1];

        return [
            // Capitaux propres détaillés
            { name: "Capital Social", value: latestData.capitalSocial },
            { name: "Prime d'Émission", value: latestData.primeEmission },
            { name: "Résultat Net", value: latestData.resultatNet },
            { name: "Report à Nouveau", value: latestData.reportNouveau },
            // Dettes détaillées
            { name: "Dettes Long Terme", value: latestData.dettesLongTerme },
            { name: "Dettes Court Terme", value: latestData.dettesCourtTerme },
            { name: "Dettes Fournisseurs", value: latestData.detteFournisseurs }
        ];
    };

    const prepareStructurePieData = () => {
        if (financials.length === 0) return [];

        // Utiliser les dernières données disponibles
        const latestData = financials[financials.length - 1];

        return [
            { name: "Capitaux Propres", value: latestData.totalCapitauxPropres },
            { name: "Dettes", value: latestData.totalDette }
        ];
    };

    // Tooltips mis à jour pour le thème sombre
    const customLineTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        return (
            <div className="bg-popover border border-border rounded-md p-3 shadow-lg text-foreground">
                <p className="font-bold">{label}</p>
                <div className="mt-2 space-y-1">
                    {payload
                        .filter((p: any) => p.value !== undefined && p.value !== null)
                        .map((entry: any, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                                <div style={{ width: 12, height: 12, backgroundColor: entry.color }} />
                                <span>
                                    {entry.name}: {formatCurrency(entry.value)}
                                </span>
                            </div>
                        ))}
                </div>
            </div>
        );
    };

    const customPieTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0];

        return (
            <div className="bg-popover border border-border rounded-md p-3 shadow-lg text-foreground">
                <p className="font-bold">{data.name}</p>
                <p className="mt-1">
                    {formatCurrency(data.value)}
                </p>
            </div>
        );
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (financials.length === 0) {
        return <div className="text-center p-4">Aucune donnée financière disponible.</div>;
    }

    const bilanChartData = prepareBilanChartData();
    const actifPieData = prepareActifPieData();
    const passifPieData = preparePassifPieData();
    const structurePieData = prepareStructurePieData();

    return (
        <div className="space-y-4">
            <Tabs value={view} onValueChange={setView}>
                <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="bilan">Bilan</TabsTrigger>
                    <TabsTrigger value="actif">Actif</TabsTrigger>
                    <TabsTrigger value="passif">Passif</TabsTrigger>
                </TabsList>
            </Tabs>

            {view === "bilan" && (
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Évolution du bilan</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={bilanChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="round" tick={{ fill: "hsl(var(--foreground))" }} />
                                        <YAxis
                                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                            tick={{ fill: "hsl(var(--foreground))" }}
                                        />
                                        <Tooltip content={customLineTooltip} />
                                        <Legend />
                                        <Line type="monotone" dataKey="totalActif" name="Total Actif" stroke="#4f46e5" strokeWidth={2} />
                                        <Line type="monotone" dataKey="totalCapitauxPropres" name="Capitaux Propres" stroke="#22c55e" />
                                        <Line type="monotone" dataKey="totalDette" name="Dettes" stroke="#ef4444" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-medium mb-4">Structure du bilan (dernier round)</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={structurePieData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={true}
                                                label={({ name, value, percent }) => `${name}: (${(percent * 100).toFixed(1)}%)`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {structurePieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={customPieTooltip} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-medium mb-4">Ratios financiers</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {financials.length > 0 && (
                                        <>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Ratio d'autonomie financière</p>
                                                <p className="text-xl font-semibold">
                                                    {(financials[financials.length - 1].totalCapitauxPropres / financials[financials.length - 1].totalActif * 100).toFixed(2)}%
                                                </p>
                                                <p className="text-xs text-muted-foreground">Capitaux propres / Total actif</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Ratio d'endettement</p>
                                                <p className="text-xl font-semibold">
                                                    {(financials[financials.length - 1].totalDette / financials[financials.length - 1].totalCapitauxPropres * 100).toFixed(2)}%
                                                </p>
                                                <p className="text-xs text-muted-foreground">Total dettes / Capitaux propres</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Ratio de liquidité</p>
                                                <p className="text-xl font-semibold">
                                                    {((financials[financials.length - 1].tresorerie + financials[financials.length - 1].creancesClients) /
                                                        (financials[financials.length - 1].dettesCourtTerme + financials[financials.length - 1].detteFournisseurs) || 0).toFixed(2)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">(Trésorerie + Créances) / Dettes CT</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {view === "actif" && (
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Composition de l'actif</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bilanChartData} stackOffset="expand">
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="round" tick={{ fill: "hsl(var(--foreground))" }} />
                                        <YAxis
                                            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                                            tick={{ fill: "hsl(var(--foreground))" }}
                                        />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (!active || !payload || !payload.length) return null;

                                                console.log("payload", payload)
                                                return (
                                                    <div className="bg-popover border border-border rounded-md p-3 shadow-lg text-foreground">
                                                        <p className="font-bold">{payload[0].payload.round}</p>
                                                        <div className="mt-2 space-y-1">
                                                            {payload.map((entry, index) => (
                                                                <div key={index} className="flex items-center gap-2">
                                                                    <div style={{ width: 12, height: 12, backgroundColor: entry.color }} />
                                                                    <span>
                                                                        {entry.name}: {formatCurrency(entry.value)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="immobilisations" name="Immobilisations" stackId="a" fill={COLORS[0]} />
                                        <Bar dataKey="stocks" name="Stocks" stackId="a" fill={COLORS[1]} />
                                        <Bar dataKey="creancesClients" name="Créances Clients" stackId="a" fill={COLORS[2]} />
                                        <Bar dataKey="tresorerie" name="Trésorerie" stackId="a" fill={COLORS[3]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Détail de l'actif (dernier round)</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={actifPieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            label={({ name, value, percent }) => `${name}: ${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {actifPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={customPieTooltip} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {view === "passif" && (
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Composition du passif</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bilanChartData} stackOffset="expand">
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="round" tick={{ fill: "hsl(var(--foreground))" }} />
                                        <YAxis
                                            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                                            tick={{ fill: "hsl(var(--foreground))" }}
                                        />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (!active || !payload || !payload.length) return null;

                                                return (
                                                    <div className="bg-popover border border-border rounded-md p-3 shadow-lg text-foreground">
                                                        <p className="font-bold">{payload[0].payload.round}</p>
                                                        <div className="mt-2 space-y-1">
                                                            {payload.map((entry, index) => (
                                                                <div key={index} className="flex items-center gap-2">
                                                                    <div style={{ width: 12, height: 12, backgroundColor: entry.color }} />
                                                                    <span>
                                                                        {entry.name === "totalCapitauxPropres"
                                                                            ? "Capitaux Propres"
                                                                            : "Dettes"}: {formatCurrency(entry.value)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="totalCapitauxPropres" name="Capitaux Propres" stackId="a" fill={COLORS[0]} />
                                        <Bar dataKey="totalDette" name="Dettes" stackId="a" fill={COLORS[1]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Détail du passif (dernier round)</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={passifPieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            label={({ name, value, percent }) => `${name}: ${formatCurrency(value)} (${(percent * 100).toFixed(1)}%)`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {passifPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={customPieTooltip} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}