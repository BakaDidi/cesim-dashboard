"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
    Bar
} from "recharts";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface HrData {
    id: number;
    equipe: string;
    roundId: number;
    roundNumero: number;
    employesRD: number;
    tauxRotation: number;
    budgetFormation: number;
    salairesMensuels: number;
}

interface HrMetricsProps {
    equipeId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function HrMetrics({ equipeId }: HrMetricsProps) {
    const [hrData, setHrData] = useState<HrData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHrData = async () => {
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

                // Pour chaque round, récupérer les données RH de l'équipe
                const hrDataArray = await Promise.all(
                    rounds.map(async (round) => {
                        const response = await fetch(`/api/hr?roundId=${round.id}&equipe=${equipe.nom}`);
                        const data = await response.json();
                        return data.length > 0 ? data[0] : null;
                    })
                );

                // Filtrer les données nulles et trier par numéro de round
                const filteredHrData = hrDataArray
                    .filter(hr => hr !== null)
                    .sort((a, b) => a.roundNumero - b.roundNumero);

                setHrData(filteredHrData);
            } catch (error) {
                console.error("Erreur lors de la récupération des données RH:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHrData();
    }, [equipeId]);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

    const formatPercent = (value: number) =>
        `${value.toFixed(2)}%`;

    const prepareChartData = () => {
        return hrData.map(hr => ({
            round: `Round ${hr.roundNumero}`,
            employesRD: hr.employesRD,
            tauxRotation: hr.tauxRotation,
            budgetFormation: hr.budgetFormation,
            salairesMensuels: hr.salairesMensuels
        }));
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (hrData.length === 0) {
        return <div className="text-center p-4">Aucune donnée RH disponible.</div>;
    }

    const chartData = prepareChartData();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Nombre d'employés R&D</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="round" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => value} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="employesRD"
                                        name="Employés R&D"
                                        stroke={COLORS[0]}
                                        strokeWidth={2}
                                        dot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Taux de rotation</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="round" />
                                    <YAxis domain={[0, 'auto']} tickFormatter={(value) => `${value}%`} />
                                    <Tooltip formatter={(value) => formatPercent(Number(value))} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="tauxRotation"
                                        name="Taux de rotation"
                                        stroke={COLORS[1]}
                                        strokeWidth={2}
                                        dot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Budget formation</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="round" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                    <Legend />
                                    <Bar dataKey="budgetFormation" name="Budget formation" fill={COLORS[2]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Salaires mensuels</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="round" />
                                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                    <Legend />
                                    <Bar dataKey="salairesMensuels" name="Salaires mensuels" fill={COLORS[3]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Métriques RH actuelles</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {hrData.length > 0 && (
                            <>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Employés R&D</p>
                                    <p className="text-2xl font-bold">{hrData[hrData.length - 1].employesRD}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Taux de rotation</p>
                                    <p className="text-2xl font-bold">{hrData[hrData.length - 1].tauxRotation}%</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Budget formation</p>
                                    <p className="text-2xl font-bold">{formatCurrency(hrData[hrData.length - 1].budgetFormation)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Salaire mensuel</p>
                                    <p className="text-2xl font-bold">{formatCurrency(hrData[hrData.length - 1].salairesMensuels)}</p>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}