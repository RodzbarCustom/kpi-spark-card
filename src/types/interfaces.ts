// interfaces.ts — tipos internos do visual

export interface SecondaryKPI {
    /** Slot da medida (1, 2 ou 3) — alinha o KPI a sua propria config de formato. */
    slot: number;
    label: string;
    value: number | null;
    /** Format string da medida (ex: "0.0%", "#,0"), para formatacao Auto. */
    format?: string;
}

export interface MappedKPIData {
    isValid: boolean;
    errorMessage?: string;
    /** Nome da medida principal (usado como titulo do KPI). */
    title: string;
    mainValue: number | null;
    comparisonValue: number | null;
    targetValue: number | null;
    category: string | null;
    timeSeriesLabels: string[];
    sparkValues: number[];
    secondary: SecondaryKPI[];
}

export type LayoutType = "standard" | "compact" | "split";
export type DensityType = "compact" | "normal" | "spacious";
export type AlignmentType = "left" | "center" | "right";
