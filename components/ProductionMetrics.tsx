"use client";

import {useEffect, useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {LoadingSpinner} from "@/components/LoadingSpinner";

interface Production {
    id: number;
    equipe: string;
    roundId: number;
    roundNumero: number;
    techno1ProductionUSA: number;
    techno2ProductionUSA: number;
    techno3ProductionUSA: number;
    techno4ProductionUSA: number;
    techno1ProductionAsie: number;
    techno2ProductionAsie: number;
    techno3ProductionAsie: number;
    techno4ProductionAsie: number;
    capaciteUSA: number;
    capaciteAsie: number;
    couvertureReseau: number;
}

interface ProductionMetricsProps {
    equipeId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function ProductionMetrics({ equipeId }: ProductionMetricsProps) {
    const [productions, setProductions] = useState<Production[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [region, setRegion] = useState("usa");

    useEffect(() => {
        const fetchProductions = async () => {
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

                // Pour chaque round, récupérer les données de production de l'équipe
                const productionsData = await Promise.all(
                    rounds.map(async (round: { id: any; }) => {
                        const response = await fetch(`/api/productions?roundId=${round.id}&equipe=${equipe.nom}`);
                        const data = await response.json();
                        return data.length > 0 ? data[0] : null;
                    })
                );

                // Filtrer les données nulles et trier par numéro de round
                const filteredProductions = productionsData
                    .filter(p => p !== null)
                    .sort((a, b) => a.roundNumero - b.roundNumero);

                setProductions(filteredProductions);
            } catch (error) {
                console.error("Erreur lors de la récupération des données de production:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductions();
    }, [equipeId]);

    const prepareProductionData = () => {
        return productions.map(p => ({
            round: `Round ${p.roundNumero}`,
            techno1: region === "usa" ? p.techno1ProductionUSA : p.techno1ProductionAsie,
            techno2: region === "usa" ? p.techno2ProductionUSA : p.techno2ProductionAsie,
            techno3: region === "usa" ? p.techno3ProductionUSA : p.techno3ProductionAsie,
            techno4: region === "usa" ? p.techno4ProductionUSA : p.techno4ProductionAsie,
            capacite: region === "usa" ? p.capaciteUSA : p.capaciteAsie,
            couvertureReseau: p.couvertureReseau
        }));
    };

    const prepareCapacityData = () => {
        return productions.map(p => ({
            round: `Round ${p.roundNumero}`,
            capaciteUSA: p.capaciteUSA,
            capaciteAsie: p.capaciteAsie,
            couvertureReseau: p.couvertureReseau
        }));
    };

    const prepareTechnoMixData = () => {
        if (productions.length === 0) return [];

        // Utiliser les dernières données disponibles
        const latestData = productions[productions.length - 1];


         // Ne montrer que les technologies avec une production
        return [
            {
                name: "Techno 1",
                value: region === "usa" ? latestData.techno1ProductionUSA : latestData.techno1ProductionAsie
            },
            {
                name: "Techno 2",
                value: region === "usa" ? latestData.techno2ProductionUSA : latestData.techno2ProductionAsie
            },
            {
                name: "Techno 3",
                value: region === "usa" ? latestData.techno3ProductionUSA : latestData.techno3ProductionAsie
            },
            {
                name: "Techno 4",
                value: region === "usa" ? latestData.techno4ProductionUSA : latestData.techno4ProductionAsie
            }
        ].filter(item => item.value > 0);
    };

    // Tooltips mis à jour pour le thème sombre
    const customBarTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        return (
            <div className="bg-popover border border-border rounded-md p-3 shadow-lg text-foreground">
                <p className="font-bold">{label}</p>
                <div className="mt-2 space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                            <div style={{ width: 12, height: 12, backgroundColor: entry.color }} />
                            <span>
                                {entry.name}: {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const customLineTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        return (
            <div className="bg-popover border border-border rounded-md p-3 shadow-lg text-foreground">
                <p className="font-bold">{label}</p>
                <div className="mt-2 space-y-1">
                    {payload.map((entry: any, index: number) => {
                        let formattedValue = entry.value;
                        if (entry.dataKey === 'couvertureReseau') {
                            formattedValue = `${entry.value}%`;
                        }

                        return (
                            <div key={index} className="flex items-center gap-2">
                                <div style={{ width: 12, height: 12, backgroundColor: entry.color }} />
                                <span>
                                    {entry.name}: {formattedValue}
                                </span>
                            </div>
                        );
                    })}
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
                    Production: {data.value} unités
                </p>
            </div>
        );
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (productions.length === 0) {
        return <div className="text-center p-4">Aucune donnée de production disponible.</div>;
    }

    const productionData = prepareProductionData();
    const capacityData = prepareCapacityData();
    const technoMixData = prepareTechnoMixData();

    return (
        <div className="space-y-4">
            <Tabs value={region} onValueChange={setRegion}>
                <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="usa">USA</TabsTrigger>
                    <TabsTrigger value="asie">Asie</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Production par technologie ({region.toUpperCase()})</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={productionData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="round" tick={{ fill: "hsl(var(--foreground))" }} />
                                    <YAxis tick={{ fill: "hsl(var(--foreground))" }} />
                                    <Tooltip content={customBarTooltip} />
                                    <Legend />
                                    <Bar dataKey="techno1" name="Techno 1" fill={COLORS[0]} />
                                    <Bar dataKey="techno2" name="Techno 2" fill={COLORS[1]} />
                                    <Bar dataKey="techno3" name="Techno 3" fill={COLORS[2]} />
                                    <Bar dataKey="techno4" name="Techno 4" fill={COLORS[3]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-lg font-medium mb-4">Mix de production ({region.toUpperCase()})</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={technoMixData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(2)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {technoMixData.map((entry, index) => (
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
                            <h3 className="text-lg font-medium mb-4">Capacité de production</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={capacityData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="round" tick={{ fill: "hsl(var(--foreground))" }} />
                                        <YAxis tick={{ fill: "hsl(var(--foreground))" }} />
                                        <Tooltip content={customLineTooltip} />
                                        <Legend />
                                        <Line type="monotone" dataKey="capaciteUSA" name="Capacité USA" stroke={COLORS[0]} />
                                        <Line type="monotone" dataKey="capaciteAsie" name="Capacité Asie" stroke={COLORS[1]} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}