"use client"
import "./globals.css"
import React, { createContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shadcn/app-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import {ThemeProvider} from "@/components/theme-provider";
// Définition du contexte d'équipe
interface Equipe {
    id: number;
    nom: string;
    estMonEquipe: boolean;
}

interface EquipeContextType {
    selectedEquipe: string;
    setSelectedEquipe: React.Dispatch<React.SetStateAction<string>>;
    equipes: Equipe[];
}

export const EquipeContext = createContext<EquipeContextType>({
    selectedEquipe: "",
    setSelectedEquipe: () => {},
    equipes: []
});

interface LayoutProps {
    children: React.ReactNode
}

export default function RootLayout({ children }: LayoutProps) {
    const pathname = usePathname();
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [selectedEquipe, setSelectedEquipe] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Génération des éléments du breadcrumb basés sur l'URL actuelle
    const generateBreadcrumb = () => {
        const paths = pathname.split('/').filter(path => path);

        // Si nous sommes sur la page d'accueil, retourner simplement Dashboard
        if (paths.length === 0) {
            return (
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Dashboard CESIM</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            );
        }

        return (
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Dashboard CESIM</BreadcrumbLink>
                </BreadcrumbItem>

                {paths.map((path, index) => {
                    const href = `/${paths.slice(0, index + 1).join('/')}`;
                    const isLast = index === paths.length - 1;

                    const formattedPath = path.charAt(0).toUpperCase() +
                        path.slice(1).replace(/-/g, ' ');

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{formattedPath}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href}>{formattedPath}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        );
    };

    useEffect(() => {
        const fetchEquipes = async () => {
            try {
                const equipesResponse = await fetch("/api/equipes");
                const equipesData = await equipesResponse.json();
                setEquipes(equipesData);

                const monEquipe = equipesData.find((e: Equipe) => e.estMonEquipe);
                if (monEquipe) {
                    setSelectedEquipe(monEquipe.id.toString());
                } else if (equipesData.length > 0) {
                    setSelectedEquipe(equipesData[0].id.toString());
                }
            } catch (error) {
                console.error("Erreur lors du chargement des équipes:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEquipes();
    }, []);

    return (
        <html lang="fr">
        <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <EquipeContext.Provider value={{ selectedEquipe, setSelectedEquipe, equipes }}>
                <SidebarProvider>
                    <div className="flex min-h-screen w-full">
                        <AppSidebar />
                        <SidebarInset className="flex flex-col flex-1">
                            <header className="flex fixed w-full h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 z-50 bg-sidebar text-foreground">
                                <div className="flex items-center justify-between w-full px-4">
                                    <div className="flex items-center gap-2">
                                        <SidebarTrigger className="-ml-1" />
                                        <ModeToggle />

                                        <Separator orientation="vertical" className="mr-2 h-4" />
                                        <Breadcrumb>
                                            {generateBreadcrumb()}
                                        </Breadcrumb>

                                    </div>
                                </div>
                            </header>
                            <main className="container mt-24 mb-12">
                                {children}
                            </main>
                        </SidebarInset>
                    </div>
                </SidebarProvider>
            </EquipeContext.Provider>
        </ThemeProvider>
        </body>
        </html>
    )
}