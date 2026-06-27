/*
 *  KPI Spark Card — Power BI custom visual
 *  Cartao de KPI com sparkline integrada, variancia e barra de progresso.
 */
"use strict";

import "../style/visual.less";

import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import FormattingModel = powerbi.visuals.FormattingModel;

import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualFormattingSettingsModel } from "./settings";
import { DataViewMapper } from "./utils/dataViewMapper";
import { LicenseGuard } from "./components/LicenseGuard";
import { applyWatermark } from "./components/watermark";
import { clearElement } from "./utils/domUtils";
import { ValueFormatter } from "./components/ValueFormatter";
import { DEFAULT_LOCALE } from "./constants";
import { RenderContext, premiumFeatureInUse } from "./renderers/cardParts";
import { StandardRenderer } from "./renderers/StandardRenderer";
import { CompactRenderer } from "./renderers/CompactRenderer";
import { SplitRenderer } from "./renderers/SplitRenderer";

export class Visual implements IVisual {
    private readonly host: IVisualHost;
    private readonly root: HTMLElement;
    private readonly formattingSettingsService: FormattingSettingsService;
    private settings: VisualFormattingSettingsModel;
    private readonly licenseGuard: LicenseGuard;
    private readonly events: IVisualEventService;

    constructor(options?: VisualConstructorOptions) {
        // O plugin gerado chama new Visual(options?) — o host sempre fornece options em runtime.
        const opts = options as VisualConstructorOptions;
        this.host = opts.host;
        this.root = opts.element;
        this.formattingSettingsService = new FormattingSettingsService();
        this.settings = new VisualFormattingSettingsModel();
        this.licenseGuard = new LicenseGuard(this.host);
        this.events = this.host.eventService;

        // Acessibilidade: grupo com rotulo descritivo; pecas internas tem roles/aria proprios.
        this.root.setAttribute("role", "group");
        this.root.setAttribute("aria-label", "KPI Spark Card");
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);
        // Atualiza o status de licenca (no-op em DEV; consulta a Licensing API quando ativo).
        void this.licenseGuard.refreshLicense();
        try {
            const dataView = options?.dataViews?.[0];
            if (!dataView) {
                this.renderEmptyState();
                this.events.renderingFinished(options);
                return;
            }

            this.settings = this.formattingSettingsService.populateFormattingSettingsModel(
                VisualFormattingSettingsModel,
                dataView
            );

            const data = DataViewMapper.map(dataView);
            if (!data.isValid) {
                this.renderEmptyState(data.errorMessage);
                this.events.renderingFinished(options);
                return;
            }

            clearElement(this.root);
            this.root.style.position = "relative";

            const isPremium = this.licenseGuard.isPremium();
            const localeSetting = String(this.settings.layout.numberLocale.value.value);
            const locale = localeSetting === "auto" ? (this.host.locale || DEFAULT_LOCALE) : localeSetting;
            const ctx: RenderContext = {
                data,
                settings: this.settings,
                isPremium,
                width: options.viewport?.width ?? this.root.clientWidth,
                height: options.viewport?.height ?? this.root.clientHeight,
                locale,
            };

            const layout = String(this.settings.layout.layoutType.value.value);
            switch (layout) {
                case "compact": new CompactRenderer(this.root).render(ctx); break;
                case "split": new SplitRenderer(this.root).render(ctx); break;
                default: new StandardRenderer(this.root).render(ctx);
            }

            // Marca d'agua apenas para features premium quando sem licenca.
            const premiumFeature = premiumFeatureInUse(ctx);
            if (premiumFeature && !isPremium) {
                applyWatermark(this.root, premiumFeature);
            }

            // aria-label dinamico (acessibilidade)
            const label = data.category ? `${data.category} — ${data.title}` : data.title;
            this.root.setAttribute(
                "aria-label",
                `KPI: ${ValueFormatter.sanitizeText(label)} ${ValueFormatter.format({ value: data.mainValue })}`
            );

            this.events.renderingFinished(options);
        } catch (e) {
            this.renderEmptyState("Erro ao renderizar o visual");
            this.events.renderingFailed(options, e instanceof Error ? e.message : String(e));
        }
    }

    public getFormattingModel(): FormattingModel {
        this.applyConditionalVisibility();
        return this.formattingSettingsService.buildFormattingModel(this.settings);
    }

    /** Mostra/oculta opcoes do painel conforme o contexto (tipo de sparkline, modo manual, etc.). */
    private applyConditionalVisibility(): void {
        const sp = this.settings.sparkline;
        const type = String(sp.sparkType.value.value);
        const isLineLike = type === "line" || type === "area";

        sp.sparkSmooth.visible = isLineLike;                 // suavizar so faz sentido em linha/area
        sp.sparkAreaOpacity.visible = type === "area";       // opacidade so na area
        sp.sparkLineWidth.visible = type !== "bar";          // espessura nao se aplica a barra
        sp.refLineColor.visible = sp.showRefLine.value;
        sp.refLineStyle.visible = sp.showRefLine.value;
        sp.meanLineColor.visible = sp.showMeanLine.value;
        sp.showEndDot.visible = type !== "bar";              // ponto final nao se aplica a barra
        sp.endDotRadius.visible = sp.showEndDot.value && type !== "bar";

        // Casas decimais manuais so aparecem quando "automaticas" esta desligado.
        this.settings.mainValue.decimalPlaces.visible = !this.settings.mainValue.decimalsAuto.value;

        const sc = this.settings.secondary;
        for (let i = 0; i < 4; i++) {
            sc.decimals[i].visible = !sc.decimalsAuto[i].value;
        }
    }

    private renderEmptyState(message?: string): void {
        clearElement(this.root);
        const container = document.createElement("div");
        container.style.cssText = [
            "display:flex",
            "align-items:center",
            "justify-content:center",
            "height:100%",
            "width:100%",
            "box-sizing:border-box",
            "padding:12px",
            "text-align:center",
            "font-family:Segoe UI,sans-serif",
            "font-size:13px",
            "color:#767676",
        ].join(";");
        container.textContent = message ?? "Adicione uma medida ao campo Valor Principal";
        this.root.appendChild(container);
        this.root.setAttribute("aria-label", "KPI Spark Card — sem dados");
    }

    public destroy(): void {
        // Sem recursos persistentes a liberar.
    }
}
