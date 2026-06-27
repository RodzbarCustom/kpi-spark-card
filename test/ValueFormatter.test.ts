import { ValueFormatter } from "../src/components/ValueFormatter";

describe("ValueFormatter", () => {
    test("null -> travessao", () => {
        expect(ValueFormatter.format({ value: null })).toBe("—");
    });

    test("nao-finito -> travessao", () => {
        expect(ValueFormatter.format({ value: Infinity })).toBe("—");
    });

    test("1500 + auto -> 1,5 mil (locale pt-BR)", () => {
        expect(ValueFormatter.format({ value: 1500 })).toBe("1,5 mil");
    });

    test("1.500.000 + auto -> 1,5 mi (pt-BR)", () => {
        expect(ValueFormatter.format({ value: 1_500_000 })).toBe("1,5 mi");
    });

    test("locale en-US usa K/M e ponto decimal", () => {
        expect(ValueFormatter.format({ value: 1500, locale: "en-US" })).toBe("1.5K");
        expect(ValueFormatter.format({ value: 1_500_000, locale: "en-US" })).toBe("1.5M");
    });

    test("trilhao: pt -> tri / en -> T", () => {
        expect(ValueFormatter.format({ value: 2e12 })).toBe("2,0 tri");
        expect(ValueFormatter.format({ value: 2e12, locale: "en-US" })).toBe("2.0T");
    });

    test("valor negativo mantem sinal", () => {
        expect(ValueFormatter.format({ value: -1500 })).toBe("-1,5 mil");
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
