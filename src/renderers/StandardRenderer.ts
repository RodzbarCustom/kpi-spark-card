// StandardRenderer.ts — layout padrao: pilha vertical rica, sparkline em largura total

import {
    RenderContext, buildCardSurface, buildCategory, buildTitle, buildMainValue,
    buildVarianceBadge, buildSparkline, buildProgress, buildSecondary, buildFooter,
} from "./cardParts";

function availableWidth(ctx: RenderContext): number {
    const padding = ctx.settings.card.padding.value;
    const accent = ctx.settings.card.accentBarEnabled.value ? ctx.settings.card.accentBarWidth.value : 0;
    return Math.max(40, ctx.width - padding * 2 - accent);
}

export class StandardRenderer {
    constructor(private readonly root: HTMLElement) {}

    public render(ctx: RenderContext): void {
        const { card, content } = buildCardSurface(ctx);
        const add = (el: Node | null): void => { if (el) content.appendChild(el); };

        add(buildCategory(ctx));
        add(buildTitle(ctx));
        add(buildMainValue(ctx));
        add(buildVarianceBadge(ctx));
        add(buildSparkline(ctx, availableWidth(ctx)));
        add(buildProgress(ctx));
        add(buildSecondary(ctx));
        add(buildFooter(ctx));

        this.root.appendChild(card);
    }
}
