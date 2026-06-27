import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import { DataViewMapper } from "../src/utils/dataViewMapper";

function valueCol(role: string, values: powerbi.PrimitiveValue[], displayName = "m") {
    return { source: { roles: { [role]: true }, displayName }, values };
}
function catCol(role: string, values: powerbi.PrimitiveValue[]) {
    return { source: { roles: { [role]: true } }, values };
}

describe("DataViewMapper", () => {
    test("DataView sem categorical -> isValid=false com mensagem", () => {
        const r = DataViewMapper.map({} as DataView);
        expect(r.isValid).toBe(false);
        expect(r.errorMessage).toBeTruthy();
    });

    test("DataView sem mainValue -> isValid=false com mensagem", () => {
        const dv = { categorical: { categories: [], values: [] } } as unknown as DataView;
        const r = DataViewMapper.map(dv);
        expect(r.isValid).toBe(false);
        expect(r.errorMessage).toContain("Valor Principal");
    });

    test("DataView completo -> campos mapeados corretamente", () => {
        const dv = {
            categorical: {
                categories: [
                    catCol("timeSeries", ["Jan", "Fev", "Mar"]),
                    catCol("categoryLabel", ["Regiao Sul", "Regiao Sul", "Regiao Sul"]),
                ],
                values: [
                    valueCol("mainValue", [10, 20, 30], "Vendas"),
                    valueCol("comparisonValue", [5, 15, 25]),
                    valueCol("targetValue", [40, 40, 40]),
                    valueCol("secondaryMeasure1", [1, 2, 3], "Margem"),
                ],
            },
        } as unknown as DataView;
        const r = DataViewMapper.map(dv);
        expect(r.isValid).toBe(true);
        expect(r.mainValue).toBe(30);
        expect(r.comparisonValue).toBe(25);
        expect(r.targetValue).toBe(40);
        expect(r.title).toBe("Vendas");
        expect(r.category).toBe("Regiao Sul");
        expect(r.timeSeriesLabels).toEqual(["Jan", "Fev", "Mar"]);
        expect(r.sparkValues).toEqual([10, 20, 30]);
        expect(r.secondary).toEqual([{ slot: 1, label: "Margem", value: 3, format: undefined }]);
    });

    test("sparkValue dedicado tem prioridade sobre mainValue", () => {
        const dv = {
            categorical: {
                categories: [catCol("timeSeries", ["A", "B"])],
                values: [
                    valueCol("mainValue", [100, 200]),
                    valueCol("sparkValue", [1, 2]),
                ],
            },
        } as unknown as DataView;
        const r = DataViewMapper.map(dv);
        expect(r.sparkValues).toEqual([1, 2]);
    });

    test("mainValue ignora nulos no fim; sparkValues converte null/string", () => {
        const dv = {
            categorical: {
                categories: [catCol("timeSeries", ["A", "B", "C"])],
                values: [
                    valueCol("mainValue", [10, 20, null]),
                    valueCol("sparkValue", [1, null, "3"]),
                ],
            },
        } as unknown as DataView;
        const r = DataViewMapper.map(dv);
        expect(r.mainValue).toBe(20); // ultimo finito
        expect(r.sparkValues[0]).toBe(1);
        expect(Number.isNaN(r.sparkValues[1])).toBe(true);
        expect(r.sparkValues[2]).toBe(3);
    });

    test("sparkValue ausente -> usa mainValue", () => {
        const dv = {
            categorical: {
                categories: [catCol("timeSeries", ["A", "B", "C"])],
                values: [valueCol("mainValue", [10, 20, 30])],
            },
        } as unknown as DataView;
        const r = DataViewMapper.map(dv);
        expect(r.sparkValues).toEqual([10, 20, 30]);
    });

    test("timeSeriesLabels com tamanho diferente de sparkValues nao quebra", () => {
        const dv = {
            categorical: {
                categories: [catCol("timeSeries", ["A", "B"])],
                values: [valueCol("mainValue", [10, 20, 30, 40])],
            },
        } as unknown as DataView;
        const r = DataViewMapper.map(dv);
        expect(r.isValid).toBe(true);
        expect(r.timeSeriesLabels.length).toBe(2);
        expect(r.sparkValues.length).toBe(4);
    });

    test("secondary measures ausentes -> array vazio sem crash", () => {
        const dv = {
            categorical: { categories: [], values: [valueCol("mainValue", [1])] },
        } as unknown as DataView;
        const r = DataViewMapper.map(dv);
        expect(r.secondary).toEqual([]);
    });
});
