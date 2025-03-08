"use client"

import * as React from "react"
import { useContext, useMemo, useCallback } from "react"
import {
    Bot,
    GalleryVerticalEnd,
    PieChart,
    BarChart3,
} from "lucide-react"

import { NavMain } from "@/components/shadcn/nav-main"
import { EquipeContext } from "@/app/layout" // Import du contexte
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import { CesimTeamSwitcher } from "@/components/shadcn/cesim-team-switcher"

// Mise à jour des items de navigation avec la nouvelle page de comparaison
const navMainItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: PieChart,
    },
    {
        title: "Comparaison",
        url: "/compare",
        icon: BarChart3,
    },
    {
        title: "Upload",
        url: "/upload",
        icon: Bot,
    },
];

function AppSidebarComponent({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { selectedEquipe, setSelectedEquipe, equipes } = useContext(EquipeContext);

    // Sample data for non-team related UI - moved outside render function
    const data = useMemo(() => ({
        navMain: navMainItems,
    }), []);

    // Memoize the handler to prevent recreating it on each render
    const handleEquipeChange = useCallback((equipeId: string) => {
        setSelectedEquipe(equipeId);
    }, [setSelectedEquipe]);

    // Memoize the active equipe calculation
    const activeEquipe = useMemo(() =>
            equipes.find(eq => eq.id.toString() === selectedEquipe),
        [equipes, selectedEquipe]
    );

    // Memoize the teams data transformation
    const teamsData = useMemo(() =>
            equipes.map(equipe => ({
                id: equipe.id.toString(),
                name: equipe.nom,
                logo: GalleryVerticalEnd,
                plan: equipe.estMonEquipe ? "Mon équipe" : "Équipe",
                estMonEquipe: equipe.estMonEquipe
            })),
        [equipes]
    );

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                {/* Affiche le TeamSwitcher uniquement quand les équipes sont chargées */}
                {equipes.length > 0 && activeEquipe && (
                    <CesimTeamSwitcher
                        teams={teamsData}
                        activeTeam={activeEquipe.id.toString()}
                        onTeamChange={handleEquipeChange}
                    />
                )}
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}

export const AppSidebar = React.memo(AppSidebarComponent);