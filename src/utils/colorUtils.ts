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
