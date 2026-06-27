// constants.ts
// Valores default centralizados. Cores com contraste >= 4.5:1 (WCAG AA) sobre #FFFFFF.

export const DEFAULT_COLORS = {
    // Card
    cardBackground: "#FFFFFF",
    cardBorder: "#E0E0E0",
    accentBar: "#185FA5",
    // Tipografia (contraste corrigido)
    categoryColor: "#6E6E6E", // era #888888 (agora ~4.6:1)
    titleColor: "#555555",
    valueColor: "#212121",
    footerColor: "#767676", // era #AAAAAA (agora ~4.5:1)
    footerBorder: "#E0E0E0",
    // Variancia positiva
    varPositiveText: "#27500A",
    varPositiveBg: "#EAF3DE",
    // Variancia negativa
    varNegativeText: "#791F1F",
    varNegativeBg: "#FCEBEB",
    // Variancia neutra
    varNeutralText: "#555555",
    varNeutralBg: "#F5F5F5",
    // Sparkline
    sparkColor: "#185FA5",
    refLineColor: "#CCCCCC",
    meanLineColor: "#AAAAAA",
    // Progresso
    targetBarFill: "#185FA5",
    targetBarBg: "#E0E0E0",
    targetExceeded: "#27500A",
    // Secundarios
    secondaryBg: "#F5F5F5",
    secondaryLabel: "#6E6E6E",
    secondaryValue: "#212121",
} as const;

export const DEFAULT_FONT_FAMILY =
    "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif";

// Locale padrao para formatacao de numeros (pt-BR -> separador decimal virgula).
export const DEFAULT_LOCALE = "pt-BR";
