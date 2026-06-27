// SplitRenderer.ts — layout split: info a esquerda, sparkline a direita (premium)

import {
    RenderContext, buildCardSurface, buildCategory, buildTitle, buildMainValue,
    buildVarianceBadge, buildSparkline, buildProgress, buildSecondary, buildFooter,
} from "./cardParts";
import { createHTMLElement } from "../utils/domUtils";

function availableWidth(ctx: RenderContext): number {
    const padding = ctx.settings.card.padding.value;
    const accent = ctx.settings.card.accentBarEnabled.value ? ctx.settings.card.accentBarWidth.value : 0;
    return Math.max(40, ctx.width - padding * 2 - accent);
}

export class SplitRenderer {
    constructor(private readonly root: HTMLElement) {}

    public render(ctx: RenderContext): void {
        const { card, content } = buildCardSurface(ctx);
        content.style.flexDirection = "column";

        const columns = createHTMLElement("div", {
            display: "flex",
            flexDirection: "row",
            gap: ctx.width < 160 ? "6px" : "12px",
            alignItems: "stretch",
            flex: "1 1 auto",
            minHeight: "0",
        });

        const left = createHTMLElement("div", {
            display: "flex",
            flexDirection: "column",
            gap: `${4}px`,
            flex: "1.2 1 0",
            minWidth: "0",
            justifyContent: "center",
        });
        const right = createHTMLElement("div", {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: "1 1 0",
            minWidth: "0",
        });

        const addLeft = (el: Node | null): void => { if (el) left.appendChild(el); };
        addLeft(buildCategory(ctx));
        addLeft(buildTitle(ctx));
        addLeft(buildMainValue(ctx));
        addLeft(buildVarianceBadge(ctx));
        addLeft(buildProgress(ctx));
        addLeft(buildSecondary(ctx));

        // No Split a sparkline preenche a altura disponivel da coluna direita.
        const padding = ctx.settings.card.padding.value;
        const footerAllowance = ctx.settings.layout.showFooter.value ? 26 : 0;
        const sparkHeight = Math.max(60, ctx.height - padding * 2 - footerAllowance);
        const sparkWidth = Math.max(60, Math.round(availableWidth(ctx) * 0.45));
        const spark = buildSparkline(ctx, sparkWidth, sparkHeight);
        if (spark) right.appendChild(spark);

        columns.appendChild(left);
        columns.appendChild(right);
        content.appendChild(columns);

        const footer = buildFooter(ctx);
        if (footer) content.appendChild(footer);

        this.root.appendChild(card);
    }
}
