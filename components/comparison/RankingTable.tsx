"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Equipe, RankingItem, MetricOption } from "@/types/types";

interface RankingTableProps {
    equipes: Equipe[];
    category: string;
}

type MetricOptionsByCategory = {
    [key: string]: MetricOption[];
};

export function RankingTable({ equipes, category }: RankingTableProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [rankings, setRankings] = useState<RankingItem[]>([]);
    const [metric, setMetric] = useState("");
    const [lastRound, setLastRound] = useState<number | null>(null);

    // Options de métriques par catégorie
    const metricOptions: MetricOptionsByCategory = {
        performances: [
            { value: "revenuGlobal", label: "Revenu Global" },
            { value: "beneficeNetGlobal", label: "Bénéfice Net Global" },
            { value: "ebitdaGlobal", label: "EBITDA Global" },
            { value: "coursAction", label: "Cours Action" },
        ],
        marketShare: [
            { value: "partMarcheGlobal", label: "Part de Marché Globale" },
            { value: "partMarcheUSA", label: "Part de Marché USA" },
            { value: "partMarcheEurope", label: "Part de Marché Europe" },
            { value: "partMarcheAsie", label: "Part de Marché Asie" },
        ],
        production: [
            { value: "capaciteUSA", label: "Capacité USA" },
            { value: "capaciteAsie", label: "Capacité Asie" },
            { value: "couvertureReseau", label: "Couverture Réseau" },
        ],
        financials: [
            { value: "totalActif", label: "Total Actif" },
            { value: "totalCapitauxPropres", label: "Capitaux Propres" },
            { value: "tresorerie", label: "Trésorerie" },
        ],
        hr: [
            { value: "employesRD", label: "Employés R&D" },
            { value: "tauxRotation", label: "Taux de Rotation" },
            { value: "budgetFormation", label: "Budget Formation" },
            { value: "salairesMensuels", label: "Salaires Mensuels" },
        ]
    };

    useEffect(() => {
        // Définir la métrique par défaut lorsque la catégorie change
        if (metricOptions[category]?.length > 0) {
            setMetric(metricOptions[category][0].value);
        }
    }, [category]);

    useEffect(() => {
        const fetchData = async () => {
            if (!metric || !equipes.length) return;

            setIsLoading(true);
            try {
                // Récupérer tous les rounds pour obtenir le dernier round
                const roundsResponse = await fetch("/api/rounds");
                const rounds = await roundsResponse.json();

                if (!rounds || rounds.length === 0) {
                    setIsLoading(false);
                    return;
                }

                // Trouver le dernier round
                const maxRound = Math.max(...rounds.map((r: { numero: number }) => r.numero));
                setLastRound(maxRound);

                const lastRoundId = rounds.find((r: { numero: number, id: number }) => r.numero === maxRound)?.id;

                if (!lastRoundId) {
                    setIsLoading(false);
                    return;
                }

                // Déterminer l'API endpoint en fonction de la catégorie
                let endpoint = '';
                switch (category) {
                    case 'performances':
                        endpoint = '/api/performances';
                        break;
                    case 'marketShare':
                        endpoint = '/api/market-shares';
                        break;
                    case 'production':
                        endpoint = '/api/productions';
                        break;
                    case 'financials':
                        endpoint = '/api/financials';
                        break;
                    case 'hr':
                        endpoint = '/api/hr';
                        break;
                    default:
                        endpoint = '/api/performances';
                }

                // Récupérer les données de toutes les équipes pour le dernier round
                const dataPromises = equipes.map(async (equipe) => {
                    const response = await fetch(`${endpoint}?roundId=${lastRoundId}&equipe=${equipe.nom}`);
                    const data = await response.json();
                    return data.length > 0 ? {
                        ...data[0],
                        equipeNom: equipe.nom,
                        estMonEquipe: equipe.estMonEquipe
                    } : null;
                });

                const resultsData = await Promise.all(dataPromises);

                // Filtrer les données nulles et trier par la métrique sélectionnée
                const filteredData: RankingItem[] = resultsData
                    .filter((item: RankingItem | null) => item !== null)
                    .sort((a: RankingItem, b: RankingItem) => {
                        // Inverser le tri pour certaines métriques où une valeur plus faible est meilleure
                        if (metric === 'tauxRotation') {
                            return a[metric] - b[metric];
                        }
                        return b[metric] - a[metric];
                    });

                setRankings(filteredData);
            } catch (error) {
                console.error("Erreur lors de la récupération des données de classement:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [equipes, category, metric]);

    // Formatage des valeurs en fonction du type de métrique
    const formatValue = (value: number, metricName: string) => {
        if (value === undefined || value === null) return "N/A";

        // Pourcentages
        if (metricName.startsWith('partMarche') || metricName === 'tauxRotation' || metricName === 'couvertureReseau') {
            return `${value.toFixed(2)}%`;
        }

        // Valeurs monétaires
        if (metricName.includes('revenu') || metricName.includes('benefice') ||
            metricName.includes('ebitda') || metricName === 'coursAction' ||
            metricName.includes('budget') || metricName.includes('salaire') ||
            metricName.includes('tresorerie') || metricName.includes('capitaux') ||
            metricName.includes('actif')) {
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0
            }).format(value);
        }

        // Nombres entiers (capacité, employés)
        if (metricName.includes('capacite') || metricName.includes('employes')) {
            return Math.round(value).toLocaleString('fr-FR');
        }

        // Valeur par défaut
        return value.toLocaleString('fr-FR');
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!rankings.length) {
        return <div className="text-center p-4">Aucune donnée disponible pour le classement.</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Métrique:</span>
                    <Select value={metric} onValueChange={setMetric}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="Sélectionner une métrique" />
                        </SelectTrigger>
                        <SelectContent>
                            {metricOptions[category]?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {lastRound && (
                    <Badge variant="outline" className="ml-auto">
                        Données du Round {lastRound}
                    </Badge>
                )}
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px] text-center">Rang</TableHead>
                            <TableHead>Équipe</TableHead>
                            <TableHead className="text-right">
                                {metricOptions[category]?.find(opt => opt.value === metric)?.label || metric}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rankings.map((item, index) => (
                            <TableRow key={item.id} className={item.estMonEquipe ? "bg-primary/10" : ""}>
                                <TableCell className="text-center font-bold">{index + 1}</TableCell>
                                <TableCell>
                                    <div className="flex items-center">
                                        <span>{item.equipeNom}</span>
                                        {item.estMonEquipe && (
                                            <Badge variant="secondary" className="ml-2">Mon équipe</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatValue(item[metric], metric)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}