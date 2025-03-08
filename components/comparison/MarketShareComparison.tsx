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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
    Equipe,
    MarketShare,
    MetricOption,
    EquipeWithData,
    ChartDataItem,
    LatestRoundDataItem,
    TooltipProps
} from "@/types/types";

interface MarketShareComparisonProps {
    equipes: Equipe[];
}

// Palette de couleurs étendue pour les équipes
const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8",
    "#82CA9D", "#FF6B6B", "#6A7FDB", "#61DAFB", "#FF85EA",
    "#FFC857", "#4E937A", "#E84855", "#B8D8D8", "#7A6563"
];

export function MarketShareComparison({ equipes }: MarketShareComparisonProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [marketShareData, setMarketShareData] = useState<EquipeWithData[]>([]);
    const [chartData, setChartData] = useState<ChartDataItem[] | LatestRoundDataItem[]>([]);
    const [region, setRegion] = useState("global");
    const [view, setView] = useState("evolution");
    const [selectedEquipes, setSelectedEquipes] = useState<string[]>([]);
    const [selectedTechno, setSelectedTechno] = useState<string>("total");

    // Options pour technologies
    const technoOptions: MetricOption[] = [
        { value: "total", label: "Part de marché totale" },
        { value: "techno1", label: "Technologie 1" },
        { value: "techno2", label: "Technologie 2" },
        { value: "techno3", label: "Technologie 3" },
        { value: "techno4", label: "Technologie 4" }
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

                // Pour chaque équipe, récupérer les données de part de marché pour tous les rounds
                const equipeDataPromises = equipes.map(async (equipe) => {
                    const marketSharesData = await Promise.all(
                        rounds.map(async (round: { id: number }) => {
                            const response = await fetch(`/api/market-shares?roundId=${round.id}&equipe=${equipe.nom}`);
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
                        marketShares: marketSharesData.filter((ms: MarketShare | null) => ms !== null)
                            .sort((a: MarketShare, b: MarketShare) => a.roundNumero - b.roundNumero)
                    };
                });

                const allData = await Promise.all(equipeDataPromises);
                setMarketShareData(allData);
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [equipes]);

    useEffect(() => {
        // Préparer les données pour le graphique en fonction de la région et de la vue sélectionnée
        if (marketShareData.length === 0) return;

        if (view === "evolution") {
            // Trouver le nombre maximum de rounds parmi toutes les équipes
            const maxRounds = Math.max(
                ...marketShareData.map(data => data.marketShares?.length || 0)
            );

            // Créer un tableau pour chaque round
            const newChartData: ChartDataItem[] = Array.from({ length: maxRounds }, (_, i) => {
                const roundObj: ChartDataItem = { round: `R${i + 1}` };

                // Ajouter les données de chaque équipe pour ce round
                marketShareData.forEach(({ equipe, marketShares }) => {
                    const ms = marketShares?.find(m => m.roundNumero === i + 1);
                    if (ms) {
                        // Sélectionner la valeur selon la région et la technologie
                        let value: number;
                        if (selectedTechno === "total") {
                            const key = `partMarche${region.charAt(0).toUpperCase() + region.slice(1)}` as keyof MarketShare;
                            value = ms[key] as number;
                        } else {
                            const key = `part${selectedTechno.charAt(0).toUpperCase() + selectedTechno.slice(1)}${region.charAt(0).toUpperCase() + region.slice(1)}` as keyof MarketShare;
                            value = ms[key] as number;
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
        } else if (view === "latest") {
            // Vue du dernier round
            const latestRoundData: LatestRoundDataItem[] = [];

            // Trouver le numéro du dernier round
            const maxRoundNum = Math.max(
                ...marketShareData.flatMap(({ marketShares }) =>
                    (marketShares || []).map(ms => ms.roundNumero)
                )
            );

            // Construire des données pour le graphique en barre
            marketShareData.forEach(({ equipe, marketShares }) => {
                const latestData = marketShares?.find(ms => ms.roundNumero === maxRoundNum);
                if (latestData) {
                    // Sélectionner la valeur selon la région et la technologie
                    let value: number;
                    if (selectedTechno === "total") {
                        const key = `partMarche${region.charAt(0).toUpperCase() + region.slice(1)}` as keyof MarketShare;
                        value = latestData[key] as number;
                    } else {
                        const key = `part${selectedTechno.charAt(0).toUpperCase() + selectedTechno.slice(1)}${region.charAt(0).toUpperCase() + region.slice(1)}` as keyof MarketShare;
                        value = latestData[key] as number;
                    }

                    latestRoundData.push({
                        equipe: equipe.nom,
                        equipeId: equipe.id.toString(),
                        value: value || 0, // Utiliser 0 comme valeur par défaut si value est undefined
                        estMonEquipe: equipe.estMonEquipe
                    });
                }
            });

            // Trier par valeur décroissante
            latestRoundData.sort((a, b) => b.value - a.value);

            setChartData(latestRoundData);
        }
    }, [marketShareData, region, view, selectedTechno]);

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

    const formatPercent = (value: number | undefined) => {
        if (value === undefined || value === null) return "N/A";
        return `${value.toFixed(2)}%`;
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
                                        {equipeName}: {formatPercent(entry.value)}
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
                    <span className="font-bold">{formatPercent(data.value)}</span>
                </p>
            </div>
        );
    };

    // Filtrer les données en toute sécurité pour éviter l'erreur
    const getFilteredBarData = () => {
        if (!Array.isArray(chartData)) return [];

        return (chartData as LatestRoundDataItem[]).filter(item => {
            // Vérifier que l'item et equipeId existent avant d'utiliser toString()
            if (!item || item.equipeId === undefined || item.equipeId === null) {
                return false;
            }

            try {
                const id = item.equipeId.toString();
                return selectedEquipes.includes(id);
            } catch (error) {
                console.error("Erreur lors du filtrage des données:", error, item);
                return false;
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
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
                        <div>
                            <Label>Vue</Label>
                            <Tabs value={view} onValueChange={setView}>
                                <TabsList>
                                    <TabsTrigger value="evolution">Évolution</TabsTrigger>
                                    <TabsTrigger value="latest">Dernier Round</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <div>
                            <Label>Technologie</Label>
                            <Select value={selectedTechno} onValueChange={setSelectedTechno}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Technologie" />
                                </SelectTrigger>
                                <SelectContent>
                                    {technoOptions.map((tech) => (
                                        <SelectItem key={tech.value} value={tech.value}>
                                            {tech.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {view === "evolution" && (
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
                                        id={`ms-equipe-${equipe.id}`}
                                        checked={selectedEquipes.includes(equipe.id.toString())}
                                        onCheckedChange={() => handleEquipeToggle(equipe.id.toString())}
                                    />
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <Label
                                        htmlFor={`ms-equipe-${equipe.id}`}
                                        className={`text-sm ${equipe.estMonEquipe ? 'font-bold' : ''}`}
                                    >
                                        {equipe.nom}
                                        {equipe.estMonEquipe && <span className="ml-1 text-xs">(Ma team)</span>}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
                                tickFormatter={(value) => `${value}%`}
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
                            data={getFilteredBarData()}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                type="number"
                                domain={[0, 'auto']}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <YAxis
                                dataKey="equipe"
                                type="category"
                                width={100}
                                tick={({ y, payload }) => {
                                    const item = (chartData as LatestRoundDataItem[]).find(d => d.equipe === payload.value);
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
                                name="Part de marché"
                                fill="#0088FE"
                                label={{
                                    position: 'right',
                                    formatter: (value: number | undefined) => formatPercent(value),
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