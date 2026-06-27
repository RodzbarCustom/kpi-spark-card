// cardParts.ts
// Construtores das pecas do cartao (categoria, titulo, valor, variancia, sparkline,
// progresso, secundarios, rodape). Os renderers apenas compoem o arranjo.

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "../settings";
import { MappedKPIData } from "../types/interfaces";
import { ValueFormatter, DisplayUnits } from "../components/ValueFormatter";
import { VarianceCalculator } from "../components/VarianceCalculator";
import { SparklineBuilder, SparklineType } from "../components/SparklineBuilder";
import { ProgressBarRenderer } from "../components/ProgressBarRenderer";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import { createHTMLElement, createSVGElement, setSVGAttributes } from "../utils/domUtils";
import { safeColor, applyOpacity } from "../utils/colorUtils";
import { DEFAULT_COLORS, DEFAULT_LOCALE } from "../constants";

export interface RenderContext {
    data: MappedKPIData;
    settings: VisualFormattingSettingsModel;
    isPremium: boolean;
    width: number;
    height: number;
}

interface FontSpec {
    family: string;
    sizePt: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
}

export function densityGap(settings: VisualFormattingSettingsModel): number {
    switch (settings.layout.density.value.value) {
        case "compact": return 4;
        case "spacious": return 14;
        default: return 8;
    }
}

function readFont(fc: formattingSettings.FontControl): FontSpec {
    return {
        family: fc.fontFamily.value,
        sizePt: fc.fontSize.value,
        bold: fc.bold?.value ?? false,
        italic: fc.italic?.value ?? false,
        underline: fc.underline?.value ?? false,
    };
}

function applyTextStyle(el: HTMLElement, font: FontSpec, color: string, align: string): void {
    el.style.fontFamily = font.family;
    el.style.fontSize = `${font.sizePt}pt`;
    el.style.fontWeight = font.bold ? "bold" : "normal";
    el.style.fontStyle = font.italic ? "italic" : "normal";
    el.style.textDecoration = font.underline ? "underline" : "none";
    el.style.color = color;
    el.style.textAlign = align;
    el.style.lineHeight = "1.2";
    el.style.whiteSpace = "nowrap";
    el.style.overflow = "hidden";
    el.style.textOverflow = "ellipsis";
}

// --- Superficie do cartao ----------------------------------------------------

export interface CardSurface {
    card: HTMLElement;
    content: HTMLElement;
}

export function buildCardSurface(ctx: RenderContext): CardSurface {
    const s = ctx.settings.card;
    const padding = s.padding.value;
    const accentEnabled = s.accentBarEnabled.value;
    const accentWidth = accentEnabled ? s.accentBarWidth.value : 0;

    const card = createHTMLElement("div", {
        position: "relative",
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
        background: applyOpacity(safeColor(s.backgroundColor.value.value, DEFAULT_COLORS.cardBackground), s.backgroundTransparency.value),
        border: `${s.borderWidth.value}px solid ${safeColor(s.borderColor.value.value, DEFAULT_COLORS.cardBorder)}`,
        borderRadius: `${s.borderRadius.value}px`,
        overflow: "hidden",
    });

    if (accentEnabled) {
        const accent = createHTMLElement("div", {
            position: "absolute",
            left: "0",
            top: "0",
            bottom: "0",
            width: `${accentWidth}px`,
            background: safeColor(s.accentBarColor.value.value, DEFAULT_COLORS.accentBar),
        });
        card.appendChild(accent);
    }

    const content = createHTMLElement("div", {
        position: "relative",
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: `${densityGap(ctx.settings)}px`,
        padding: `${padding}px`,
        paddingLeft: `${padding + accentWidth}px`,
    });
    card.appendChild(content);

    return { card, content };
}

// --- Categoria ---------------------------------------------------------------

export function buildCategory(ctx: RenderContext): HTMLElement | null {
    if (!ctx.settings.layout.showCategory.value) return null;
    const raw = ctx.data.category;
    if (raw == null || raw === "") return null;

    const c = ctx.settings.category;
    const el = createHTMLElement("div");
    let text = ValueFormatter.sanitizeText(raw);
    if (c.uppercase.value) text = text.toUpperCase();
    el.textContent = text;
    applyTextStyle(el, readFont(c.font), safeColor(c.fontColor.value.value, DEFAULT_COLORS.categoryColor), String(c.alignment.value.value));
    return el;
}

// --- Titulo ------------------------------------------------------------------

export function buildTitle(ctx: RenderContext): HTMLElement | null {
    const raw = ctx.data.title;
    if (!raw) return null;
    const t = ctx.settings.title;
    const el = createHTMLElement("div");
    el.textContent = ValueFormatter.sanitizeText(raw);
    applyTextStyle(el, readFont(t.font), safeColor(t.fontColor.value.value, DEFAULT_COLORS.titleColor), String(t.alignment.value.value));
    return el;
}

// --- Valor principal ---------------------------------------------------------

export function formatMainValue(ctx: RenderContext): string {
    const v = ctx.settings.mainValue;
    return ValueFormatter.format({
        value: ctx.data.mainValue,
        displayUnits: String(v.displayUnits.value.value) as DisplayUnits,
        decimalPlaces: v.decimalPlaces.value,
        prefix: v.prefix.value,
        suffix: v.suffix.value,
        locale: DEFAULT_LOCALE,
    });
}

export function buildMainValue(ctx: RenderContext): HTMLElement {
    const v = ctx.settings.mainValue;
    const el = createHTMLElement("div");
    el.textContent = formatMainValue(ctx);
    applyTextStyle(el, readFont(v.font), safeColor(v.fontColor.value.value, DEFAULT_COLORS.valueColor), String(v.alignment.value.value));
    el.style.whiteSpace = "nowrap";
    return el;
}

// --- Variancia ---------------------------------------------------------------

export function buildVarianceBadge(ctx: RenderContext): HTMLElement | null {
    const vs = ctx.settings.variance;
    if (!vs.varianceEnabled.value) return null;
    if (ctx.data.comparisonValue == null) return null;

    const result = VarianceCalculator.calculate(
        ctx.data.mainValue,
        ctx.data.comparisonValue,
        vs.positiveIsGood.value,
        vs.neutralThreshold.value
    );

    let text: string;
    let color: string;
    let bg: string;
    if (result.direction === "neutral") {
        color = safeColor(vs.colorNeutral.value.value, DEFAULT_COLORS.varNeutralText);
        bg = applyOpacity(safeColor(vs.bgNeutral.value.value, DEFAULT_COLORS.varNeutralBg), vs.bgNeutralTransparency.value);
    } else if (result.isGood) {
        color = safeColor(vs.colorPositive.value.value, DEFAULT_COLORS.varPositiveText);
        bg = applyOpacity(safeColor(vs.bgPositive.value.value, DEFAULT_COLORS.varPositiveBg), vs.bgPositiveTransparency.value);
    } else {
        color = safeColor(vs.colorNegative.value.value, DEFAULT_COLORS.varNegativeText);
        bg = applyOpacity(safeColor(vs.bgNegative.value.value, DEFAULT_COLORS.varNegativeBg), vs.bgNegativeTransparency.value);
    }

    // Indicador configuravel: triangulo (▲▼), seta (↑↓) ou nenhum (+/- como sinal nao-baseado-em-cor).
    const indicator = String(vs.varianceIndicator.value.value);
    const up = result.absolute !== null && result.absolute > 0;
    let glyph = "";
    let signPrefix = "";
    if (result.direction !== "neutral") {
        if (indicator === "triangle") glyph = up ? "▲" : "▼";
        else if (indicator === "arrow") glyph = up ? "↑" : "↓";
        else signPrefix = up ? "+" : "−"; // acessibilidade: mantem sinal sem depender de cor
    }

    const pctStr = result.percentage !== null
        ? new Intl.NumberFormat(DEFAULT_LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.abs(result.percentage)) + "%"
        : "—";
    const mv = ctx.settings.mainValue;
    const absStr = ValueFormatter.format({
        value: result.absolute !== null ? Math.abs(result.absolute) : null,
        displayUnits: String(mv.displayUnits.value.value) as DisplayUnits,
        decimalPlaces: mv.decimalPlaces.value,
        locale: DEFAULT_LOCALE,
    });

    const mode = String(vs.varianceMode.value.value);
    if (mode === "absolute") text = absStr;
    else if (mode === "both") text = `${absStr} (${pctStr})`;
    else text = pctStr;

    const row = createHTMLElement("div", {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexWrap: "wrap",
    });

    const vfont = vs.font;
    const badge = createHTMLElement("span", {
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        color,
        background: bg,
        fontFamily: vfont.fontFamily.value,
        fontSize: `${vfont.fontSize.value}pt`,
        fontWeight: (vfont.bold?.value ?? false) ? "bold" : "normal",
        fontStyle: (vfont.italic?.value ?? false) ? "italic" : "normal",
        textDecoration: (vfont.underline?.value ?? false) ? "underline" : "none",
        padding: "1px 7px",
        borderRadius: "10px",
        lineHeight: "1.3",
    });
    badge.textContent = `${glyph ? glyph + " " : ""}${signPrefix}${text}`;
    row.appendChild(badge);

    const label = ValueFormatter.sanitizeText(vs.varianceLabel.value);
    if (label) {
        const lbl = createHTMLElement("span", {
            color: safeColor(ctx.settings.footer.footerColor.value.value, DEFAULT_COLORS.footerColor),
            fontSize: `${vfont.fontSize.value}pt`,
            fontFamily: vfont.fontFamily.value,
        });
        lbl.textContent = label;
        row.appendChild(lbl);
    }

    return row;
}

// --- Sparkline ---------------------------------------------------------------

export function buildSparkline(ctx: RenderContext, width: number, heightOverride?: number): SVGElement | null {
    const sp = ctx.settings.sparkline;
    if (!sp.sparkEnabled.value) return null;
    if (ctx.data.sparkValues.filter((v) => isFinite(v)).length < 2) return null;

    const height = heightOverride && heightOverride > 0 ? heightOverride : sp.sparkHeight.value;
    const svg = createSVGElement("svg");
    setSVGAttributes(svg, {
        viewBox: `0 0 ${width} ${height}`,
        preserveAspectRatio: "none",
        "aria-hidden": "true",
    });
    svg.style.width = "100%";
    svg.style.height = `${height}px`;
    svg.style.display = "block";

    SparklineBuilder.build(svg, {
        values: ctx.data.sparkValues,
        width,
        height,
        type: String(sp.sparkType.value.value) as SparklineType,
        color: safeColor(sp.sparkColor.value.value, DEFAULT_COLORS.sparkColor),
        areaOpacity: sp.sparkAreaOpacity.value,
        lineWidth: sp.sparkLineWidth.value,
        referenceValue: sp.showRefLine.value && ctx.data.targetValue != null ? ctx.data.targetValue : undefined,
        refLineColor: safeColor(sp.refLineColor.value.value, DEFAULT_COLORS.refLineColor),
        refLineStyle: String(sp.refLineStyle.value.value) as "solid" | "dashed" | "dotted",
        meanLineEnabled: sp.showMeanLine.value,
        meanLineColor: safeColor(sp.meanLineColor.value.value, DEFAULT_COLORS.meanLineColor),
        showEndDot: sp.showEndDot.value,
        endDotRadius: sp.endDotRadius.value,
        smooth: sp.sparkSmooth.value,
    });

    return svg;
}

// --- Progresso vs. meta ------------------------------------------------------

export function buildProgress(ctx: RenderContext): HTMLElement | null {
    const t = ctx.settings.target;
    if (!t.targetEnabled.value) return null;
    if (ctx.data.targetValue == null || ctx.data.mainValue == null) return null;

    const mv = ctx.settings.mainValue;
    const formattedTarget = ValueFormatter.format({
        value: ctx.data.targetValue,
        displayUnits: String(mv.displayUnits.value.value) as DisplayUnits,
        decimalPlaces: mv.decimalPlaces.value,
        prefix: mv.prefix.value,
        suffix: mv.suffix.value,
        locale: DEFAULT_LOCALE,
    });

    return ProgressBarRenderer.render({
        current: ctx.data.mainValue,
        target: ctx.data.targetValue,
        label: ValueFormatter.sanitizeText(t.targetLabel.value),
        formattedTarget,
        barColor: safeColor(t.targetBarColor.value.value, DEFAULT_COLORS.targetBarFill),
        barBgColor: applyOpacity(safeColor(t.targetBarBgColor.value.value, DEFAULT_COLORS.targetBarBg), t.targetBarBgTransparency.value),
        exceededColor: safeColor(t.targetColorExceeded.value.value, DEFAULT_COLORS.targetExceeded),
        barHeight: t.targetBarHeight.value,
        barRadius: t.targetBarRadius.value,
        fontSizePt: t.font.fontSize.value,
        fontFamily: t.font.fontFamily.value,
        fontBold: t.font.bold?.value ?? false,
        fontItalic: t.font.italic?.value ?? false,
        fontUnderline: t.font.underline?.value ?? false,
        fontColor: safeColor(ctx.settings.footer.footerColor.value.value, DEFAULT_COLORS.footerColor),
    });
}

// --- KPIs secundarios (premium) ---------------------------------------------

/**
 * Formata o valor secundario. Auto = respeita o format string da medida (%, moeda,
 * etc.) via valueFormatter oficial; Manual = usa unidades/decimais do card.
 */
function formatSecondaryValue(ctx: RenderContext, kpi: { slot: number; value: number | null; format?: string }): string {
    if (kpi.value == null || !isFinite(kpi.value)) return "—";
    const sc = ctx.settings.secondary;
    const idx = Math.min(Math.max(kpi.slot - 1, 0), 3); // alinha ao KPI correto (1..4)
    if (String(sc.formatMode[idx].value.value) === "manual") {
        return ValueFormatter.format({
            value: kpi.value,
            displayUnits: String(sc.displayUnits[idx].value.value) as DisplayUnits,
            decimalPlaces: sc.decimals[idx].value,
            locale: DEFAULT_LOCALE,
        });
    }
    // Auto: respeita o format string da propria medida (%, moeda, etc.).
    if (kpi.format) {
        return valueFormatter.format(kpi.value, kpi.format, false, DEFAULT_LOCALE);
    }
    // Sem format definido na medida: usa escala automatica K/M/B (evita numero cru gigante).
    return ValueFormatter.format({ value: kpi.value, displayUnits: "auto", decimalPlaces: 1, locale: DEFAULT_LOCALE });
}

export function buildSecondary(ctx: RenderContext): HTMLElement | null {
    const sc = ctx.settings.secondary;
    if (!sc.secondaryEnabled.value) return null;
    if (ctx.data.secondary.length === 0) return null;

    const wrap = createHTMLElement("div", {
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
    });

    for (const kpi of ctx.data.secondary) {
        const chip = createHTMLElement("div", {
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            background: applyOpacity(safeColor(sc.secondaryBgColor.value.value, DEFAULT_COLORS.secondaryBg), sc.secondaryBgTransparency.value),
            borderRadius: "6px",
            padding: "4px 8px",
            minWidth: "0",
            flex: "1 1 auto",
        });
        const label = createHTMLElement("span", {
            fontSize: `${sc.secondaryLabelSize.value}pt`,
            color: safeColor(sc.secondaryLabelColor.value.value, DEFAULT_COLORS.secondaryLabel),
            fontFamily: ctx.settings.title.font.fontFamily.value,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
        });
        label.textContent = ValueFormatter.sanitizeText(kpi.label);
        const value = createHTMLElement("span", {
            fontSize: `${sc.secondaryValueSize.value}pt`,
            color: safeColor(sc.secondaryValueColor.value.value, DEFAULT_COLORS.secondaryValue),
            fontWeight: sc.secondaryValueBold.value ? "bold" : "normal",
            fontFamily: ctx.settings.title.font.fontFamily.value,
            whiteSpace: "nowrap",
        });
        value.textContent = formatSecondaryValue(ctx, kpi);
        chip.appendChild(label);
        chip.appendChild(value);
        wrap.appendChild(chip);
    }

    return wrap;
}

// --- Rodape ------------------------------------------------------------------

export function buildFooter(ctx: RenderContext): HTMLElement | null {
    if (!ctx.settings.layout.showFooter.value) return null;
    const f = ctx.settings.footer;

    const periodOverride = ValueFormatter.sanitizeText(f.periodLabel.value);
    const freqOverride = ValueFormatter.sanitizeText(f.frequencyLabel.value);

    let period = periodOverride;
    if (!period) {
        const labels = ctx.data.timeSeriesLabels;
        if (labels.length >= 2) period = `${ValueFormatter.sanitizeText(labels[0])} – ${ValueFormatter.sanitizeText(labels[labels.length - 1])}`;
        else if (labels.length === 1) period = ValueFormatter.sanitizeText(labels[0]);
    }

    if (!period && !freqOverride) return null;

    const footer = createHTMLElement("div", {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "auto",
        paddingTop: "5px",
        borderTop: `1px solid ${safeColor(f.footerBorderColor.value.value, DEFAULT_COLORS.footerBorder)}`,
        fontSize: `${f.footerFontSize.value}pt`,
        color: safeColor(f.footerColor.value.value, DEFAULT_COLORS.footerColor),
        fontFamily: ctx.settings.title.font.fontFamily.value,
    });
    const left = createHTMLElement("span");
    left.textContent = period;
    const right = createHTMLElement("span");
    right.textContent = freqOverride;
    footer.appendChild(left);
    footer.appendChild(right);
    return footer;
}

// --- Deteccao de feature premium em uso --------------------------------------

export function premiumFeatureInUse(ctx: RenderContext): string | null {
    const s = ctx.settings;
    if (String(s.layout.layoutType.value.value) === "split") return "Layout Split";
    const sparkType = String(s.sparkline.sparkType.value.value);
    if (s.sparkline.sparkEnabled.value && (sparkType === "bar" || sparkType === "step")) return "Sparkline Barra/Step";
    if (s.secondary.secondaryEnabled.value && ctx.data.secondary.length > 0) return "KPIs Secundarios";
    if (s.sparkline.sparkEnabled.value && s.sparkline.showRefLine.value) return "Linha de referencia";
    if (s.sparkline.sparkEnabled.value && s.sparkline.showMeanLine.value) return "Linha de media";
    return null;
}
