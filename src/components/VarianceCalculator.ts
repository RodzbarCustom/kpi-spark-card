// VarianceCalculator.ts — calculo de variancia com direcao semantica

export interface VarianceResult {
    absolute: number | null;
    percentage: number | null;
    direction: "positive" | "negative" | "neutral";
    isGood: boolean;
}

export class VarianceCalculator {
    /**
     * @param current         Valor atual
     * @param comparison      Valor de comparacao (anterior, meta, etc.)
     * @param positiveIsGood  true = aumento favoravel; false = reducao favoravel
     * @param neutralThreshold Percentual (0-100) abaixo do qual e considerado neutro
     */
    public static calculate(
        current: number | null | undefined,
        comparison: number | null | undefined,
        positiveIsGood = true,
        neutralThreshold = 0.5
    ): VarianceResult {
        if (
            current == null || comparison == null ||
            !isFinite(current) || !isFinite(comparison)
        ) {
            return { absolute: null, percentage: null, direction: "neutral", isGood: false };
        }

        const absolute = current - comparison;
        const percentage = comparison !== 0 ? (absolute / Math.abs(comparison)) * 100 : null;
        const absPct = percentage !== null ? Math.abs(percentage) : 0;

        let direction: VarianceResult["direction"];
        if (absPct <= neutralThreshold) {
            direction = "neutral";
        } else {
            direction = absolute > 0 ? "positive" : "negative";
        }

        const isGood =
            direction === "neutral"
                ? true
                : positiveIsGood
                ? direction === "positive"
                : direction === "negative";

        return { absolute, percentage, direction, isGood };
    }
}
