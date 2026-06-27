// SparklineBuilder.ts — sparkline inline em SVG (sem D3 no bundle de producao)

import { createSVGElement, setSVGAttributes } from "../utils/domUtils";

export type SparklineType = "line" | "area" | "bar" | "step";

interface Point { x: number; y: number; }

export interface SparklineOptions {
    values: number[];
    width: number;
    height: number;
    type: SparklineType;
    color: string;
    areaOpacity: number;   // 0-100
    lineWidth: number;
    referenceValue?: number;
    refLineColor?: string;
    refLineStyle?: "solid" | "dashed" | "dotted";
    meanLineEnabled?: boolean;
    meanLineColor?: string;
    showEndDot?: boolean;
    endDotRadius?: number;
    smooth?: boolean;
}

export class SparklineBuilder {
    /** Renderiza a sparkline dentro do container SVG fornecido. */
    public static build(container: SVGElement, opts: SparklineOptions): void {
        const { values, width, height } = opts;
        if (!values || values.length < 1) return;

        const valid = values.filter((v) => typeof v === "number" && isFinite(v));
        if (valid.length < 1) return;

        // Serie com 1 ponto: renderiza um ponto unico centralizado (degrada graciosamente).
        if (valid.length === 1) {
            const dot = createSVGElement("circle");
            setSVGAttributes(dot, {
                cx: width / 2,
                cy: height / 2,
                r: Math.max(2, opts.endDotRadius ?? 3),
                fill: opts.color,
            });
            container.appendChild(dot);
            return;
        }

        const refEnabled = opts.referenceValue !== undefined && isFinite(opts.referenceValue);

        // Dominio inclui a referencia (meta) quando ativa, para a linha ficar sempre visivel.
        // Loop (em vez de Math.min(...valid)) evita estourar a pilha com arrays grandes.
        let domainMin = valid[0];
        let domainMax = valid[0];
        for (const v of valid) {
            if (v < domainMin) domainMin = v;
            if (v > domainMax) domainMax = v;
        }
        if (refEnabled) {
            domainMin = Math.min(domainMin, opts.referenceValue as number);
            domainMax = Math.max(domainMax, opts.referenceValue as number);
        }
        const range = domainMax - domainMin;

        const n = valid.length;
        const isBar = opts.type === "bar";
        const dotR = opts.showEndDot ? (opts.endDotRadius ?? 3) : 0;
        const barWidth = Math.max(1, (width / n) * 0.7);

        // Insets para nao cortar barras, ponto final e a espessura da linha nas bordas.
        const padX = isBar ? barWidth / 2 : Math.max(dotR, opts.lineWidth / 2, 1);
        const padV = Math.max(dotR, opts.lineWidth / 2, height * 0.06);
        const innerW = Math.max(1, width - 2 * padX);
        const innerH = Math.max(1, height - 2 * padV);
        const baseline = height - padV;

        const scaleX = (i: number): number => padX + (i / (n - 1)) * innerW;
        const scaleY = (v: number): number =>
            range === 0 ? height / 2 : baseline - ((v - domainMin) / range) * innerH;

        const points: Point[] = valid.map((v, i) => ({ x: scaleX(i), y: scaleY(v) }));

        switch (opts.type) {
            case "bar": SparklineBuilder.renderBar(container, points, opts, barWidth, baseline); break;
            case "step": SparklineBuilder.renderStep(container, points, opts); break;
            case "area":
                // range=0: todos iguais -> so a linha (evita triangulo de fechamento estranho).
                if (range === 0) SparklineBuilder.renderLine(container, points, opts);
                else SparklineBuilder.renderArea(container, points, opts, baseline);
                break;
            default: SparklineBuilder.renderLine(container, points, opts);
        }

        // Linha de referencia (meta) — sempre dentro do dominio
        if (refEnabled) {
            const ry = scaleY(opts.referenceValue as number);
            const dash =
                opts.refLineStyle === "dashed" ? "4,3" :
                opts.refLineStyle === "dotted" ? "1,3" : "";
            const refLine = createSVGElement("line");
            setSVGAttributes(refLine, {
                x1: 0, y1: ry, x2: width, y2: ry,
                stroke: opts.refLineColor ?? "#CCCCCC", "stroke-width": 1,
            });
            if (dash) setSVGAttributes(refLine, { "stroke-dasharray": dash });
            container.appendChild(refLine);
        }

        // Linha de media
        if (opts.meanLineEnabled) {
            const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
            const my = scaleY(mean);
            const meanLine = createSVGElement("line");
            setSVGAttributes(meanLine, {
                x1: 0, y1: my, x2: width, y2: my,
                stroke: opts.meanLineColor ?? "#AAAAAA", "stroke-width": 1,
                "stroke-dasharray": "2,2",
            });
            container.appendChild(meanLine);
        }

        // Ponto final (o inset garante que nao seja cortado). Nao se aplica a barras.
        if (opts.showEndDot && !isBar && points.length > 0) {
            const last = points[points.length - 1];
            const dot = createSVGElement("circle");
            setSVGAttributes(dot, {
                cx: last.x, cy: last.y, r: opts.endDotRadius ?? 3, fill: opts.color,
            });
            container.appendChild(dot);
        }
    }

    private static buildLinePath(points: Point[]): string {
        return points.reduce(
            (acc, p, i) => acc + (i === 0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`),
            ""
        );
    }

    /** Curva suave (Catmull-Rom convertida em beziers cubicas). */
    private static buildSmoothPath(points: Point[]): string {
        if (points.length < 3) return SparklineBuilder.buildLinePath(points);
        let d = `M${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i - 1] ?? points[i];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2] ?? p2;
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
        }
        return d;
    }

    private static pathData(points: Point[], smooth?: boolean): string {
        return smooth ? SparklineBuilder.buildSmoothPath(points) : SparklineBuilder.buildLinePath(points);
    }

    private static renderLine(container: SVGElement, points: Point[], opts: SparklineOptions): void {
        const path = createSVGElement("path");
        setSVGAttributes(path, {
            d: SparklineBuilder.pathData(points, opts.smooth),
            fill: "none",
            stroke: opts.color,
            "stroke-width": opts.lineWidth,
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
        });
        container.appendChild(path);
    }

    private static renderArea(container: SVGElement, points: Point[], opts: SparklineOptions, baseline: number): void {
        const linePath = SparklineBuilder.pathData(points, opts.smooth);
        const last = points[points.length - 1];
        const first = points[0];
        const areaPath = `${linePath} L${last.x},${baseline} L${first.x},${baseline} Z`;
        const area = createSVGElement("path");
        setSVGAttributes(area, {
            d: areaPath,
            fill: opts.color,
            opacity: (opts.areaOpacity ?? 15) / 100,
        });
        container.appendChild(area);
        SparklineBuilder.renderLine(container, points, opts);
    }

    private static renderBar(container: SVGElement, points: Point[], opts: SparklineOptions, barWidth: number, baseline: number): void {
        for (const p of points) {
            const bar = createSVGElement("rect");
            setSVGAttributes(bar, {
                x: p.x - barWidth / 2,
                y: p.y,
                width: barWidth,
                height: Math.max(0, baseline - p.y),
                fill: opts.color,
                rx: 1,
            });
            container.appendChild(bar);
        }
    }

    private static renderStep(container: SVGElement, points: Point[], opts: SparklineOptions): void {
        let d = `M${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            d += ` H${points[i].x} V${points[i].y}`;
        }
        const path = createSVGElement("path");
        setSVGAttributes(path, {
            d,
            fill: "none",
            stroke: opts.color,
            "stroke-width": opts.lineWidth,
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
        });
        container.appendChild(path);
    }
}
