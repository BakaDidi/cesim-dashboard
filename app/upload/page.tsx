// app/upload/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { parseExcelRound } from "@/lib/excel-parser";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [roundNumber, setRoundNumber] = useState<number>(0);
    const [roundDate, setRoundDate] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { toast } = useToast();

    // Initialiser la date à la date actuelle au chargement du composant
    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
        setRoundDate(formattedDate);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast({
                title: "Erreur",
                description: "Veuillez sélectionner un fichier.",
                variant: "destructive",
            });
            return;
        }

        if (roundNumber < 0) {
            toast({
                title: "Erreur",
                description: "Le numéro de round doit être positif.",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(10);

        try {
            // Lire le fichier
            const arrayBuffer = await file.arrayBuffer();
            setUploadProgress(30);

            // Convertir ArrayBuffer en Uint8Array
            const uint8Array = new Uint8Array(arrayBuffer);
            setUploadProgress(50);

            // Parser le fichier Excel
            const roundData = await parseExcelRound(uint8Array);
            setUploadProgress(70);

            // Envoyer les données au serveur
            const response = await fetch("/api/rounds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    roundNumber: roundNumber,
                    roundDate: roundDate,
                    data: roundData,
                }),
            });

            setUploadProgress(90);

            if (!response.ok) {
                throw new Error("Erreur lors de l'upload");
            }

            setUploadProgress(100);

            toast({
                title: "Succès",
                description: `Le fichier pour le round ${roundNumber} a été uploadé avec succès.`,
            });

            // Réinitialiser le formulaire
            setFile(null);
            if (document.getElementById("file-upload") as HTMLInputElement) {
                (document.getElementById("file-upload") as HTMLInputElement).value = "";
            }
        } catch (error) {
            console.error("Erreur:", error);
            toast({
                title: "Erreur",
                description: "Une erreur s'est produite lors du traitement du fichier.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="container">

            <Card>
                <CardHeader>
                    <CardTitle>Importer un fichier de round CESIM</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="round-number">Numéro du Round</Label>
                            <Input
                                id="round-number"
                                type="number"
                                value={roundNumber}
                                onChange={(e) => setRoundNumber(parseInt(e.target.value))}
                                required
                                min="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="round-date">Date du Round</Label>
                            <Input
                                id="round-date"
                                type="date"
                                value={roundDate}
                                onChange={(e) => setRoundDate(e.target.value)}
                                required
                                disabled
                            />
                            <p className="text-sm text-gray-500">
                                Date automatiquement définie à aujourd'hui
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file-upload">Fichier Excel (.xls)</Label>
                            <Input
                                id="file-upload"
                                type="file"
                                accept=".xls,.xlsx"
                                onChange={handleFileChange}
                                required
                            />
                            <p className="text-sm text-gray-500">
                                Sélectionnez le fichier Excel contenant les données du round CESIM
                            </p>
                        </div>

                        {isUploading && (
                            <div className="space-y-2">
                                <Progress value={uploadProgress} className="w-full" />
                                <p className="text-sm text-center">
                                    Traitement en cours... {uploadProgress}%
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isUploading || !file}
                            className="w-full"
                        >
                            {isUploading ? "Traitement en cours..." : "Importer les données"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}