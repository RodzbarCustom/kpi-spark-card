// domUtils.ts
// Criacao segura de elementos. NUNCA innerHTML com dados do usuario.
// Whitelists HTML e SVG SEPARADAS. "style" NAO entra na whitelist de atributos
// (estilo so via Object.assign(el.style, ...), tipado e seguro).

export function createSVGElement<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

const ALLOWED_HTML_ATTRS = new Set<string>([
    "role", "aria-label", "aria-hidden", "class", "id", "title",
]);

const ALLOWED_SVG_ATTRS = new Set<string>([
    "viewBox", "preserveAspectRatio",
    "d", "fill", "fill-opacity", "stroke", "stroke-width",
    "stroke-linecap", "stroke-linejoin", "stroke-dasharray",
    "cx", "cy", "r",
    "x", "y", "x1", "y1", "x2", "y2",
    "width", "height", "rx", "ry",
    "opacity", "transform",
    "font-size", "font-family", "font-weight", "text-anchor", "dominant-baseline",
    "aria-hidden", "id", "class",
]);

export function createHTMLElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    styles?: Partial<CSSStyleDeclaration>,
    attributes?: Record<string, string>
): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);
    if (styles) Object.assign(el.style, styles);           // estilo seguro/tipado
    if (attributes) {
        for (const [key, val] of Object.entries(attributes)) {
            if (ALLOWED_HTML_ATTRS.has(key)) el.setAttribute(key, val);
        }
    }
    return el;
}

export function setSVGAttribute(el: SVGElement, name: string, value: string): void {
    if (ALLOWED_SVG_ATTRS.has(name)) el.setAttribute(name, value);
}

/** Aplica varios atributos SVG de uma vez (todos passam pela whitelist). */
export function setSVGAttributes(el: SVGElement, attrs: Record<string, string | number>): void {
    for (const [name, value] of Object.entries(attrs)) {
        setSVGAttribute(el, name, String(value));
    }
}

/** Remove todos os filhos de um no de forma segura. */
export function clearElement(el: Node): void {
    while (el.firstChild) el.removeChild(el.firstChild);
}
