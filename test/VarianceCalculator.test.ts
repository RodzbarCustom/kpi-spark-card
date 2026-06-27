import { VarianceCalculator } from "../src/components/VarianceCalculator";

describe("VarianceCalculator", () => {
    test("positivo com positiveIsGood=true -> isGood=true", () => {
        const r = VarianceCalculator.calculate(120, 100, true, 0.5);
        expect(r.direction).toBe("positive");
        expect(r.isGood).toBe(true);
        expect(r.absolute).toBe(20);
        expect(r.percentage).toBeCloseTo(20);
    });

    test("negativo com positiveIsGood=false -> isGood=true (invertido)", () => {
        const r = VarianceCalculator.calculate(80, 100, false, 0.5);
        expect(r.direction).toBe("negative");
        expect(r.isGood).toBe(true);
    });

    test("negativo com positiveIsGood=true -> isGood=false", () => {
        const r = VarianceCalculator.calculate(80, 100, true, 0.5);
        expect(r.direction).toBe("negative");
        expect(r.isGood).toBe(false);
    });

    test("valores nulos -> direction=neutral", () => {
        expect(VarianceCalculator.calculate(null, 100).direction).toBe("neutral");
        expect(VarianceCalculator.calculate(100, undefined).direction).toBe("neutral");
    });

    test("dentro do neutralThreshold -> direction=neutral", () => {
        const r = VarianceCalculator.calculate(100.2, 100, true, 0.5); // 0,2% < 0,5%
        expect(r.direction).toBe("neutral");
        expect(r.isGood).toBe(true);
    });

    test("comparison=0 -> percentage=null (sem divisao por zero)", () => {
        const r = VarianceCalculator.calculate(50, 0);
        expect(r.percentage).toBeNull();
        expect(r.absolute).toBe(50);
    });
});
