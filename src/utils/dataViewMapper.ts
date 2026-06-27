// dataViewMapper.ts
// Extracao e validacao do DataView (mapeamento categorical).
// Decisao de semantica: mainValue = ultimo valor finito da coluna (valor "atual"
// no contexto de filtro). Medidas tipo acumulado devem ja refletir o total na DAX.

import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import PrimitiveValue = powerbi.PrimitiveValue;
import { MappedKPIData, SecondaryKPI } from "../types/interfaces";

function lastNumeric(values: PrimitiveValue[] | undefined): number | null {
    if (!values) return null;
    for (let i = values.length - 1; i >= 0; i--) {
        const v = values[i];
        if (typeof v === "number" && isFinite(v)) return v;
    }
    return null;
}

function toSparkValues(values: PrimitiveValue[] | undefined): number[] {
    if (!values) return [];
    return values.map((v) => {
        if (typeof v === "number") return v;
        if (v == null) return NaN;
        const n = Number(v);
        return isNaN(n) ? NaN : n;
    });
}

export class DataViewMapper {
    public static map(dataView: DataView): MappedKPIData {
        const empty: MappedKPIData = {
            isValid: false,
            title: "",
            mainValue: null,
            comparisonValue: null,
            targetValue: null,
            category: null,
            timeSeriesLabels: [],
            sparkValues: [],
            secondary: [],
        };

        const cat = dataView?.categorical;
        if (!cat) return { ...empty, errorMessage: "Dados nao disponiveis" };

        const categories: DataViewCategoryColumn[] = cat.categories ?? [];
        const valueColumns: DataViewValueColumn[] = (cat.values ?? []) as DataViewValueColumn[];

        // Cache de roles (uma passada) em vez de varrer as colunas a cada consulta.
        const byRole = new Map<string, DataViewValueColumn>();
        for (const c of valueColumns) {
            const roles = c.source.roles ?? {};
            for (const r of Object.keys(roles)) {
                if (roles[r] && !byRole.has(r)) byRole.set(r, c);
            }
        }
        const findValue = (role: string): DataViewValueColumn | undefined => byRole.get(role);

        const mainCol = findValue("mainValue");
        const mainValue = lastNumeric(mainCol?.values);
        if (mainValue === null) {
            return { ...empty, errorMessage: "Adicione uma medida ao campo Valor Principal" };
        }

        const timeCat = categories.find((c) => c.source.roles?.["timeSeries"]);
        const labelCat = categories.find((c) => c.source.roles?.["categoryLabel"]);

        const sparkCol = findValue("sparkValue") ?? mainCol;
        const sparkValues = toSparkValues(sparkCol?.values);
        const timeSeriesLabels = timeCat?.values?.map((v) => String(v ?? "")) ?? [];

        const comparisonValue = lastNumeric(findValue("comparisonValue")?.values);
        const targetValue = lastNumeric(findValue("targetValue")?.values);

        const category =
            labelCat?.values?.[0] != null ? String(labelCat.values[0]) : null;

        const secondary: SecondaryKPI[] = [];
        for (let i = 1; i <= 4; i++) {
            const col = findValue(`secondaryMeasure${i}`);
            if (col) {
                secondary.push({
                    slot: i,
                    label: col.source.displayName ?? `KPI ${i}`,
                    value: lastNumeric(col.values),
                    format: col.source.format,
                });
            }
        }

        return {
            isValid: true,
            title: mainCol?.source.displayName ?? "",
            mainFormat: mainCol?.source.format,
            mainValue,
            comparisonValue,
            targetValue,
            category,
            timeSeriesLabels,
            sparkValues,
            secondary,
        };
    }
}
