// settings.ts
// VisualFormattingSettingsModel completo (powerbi-visuals-utils-formattingmodel v6+).
// getFormattingModel() exclusivamente (enumerateObjectInstances depreciado).
// Fontes em pt. Toda cor expoe color picker + fx (instanceKind: ConstantOrRule).

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { DEFAULT_COLORS, DEFAULT_FONT_FAMILY } from "./constants";

import Card = formattingSettings.SimpleCard;
import Model = formattingSettings.Model;
import ColorPicker = formattingSettings.ColorPicker;
import ToggleSwitch = formattingSettings.ToggleSwitch;
import NumUpDown = formattingSettings.NumUpDown;
import ItemDropdown = formattingSettings.ItemDropdown;
import TextInput = formattingSettings.TextInput;
import FontControl = formattingSettings.FontControl;
import FontPicker = formattingSettings.FontPicker;

// const enums (ValidatorType, VisualEnumerationInstanceKinds) nao podem ser
// atribuidos a variaveis — usar caminho completo (acesso de propriedade) ou cast de tipo.
// ConstantOrRule = Constant | Rule = 3.
const FX_INSTANCE_KIND = 3 as powerbi.VisualEnumerationInstanceKinds;

type EnumMember = powerbi.IEnumMember;

// --- Helpers -----------------------------------------------------------------

function num(min: number, max: number) {
    return {
        minValue: { type: powerbi.visuals.ValidatorType.Min as const, value: min },
        maxValue: { type: powerbi.visuals.ValidatorType.Max as const, value: max },
    };
}

/** ColorPicker com botao fx (formatacao condicional por DAX). */
function fxColor(name: string, displayName: string, def: string): ColorPicker {
    return new ColorPicker({
        name,
        displayName,
        value: { value: def },
        instanceKind: FX_INSTANCE_KIND,
    });
}

/** FontControl composto (familia + tamanho pt + negrito/italico/sublinhado). */
function makeFont(minPt: number, maxPt: number, defPt: number, bold: boolean): FontControl {
    return new FontControl({
        name: "font",
        displayName: "Fonte",
        fontFamily: new FontPicker({ name: "fontFamily", displayName: "Familia", value: DEFAULT_FONT_FAMILY }),
        fontSize: new NumUpDown({ name: "fontSize", displayName: "Tamanho", value: defPt, options: num(minPt, maxPt) }),
        bold: new ToggleSwitch({ name: "bold", displayName: "Negrito", value: bold }),
        italic: new ToggleSwitch({ name: "italic", displayName: "Italico", value: false }),
        underline: new ToggleSwitch({ name: "underline", displayName: "Sublinhado", value: false }),
    });
}

/** FontControl com nomes de sub-controles personalizados (para conviver com outro FontControl no mesmo objeto). */
function makeFontNamed(prefix: string, minPt: number, maxPt: number, defPt: number, bold: boolean): FontControl {
    return new FontControl({
        name: `${prefix}Font`,
        displayName: "Fonte",
        fontFamily: new FontPicker({ name: `${prefix}FontFamily`, displayName: "Familia", value: DEFAULT_FONT_FAMILY }),
        fontSize: new NumUpDown({ name: `${prefix}FontSize`, displayName: "Tamanho", value: defPt, options: num(minPt, maxPt) }),
        bold: new ToggleSwitch({ name: `${prefix}Bold`, displayName: "Negrito", value: bold }),
        italic: new ToggleSwitch({ name: `${prefix}Italic`, displayName: "Italico", value: false }),
        underline: new ToggleSwitch({ name: `${prefix}Underline`, displayName: "Sublinhado", value: false }),
    });
}

/** TextInput com botao fx (recebe medida de texto DAX). */
function fxText(name: string, displayName: string, placeholder: string): TextInput {
    return new TextInput({ name, displayName, value: "", placeholder, instanceKind: FX_INSTANCE_KIND });
}

const ALIGN_ITEMS: EnumMember[] = [
    { value: "left", displayName: "Esquerda" },
    { value: "center", displayName: "Centro" },
    { value: "right", displayName: "Direita" },
];

function alignmentDropdown(name = "alignment"): ItemDropdown {
    return new ItemDropdown({ name, displayName: "Alinhamento", items: ALIGN_ITEMS, value: ALIGN_ITEMS[0] });
}

// --- Card 1: layout ----------------------------------------------------------

class LayoutCard extends Card {
    layoutType = new ItemDropdown({
        name: "layoutType",
        displayName: "Layout",
        items: [
            { value: "standard", displayName: "Standard" },
            { value: "compact", displayName: "Compacto" },
            { value: "split", displayName: "Split" },
        ],
        value: { value: "standard", displayName: "Standard" },
    });
    showCategory = new ToggleSwitch({ name: "showCategory", displayName: "Exibir categoria", value: true });
    showFooter = new ToggleSwitch({ name: "showFooter", displayName: "Exibir rodape", value: true });
    density = new ItemDropdown({
        name: "density",
        displayName: "Densidade",
        items: [
            { value: "compact", displayName: "Compacto" },
            { value: "normal", displayName: "Normal" },
            { value: "spacious", displayName: "Espacoso" },
        ],
        value: { value: "normal", displayName: "Normal" },
    });
    numberLocale = new ItemDropdown({
        name: "numberLocale",
        displayName: "Idioma dos numeros",
        items: [
            { value: "auto", displayName: "Auto (relatorio)" },
            { value: "pt-BR", displayName: "Portugues (pt-BR)" },
            { value: "en-US", displayName: "Ingles (en-US)" },
        ],
        value: { value: "auto", displayName: "Auto (relatorio)" },
    });
    name = "layout";
    displayName = "Aparencia Geral";
    slices = [this.layoutType, this.showCategory, this.showFooter, this.density, this.numberLocale];
}

// --- Card 2: card ------------------------------------------------------------

class CardStyleCard extends Card {
    backgroundColor = fxColor("backgroundColor", "Cor de fundo", DEFAULT_COLORS.cardBackground);
    backgroundTransparency = new NumUpDown({ name: "backgroundTransparency", displayName: "Transparencia do fundo (%)", value: 0, options: num(0, 100) });
    borderColor = fxColor("borderColor", "Cor da borda", DEFAULT_COLORS.cardBorder);
    borderWidth = new NumUpDown({ name: "borderWidth", displayName: "Largura da borda (px)", value: 1, options: num(0, 4) });
    borderRadius = new NumUpDown({ name: "borderRadius", displayName: "Raio dos cantos (px)", value: 12, options: num(0, 20) });
    accentBarEnabled = new ToggleSwitch({ name: "accentBarEnabled", displayName: "Barra de destaque", value: true });
    accentBarColor = fxColor("accentBarColor", "Cor da barra de destaque", DEFAULT_COLORS.accentBar);
    accentBarWidth = new NumUpDown({ name: "accentBarWidth", displayName: "Largura da barra (px)", value: 3, options: num(1, 8) });
    padding = new NumUpDown({ name: "padding", displayName: "Padding interno (px)", value: 16, options: num(4, 32) });
    name = "card";
    displayName = "Cartao";
    slices = [this.backgroundColor, this.backgroundTransparency, this.borderColor, this.borderWidth, this.borderRadius, this.accentBarEnabled, this.accentBarColor, this.accentBarWidth, this.padding];
}

// --- Card 3: category --------------------------------------------------------

class CategoryCard extends Card {
    text = fxText("text", "Texto (vazio = campo / fx)", "auto");
    font = makeFont(6, 14, 8, true);
    fontColor = fxColor("fontColor", "Cor do texto", DEFAULT_COLORS.categoryColor);
    alignment = alignmentDropdown();
    uppercase = new ToggleSwitch({ name: "uppercase", displayName: "CAIXA ALTA", value: true });
    wrap = new ToggleSwitch({ name: "wrap", displayName: "Quebra de texto", value: false });
    name = "category";
    displayName = "Categoria";
    slices = [this.text, this.font, this.fontColor, this.alignment, this.uppercase, this.wrap];
}

// --- Card 4: title -----------------------------------------------------------

class TitleCard extends Card {
    text = fxText("text", "Texto (vazio = medida / fx)", "auto");
    font = makeFont(6, 14, 9, false);
    fontColor = fxColor("fontColor", "Cor do texto", DEFAULT_COLORS.titleColor);
    alignment = alignmentDropdown();
    wrap = new ToggleSwitch({ name: "wrap", displayName: "Quebra de texto", value: false });
    name = "title";
    displayName = "Titulo do KPI";
    slices = [this.text, this.font, this.fontColor, this.alignment, this.wrap];
}

// --- Card 5: mainValue -------------------------------------------------------

class MainValueCard extends Card {
    font = makeFont(11, 45, 20, true);
    fontColor = fxColor("fontColor", "Cor do texto", DEFAULT_COLORS.valueColor);
    alignment = alignmentDropdown();
    displayUnits = new ItemDropdown({
        name: "displayUnits",
        displayName: "Unidades",
        items: [
            { value: "auto", displayName: "Auto" },
            { value: "none", displayName: "Nenhum" },
            { value: "thousands", displayName: "Mil" },
            { value: "millions", displayName: "Milhao" },
            { value: "billions", displayName: "Bilhao" },
            { value: "trillions", displayName: "Trilhao" },
        ],
        value: { value: "auto", displayName: "Auto" },
    });
    decimalsAuto = new ToggleSwitch({ name: "decimalsAuto", displayName: "Casas decimais automaticas", value: false });
    decimalPlaces = new NumUpDown({ name: "decimalPlaces", displayName: "Casas decimais", value: 1, options: num(0, 4) });
    wrap = new ToggleSwitch({ name: "wrap", displayName: "Quebra de texto", value: false });
    prefix = new TextInput({ name: "prefix", displayName: "Prefixo", value: "", placeholder: "ex: R$" });
    suffix = new TextInput({ name: "suffix", displayName: "Sufixo", value: "", placeholder: "ex: %" });
    name = "mainValue";
    displayName = "Valor Principal";
    slices = [this.font, this.fontColor, this.alignment, this.displayUnits, this.decimalsAuto, this.decimalPlaces, this.wrap, this.prefix, this.suffix];
}

// --- Card 6: variance --------------------------------------------------------

class VarianceCard extends Card {
    varianceEnabled = new ToggleSwitch({ name: "varianceEnabled", displayName: "Exibir variancia", value: true });
    varianceMode = new ItemDropdown({
        name: "varianceMode",
        displayName: "Modo",
        items: [
            { value: "percent", displayName: "Percentual" },
            { value: "absolute", displayName: "Absoluto" },
            { value: "both", displayName: "Ambos" },
        ],
        value: { value: "percent", displayName: "Percentual" },
    });
    varianceLabel = new TextInput({ name: "varianceLabel", displayName: "Rotulo", value: "", placeholder: "vs. mes anterior" });
    varianceIndicator = new ItemDropdown({
        name: "varianceIndicator",
        displayName: "Indicador",
        items: [
            { value: "triangle", displayName: "Triangulo" },
            { value: "arrow", displayName: "Seta" },
            { value: "none", displayName: "Nenhum" },
        ],
        value: { value: "triangle", displayName: "Triangulo" },
    });
    positiveIsGood = new ToggleSwitch({ name: "positiveIsGood", displayName: "Positivo = favoravel", value: true });
    colorPositive = fxColor("colorPositive", "Cor positiva", DEFAULT_COLORS.varPositiveText);
    bgPositive = fxColor("bgPositive", "Fundo positivo", DEFAULT_COLORS.varPositiveBg);
    bgPositiveTransparency = new NumUpDown({ name: "bgPositiveTransparency", displayName: "Transparencia fundo positivo (%)", value: 0, options: num(0, 100) });
    colorNegative = fxColor("colorNegative", "Cor negativa", DEFAULT_COLORS.varNegativeText);
    bgNegative = fxColor("bgNegative", "Fundo negativo", DEFAULT_COLORS.varNegativeBg);
    bgNegativeTransparency = new NumUpDown({ name: "bgNegativeTransparency", displayName: "Transparencia fundo negativo (%)", value: 0, options: num(0, 100) });
    colorNeutral = fxColor("colorNeutral", "Cor neutra", DEFAULT_COLORS.varNeutralText);
    bgNeutral = fxColor("bgNeutral", "Fundo neutro", DEFAULT_COLORS.varNeutralBg);
    bgNeutralTransparency = new NumUpDown({ name: "bgNeutralTransparency", displayName: "Transparencia fundo neutro (%)", value: 0, options: num(0, 100) });
    font = makeFont(6, 12, 8, true);
    neutralThreshold = new NumUpDown({ name: "neutralThreshold", displayName: "Limiar neutro (%)", value: 0.5, options: num(0, 5) });
    topLevelSlice = this.varianceEnabled;
    name = "variance";
    displayName = "Variancia";
    slices = [this.varianceMode, this.varianceLabel, this.varianceIndicator, this.positiveIsGood, this.colorPositive, this.bgPositive, this.bgPositiveTransparency, this.colorNegative, this.bgNegative, this.bgNegativeTransparency, this.colorNeutral, this.bgNeutral, this.bgNeutralTransparency, this.font, this.neutralThreshold];
}

// --- Card 7: target ----------------------------------------------------------

class TargetCard extends Card {
    targetEnabled = new ToggleSwitch({ name: "targetEnabled", displayName: "Exibir barra de progresso", value: true });
    targetLabel = new TextInput({ name: "targetLabel", displayName: "Rotulo da meta", value: "Meta", placeholder: "Meta" });
    targetBarColor = fxColor("targetBarColor", "Cor de preenchimento", DEFAULT_COLORS.targetBarFill);
    targetBarBgColor = fxColor("targetBarBgColor", "Cor do fundo da barra", DEFAULT_COLORS.targetBarBg);
    targetBarBgTransparency = new NumUpDown({ name: "targetBarBgTransparency", displayName: "Transparencia fundo da barra (%)", value: 0, options: num(0, 100) });
    targetBarHeight = new NumUpDown({ name: "targetBarHeight", displayName: "Altura da barra (px)", value: 4, options: num(2, 10) });
    targetBarRadius = new NumUpDown({ name: "targetBarRadius", displayName: "Raio dos cantos (px)", value: 2, options: num(0, 5) });
    font = makeFont(6, 11, 8, false);
    targetColorExceeded = fxColor("targetColorExceeded", "Cor ao superar 100%", DEFAULT_COLORS.targetExceeded);
    topLevelSlice = this.targetEnabled;
    name = "target";
    displayName = "Meta e Progresso";
    slices = [this.targetLabel, this.targetBarColor, this.targetBarBgColor, this.targetBarBgTransparency, this.targetBarHeight, this.targetBarRadius, this.font, this.targetColorExceeded];
}

// --- Card 8: sparkline -------------------------------------------------------

class SparklineCard extends Card {
    sparkEnabled = new ToggleSwitch({ name: "sparkEnabled", displayName: "Exibir sparkline", value: true });
    sparkType = new ItemDropdown({
        name: "sparkType",
        displayName: "Tipo",
        items: [
            { value: "line", displayName: "Linha" },
            { value: "area", displayName: "Area" },
            { value: "bar", displayName: "Barra" },
            { value: "step", displayName: "Step" },
        ],
        value: { value: "area", displayName: "Area" },
    });
    sparkColor = fxColor("sparkColor", "Cor da linha/barra", DEFAULT_COLORS.sparkColor);
    sparkSmooth = new ToggleSwitch({ name: "sparkSmooth", displayName: "Suavizar linha (area/linha)", value: false });
    sparkAreaOpacity = new NumUpDown({ name: "sparkAreaOpacity", displayName: "Opacidade da area (%)", value: 15, options: num(0, 100) });
    sparkLineWidth = new NumUpDown({ name: "sparkLineWidth", displayName: "Espessura da linha (px)", value: 1.5, options: num(0.5, 4) });
    sparkHeight = new NumUpDown({ name: "sparkHeight", displayName: "Altura (px)", value: 38, options: num(20, 80) });
    showRefLine = new ToggleSwitch({ name: "showRefLine", displayName: "Linha de referencia (meta)", value: false });
    refLineColor = fxColor("refLineColor", "Cor da linha de referencia", DEFAULT_COLORS.refLineColor);
    refLineStyle = new ItemDropdown({
        name: "refLineStyle",
        displayName: "Estilo da linha de referencia",
        items: [
            { value: "solid", displayName: "Solida" },
            { value: "dashed", displayName: "Tracejada" },
            { value: "dotted", displayName: "Pontilhada" },
        ],
        value: { value: "dashed", displayName: "Tracejada" },
    });
    showMeanLine = new ToggleSwitch({ name: "showMeanLine", displayName: "Linha de media", value: false });
    meanLineColor = fxColor("meanLineColor", "Cor da linha de media", DEFAULT_COLORS.meanLineColor);
    showEndDot = new ToggleSwitch({ name: "showEndDot", displayName: "Destacar ultimo ponto", value: true });
    endDotRadius = new NumUpDown({ name: "endDotRadius", displayName: "Raio do ponto final (px)", value: 3, options: num(1, 6) });
    topLevelSlice = this.sparkEnabled;
    name = "sparkline";
    displayName = "Sparkline";
    slices = [this.sparkType, this.sparkColor, this.sparkSmooth, this.sparkAreaOpacity, this.sparkLineWidth, this.sparkHeight, this.showRefLine, this.refLineColor, this.refLineStyle, this.showMeanLine, this.meanLineColor, this.showEndDot, this.endDotRadius];
}

// --- Card 9: secondary (PREMIUM) --------------------------------------------

class SecondaryCard extends Card {
    secondaryEnabled = new ToggleSwitch({ name: "secondaryEnabled", displayName: "Exibir KPIs secundarios", value: false });
    // POR KPI: texto do rotulo (fx), unidade, casas decimais (auto/manual) — suporta R$ + % juntos.
    labelText = [1, 2, 3, 4].map((i) => fxText(`labelText${i}`, `KPI ${i} - Texto do rotulo (vazio = medida / fx)`, "nome da medida"));
    displayUnits = [1, 2, 3, 4].map((i) => new ItemDropdown({
        name: `displayUnits${i}`,
        displayName: `KPI ${i} - Unidades`,
        items: [
            { value: "auto", displayName: "Auto" },
            { value: "none", displayName: "Nenhum" },
            { value: "thousands", displayName: "Mil" },
            { value: "millions", displayName: "Milhao" },
            { value: "billions", displayName: "Bilhao" },
            { value: "trillions", displayName: "Trilhao" },
        ],
        value: { value: "auto", displayName: "Auto" },
    }));
    decimalsAuto = [1, 2, 3, 4].map((i) => new ToggleSwitch({ name: `decimalsAuto${i}`, displayName: `KPI ${i} - Casas decimais automaticas`, value: true }));
    decimals = [1, 2, 3, 4].map((i) => new NumUpDown({ name: `decimals${i}`, displayName: `KPI ${i} - Casas decimais`, value: 1, options: num(0, 4) }));
    // COMPARTILHADO (rotulo): fonte + cor + alinhamento + quebra
    labelFont = makeFontNamed("secLabel", 6, 14, 8, false);
    secondaryLabelColor = fxColor("secondaryLabelColor", "Cor do rotulo", DEFAULT_COLORS.secondaryLabel);
    labelAlignment = alignmentDropdown("labelAlignment");
    labelWrap = new ToggleSwitch({ name: "labelWrap", displayName: "Quebra de texto (rotulo)", value: false });
    // COMPARTILHADO (valor): fonte + cor + quebra
    valueFont = makeFontNamed("secValue", 8, 18, 10, true);
    secondaryValueColor = fxColor("secondaryValueColor", "Cor do valor", DEFAULT_COLORS.secondaryValue);
    valueWrap = new ToggleSwitch({ name: "valueWrap", displayName: "Quebra de texto (valor)", value: false });
    // Fundo dos chips
    secondaryBgColor = fxColor("secondaryBgColor", "Cor de fundo dos chips", DEFAULT_COLORS.secondaryBg);
    secondaryBgTransparency = new NumUpDown({ name: "secondaryBgTransparency", displayName: "Transparencia fundo dos chips (%)", value: 0, options: num(0, 100) });
    topLevelSlice = this.secondaryEnabled;
    name = "secondary";
    displayName = "KPIs Secundarios (Premium)";
    slices = [
        this.labelText[0], this.displayUnits[0], this.decimalsAuto[0], this.decimals[0],
        this.labelText[1], this.displayUnits[1], this.decimalsAuto[1], this.decimals[1],
        this.labelText[2], this.displayUnits[2], this.decimalsAuto[2], this.decimals[2],
        this.labelText[3], this.displayUnits[3], this.decimalsAuto[3], this.decimals[3],
        this.labelFont, this.secondaryLabelColor, this.labelAlignment, this.labelWrap,
        this.valueFont, this.secondaryValueColor, this.valueWrap,
        this.secondaryBgColor, this.secondaryBgTransparency,
    ];
}

// --- Card 10: footer ---------------------------------------------------------

class FooterCard extends Card {
    font = makeFont(6, 12, 8, false);
    footerColor = fxColor("footerColor", "Cor do texto", DEFAULT_COLORS.footerColor);
    footerBorderColor = fxColor("footerBorderColor", "Cor da linha separadora", DEFAULT_COLORS.footerBorder);
    periodLabel = new TextInput({ name: "periodLabel", displayName: "Periodo (override / fx)", value: "", placeholder: "auto", instanceKind: FX_INSTANCE_KIND });
    frequencyLabel = new TextInput({ name: "frequencyLabel", displayName: "Frequencia (override / fx)", value: "", placeholder: "auto", instanceKind: FX_INSTANCE_KIND });
    name = "footer";
    displayName = "Rodape";
    slices = [this.font, this.footerColor, this.footerBorderColor, this.periodLabel, this.frequencyLabel];
}

// --- Model -------------------------------------------------------------------

export class VisualFormattingSettingsModel extends Model {
    layout = new LayoutCard();
    card = new CardStyleCard();
    category = new CategoryCard();
    title = new TitleCard();
    mainValue = new MainValueCard();
    variance = new VarianceCard();
    target = new TargetCard();
    sparkline = new SparklineCard();
    secondary = new SecondaryCard();
    footer = new FooterCard();

    cards = [
        this.layout,
        this.card,
        this.category,
        this.title,
        this.mainValue,
        this.variance,
        this.target,
        this.sparkline,
        this.secondary,
        this.footer,
    ];
}
