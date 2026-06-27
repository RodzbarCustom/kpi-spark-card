// watermark.ts
// Sobreposicao para features premium. Inserida DENTRO do root (nunca no parentElement).
// pointer-events:none, sem alert/confirm, sem chamada de rede. Features free continuam
// funcionando — apenas sinaliza visualmente.

const WATERMARK_CLASS = "kpi-spark-watermark";

export function applyWatermark(root: HTMLElement, featureName: string): void {
    root.style.position = "relative";

    // Remove overlay anterior (evita duplicacao em updates subsequentes).
    const existing = root.querySelector(`.${WATERMARK_CLASS}`);
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.className = WATERMARK_CLASS;
    overlay.style.cssText = [
        "position:absolute",
        "inset:0",
        "display:flex",
        "flex-direction:column",
        "align-items:center",
        "justify-content:center",
        "background:rgba(255,255,255,0.82)",
        "font-family:Segoe UI,sans-serif",
        "gap:6px",
        "pointer-events:none",
        "z-index:10",
    ].join(";");

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("stroke", "#555555");
    svg.setAttribute("stroke-width", "1.5");
    svg.setAttribute("fill", "none");
    svg.setAttribute("aria-hidden", "true");

    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", "3");
    rect.setAttribute("y", "11");
    rect.setAttribute("width", "18");
    rect.setAttribute("height", "11");
    rect.setAttribute("rx", "2");

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", "M7 11V7a5 5 0 0 1 10 0v4");

    svg.appendChild(rect);
    svg.appendChild(path);

    const text = document.createElement("div");
    text.textContent = `${featureName} — requer licenca Premium`;
    text.style.fontSize = "12px";
    text.style.color = "#555555";
    text.style.textAlign = "center";
    text.style.padding = "0 8px";

    overlay.appendChild(svg);
    overlay.appendChild(text);
    root.appendChild(overlay);
}
