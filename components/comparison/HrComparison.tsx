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
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
    Equipe,
    HrData,
    MetricOption,
    EquipeWithData,
    ChartDataItem,
    LatestRoundDataItem,
    TooltipProps
} from "@/types/types";

interface HrComparisonProps {
    equipes: Equipe[];
}

// Palette de couleurs étendue pour les équipes
const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8",
    "#82CA9D", "#FF6B6B", "#6A7FDB", "#61DAFB", "#FF85EA",
    "#FFC857", "#4E937A", "#E84855", "#B8D8D8", "#7A6563"
];

export function HrComparison({ equipes }: HrComparisonProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hrData, setHrData] = useState<EquipeWithData[]>([]);
    const [chartData, setChartData] = useState<ChartDataItem[] | LatestRoundDataItem[]>([]);
    const [view, setView] = useState("evolution");
    const [metric, setMetric] = useState("employesRD");
    const [selectedEquipes, setSelectedEquipes] = useState<string[]>([]);

    // Définir les métriques disponibles
    const metrics: MetricOption[] = [
        { value: "employesRD", label: "Employés R&D" },
        { value: "tauxRotation", label: "Taux de Rotation" },
        { value: "budgetFormation", label: "Budget Formation" },
        { value: "salairesMensuels", label: "Salaires Mensuels" }
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

                // Pour chaque équipe, récupérer les données RH pour tous les rounds
                const equipeDataPromises = equipes.map(async (equipe) => {
                    const hrDataArray = await Promise.all(
                        rounds.map(async (round: { id: number }) => {
                            const response = await fetch(`/api/hr?roundId=${round.id}&equipe=${equipe.nom}`);
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
                        hrData: hrDataArray.filter((hr: HrData | null) => hr !== null)
                            .sort((a: HrData, b: HrData) => a.roundNumero - b.roundNumero)
                    };
                });

                const allData = await Promise.all(equipeDataPromises);
                setHrData(allData);
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [equipes]);

    useEffect(() => {
        // Préparer les données pour le graphique en fonction de la vue et de la métrique sélectionnée
        if (hrData.length === 0) return;

        if (view === "evolution") {
            // Trouver le nombre maximum de rounds parmi toutes les équipes
            const maxRounds = Math.max(
                ...hrData.map(data => data.hrData?.length || 0)
            );

            // Créer un tableau pour chaque round
            const newChartData: ChartDataItem[] = Array.from({ length: maxRounds }, (_, i) => {
                const roundObj: ChartDataItem = { round: `R${i + 1}` };

                // Ajouter les données de chaque équipe pour ce round
                hrData.forEach(({ equipe, hrData }) => {
                    const hr = hrData?.find(h => h.roundNumero === i + 1);
                    if (hr) {
                        // Ajouter la valeur au tableau de données
                        const key = `${equipe.nom}_${equipe.id}`;
                        roundObj[key] = hr[metric as keyof HrData] as number;
                        roundObj[`${key}_estMonEquipe`] = equipe.estMonEquipe;
                    }
                });

                return roundObj;
            });

            setChartData(newChartData);
        } else if (view === "latest") {
            // Vue en barres pour le dernier round
            // Trouver le numéro du dernier round
            const maxRoundNum = Math.max(
                ...hrData.flatMap(({ hrData }) =>
                    (hrData || []).map(hr => hr.roundNumero)
                )
            );

            // Construire des données pour le graphique en barre
            const latestRoundData: LatestRoundDataItem[] = [];

            hrData.forEach(({ equipe, hrData }) => {
                const latestData = hrData?.find(hr => hr.roundNumero === maxRoundNum);
                if (latestData) {
                    latestRoundData.push({
                        equipe: equipe.nom,
                        equipeId: equipe.id.toString(),
                        value: latestData[metric as keyof HrData] as number,
                        estMonEquipe: equipe.estMonEquipe
                    });
                }
            });

            // Trier par valeur (décroissante pour la plupart des métriques, croissante pour le taux de rotation)
            if (metric === 'tauxRotation') {
                latestRoundData.sort((a, b) => a.value - b.value); // Taux de rotation plus bas est meilleur
            } else {
                latestRoundData.sort((a, b) => b.value - a.value); // Valeurs plus élevées sont meilleures
            }

            setChartData(latestRoundData);
        }
    }, [hrData, view, metric]);

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

        if (metric === "tauxRotation") {
            return `${value.toFixed(2)}%`;
        }

        if (metric === "budgetFormation" || metric === "salairesMensuels") {
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0
            }).format(value);
        }

        return value.toLocaleString('fr-FR');
    };

    const handleViewChange = (newView: string) => {
        setView(newView);
    };

    // Obtenir le bon label pour la métrique actuelle
    const getMetricLabel = () => {
        return metrics.find(m => m.value === metric)?.label || "Métrique";
    };

    const customLineTooltip = ({ active, payload, label }: TooltipProps) => {
        if (!active || !payload || !payload.length) return null;

        return (
            <div className="bg-background border rounded p-3 shadow-lg">
                <p className="font-bold">{label}</p>
                <div className="mt-2 space-y-1">
                    {payload
                        .filter(p => p.value !== undefined && p.value !== null)
                        .sort((a, b) => {
                            // Trier différemment selon la métrique
                            if (metric === 'tauxRotation') {
                                return a.value - b.value;
                            }
                            return b.value - a.value;
                        })
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

    const customBarTooltip = ({ active, payload }: TooltipProps) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0].payload as LatestRoundDataItem;

        return (
            <div className="bg-background border rounded p-3 shadow-lg">
                <p className={`font-medium ${data.estMonEquipe ? 'font-bold' : ''}`}>
                    {data.equipe} {data.estMonEquipe ? '(Ma team)' : ''}
                </p>
                <p className="mt-1">
                    <span className="font-bold">{formatValue(data.value)}</span>
                </p>
            </div>
        );
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

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
                        <div>
                            <Label>Vue</Label>
                            <div className="flex rounded-md border">
                                <button
                                    className={`px-3 py-1.5 text-sm ${view === 'evolution' ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
                                    onClick={() => handleViewChange('evolution')}
                                >
                                    Évolution
                                </button>
                                <button
                                    className={`px-3 py-1.5 text-sm ${view === 'latest' ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
                                    onClick={() => handleViewChange('latest')}
                                >
                                    Dernier round
                                </button>
                            </div>
                        </div>
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
                                    id={`hr-equipe-${equipe.id}`}
                                    checked={selectedEquipes.includes(equipe.id.toString())}
                                    onCheckedChange={() => handleEquipeToggle(equipe.id.toString())}
                                />
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <Label
                                    htmlFor={`hr-equipe-${equipe.id}`}
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
                {view === "evolution" ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData as ChartDataItem[]}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="round" />
                            <YAxis
                                domain={[0, 'auto']}
                                tickFormatter={(value) => {
                                    if (metric === "tauxRotation") {
                                        return `${value}%`;
                                    }
                                    if (metric === "budgetFormation" || metric === "salairesMensuels") {
                                        if (value >= 1000000) {
                                            return `${(value / 1000000).toFixed(1)}M`;
                                        } else if (value >= 1000) {
                                            return `${(value / 1000).toFixed(0)}k`;
                                        }
                                    }
                                    return value;
                                }}
                            />
                            <Tooltip content={customLineTooltip} />
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
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={(chartData as LatestRoundDataItem[])
                                .filter(item => selectedEquipes.includes(item.equipeId.toString()))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                tickFormatter={(value) => {
                                    if (metric === "tauxRotation") {
                                        return `${value}%`;
                                    }
                                    if (metric === "budgetFormation" || metric === "salairesMensuels") {
                                        if (value >= 1000000) {
                                            return `${(value / 1000000).toFixed(1)}M`;
                                        } else if (value >= 1000) {
                                            return `${(value / 1000).toFixed(0)}k`;
                                        }
                                    }
                                    return value;
                                }}
                            />
                            <YAxis
                                dataKey="equipe"
                                type="category"
                                width={100}
                                tick={({ y, payload }) => {
                                    const item = (chartData as LatestRoundDataItem[])
                                        .find(d => d.equipe === payload.value);
                                    return (
                                        <text
                                            x={0}
                                            y={y}
                                            dy={4}
                                            textAnchor="start"
                                            fill={item?.estMonEquipe ? "#000" : "#666"}
                                            fontWeight={item?.estMonEquipe ? "bold" : "normal"}
                                            fontSize={13}
                                        >
                                            {payload.value}
                                        </text>
                                    );
                                }}
                            />
                            <Tooltip content={customBarTooltip} />
                            <Bar
                                dataKey="value"
                                name={getMetricLabel()}
                                fill="#0088FE"
                                label={{
                                    position: 'right',
                                    formatter: (value: number | undefined) => formatValue(value),
                                }}
                                background={{ fill: '#eee' }}
                            >
                                {(chartData as LatestRoundDataItem[]).map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        strokeWidth={entry.estMonEquipe ? 2 : 0}
                                        stroke="#000"
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}