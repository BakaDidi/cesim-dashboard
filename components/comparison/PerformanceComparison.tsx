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
    Performance,
    MetricOption,
    EquipeWithData,
    ChartDataItem,
    TooltipProps
} from "@/types/types";

interface PerformanceComparisonProps {
    equipes: Equipe[];
}

// Palette de couleurs étendue pour les équipes
const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8",
    "#82CA9D", "#FF6B6B", "#6A7FDB", "#61DAFB", "#FF85EA",
    "#FFC857", "#4E937A", "#E84855", "#B8D8D8", "#7A6563"
];

export function PerformanceComparison({ equipes }: PerformanceComparisonProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [performanceData, setPerformanceData] = useState<EquipeWithData[]>([]);
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    const [region, setRegion] = useState("global");
    const [metric, setMetric] = useState("revenu");
    const [selectedEquipes, setSelectedEquipes] = useState<string[]>([]);

    // Définir les métriques disponibles
    const metrics: MetricOption[] = [
        { value: "revenu", label: "Revenu" },
        { value: "beneficeNet", label: "Bénéfice Net" },
        { value: "ebitda", label: "EBITDA" },
        { value: "coursAction", label: "Cours Action" }
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

                // Pour chaque équipe, récupérer les données de performance pour tous les rounds
                const equipeDataPromises = equipes.map(async (equipe) => {
                    const performancesData = await Promise.all(
                        rounds.map(async (round: { id: number }) => {
                            const response = await fetch(`/api/performances?roundId=${round.id}&equipe=${equipe.nom}`);
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
                        performances: performancesData.filter((p: Performance | null) => p !== null)
                            .sort((a: Performance, b: Performance) => a.roundNumero - b.roundNumero)
                    };
                });

                const allData = await Promise.all(equipeDataPromises);
                setPerformanceData(allData);
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
        if (performanceData.length === 0) return;

        // Trouver le nombre maximum de rounds parmi toutes les équipes
        const maxRounds = Math.max(
            ...performanceData.map(data => data.performances?.length || 0)
        );

        // Créer un tableau pour chaque round
        const newChartData: ChartDataItem[] = Array.from({ length: maxRounds }, (_, i) => {
            const roundObj: ChartDataItem = { round: `R${i + 1}` };

            // Ajouter les données de chaque équipe pour ce round
            performanceData.forEach(({ equipe, performances }) => {
                const perf = performances?.find(p => p.roundNumero === i + 1);
                if (perf) {
                    // Sélectionner la valeur selon la région et la métrique
                    let value: number;
                    if (metric === "coursAction") {
                        value = perf.coursAction;
                    } else {
                        const metricKey = metric + region.charAt(0).toUpperCase() + region.slice(1);
                        value = perf[metricKey as keyof Performance] as number;
                    }

                    // Ajouter au tableau de données
                    const key = `${equipe.nom}_${equipe.id}`;
                    roundObj[key] = value;
                    roundObj[`${key}_estMonEquipe`] = equipe.estMonEquipe;
                }
            });

            return roundObj;
        });

        setChartData(newChartData);
    }, [performanceData, region, metric]);

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

        if (metric === "coursAction") {
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
            }).format(value);
        }

        // Valeurs monétaires
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(value);
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
                                <SelectTrigger className="w-[200px]">
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

                        {metric !== "coursAction" && (
                            <div>
                                <Label>Région</Label>
                                <Tabs value={region} onValueChange={setRegion}>
                                    <TabsList>
                                        <TabsTrigger value="global">Global</TabsTrigger>
                                        <TabsTrigger value="USA">USA</TabsTrigger>
                                        <TabsTrigger value="Europe">Europe</TabsTrigger>
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
                                    id={`equipe-${equipe.id}`}
                                    checked={selectedEquipes.includes(equipe.id.toString())}
                                    onCheckedChange={() => handleEquipeToggle(equipe.id.toString())}
                                />
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <Label
                                    htmlFor={`equipe-${equipe.id}`}
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
                            tickFormatter={(value) => {
                                if (value >= 1000000) {
                                    return `${(value / 1000000).toFixed(0)}M`;
                                } else if (value >= 1000) {
                                    return `${(value / 1000).toFixed(0)}k`;
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