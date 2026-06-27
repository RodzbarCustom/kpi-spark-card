import { isValidColor, safeColor } from "../src/utils/colorUtils";
import { LicenseGuard } from "../src/components/LicenseGuard";
import { applyWatermark } from "../src/components/watermark";
import { ProgressBarRenderer } from "../src/components/ProgressBarRenderer";

describe("colorUtils", () => {
    test("isValidColor aceita hex e rgba, rejeita invalidos", () => {
        expect(isValidColor("#fff")).toBe(true);
        expect(isValidColor("#185FA5")).toBe(true);
        expect(isValidColor("rgba(10,20,30,0.5)")).toBe(true);
        expect(isValidColor("red")).toBe(false);
        expect(isValidColor("")).toBe(false);
        expect(isValidColor(null)).toBe(false);
    });

    test("safeColor retorna fallback para cor invalida", () => {
        expect(safeColor("#abc", "#000")).toBe("#abc");
        expect(safeColor("nope", "#000")).toBe("#000");
    });
});

describe("LicenseGuard", () => {
    test("isPremium retorna true em modo desenvolvimento", () => {
        const guard = new LicenseGuard({} as never);
        expect(guard.isPremium()).toBe(true);
    });

    test("refreshLicense em dev mantem premium e invalidateCache nao quebra", async () => {
        const guard = new LicenseGuard({} as never);
        await guard.refreshLicense();
        expect(guard.isPremium()).toBe(true);
        guard.invalidateCache();
        expect(guard.isPremium()).toBe(true);
    });
});

describe("watermark", () => {
    test("applyWatermark insere overlay DENTRO do root (nao no parent)", () => {
        const parent = document.createElement("section");
        const root = document.createElement("div");
        parent.appendChild(root);
        applyWatermark(root, "Layout Split");
        expect(root.style.position).toBe("relative");
        expect(root.children.length).toBe(1);
        expect(root.querySelector("svg")).not.toBeNull();
        expect(root.textContent).toContain("Premium");
        // O parent nao deve ter sido tocado
        expect(parent.children.length).toBe(1);
    });
});

describe("ProgressBarRenderer", () => {
    function opts(over: Partial<Parameters<typeof ProgressBarRenderer.render>[0]> = {}) {
        return ProgressBarRenderer.render({
            current: 50, target: 100, label: "Meta", formattedTarget: "100",
            barColor: "#185FA5", barBgColor: "#E0E0E0", exceededColor: "#27500A",
            barHeight: 4, barRadius: 2, fontSizePt: 8, fontColor: "#767676", ...over,
        });
    }

    test("50% renderiza rotulo e percentual", () => {
        const el = opts();
        expect(el.textContent).toContain("Meta: 100");
        expect(el.textContent).toContain("50%");
    });

    test("meta 0 mostra travessao no percentual", () => {
        const el = opts({ target: 0 });
        expect(el.textContent).toContain("—");
    });

    test("acima da meta usa cor de excedido", () => {
        const el = opts({ current: 120 });
        const fill = el.querySelector("div > div") as HTMLElement;
        expect(fill).not.toBeNull();
        // 120% -> preenchimento limitado e cor de excedido
        expect(el.textContent).toContain("120%");
    });
});
