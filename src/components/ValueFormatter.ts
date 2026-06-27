// ValueFormatter.ts
// Formatacao de valores com unidades K/M/B via Intl.NumberFormat (locale pt-BR ->
// separador decimal virgula). Nunca usar toFixed (sempre devolve ponto).

import { DEFAULT_LOCALE } from "../constants";

export type DisplayUnits = "auto" | "none" | "thousands" | "millions" | "billions";

export interface FormatOptions {
    value: number | null;
    displayUnits?: DisplayUnits;
    decimalPlaces?: number;
    prefix?: string;
    suffix?: string;
    locale?: string;
}

function sanitize(input: string): string {
    return input.replace(/[<>&"'`]/g, "");
}

export class ValueFormatter {
    public static format(opts: FormatOptions): string {
        const { value, displayUnits = "auto", decimalPlaces = 1, prefix = "", suffix = "" } = opts;
        if (value === null || value === undefined || !isFinite(value)) return "—";

        const locale = opts.locale ?? DEFAULT_LOCALE;
        const abs = Math.abs(value);
        const sign = value < 0 ? "-" : "";

        const mode: Exclude<DisplayUnits, "auto"> =
            displayUnits === "auto"
                ? abs >= 1e9 ? "billions"
                : abs >= 1e6 ? "millions"
                : abs >= 1e3 ? "thousands"
                : "none"
                : displayUnits;

        let scaled = abs;
        let unit = "";
        switch (mode) {
            case "billions": scaled = abs / 1e9; unit = "B"; break;
            case "millions": scaled = abs / 1e6; unit = "M"; break;
            case "thousands": scaled = abs / 1e3; unit = "K"; break;
            default: scaled = abs; unit = "";
        }

        const formatted = new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
        }).format(scaled);

        return `${sanitize(String(prefix))}${sign}${formatted}${unit}${sanitize(String(suffix))}`;
    }

    /** Remove caracteres potencialmente perigosos antes de exibir texto. */
    public static sanitizeText(input: unknown): string {
        if (input === null || input === undefined) return "";
        return String(input).replace(/[<>&"'`]/g, "");
    }
}
