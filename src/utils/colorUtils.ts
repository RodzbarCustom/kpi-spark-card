// colorUtils.ts — validacao e utilitarios de cor

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const RGBA_COLOR_REGEX =
    /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(\s*,\s*(0|1|0?\.\d+))?\s*\)$/;

export function isValidColor(color: string | undefined | null): boolean {
    if (!color) return false;
    return HEX_COLOR_REGEX.test(color) || RGBA_COLOR_REGEX.test(color);
}

/** Retorna a cor se valida, senao o fallback. */
export function safeColor(color: string | undefined | null, fallback: string): string {
    return isValidColor(color) ? (color as string) : fallback;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    if (!HEX_COLOR_REGEX.test(hex)) return null;
    let h = hex.slice(1);
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/**
 * Aplica transparencia (0-100, padrao nativo: 0 = opaco, 100 = totalmente transparente)
 * a uma cor hex, retornando rgba(). Se a cor nao for hex (ex: ja for rgba), retorna sem alterar.
 */
export function applyOpacity(color: string, transparencyPct: number): string {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    const t = Math.min(100, Math.max(0, transparencyPct));
    const alpha = Math.round(((100 - t) / 100) * 1000) / 1000;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
