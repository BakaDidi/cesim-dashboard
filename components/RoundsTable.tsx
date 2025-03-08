"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpDown, MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadingSpinner } from "@/components/LoadingSpinner"

interface Round {
    id: number;
    numero: number;
    date: string;
    commentaires: string;
    performance?: {
        revenuGlobal: number;
        revenuEurope: number;
        beneficeNetGlobal: number;
        beneficeNetEurope: number;
    };
    marketShare?: {
        partMarcheGlobal: number;
        partMarcheEurope: number;
    };
}

export function RoundsTable() {
    const [searchTerm, setSearchTerm] = useState("")
    const [rounds, setRounds] = useState<Round[]>([])
    const [loading, setLoading] = useState(true)
    const [sortField, setSortField] = useState<string>("numero")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

    useEffect(() => {
        const fetchRounds = async () => {
            try {
                setLoading(true)
                // Récupérer les tours avec toutes les données déjà incluses
                const response = await fetch("/api/rounds")

                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }

                const data = await response.json()
                setRounds(data)
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchRounds()
    }, [])

    // Fonction de filtrage
    const filteredRounds = rounds.filter(
        (round) =>
            (round.commentaires?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
            round.numero.toString().includes(searchTerm)
    )

    // Fonction de tri
    const sortedRounds = [...filteredRounds].sort((a, b) => {
        let valA, valB;

        // Déterminer les valeurs à comparer en fonction du champ de tri
        if (sortField === "numero") {
            valA = a.numero;
            valB = b.numero;
        } else if (sortField === "date") {
            valA = new Date(a.date).getTime();
            valB = new Date(b.date).getTime();
        } else if (sortField === "revenuEurope") {
            valA = a.performance?.revenuEurope || 0;
            valB = b.performance?.revenuEurope || 0;
        } else if (sortField === "revenuGlobal") {
            valA = a.performance?.revenuGlobal || 0;
            valB = b.performance?.revenuGlobal || 0;
        } else if (sortField === "beneficeEurope") {
            valA = a.performance?.beneficeNetEurope || 0;
            valB = b.performance?.beneficeNetEurope || 0;
        } else if (sortField === "beneficeGlobal") {
            valA = a.performance?.beneficeNetGlobal || 0;
            valB = b.performance?.beneficeNetGlobal || 0;
        } else if (sortField === "partMarche") {
            valA = a.marketShare?.partMarcheEurope || 0;
            valB = b.marketShare?.partMarcheEurope || 0;
        } else {
            valA = a.numero;
            valB = b.numero;
        }

        // Appliquer la direction du tri
        if (sortDirection === "asc") {
            return valA > valB ? 1 : -1;
        } else {
            return valA < valB ? 1 : -1;
        }
    });

    // Fonction pour changer le tri
    const handleSort = (field: string) => {
        if (sortField === field) {
            // Si on clique sur le même champ, on change juste la direction
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            // Sinon on change le champ et on remet la direction par défaut
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Fonction pour obtenir l'icône de tri
    const getSortIcon = (field: string) => {
        if (sortField === field) {
            return sortDirection === "asc" ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />;
        }
        return <ArrowUpDown className="ml-2 h-4 w-4" />;
    };

    // Formatage des nombres pour l'affichage
    const formatNumber = (num: number | undefined) => {
        if (num === undefined || num === null) return "N/A";
        return new Intl.NumberFormat('fr-FR').format(num);
    };

    // Formatage des pourcentages
    const formatPercent = (num: number | undefined) => {
        if (num === undefined || num === null) return "N/A";
        return new Intl.NumberFormat('fr-FR', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num / 100);
    };

    return (
        <div className="space-y-4 w-full overflow-hidden">
            <div className="flex items-center justify-between">
                <Input
                    placeholder="Rechercher un tour..."
                    className="max-w-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">
                                <Button
                                    variant="ghost"
                                    className="p-0 hover:bg-transparent"
                                    onClick={() => handleSort("numero")}
                                >
                                    <span>Tour</span>
                                    {getSortIcon("numero")}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="p-0 hover:bg-transparent whitespace-nowrap"
                                    onClick={() => handleSort("revenuEurope")}
                                >
                                    <span>Revenu EU</span>
                                    {getSortIcon("revenuEurope")}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="p-0 hover:bg-transparent whitespace-nowrap"
                                    onClick={() => handleSort("revenuGlobal")}
                                >
                                    <span>Revenu Global</span>
                                    {getSortIcon("revenuGlobal")}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="p-0 hover:bg-transparent whitespace-nowrap"
                                    onClick={() => handleSort("beneficeEurope")}
                                >
                                    <span>Bénéfice EU</span>
                                    {getSortIcon("beneficeEurope")}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="p-0 hover:bg-transparent whitespace-nowrap"
                                    onClick={() => handleSort("beneficeGlobal")}
                                >
                                    <span>Bénéfice Global</span>
                                    {getSortIcon("beneficeGlobal")}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="p-0 hover:bg-transparent whitespace-nowrap"
                                    onClick={() => handleSort("partMarche")}
                                >
                                    <span>Part Marché</span>
                                    {getSortIcon("partMarche")}
                                </Button>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4">
                                    <LoadingSpinner />
                                </TableCell>
                            </TableRow>
                        ) : sortedRounds.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4">
                                    Aucun tour trouvé
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedRounds.map((round) => (
                                <TableRow key={round.id}>
                                    <TableCell className="font-medium">{round.numero}</TableCell>
                                    <TableCell>{formatNumber(round.performance?.revenuEurope)}</TableCell>
                                    <TableCell>{formatNumber(round.performance?.revenuGlobal)}</TableCell>
                                    <TableCell>{formatNumber(round.performance?.beneficeNetEurope)}</TableCell>
                                    <TableCell>{formatNumber(round.performance?.beneficeNetGlobal)}</TableCell>
                                    <TableCell>{formatPercent(round.marketShare?.partMarcheEurope)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Ouvrir menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/rounds/${round.id}`}>Voir détails</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={async () => {
                                                        if (confirm(`Êtes-vous sûr de vouloir supprimer le tour ${round.numero} ?`)) {
                                                            try {
                                                                const response = await fetch(`/api/rounds/${round.id}`, {
                                                                    method: 'DELETE'
                                                                });

                                                                if (response.ok) {
                                                                    setRounds(rounds.filter(r => r.id !== round.id));
                                                                } else {
                                                                    console.error("Erreur lors de la suppression");
                                                                    alert("Erreur lors de la suppression du tour.");
                                                                }
                                                            } catch (error) {
                                                                console.error("Erreur:", error);
                                                                alert("Erreur lors de la suppression du tour.");
                                                            }
                                                        }
                                                    }}
                                                >
                                                    Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}