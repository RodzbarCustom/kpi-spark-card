import { StandardRenderer } from "../src/renderers/StandardRenderer";
import { CompactRenderer } from "../src/renderers/CompactRenderer";
import { SplitRenderer } from "../src/renderers/SplitRenderer";
import { RenderContext } from "../src/renderers/cardParts";
import { VisualFormattingSettingsModel } from "../src/settings";
import { MappedKPIData } from "../src/types/interfaces";

function makeData(over: Partial<MappedKPIData> = {}): MappedKPIData {
    return {
        isValid: true,
        title: "Vendas",
        mainValue: 1500,
        comparisonValue: 1200,
        targetValue: 2000,
        category: "Regiao Sul",
        timeSeriesLabels: ["Jan", "Fev", "Mar"],
        sparkValues: [1000, 1200, 1500],
        secondary: [],
        ...over,
    };
}

function makeCtx(data = makeData(), settings = new VisualFormattingSettingsModel()): RenderContext {
    return { data, settings, isPremium: true, width: 320, height: 220, locale: "pt-BR" };
}

describe("Renderers (snapshot estrutural)", () => {
    test("StandardRenderer monta um cartao com valor e sparkline", () => {
        const root = document.createElement("div");
        new StandardRenderer(root).render(makeCtx());
        expect(root.children.length).toBe(1); // um cartao
        expect(root.textContent).toContain("1,5K"); // valor formatado
        expect(root.textContent).toContain("REGIAO SUL"); // categoria em caixa alta
        expect(root.querySelector("svg path")).not.toBeNull(); // sparkline
    });

    test("CompactRenderer renderiza sem lancar e com valor", () => {
        const root = document.createElement("div");
        new CompactRenderer(root).render(makeCtx());
        expect(root.querySelector("div")).not.toBeNull();
        expect(root.textContent).toContain("1,5K");
    });

    test("SplitRenderer renderiza colunas com sparkline a direita", () => {
        const root = document.createElement("div");
        new SplitRenderer(root).render(makeCtx());
        expect(root.querySelector("svg")).not.toBeNull();
        expect(root.textContent).toContain("1,5K");
    });

    test("variancia renderiza badge com seta direcional", () => {
        const root = document.createElement("div");
        new StandardRenderer(root).render(makeCtx());
        // 1500 vs 1200 = +25% favoravel -> seta para cima
        expect(root.textContent).toContain("▲");
    });

    test("KPIs secundarios sao renderizados quando habilitados", () => {
        const settings = new VisualFormattingSettingsModel();
        settings.secondary.secondaryEnabled.value = true;
        const data = makeData({ secondary: [{ slot: 1, label: "Margem", value: 0.42 }] });
        const root = document.createElement("div");
        new StandardRenderer(root).render(makeCtx(data, settings));
        expect(root.textContent).toContain("Margem");
    });

    test("estado com 1 ponto: sparkline degrada sem quebrar", () => {
        const data = makeData({ sparkValues: [1500], timeSeriesLabels: ["Jan"] });
        const root = document.createElement("div");
        expect(() => new StandardRenderer(root).render(makeCtx(data))).not.toThrow();
        expect(root.querySelector("svg path")).toBeNull(); // <2 pontos: nao desenha linha
    });
});
