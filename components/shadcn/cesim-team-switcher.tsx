import { ChevronsUpDown, Users } from "lucide-react"
import { useCallback, useMemo, memo } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

interface TeamData {
    id: string;
    name: string;
    logo: React.ElementType;
    plan: string;
    estMonEquipe: boolean;
}

interface TeamSwitcherProps {
    teams: TeamData[];
    activeTeam: string;
    onTeamChange: (teamId: string) => void;
}

// Memoized dropdown menu item component
const MemoizedDropdownMenuItem = memo(({
                                           team,
                                           isActive,
                                           index,
                                           onTeamChange
                                       }: {
    team: TeamData;
    isActive: boolean;
    index: number;
    onTeamChange: (teamId: string) => void;
}) => {
    const handleClick = useCallback(() => {
        onTeamChange(team.id);
    }, [team.id, onTeamChange]);

    return (
        <DropdownMenuItem
            onClick={handleClick}
            className={`gap-2 p-2 ${isActive ? "bg-accent" : ""}`}
        >
            <div className="flex size-6 items-center justify-center rounded-sm border">
                <Users className="size-4 shrink-0" />
            </div>
            {team.name} {team.estMonEquipe ? "(Mon Equipe)" : ""}
            {index < 9 && (
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
            )}
        </DropdownMenuItem>
    );
});

MemoizedDropdownMenuItem.displayName = "MemoizedDropdownMenuItem";

// Main component with memoization
export const CesimTeamSwitcher = memo(function CesimTeamSwitcher({
                                                                     teams,
                                                                     activeTeam,
                                                                     onTeamChange
                                                                 }: TeamSwitcherProps) {
    const { isMobile } = useSidebar();

    // Memoize the selected team to avoid recalculation on each render
    const selectedTeam = useMemo(() =>
            teams.find(team => team.id === activeTeam),
        [teams, activeTeam]
    );

    // If no team is selected, don't render anything
    if (!selectedTeam) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <Users className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {selectedTeam.name}
                                </span>
                                <span className="truncate text-xs">{selectedTeam.plan}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Équipes
                        </DropdownMenuLabel>
                        {teams.map((team, index) => (
                            <MemoizedDropdownMenuItem
                                key={team.id}
                                team={team}
                                isActive={team.id === activeTeam}
                                index={index}
                                onTeamChange={onTeamChange}
                            />
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
});