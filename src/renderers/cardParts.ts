// cardParts.ts
// Construtores das pecas do cartao (categoria, titulo, valor, variancia, sparkline,
// progresso, secundarios, rodape). Os renderers apenas compoem o arranjo.

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "../settings";
import { MappedKPIData } from "../types/interfaces";
import { ValueFormatter } from "../components/ValueFormatter";
import { VarianceCalculator } from "../components/VarianceCalculator";
import { SparklineBuilder, SparklineType } from "../components/SparklineBuilder";
import { ProgressBarRenderer } from "../components/ProgressBarRenderer";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import { createHTMLElement, createSVGElement, setSVGAttributes } from "../utils/domUtils";
import { safeColor, applyOpacity } from "../utils/colorUtils";
import { DEFAULT_COLORS, DEFAULT_LOCALE } from "../constants";

/** Cores de alto contraste fornecidas pelo host. */
export interface HighContrast {
    enabled: boolean;
    fg: string;
    bg: string;
}

export interface RenderContext {
    data: MappedKPIData;
    settings: VisualFormattingSettingsModel;
    isPremium: boolean;
    width: number;
    height: number;
    locale: string;
    hc?: HighContrast;
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

// --- Resolucao de cor (com Alto Contraste) -----------------------------------

function hcOn(ctx: RenderContext): boolean {
    return !!ctx.hc?.enabled;
}
/** Cor de primeiro plano (texto/linhas): em HC usa o foreground do host. */
function fgColor(ctx: RenderContext, userVal: string | undefined, fallback: string): string {
    return hcOn(ctx) ? (ctx.hc!.fg || "#000000") : safeColor(userVal, fallback);
}
/** Cor de fundo solida: em HC usa o background do host (sem transparencia). */
function bgColor(ctx: RenderContext, userVal: string | undefined, fallback: string, transparency: number): string {
    return hcOn(ctx) ? (ctx.hc!.bg || "#FFFFFF") : applyOpacity(safeColor(userVal, fallback), transparency);
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

/**
 * Aplica fonte/cor/alinhamento e quebra de texto.
 * wrap=true: preserva espacos extras e quebra linha (white-space: pre-wrap).
 * wrap=false: corta com reticencias (nowrap + ellipsis).
 */
function applyTextStyle(el: HTMLElement, font: FontSpec, color: string, align: string, wrap = false): void {
    el.style.fontFamily = font.family;
    el.style.fontSize = `${font.sizePt}pt`;
    el.style.fontWeight = font.bold ? "bold" : "normal";
    el.style.fontStyle = font.italic ? "italic" : "normal";
    el.style.textDecoration = font.underline ? "underline" : "none";
    el.style.color = color;
    el.style.textAlign = align;
    el.style.lineHeight = "1.2";
    el.style.overflow = "hidden";
    if (wrap) {
        el.style.whiteSpace = "pre-wrap";
        el.style.wordBreak = "break-word";
    } else {
        el.style.whiteSpace = "nowrap";
        el.style.textOverflow = "ellipsis";
    }
}

// --- Motor de formatacao de valor (estilo cartao nativo) ---------------------

/** Numero representativo que forca a unidade de exibicao no valueFormatter. */
function unitRepresentative(units: string, value: number): number {
    switch (units) {
        case "none": return 0;
        case "thousands": return 1e3;
        case "millions": return 1e6;
        case "billions": return 1e9;
        case "trillions": return 1e12;
        default: return Math.abs(value); // auto
    }
}

/**
 * Formata um valor respeitando o format string da medida (%, moeda) e aplicando
 * unidade de exibicao (Auto/Nenhum/Mil/Milhao/Bilhao/Trilhao) e casas decimais
 * (Auto ou manual). Equivalente ao "valor do balao" do cartao nativo.
 */
function formatValueNative(
    value: number | null | undefined,
    format: string | undefined,
    units: string,
    decimalsAuto: boolean,
    decimals: number,
    locale: string = DEFAULT_LOCALE
): string {
    if (value == null || !isFinite(value)) return "—";
    const fmt = valueFormatter.create({
        format: format,
        value: unitRepresentative(units, value),
        precision: decimalsAuto ? undefined : decimals,
        cultureSelector: locale,
    });
    return fmt.format(value);
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
    // Em alto contraste garante borda visivel (stroke claro).
    const borderWidth = hcOn(ctx) ? Math.max(1, s.borderWidth.value) : s.borderWidth.value;

    const card = createHTMLElement("div", {
        position: "relative",
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
        background: bgColor(ctx, s.backgroundColor.value.value, DEFAULT_COLORS.cardBackground, s.backgroundTransparency.value),
        border: `${borderWidth}px solid ${fgColor(ctx, s.borderColor.value.value, DEFAULT_COLORS.cardBorder)}`,
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
            background: fgColor(ctx, s.accentBarColor.value.value, DEFAULT_COLORS.accentBar),
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
    const c = ctx.settings.category;
    const override = ValueFormatter.sanitizeText(c.text.value);
    let raw = override || ValueFormatter.sanitizeText(ctx.data.category ?? "");
    if (!raw) return null;
    if (c.uppercase.value) raw = raw.toUpperCase();

    const el = createHTMLElement("div");
    el.textContent = raw;
    applyTextStyle(el, readFont(c.font), fgColor(ctx, c.fontColor.value.value, DEFAULT_COLORS.categoryColor), String(c.alignment.value.value), c.wrap.value);
    return el;
}

// --- Titulo ------------------------------------------------------------------

export function buildTitle(ctx: RenderContext): HTMLElement | null {
    const t = ctx.settings.title;
    const override = ValueFormatter.sanitizeText(t.text.value);
    const raw = override || ValueFormatter.sanitizeText(ctx.data.title);
    if (!raw) return null;

    const el = createHTMLElement("div");
    el.textContent = raw;
    applyTextStyle(el, readFont(t.font), fgColor(ctx, t.fontColor.value.value, DEFAULT_COLORS.titleColor), String(t.alignment.value.value), t.wrap.value);
    return el;
}

// --- Valor principal ---------------------------------------------------------

export function formatMainValue(ctx: RenderContext): string {
    const v = ctx.settings.mainValue;
    const num = formatValueNative(
        ctx.data.mainValue,
        ctx.data.mainFormat,
        String(v.displayUnits.value.value),
        v.decimalsAuto.value,
        v.decimalPlaces.value,
        ctx.locale
    );
    const prefix = ValueFormatter.sanitizeText(v.prefix.value);
    const suffix = ValueFormatter.sanitizeText(v.suffix.value);
    return `${prefix}${num}${suffix}`;
}

export function buildMainValue(ctx: RenderContext): HTMLElement {
    const v = ctx.settings.mainValue;
    const el = createHTMLElement("div");
    const text = formatMainValue(ctx);
    el.textContent = text;
    applyTextStyle(el, readFont(v.font), fgColor(ctx, v.fontColor.value.value, DEFAULT_COLORS.valueColor), String(v.alignment.value.value), v.wrap.value);
    // Acessibilidade: descricao textual do valor principal.
    const title = ValueFormatter.sanitizeText(ctx.data.title);
    el.setAttribute("aria-label", title ? `${title}: ${text}` : `Valor principal: ${text}`);
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
    // Em alto contraste: pilula foreground/background com borda visivel.
    let badgeBorder = "none";
    if (hcOn(ctx)) {
        color = ctx.hc!.fg;
        bg = ctx.hc!.bg;
        badgeBorder = `1px solid ${ctx.hc!.fg}`;
    }

    // Indicador configuravel: triangulo (▲▼), seta (↑↓) ou nenhum (+/- como sinal nao-baseado-em-cor).
    const indicator = String(vs.varianceIndicator.value.value);
    const up = result.absolute !== null && result.absolute > 0;
    let glyph = "";
    let signPrefix = "";
    if (result.direction !== "neutral") {
        if (indicator === "triangle") glyph = up ? "▲" : "▼";
        else if (indicator === "arrow") glyph = up ? "↑" : "↓";
        else signPrefix = up ? "+" : "−";
    }

    const pctStr = result.percentage !== null
        ? new Intl.NumberFormat(ctx.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.abs(result.percentage)) + "%"
        : "—";
    const mv = ctx.settings.mainValue;
    const absStr = formatValueNative(
        result.absolute !== null ? Math.abs(result.absolute) : null,
        ctx.data.mainFormat,
        String(mv.displayUnits.value.value),
        mv.decimalsAuto.value,
        mv.decimalPlaces.value,
        ctx.locale
    );

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
        border: badgeBorder,
        fontFamily: vfont.fontFamily.value,
        fontSize: `${vfont.fontSize.value}pt`,
        fontWeight: (vfont.bold?.value ?? false) ? "bold" : "normal",
        fontStyle: (vfont.italic?.value ?? false) ? "italic" : "normal",
        textDecoration: (vfont.underline?.value ?? false) ? "underline" : "none",
        padding: "1px 7px",
        borderRadius: "10px",
        lineHeight: "1.3",
        minWidth: "34px",
        justifyContent: "center",
    });
    badge.textContent = `${glyph ? glyph + " " : ""}${signPrefix}${text}`;
    const label = ValueFormatter.sanitizeText(vs.varianceLabel.value);
    // Acessibilidade: descricao textual da variancia (direcao + valor + rotulo).
    const dirWord = result.direction === "positive" ? "aumento" : result.direction === "negative" ? "queda" : "estavel";
    badge.setAttribute("role", "img");
    badge.setAttribute("aria-label", `Variancia: ${dirWord} ${signPrefix}${text}${label ? " " + label : ""}`);
    row.appendChild(badge);

    if (label) {
        const lbl = createHTMLElement("span", {
            color: fgColor(ctx, ctx.settings.footer.footerColor.value.value, DEFAULT_COLORS.footerColor),
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
    // Aceita 1 ponto (renderiza ponto unico) ou mais; 0 pontos validos -> nao renderiza.
    if (ctx.data.sparkValues.filter((v) => isFinite(v)).length < 1) return null;

    // Sem override, a altura respeita a densidade (compacto menor, espacoso maior).
    const density = String(ctx.settings.layout.density.value.value);
    const densityFactor = density === "compact" ? 0.8 : density === "spacious" ? 1.2 : 1;
    const height = heightOverride != null && heightOverride > 0
        ? heightOverride
        : Math.round(sp.sparkHeight.value * densityFactor);
    const svg = createSVGElement("svg");
    setSVGAttributes(svg, {
        viewBox: `0 0 ${width} ${height}`,
        preserveAspectRatio: "none",
        "aria-hidden": "true",
    });
    svg.style.width = "100%";
    svg.style.height = `${height}px`;
    svg.style.display = "block";

    const sparkColor = fgColor(ctx, sp.sparkColor.value.value, DEFAULT_COLORS.sparkColor);
    SparklineBuilder.build(svg, {
        values: ctx.data.sparkValues,
        width,
        height,
        type: String(sp.sparkType.value.value) as SparklineType,
        color: sparkColor,
        areaOpacity: sp.sparkAreaOpacity.value,
        lineWidth: sp.sparkLineWidth.value,
        referenceValue: sp.showRefLine.value && ctx.data.targetValue != null ? ctx.data.targetValue : undefined,
        refLineColor: fgColor(ctx, sp.refLineColor.value.value, DEFAULT_COLORS.refLineColor),
        refLineStyle: String(sp.refLineStyle.value.value) as "solid" | "dashed" | "dotted",
        meanLineEnabled: sp.showMeanLine.value,
        meanLineColor: fgColor(ctx, sp.meanLineColor.value.value, DEFAULT_COLORS.meanLineColor),
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
    const num = formatValueNative(
        ctx.data.targetValue,
        ctx.data.mainFormat,
        String(mv.displayUnits.value.value),
        mv.decimalsAuto.value,
        mv.decimalPlaces.value,
        ctx.locale
    );
    const formattedTarget = `${ValueFormatter.sanitizeText(mv.prefix.value)}${num}${ValueFormatter.sanitizeText(mv.suffix.value)}`;

    return ProgressBarRenderer.render({
        current: ctx.data.mainValue,
        target: ctx.data.targetValue,
        label: ValueFormatter.sanitizeText(t.targetLabel.value),
        formattedTarget,
        barColor: fgColor(ctx, t.targetBarColor.value.value, DEFAULT_COLORS.targetBarFill),
        barBgColor: bgColor(ctx, t.targetBarBgColor.value.value, DEFAULT_COLORS.targetBarBg, t.targetBarBgTransparency.value),
        exceededColor: fgColor(ctx, t.targetColorExceeded.value.value, DEFAULT_COLORS.targetExceeded),
        trackBorder: hcOn(ctx) ? ctx.hc!.fg : undefined,
        barHeight: t.targetBarHeight.value,
        barRadius: t.targetBarRadius.value,
        fontSizePt: t.font.fontSize.value,
        fontFamily: t.font.fontFamily.value,
        fontBold: t.font.bold?.value ?? false,
        fontItalic: t.font.italic?.value ?? false,
        fontUnderline: t.font.underline?.value ?? false,
        fontColor: fgColor(ctx, ctx.settings.footer.footerColor.value.value, DEFAULT_COLORS.footerColor),
    });
}

// --- KPIs secundarios (premium) ---------------------------------------------

function formatSecondaryValue(ctx: RenderContext, kpi: { slot: number; value: number | null; format?: string }): string {
    const sc = ctx.settings.secondary;
    const idx = Math.min(Math.max(kpi.slot - 1, 0), 3); // alinha ao KPI correto (1..4)
    return formatValueNative(
        kpi.value,
        kpi.format,
        String(sc.displayUnits[idx].value.value),
        sc.decimalsAuto[idx].value,
        sc.decimals[idx].value,
        ctx.locale
    );
}

export function buildSecondary(ctx: RenderContext): HTMLElement | null {
    const sc = ctx.settings.secondary;
    if (!sc.secondaryEnabled.value) return null;
    if (ctx.data.secondary.length === 0) return null;

    const chipBorder = hcOn(ctx) ? `1px solid ${ctx.hc!.fg}` : "none";

    const wrap = createHTMLElement("div", { display: "flex", gap: "6px", flexWrap: "wrap" });

    for (const kpi of ctx.data.secondary) {
        const idx = Math.min(Math.max(kpi.slot - 1, 0), 3);
        // Estilo independente por KPI (1..4).
        const labelFont = readFont(sc.labelFont[idx]);
        const valueFont = readFont(sc.valueFont[idx]);
        const labelColor = fgColor(ctx, sc.labelColor[idx].value.value, DEFAULT_COLORS.secondaryLabel);
        const valueColor = fgColor(ctx, sc.valueColor[idx].value.value, DEFAULT_COLORS.secondaryValue);
        const align = String(sc.labelAlignment[idx].value.value);
        const labelWrap = sc.labelWrap[idx].value;
        const valueWrap = sc.valueWrap[idx].value;
        const bg = bgColor(ctx, sc.bgColor[idx].value.value, DEFAULT_COLORS.secondaryBg, sc.bgTransparency[idx].value);

        const labelText = ValueFormatter.sanitizeText(sc.labelText[idx].value) || ValueFormatter.sanitizeText(kpi.label);
        const valueText = formatSecondaryValue(ctx, kpi);

        const chip = createHTMLElement("div", {
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            background: bg,
            border: chipBorder,
            borderRadius: "6px",
            padding: "4px 8px",
            minWidth: "0",
            flex: "1 1 auto",
        }, { role: "group", tabindex: "0", "aria-label": `${labelText}: ${valueText}` });

        const labelEl = createHTMLElement("span");
        labelEl.textContent = labelText;
        applyTextStyle(labelEl, labelFont, labelColor, align, labelWrap);

        const valueEl = createHTMLElement("span");
        valueEl.textContent = valueText;
        applyTextStyle(valueEl, valueFont, valueColor, align, valueWrap);

        chip.appendChild(labelEl);
        chip.appendChild(valueEl);
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

    const ffont = readFont(f.font);
    const footer = createHTMLElement("div", {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "auto",
        paddingTop: "5px",
        borderTop: `1px solid ${fgColor(ctx, f.footerBorderColor.value.value, DEFAULT_COLORS.footerBorder)}`,
        fontSize: `${ffont.sizePt}pt`,
        fontWeight: ffont.bold ? "bold" : "normal",
        fontStyle: ffont.italic ? "italic" : "normal",
        textDecoration: ffont.underline ? "underline" : "none",
        color: fgColor(ctx, f.footerColor.value.value, DEFAULT_COLORS.footerColor),
        fontFamily: ffont.family,
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
