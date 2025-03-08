// lib/chart-utils.tsx
import * as React from "react";

// Types génériques pour les tooltips
export interface ChartTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    [key: string]: any;
}

// Fonction pour formater les valeurs monétaires
export const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "N/A";
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    }).format(value);
};

// Fonction pour formater les pourcentages
export const formatPercent = (value: number | undefined) => {
    if (value === undefined || value === null) return "N/A";
    return `${value.toFixed(2)}%`;
};

// Tooltip générique pour les graphiques linéaires
export const GenericLineTooltip: React.FC<ChartTooltipProps> = ({
                                                                    active,
                                                                    payload,
                                                                    label,
                                                                    formatter = formatCurrency,
                                                                    sortItems = true
                                                                }) => {
    if (!active || !payload || !payload.length) return null;

    let items = [...payload].filter(p => p.value !== undefined && p.value !== null);

    if (sortItems) {
        items = items.sort((a, b) => b.value - a.value);
    }

    return (
        <div className="bg-popover border border-border rounded-md p-3 shadow-lg text-foreground">
        <p className="font-bold">{label}</p>
            <div className="mt-2 space-y-1">
        {items.map((entry, index) => {
                // Pour gérer différentes structures de données
                const name = entry.name || entry.dataKey || 'Valeur';
                const isHighlighted = entry.payload &&
                    entry.dataKey &&
                    entry.payload[`${entry.dataKey}_estMonEquipe`];

                return (
                    <div key={index} className="flex items-center gap-2">
                <div style={{ width: 12, height: 12, backgroundColor: entry.color }} />
                <span className={isHighlighted ? 'font-bold' : ''}>
                    {name}: {formatter(entry.value)}
                </span>
                </div>
            );
            })}
        </div>
        </div>
);
};

// Tooltip pour les graphiques en barres (avec mise en forme verticale)
export const GenericBarTooltip: React.FC<ChartTooltipProps> = ({
                                                                   active,
                                                                   payload,
                                                                   formatter = formatCurrency
                                                               }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const isHighlighted = data.estMonEquipe;

    return (
        <div className="bg-popover border border-border rounded-md p-3 shadow-lg text-foreground">
        <p className={`font-medium ${isHighlighted ? 'font-bold' : ''}`}>
    {data.equipe} {isHighlighted ? '(Mon Equipe)' : ''}
    </p>
    <p className="mt-1">
    <span className="font-bold">{formatter(data.value)}</span>
    </p>
    </div>
);
};

// Tooltip pour les graphiques en camembert
export const GenericPieTooltip: React.FC<ChartTooltipProps> = ({
                                                                   active,
                                                                   payload,
                                                                   formatter = formatCurrency
                                                               }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0];

    return (
        <div className="bg-popover border border-border rounded-md p-3 shadow-lg text-foreground">
        <p className="font-bold">{data.name}</p>
            <p className="mt-1">
        {formatter(data.value)}
    {data.percent !== undefined && ` (${(data.percent * 100).toFixed(1)}%)`}
    </p>
    </div>
);
};