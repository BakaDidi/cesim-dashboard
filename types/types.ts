export interface Equipe {
    id: number;
    nom: string;
    estMonEquipe: boolean;
}

export interface Round {
    id: number;
    numero: number;
    date: string;
    commentaires: string;
}

export interface Performance {
    id: number;
    equipe: string;
    equipeId?: number;
    roundId: number;
    roundNumero: number;
    revenuGlobal: number;
    beneficeNetGlobal: number;
    ebitdaGlobal: number;
    ebitGlobal: number;
    revenuUSA: number;
    beneficeNetUSA: number;
    ebitdaUSA: number;
    ebitUSA: number;
    revenuEurope: number;
    beneficeNetEurope: number;
    ebitdaEurope: number;
    ebitEurope: number;
    revenuAsie: number;
    beneficeNetAsie: number;
    ebitdaAsie: number;
    ebitAsie: number;
    rendementCumulatif: number;
    coursAction: number;
    equipeNom?: string;
    estMonEquipe?: boolean;
}

export interface MarketShare {
    id: number;
    equipe: string;
    equipeId?: number;
    roundId: number;
    roundNumero: number;
    partMarcheGlobal: number;
    partTechno1Global: number;
    partTechno2Global: number;
    partTechno3Global: number;
    partTechno4Global: number;
    partMarcheUSA: number;
    partTechno1USA: number;
    partTechno2USA: number;
    partTechno3USA: number;
    partTechno4USA: number;
    partMarcheEurope: number;
    partTechno1Europe: number;
    partTechno2Europe: number;
    partTechno3Europe: number;
    partTechno4Europe: number;
    partMarcheAsie: number;
    partTechno1Asie: number;
    partTechno2Asie: number;
    partTechno3Asie: number;
    partTechno4Asie: number;
    equipeNom?: string;
    estMonEquipe?: boolean;
}

export interface HrData {
    id: number;
    equipe: string;
    equipeId?: number;
    roundId: number;
    roundNumero: number;
    employesRD: number;
    tauxRotation: number;
    budgetFormation: number;
    salairesMensuels: number;
    equipeNom?: string;
    estMonEquipe?: boolean;
}

export interface Production {
    id: number;
    equipe: string;
    equipeId?: number;
    roundId: number;
    roundNumero: number;
    techno1ProductionUSA: number;
    techno2ProductionUSA: number;
    techno3ProductionUSA: number;
    techno4ProductionUSA: number;
    techno1ProductionAsie: number;
    techno2ProductionAsie: number;
    techno3ProductionAsie: number;
    techno4ProductionAsie: number;
    capaciteUSA: number;
    capaciteAsie: number;
    couvertureReseau: number;
    equipeNom?: string;
    estMonEquipe?: boolean;
}

export interface Financial {
    id: number;
    equipe: string;
    equipeId?: number;
    roundId: number;
    roundNumero: number;
    immobilisations: number;
    stocks: number;
    creancesClients: number;
    tresorerie: number;
    totalActif: number;
    capitalSocial: number;
    primeEmission: number;
    resultatNet: number;
    reportNouveau: number;
    totalCapitauxPropres: number;
    dettesLongTerme: number;
    dettesCourtTerme: number;
    detteFournisseurs: number;
    totalDette: number;
    equipeNom?: string;
    estMonEquipe?: boolean;
}

// Types spécifiques pour les composants

export interface ChartDataItem {
    [key: string]: any;
    round: string;
}

export interface EquipeWithData {
    equipe: Equipe;
    performances?: Performance[];
    marketShares?: MarketShare[];
    hrData?: HrData[];
    productions?: Production[];
    financials?: Financial[];
}

export interface MetricOption {
    value: string;
    label: string;
    group?: string;
}

export interface TeamData {
    id: string;
    name: string;
    logo: React.ElementType;
    plan: string;
    estMonEquipe: boolean;
}

export interface RankingItem {
    id: number;
    equipeNom: string;
    estMonEquipe: boolean;
    [key: string]: any;
}

export interface TooltipProps {
    active?: boolean;
    payload?: any[];
    label?: any;
}

export interface RadarDataItem {
    metric: string;
    [key: string]: any;
}

export interface LatestRoundDataItem {
    equipe: string;
    equipeId: string | number;
    value: number;
    estMonEquipe: boolean;
}