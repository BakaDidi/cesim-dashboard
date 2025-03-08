"use client";

import {useEffect, useState} from "react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {LoadingSpinner} from "@/components/LoadingSpinner";
import {
    ChartDataItem,
    Equipe,
    EquipeWithData,
    Financial,
    MetricOption,
    RadarDataItem,
    TooltipProps
} from "@/types/types";

interface FinancialComparisonProps {
    equipes: Equipe[];
}

// Palette de couleurs étendue pour les équipes
const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8",
    "#82CA9D", "#FF6B6B", "#6A7FDB", "#61DAFB", "#FF85EA",
    "#FFC857", "#4E937A", "#E84855", "#B8D8D8", "#7A6563"
];

export function FinancialComparison({ equipes }: FinancialComparisonProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [financialData, setFinancialData] = useState<EquipeWithData[]>([]);
    const [chartData, setChartData] = useState<ChartDataItem[] | RadarDataItem[]>([]);
    const [view, setView] = useState("evolution");
    const [metric, setMetric] = useState("totalActif");
    const [selectedEquipes, setSelectedEquipes] = useState<string[]>([]);

    // Définir les métriques disponibles
    const metrics: MetricOption[] = [
        // Actif
        { value: "totalActif", label: "Total Actif", group: "Actif" },
        { value: "immobilisations", label: "Immobilisations", group: "Actif" },
        { value: "stocks", label: "Stocks", group: "Actif" },
        { value: "creancesClients", label: "Créances Clients", group: "Actif" },
        { value: "tresorerie", label: "Trésorerie", group: "Actif" },

        // Capitaux propres
        { value: "totalCapitauxPropres", label: "Total Capitaux Propres", group: "Capitaux" },
        { value: "capitalSocial", label: "Capital Social", group: "Capitaux" },
        { value: "primeEmission", label: "Prime d'Émission", group: "Capitaux" },
        { value: "resultatNet", label: "Résultat Net", group: "Capitaux" },
        { value: "reportNouveau", label: "Report à Nouveau", group: "Capitaux" },

        // Dettes
        { value: "totalDette", label: "Total Dette", group: "Dettes" },
        { value: "dettesLongTerme", label: "Dettes Long Terme", group: "Dettes" },
        { value: "dettesCourtTerme", label: "Dettes Court Terme", group: "Dettes" },
        { value: "detteFournisseurs", label: "Dette Fournisseurs", group: "Dettes" }
    ];

    const metricGroups = [...new Set(metrics.map(m => m.group))];

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

                // Pour chaque équipe, récupérer les données financières pour tous les rounds
                const equipeDataPromises = equipes.map(async (equipe) => {
                    const financialsData = await Promise.all(
                        rounds.map(async (round: { id: number }) => {
                            const response = await fetch(`/api/financials?roundId=${round.id}&equipe=${equipe.nom}`);
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
                        financials: financialsData.filter((f: Financial | null) => f !== null).sort((a, b) => a.roundNumero - b.roundNumero)
                    };
                });

                const allData = await Promise.all(equipeDataPromises);
                setFinancialData(allData);
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
        if (financialData.length === 0) return;

        if (view === "evolution") {
            // Trouver le nombre maximum de rounds parmi toutes les équipes
            const maxRounds = Math.max(
                ...financialData.map(data => data.financials?.length || 0)
            );

            // Créer un tableau pour chaque round
            const newChartData: ChartDataItem[] = Array.from({ length: maxRounds }, (_, i) => {
                const roundObj: ChartDataItem = { round: `R${i + 1}` };

                // Ajouter les données de chaque équipe pour ce round
                financialData.forEach(({ equipe, financials }) => {
                    const fin = financials?.find(f => f.roundNumero === i + 1);
                    if (fin) {
                        // Ajouter la valeur au tableau de données
                        const key = `${equipe.nom}_${equipe.id}`;
                        roundObj[key] = fin[metric as keyof Financial] as number;
                        roundObj[`${key}_estMonEquipe`] = equipe.estMonEquipe;
                    }
                });

                return roundObj;
            });

            setChartData(newChartData);
        } else if (view === "latest") {
            // Vue radar pour comparer les structures financières
            // Trouver le numéro du dernier round
            const maxRoundNum = Math.max(
                ...financialData.flatMap(({ financials }) =>
                    (financials || []).map(fin => fin.roundNumero)
                )
            );

            // Préparer les données pour le radar chart
            const radarData: RadarDataItem[] = [];
            const selectedMetrics = metrics.filter(m => m.group === 'Actif');

            // Normaliser les données pour le radar chart
            // D'abord, trouver les valeurs max pour chaque métrique
            const maxValues: Record<string, number> = {};
            selectedMetrics.forEach(m => {
                maxValues[m.value] = Math.max(
                    ...financialData
                        .filter(data => selectedEquipes.includes(data.equipe.id.toString()))
                        .map(data => {
                            const latestData = data.financials?.find(fin => fin.roundNumero === maxRoundNum);
                            return latestData ? (latestData[m.value as keyof Financial] as number) || 0 : 0;
                        })
                );
            });

            // Ensuite, créer les données pour chaque métrique
            selectedMetrics.forEach(m => {
                const metricData: RadarDataItem = {
                    metric: m.label,
                };

                financialData
                    .filter(data => selectedEquipes.includes(data.equipe.id.toString()))
                    .forEach(({ equipe, financials }) => {
                        const latestData = financials?.find(fin => fin.roundNumero === maxRoundNum);
                        if (latestData) {
                            // Normaliser la valeur (pourcentage du max)
                            const metricKey = m.value as keyof Financial;
                            metricData[equipe.nom] = maxValues[m.value] > 0
                                ? ((latestData[metricKey] as number) / maxValues[m.value]) * 100
                                : 0;
                            metricData[`${equipe.nom}_estMonEquipe`] = equipe.estMonEquipe;
                            metricData[`${equipe.nom}_originalValue`] = latestData[metricKey] as number;
                        }
                    });

                radarData.push(metricData);
            });

            setChartData(radarData);
        }
    }, [financialData, view, metric, selectedEquipes]);

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

    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return "N/A";

        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(value);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    const customLineTooltip = ({ active, payload, label }: TooltipProps) => {
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
                                        {equipeName}: {formatCurrency(entry.value)}
                                    </span>
                                </div>
                            );
                        })}
                </div>
            </div>
        );
    };

    const customRadarTooltip = ({ active, payload }: TooltipProps) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0].payload as RadarDataItem;

        return (
            <div className="bg-background border rounded p-3 shadow-lg">
                <p className="font-bold">{data.metric}</p>
                <div className="mt-2 space-y-1">
                    {Object.keys(data)
                        .filter(key => !key.includes('_') && key !== 'metric')
                        .sort((a, b) => (data[b] as number) - (data[a] as number))
                        .map((equipe, index) => {
                            const isMyTeam = data[`${equipe}_estMonEquipe`];
                            const originalValue = data[`${equipe}_originalValue`] as number;

                            return (
                                <div key={index} className="flex items-center gap-2">
                                    <div
                                        style={{
                                            width: 12,
                                            height: 12,
                                            backgroundColor: COLORS[index % COLORS.length]
                                        }}
                                    />
                                    <span className={`${isMyTeam ? 'font-bold' : ''}`}>
                                        {equipe}: {formatCurrency(originalValue)}
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
                            <Label>Vue</Label>
                            <Tabs value={view} onValueChange={setView}>
                                <TabsList>
                                    <TabsTrigger value="evolution">Évolution</TabsTrigger>
                                    <TabsTrigger value="latest">Structure du bilan</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {view === "evolution" && (
                            <div>
                                <Label>Métrique</Label>
                                <Select value={metric} onValueChange={setMetric}>
                                    <SelectTrigger className="w-[250px]">
                                        <SelectValue placeholder="Métrique" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {metricGroups.map(group => (
                                            <div key={group}>
                                                <div className="px-2 py-1.5 text-xs font-semibold">{group}</div>
                                                {metrics
                                                    .filter(m => m.group === group)
                                                    .map(m => (
                                                        <SelectItem key={m.value} value={m.value}>
                                                            {m.label}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </div>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                    id={`fin-equipe-${equipe.id}`}
                                    checked={selectedEquipes.includes(equipe.id.toString())}
                                    onCheckedChange={() => handleEquipeToggle(equipe.id.toString())}
                                />
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <Label
                                    htmlFor={`fin-equipe-${equipe.id}`}
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
                                tickFormatter={(value) => {
                                    if (value >= 1000000) {
                                        return `${(value / 1000000).toFixed(0)}M`;
                                    } else if (value >= 1000) {
                                        return `${(value / 1000).toFixed(0)}k`;
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
                        <RadarChart
                            outerRadius={180}
                            width={500}
                            height={500}
                            data={chartData as RadarDataItem[]}
                        >
                            <PolarGrid />
                            <PolarAngleAxis dataKey="metric" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Tooltip content={customRadarTooltip} />
                            {equipes
                                .filter(equipe => selectedEquipes.includes(equipe.id.toString()))
                                .map((equipe, index) => (
                                        <Radar
                                            key={equipe.id}
                                            name={equipe.nom}
                                            dataKey={equipe.nom}
                                            stroke={COLORS[index % COLORS.length]}
                                            fill={COLORS[index % COLORS.length]}
                                            fillOpacity={0.2}
                                            strokeWidth={equipe.estMonEquipe ? 3 : 1.5}
                                        />
                                    )
                                )}
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}