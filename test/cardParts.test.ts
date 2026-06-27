import * as parts from "../src/renderers/cardParts";
import { VisualFormattingSettingsModel } from "../src/settings";
import { MappedKPIData } from "../src/types/interfaces";

function makeData(over: Partial<MappedKPIData> = {}): MappedKPIData {
    return {
        isValid: true, title: "Vendas", mainValue: 1500, comparisonValue: 1200,
        targetValue: 2000, category: "Sul", timeSeriesLabels: ["Jan", "Fev", "Mar"],
        sparkValues: [1000, 1200, 1500], secondary: [], ...over,
    };
}
function ctx(data = makeData(), settings = new VisualFormattingSettingsModel()): parts.RenderContext {
    return { data, settings, isPremium: true, width: 320, height: 220, locale: "pt-BR" };
}
function setEnum(slice: { value: { value: string } }, v: string): void {
    slice.value = { value: v };
}

describe("cardParts — variancia", () => {
    test("modo absoluto: badge sem %", () => {
        const s = new VisualFormattingSettingsModel();
        setEnum(s.variance.varianceMode as never, "absolute");
        const el = parts.buildVarianceBadge(ctx(makeData(), s))!;
        expect(el.textContent).toContain("▲");
        expect(el.textContent).not.toContain("%");
    });

    test("modo ambos: badge com % e parenteses", () => {
        const s = new VisualFormattingSettingsModel();
        setEnum(s.variance.varianceMode as never, "both");
        const el = parts.buildVarianceBadge(ctx(makeData(), s))!;
        expect(el.textContent).toContain("%");
        expect(el.textContent).toContain("(");
    });

    test("neutro: sem seta direcional", () => {
        const el = parts.buildVarianceBadge(ctx(makeData({ mainValue: 1000, comparisonValue: 1000 })))!;
        expect(el.textContent).not.toContain("▲");
        expect(el.textContent).not.toContain("▼");
    });

    test("negativo: seta para baixo", () => {
        const el = parts.buildVarianceBadge(ctx(makeData({ mainValue: 800, comparisonValue: 1000 })))!;
        expect(el.textContent).toContain("▼");
    });

    test("rotulo de variancia e exibido", () => {
        const s = new VisualFormattingSettingsModel();
        s.variance.varianceLabel.value = "vs. mes anterior";
        const el = parts.buildVarianceBadge(ctx(makeData(), s))!;
        expect(el.textContent).toContain("vs. mes anterior");
    });

    test("desabilitada -> null; sem comparacao -> null", () => {
        const s = new VisualFormattingSettingsModel();
        s.variance.varianceEnabled.value = false;
        expect(parts.buildVarianceBadge(ctx(makeData(), s))).toBeNull();
        expect(parts.buildVarianceBadge(ctx(makeData({ comparisonValue: null })))).toBeNull();
    });
});

describe("cardParts — categoria/titulo", () => {
    test("showCategory false -> null", () => {
        const s = new VisualFormattingSettingsModel();
        s.layout.showCategory.value = false;
        expect(parts.buildCategory(ctx(makeData(), s))).toBeNull();
    });

    test("categoria nula -> null", () => {
        expect(parts.buildCategory(ctx(makeData({ category: null })))).toBeNull();
    });

    test("uppercase false preserva caixa", () => {
        const s = new VisualFormattingSettingsModel();
        s.category.uppercase.value = false;
        const el = parts.buildCategory(ctx(makeData({ category: "Sul" }), s))!;
        expect(el.textContent).toBe("Sul");
    });

    test("titulo vazio -> null", () => {
        expect(parts.buildTitle(ctx(makeData({ title: "" })))).toBeNull();
    });
});

describe("cardParts — sparkline/progresso/secundarios/rodape", () => {
    test("sparkline desabilitada -> null; sem pontos -> null; 1 ponto -> renderiza", () => {
        const s = new VisualFormattingSettingsModel();
        s.sparkline.sparkEnabled.value = false;
        expect(parts.buildSparkline(ctx(makeData(), s), 200)).toBeNull();
        expect(parts.buildSparkline(ctx(makeData({ sparkValues: [] })), 200)).toBeNull();
        expect(parts.buildSparkline(ctx(makeData({ sparkValues: [42] })), 200)).not.toBeNull();
    });

    test("progresso desabilitado -> null; sem meta -> null", () => {
        const s = new VisualFormattingSettingsModel();
        s.target.targetEnabled.value = false;
        expect(parts.buildProgress(ctx(makeData(), s))).toBeNull();
        expect(parts.buildProgress(ctx(makeData({ targetValue: null })))).toBeNull();
    });

    test("secundarios: desabilitado -> null; habilitado+vazio -> null; habilitado+itens -> elemento", () => {
        const off = new VisualFormattingSettingsModel();
        expect(parts.buildSecondary(ctx(makeData(), off))).toBeNull();
        const on = new VisualFormattingSettingsModel();
        on.secondary.secondaryEnabled.value = true;
        expect(parts.buildSecondary(ctx(makeData(), on))).toBeNull();
        const el = parts.buildSecondary(ctx(makeData({ secondary: [{ slot: 1, label: "Margem", value: 0.4 }] }), on))!;
        expect(el.textContent).toContain("Margem");
    });

    test("rodape: showFooter false -> null; overrides -> exibidos; sem dados -> null", () => {
        const off = new VisualFormattingSettingsModel();
        off.layout.showFooter.value = false;
        expect(parts.buildFooter(ctx(makeData(), off))).toBeNull();

        const ov = new VisualFormattingSettingsModel();
        ov.footer.periodLabel.value = "2024";
        ov.footer.frequencyLabel.value = "Mensal";
        const el = parts.buildFooter(ctx(makeData(), ov))!;
        expect(el.textContent).toContain("2024");
        expect(el.textContent).toContain("Mensal");

        expect(parts.buildFooter(ctx(makeData({ timeSeriesLabels: [] })))).toBeNull();
    });
});

describe("cardParts — premiumFeatureInUse", () => {
    test("detecta cada feature premium e null no padrao", () => {
        const split = new VisualFormattingSettingsModel();
        setEnum(split.layout.layoutType as never, "split");
        expect(parts.premiumFeatureInUse(ctx(makeData(), split))).toBe("Layout Split");

        const bar = new VisualFormattingSettingsModel();
        setEnum(bar.sparkline.sparkType as never, "bar");
        expect(parts.premiumFeatureInUse(ctx(makeData(), bar))).toBe("Sparkline Barra/Step");

        const sec = new VisualFormattingSettingsModel();
        sec.secondary.secondaryEnabled.value = true;
        expect(parts.premiumFeatureInUse(ctx(makeData({ secondary: [{ slot: 1, label: "x", value: 1 }] }), sec))).toBe("KPIs Secundarios");

        const ref = new VisualFormattingSettingsModel();
        ref.sparkline.showRefLine.value = true;
        expect(parts.premiumFeatureInUse(ctx(makeData(), ref))).toBe("Linha de referencia");

        const mean = new VisualFormattingSettingsModel();
        mean.sparkline.showMeanLine.value = true;
        expect(parts.premiumFeatureInUse(ctx(makeData(), mean))).toBe("Linha de media");

        expect(parts.premiumFeatureInUse(ctx())).toBeNull();
    });
});

describe("cardParts — indicador de variancia", () => {
    test("seta usa ↑/↓", () => {
        const s = new VisualFormattingSettingsModel();
        setEnum(s.variance.varianceIndicator as never, "arrow");
        const el = parts.buildVarianceBadge(ctx(makeData(), s))!;
        expect(el.textContent).toContain("↑");
    });

    test("nenhum usa sinal +/- sem glyph", () => {
        const s = new VisualFormattingSettingsModel();
        setEnum(s.variance.varianceIndicator as never, "none");
        const el = parts.buildVarianceBadge(ctx(makeData(), s))!;
        expect(el.textContent).not.toContain("▲");
        expect(el.textContent).not.toContain("↑");
        expect(el.textContent).toContain("+");
    });
});

describe("cardParts — formato dos secundarios", () => {
    test("auto respeita o formato % da medida", () => {
        const s = new VisualFormattingSettingsModel();
        s.secondary.secondaryEnabled.value = true;
        const data = makeData({ secondary: [{ slot: 1, label: "Margem", value: 0.42, format: "0.0%" }] });
        const el = parts.buildSecondary(ctx(data, s))!;
        expect(el.textContent).toContain("%");
    });

    test("auto sem format string usa escala K/M/B", () => {
        const s = new VisualFormattingSettingsModel();
        s.secondary.secondaryEnabled.value = true;
        const data = makeData({ secondary: [{ slot: 1, label: "YTD", value: 25560120 }] });
        const el = parts.buildSecondary(ctx(data, s))!;
        expect(el.textContent).toContain("25,6M");
    });

    test("unidade por KPI: millions -> M", () => {
        const s = new VisualFormattingSettingsModel();
        s.secondary.secondaryEnabled.value = true;
        setEnum(s.secondary.displayUnits[0] as never, "millions");
        const data = makeData({ secondary: [{ slot: 1, label: "Receita", value: 1500000 }] });
        const el = parts.buildSecondary(ctx(data, s))!;
        expect(el.textContent).toContain("1,5M");
    });

    test("config por KPI e independente: KPI1 sem unidade, KPI2 respeita % (tipos mistos)", () => {
        const s = new VisualFormattingSettingsModel();
        s.secondary.secondaryEnabled.value = true;
        setEnum(s.secondary.displayUnits[0] as never, "none"); // KPI 1 sem escala
        s.secondary.decimalsAuto[0].value = false;
        s.secondary.decimals[0].value = 0;
        const data = makeData({
            secondary: [
                { slot: 1, label: "Receita", value: 1500, format: "#,0" },
                { slot: 2, label: "Margem", value: 0.42, format: "0.0%" },
            ],
        });
        const el = parts.buildSecondary(ctx(data, s))!;
        expect(el.textContent).toContain("1500"); // KPI1 sem unidade, 0 decimais
        expect(el.textContent).toContain("%");     // KPI2 respeita % da medida
    });
});

describe("cardParts — alto contraste", () => {
    test("valor principal usa o foreground do host quando HC ativo", () => {
        const c = ctx();
        c.hc = { enabled: true, fg: "#00FF00", bg: "#000000" };
        const el = parts.buildMainValue(c);
        expect(el.style.color).toBe("rgb(0, 255, 0)");
    });

    test("cartao usa background do host quando HC ativo", () => {
        const c = ctx();
        c.hc = { enabled: true, fg: "#00FF00", bg: "#000000" };
        const { card } = parts.buildCardSurface(c);
        expect(card.style.background).toBe("rgb(0, 0, 0)");
    });
});

describe("cardParts — formatMainValue", () => {
    test("aplica prefixo e sufixo", () => {
        const s = new VisualFormattingSettingsModel();
        s.mainValue.prefix.value = "R$ ";
        s.mainValue.suffix.value = " /mes";
        const out = parts.formatMainValue(ctx(makeData({ mainValue: 1500 }), s));
        expect(out).toContain("R$");
        expect(out).toContain("/mes");
        expect(out).toContain("1,5K");
    });
});
