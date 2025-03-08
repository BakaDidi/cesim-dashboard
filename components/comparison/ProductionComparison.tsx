"use client";

import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
    Equipe,
    Production,
    MetricOption,
    EquipeWithData,
    ChartDataItem,
    TooltipProps
} from "@/types/types";

interface ProductionComparisonProps {
    equipes: Equipe[];
}

// Palette de couleurs étendue pour les équipes
const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8",
    "#82CA9D", "#FF6B6B", "#6A7FDB", "#61DAFB", "#FF85EA",
    "#FFC857", "#4E937A", "#E84855", "#B8D8D8", "#7A6563"
];

export function ProductionComparison({ equipes }: ProductionComparisonProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [productionData, setProductionData] = useState<EquipeWithData[]>([]);
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    const [region, setRegion] = useState("USA");
    const [metric, setMetric] = useState("capacite");
    const [selectedEquipes, setSelectedEquipes] = useState<string[]>([]);

    // Définir les métriques disponibles
    const metrics: MetricOption[] = [
        { value: "capacite", label: "Capacité de production" },
        { value: "techno1Production", label: "Production Techno 1" },
        { value: "techno2Production", label: "Production Techno 2" },
        { value: "techno3Production", label: "Production Techno 3" },
        { value: "techno4Production", label: "Production Techno 4" },
        { value: "couvertureReseau", label: "Couverture Réseau" }
    ];

    useEffect(() => {
        // Initialiser les équipes sélectionnées avec toutes les équipes
        if (equipes.length > 0 && selectedEquipes.length === 0) {
            setSelectedEquipes(equipes.map(e => e.id.toString()));
        }
    }, [equipes, selectedEquipes]);

    useEffect(() => {
        const fetchData = async () => {
            if (equipes.length === 0) return;

            setIsLoading(true);
            try {
                // Récupérer tous les rounds
                const roundsResponse = await fetch("/api/rounds");
                const rounds = await roundsResponse.json();

                if (!rounds || rounds.length === 0) {
                    setIsLoading(false);
                    return;
                }

                // Pour chaque équipe, récupérer les données de production pour tous les rounds
                const equipeDataPromises = equipes.map(async (equipe) => {
                    const productionsData = await Promise.all(
                        rounds.map(async (round: { id: number }) => {
                            const response = await fetch(`/api/productions?roundId=${round.id}&equipe=${equipe.nom}`);
                            const data = await response.json();
                            return data.length > 0 ? {
                                ...data[0],
                                equipeId: equipe.id,
                                equipeNom: equipe.nom,
                                estMonEquipe: equipe.estMonEquipe
                            } : null;
                        })
                    );

                    return {
                        equipe,
                        productions: productionsData.filter((p: Production | null) => p !== null)
                            .sort((a: Production, b: Production) => a.roundNumero - b.roundNumero)
                    };
                });

                const allData = await Promise.all(equipeDataPromises);
                setProductionData(allData);
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [equipes]);

    useEffect(() => {
        // Préparer les données pour le graphique en fonction de la région et de la métrique sélectionnée
        if (productionData.length === 0) return;

        // Trouver le nombre maximum de rounds parmi toutes les équipes
        const maxRounds = Math.max(
            ...productionData.map(data => data.productions?.length || 0)
        );

        // Créer un tableau pour chaque round
        const newChartData: ChartDataItem[] = Array.from({ length: maxRounds }, (_, i) => {
            const roundObj: ChartDataItem = { round: `R${i + 1}` };

            // Ajouter les données de chaque équipe pour ce round
            productionData.forEach(({ equipe, productions }) => {
                const prod = productions?.find(p => p.roundNumero === i + 1);
                if (prod) {
                    // Sélectionner la valeur selon la région et la métrique
                    let value: number;
                    if (metric === "capacite") {
                        const key = `capacite${region}` as keyof Production;
                        value = prod[key] as number;
                    } else if (metric === "couvertureReseau") {
                        value = prod.couvertureReseau;
                    } else {
                        // Métriques de production par technologie (techno1Production, techno2Production, etc.)
                        const key = `${metric}${region}` as keyof Production;
                        value = prod[key] as number;
                    }

                    // Ajouter au tableau de données
                    const dataKey = `${equipe.nom}_${equipe.id}`;
                    roundObj[dataKey] = value;
                    roundObj[`${dataKey}_estMonEquipe`] = equipe.estMonEquipe;
                }
            });

            return roundObj;
        });

        setChartData(newChartData);
    }, [productionData, region, metric]);

    const handleEquipeToggle = (equipeId: string) => {
        setSelectedEquipes(prev => {
            if (prev.includes(equipeId)) {
                return prev.filter(id => id !== equipeId);
            } else {
                return [...prev, equipeId];
            }
        });
    };

    const toggleAllEquipes = () => {
        if (selectedEquipes.length === equipes.length) {
            setSelectedEquipes([]);
        } else {
            setSelectedEquipes(equipes.map(e => e.id.toString()));
        }
    };

    const formatValue = (value: number | undefined) => {
        if (value === undefined || value === null) return "N/A";

        if (metric === "couvertureReseau") {
            return `${value.toFixed(2)}%`;
        }

        return value.toLocaleString('fr-FR');
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    const customTooltip = ({ active, payload, label }: TooltipProps) => {
        if (!active || !payload || !payload.length) return null;

        return (
            <div className="bg-background border rounded p-3 shadow-lg">
                <p className="font-bold">{label}</p>
                <div className="mt-2 space-y-1">
                    {payload
                        .filter(p => p.value !== undefined && p.value !== null)
                        .sort((a, b) => b.value - a.value)
                        .map((entry, index) => {
                            const [equipeName] = entry.dataKey.split('_');
                            const isMyTeam = entry.payload[`${entry.dataKey}_estMonEquipe`];

                            return (
                                <div key={index} className="flex items-center gap-2">
                                    <div style={{ width: 12, height: 12, backgroundColor: entry.color }} />
                                    <span className={`${isMyTeam ? 'font-bold' : ''}`}>
                                        {equipeName}: {formatValue(entry.value)}
                                    </span>
                                </div>
                            );
                        })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <div>
                            <Label>Métrique</Label>
                            <Select value={metric} onValueChange={setMetric}>
                                <SelectTrigger className="w-[220px]">
                                    <SelectValue placeholder="Métrique" />
                                </SelectTrigger>
                                <SelectContent>
                                    {metrics.map((m) => (
                                        <SelectItem key={m.value} value={m.value}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {metric !== "couvertureReseau" && (
                            <div>
                                <Label>Région</Label>
                                <Tabs value={region} onValueChange={setRegion}>
                                    <TabsList>
                                        <TabsTrigger value="USA">USA</TabsTrigger>
                                        <TabsTrigger value="Asie">Asie</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <button
                        onClick={toggleAllEquipes}
                        className="text-sm underline"
                    >
                        {selectedEquipes.length === equipes.length ? "Désélectionner tout" : "Sélectionner tout"}
                    </button>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                        {equipes.map((equipe, index) => (
                            <div key={equipe.id} className="flex items-center gap-2">
                                <Checkbox
                                    id={`prod-equipe-${equipe.id}`}
                                    checked={selectedEquipes.includes(equipe.id.toString())}
                                    onCheckedChange={() => handleEquipeToggle(equipe.id.toString())}
                                />
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <Label
                                    htmlFor={`prod-equipe-${equipe.id}`}
                                    className={`text-sm ${equipe.estMonEquipe ? 'font-bold' : ''}`}
                                >
                                    {equipe.nom}
                                    {equipe.estMonEquipe && <span className="ml-1 text-xs">(Ma team)</span>}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="round" />
                        <YAxis
                            domain={[0, 'auto']}
                            tickFormatter={(value) => {
                                if (metric === "couvertureReseau") {
                                    return `${value}%`;
                                }
                                return value;
                            }}
                        />
                        <Tooltip content={customTooltip} />
                        <Legend />
                        {equipes.map((equipe, index) => (
                            selectedEquipes.includes(equipe.id.toString()) && (
                                <Line
                                    key={equipe.id}
                                    type="monotone"
                                    dataKey={`${equipe.nom}_${equipe.id}`}
                                    name={equipe.nom}
                                    stroke={COLORS[index % COLORS.length]}
                                    strokeWidth={equipe.estMonEquipe ? 3 : 1.5}
                                    dot={{ r: equipe.estMonEquipe ? 6 : 4 }}
                                    activeDot={{ r: equipe.estMonEquipe ? 8 : 6 }}
                                />
                            )
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}