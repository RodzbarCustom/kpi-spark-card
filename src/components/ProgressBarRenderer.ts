// ProgressBarRenderer.ts — barra de progresso vs. meta (HTML)

import { createHTMLElement } from "../utils/domUtils";
import { DEFAULT_FONT_FAMILY } from "../constants";

export interface ProgressBarOptions {
    current: number;
    target: number;
    label: string;
    formattedTarget: string;
    barColor: string;
    barBgColor: string;
    exceededColor: string;
    barHeight: number;   // px
    barRadius: number;   // px
    fontSizePt: number;  // pt
    fontColor: string;
    fontFamily?: string;
    fontBold?: boolean;
    fontItalic?: boolean;
    fontUnderline?: boolean;
}

export class ProgressBarRenderer {
    public static render(opts: ProgressBarOptions): HTMLElement {
        const hasTarget = isFinite(opts.target) && opts.target !== 0;
        const pct = hasTarget ? opts.current / opts.target : 0;
        const fillPct = Math.max(0, Math.min(100, pct * 100));
        const exceeded = pct >= 1;
        const fillColor = exceeded ? opts.exceededColor : opts.barColor;

        const container = createHTMLElement("div", {
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            width: "100%",
        });

        const labelRow = createHTMLElement("div", {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontSize: `${opts.fontSizePt}pt`,
            color: opts.fontColor,
            fontFamily: opts.fontFamily ?? DEFAULT_FONT_FAMILY,
            fontWeight: opts.fontBold ? "bold" : "normal",
            fontStyle: opts.fontItalic ? "italic" : "normal",
            textDecoration: opts.fontUnderline ? "underline" : "none",
        });
        const labelLeft = createHTMLElement("span");
        labelLeft.textContent = opts.label
            ? `${opts.label}: ${opts.formattedTarget}`
            : opts.formattedTarget;
        const labelRight = createHTMLElement("span");
        labelRight.textContent = hasTarget ? `${Math.round(pct * 100)}%` : "—";
        labelRow.appendChild(labelLeft);
        labelRow.appendChild(labelRight);

        const track = createHTMLElement("div", {
            position: "relative",
            width: "100%",
            height: `${opts.barHeight}px`,
            background: opts.barBgColor,
            borderRadius: `${opts.barRadius}px`,
            overflow: "hidden",
        });
        const fill = createHTMLElement("div", {
            position: "absolute",
            left: "0",
            top: "0",
            height: "100%",
            width: `${fillPct}%`,
            background: fillColor,
            borderRadius: `${opts.barRadius}px`,
        });
        track.appendChild(fill);

        container.appendChild(labelRow);
        container.appendChild(track);
        return container;
    }
}
