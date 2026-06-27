import { ValueFormatter } from "../src/components/ValueFormatter";

describe("ValueFormatter", () => {
    test("null -> travessao", () => {
        expect(ValueFormatter.format({ value: null })).toBe("—");
    });

    test("nao-finito -> travessao", () => {
        expect(ValueFormatter.format({ value: Infinity })).toBe("—");
    });

    test("1500 + auto -> 1,5K (locale pt-BR)", () => {
        expect(ValueFormatter.format({ value: 1500 })).toBe("1,5K");
    });

    test("1.500.000 + auto -> 1,5M", () => {
        expect(ValueFormatter.format({ value: 1_500_000 })).toBe("1,5M");
    });

    test("2.000.000.000 + auto -> 2,0B", () => {
        expect(ValueFormatter.format({ value: 2_000_000_000 })).toBe("2,0B");
    });

    test("valor negativo mantem sinal", () => {
        expect(ValueFormatter.format({ value: -1500 })).toBe("-1,5K");
    });

    test("displayUnits none usa separador de milhar pt-BR", () => {
        expect(ValueFormatter.format({ value: 1234, displayUnits: "none", decimalPlaces: 0 })).toBe("1.234");
    });

    test("prefix/suffix com caracteres especiais sao sanitizados", () => {
        const out = ValueFormatter.format({
            value: 10, displayUnits: "none", decimalPlaces: 0, prefix: "<R$>", suffix: "<x>",
        });
        expect(out).not.toContain("<");
        expect(out).not.toContain(">");
        expect(out).toContain("10");
    });

    test("sanitizeText remove caracteres perigosos", () => {
        expect(ValueFormatter.sanitizeText("a<b>&\"'`c")).toBe("abc");
        expect(ValueFormatter.sanitizeText(null)).toBe("");
    });
});
