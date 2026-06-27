import { axe } from "jest-axe";
import { StandardRenderer } from "../src/renderers/StandardRenderer";
import { RenderContext } from "../src/renderers/cardParts";
import { VisualFormattingSettingsModel } from "../src/settings";
import { MappedKPIData } from "../src/types/interfaces";

// IMPORTANTE: axe roda sobre jsdom, que NAO calcula layout nem cores reais.
// A regra "color-contrast" e desabilitada (validada pelos defaults do projeto,
// nao por este teste). Aqui validamos apenas semantica ARIA/roles.

function ctx(): RenderContext {
    const data: MappedKPIData = {
        isValid: true, title: "Vendas", mainValue: 1500, comparisonValue: 1200,
        targetValue: 2000, category: "Regiao Sul",
        timeSeriesLabels: ["Jan", "Fev", "Mar"], sparkValues: [1000, 1200, 1500], secondary: [],
    };
    return { data, settings: new VisualFormattingSettingsModel(), isPremium: true, width: 320, height: 220 };
}

describe("Acessibilidade (axe)", () => {
    test("sem violacoes ARIA (contraste desabilitado no jsdom)", async () => {
        const root = document.createElement("div");
        root.setAttribute("role", "img");
        root.setAttribute("aria-label", "KPI: Regiao Sul Vendas 1,5K");
        document.body.appendChild(root);

        new StandardRenderer(root).render(ctx());

        const results = await axe(root, { rules: { "color-contrast": { enabled: false } } });
        expect(results.violations).toHaveLength(0);

        document.body.removeChild(root);
    });
});
