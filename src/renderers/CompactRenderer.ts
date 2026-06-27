// CompactRenderer.ts — layout compacto: denso, valor + variancia na mesma linha

import {
    RenderContext, buildCardSurface, buildCategory, buildTitle, buildMainValue,
    buildVarianceBadge, buildSparkline, buildProgress,
} from "./cardParts";
import { createHTMLElement } from "../utils/domUtils";

function availableWidth(ctx: RenderContext): number {
    const padding = ctx.settings.card.padding.value;
    const accent = ctx.settings.card.accentBarEnabled.value ? ctx.settings.card.accentBarWidth.value : 0;
    return Math.max(40, ctx.width - padding * 2 - accent);
}

export class CompactRenderer {
    constructor(private readonly root: HTMLElement) {}

    public render(ctx: RenderContext): void {
        const { card, content } = buildCardSurface(ctx);
        const add = (el: Node | null): void => { if (el) content.appendChild(el); };

        add(buildCategory(ctx));
        add(buildTitle(ctx));

        // Valor e variancia lado a lado (denso)
        const value = buildMainValue(ctx);
        const variance = buildVarianceBadge(ctx);
        if (variance) {
            const row = createHTMLElement("div", {
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: "8px",
                flexWrap: "wrap",
            });
            value.style.flex = "0 1 auto";
            row.appendChild(value);
            row.appendChild(variance);
            content.appendChild(row);
        } else {
            content.appendChild(value);
        }

        add(buildSparkline(ctx, availableWidth(ctx)));
        add(buildProgress(ctx));

        this.root.appendChild(card);
    }
}
