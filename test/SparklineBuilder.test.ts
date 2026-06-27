import { SparklineBuilder, SparklineOptions } from "../src/components/SparklineBuilder";

function svg(): SVGElement {
    return document.createElementNS("http://www.w3.org/2000/svg", "svg");
}

const base: Omit<SparklineOptions, "values" | "type"> = {
    width: 100,
    height: 40,
    color: "#185FA5",
    areaOpacity: 15,
    lineWidth: 1.5,
};

describe("SparklineBuilder", () => {
    test("valores validos geram path SVG iniciando com M", () => {
        const c = svg();
        SparklineBuilder.build(c, { ...base, values: [1, 2, 3, 4], type: "line" });
        const path = c.querySelector("path");
        expect(path).not.toBeNull();
        expect(path!.getAttribute("d")!.startsWith("M")).toBe(true);
    });

    test("area gera 2 paths (area + linha)", () => {
        const c = svg();
        SparklineBuilder.build(c, { ...base, values: [1, 2, 3], type: "area" });
        expect(c.querySelectorAll("path").length).toBe(2);
    });

    test("array vazio nao lanca e nao renderiza", () => {
        const c = svg();
        expect(() => SparklineBuilder.build(c, { ...base, values: [], type: "line" })).not.toThrow();
        expect(c.childNodes.length).toBe(0);
    });

    test("valores nao-finitos sao filtrados; <2 validos nao renderiza", () => {
        const c = svg();
        SparklineBuilder.build(c, { ...base, values: [NaN, 5, NaN], type: "line" });
        expect(c.childNodes.length).toBe(0);
    });

    test("todos os valores iguais (range=0) nao gera NaN no path", () => {
        const c = svg();
        SparklineBuilder.build(c, { ...base, values: [5, 5, 5], type: "line" });
        const path = c.querySelector("path");
        expect(path).not.toBeNull();
        expect(path!.getAttribute("d")).not.toContain("NaN");
    });

    test("barra gera um rect por ponto", () => {
        const c = svg();
        SparklineBuilder.build(c, { ...base, values: [1, 2, 3, 4], type: "bar" });
        expect(c.querySelectorAll("rect").length).toBe(4);
    });

    test("linha de referencia, media e ponto final sao renderizados", () => {
        const c = svg();
        SparklineBuilder.build(c, {
            ...base, values: [1, 2, 3], type: "line",
            referenceValue: 2, refLineStyle: "dashed",
            meanLineEnabled: true, showEndDot: true, endDotRadius: 3,
        });
        expect(c.querySelectorAll("line").length).toBe(2); // ref + media
        expect(c.querySelector("circle")).not.toBeNull(); // ponto final
    });

    test("smooth gera curva (comando C) no path da linha", () => {
        const c = svg();
        SparklineBuilder.build(c, { ...base, values: [1, 5, 2, 6], type: "line", smooth: true });
        const d = c.querySelector("path")!.getAttribute("d")!;
        expect(d).toContain("C");
    });

    test("linha de referencia fora do range dos dados ainda aparece dentro da area", () => {
        const c = svg();
        SparklineBuilder.build(c, { ...base, values: [10, 20, 30], type: "line", referenceValue: 100, refLineStyle: "dashed" });
        const lines = c.querySelectorAll("line");
        expect(lines.length).toBe(1);
        const y1 = parseFloat(lines[0].getAttribute("y1")!);
        expect(y1).toBeGreaterThanOrEqual(0);
        expect(y1).toBeLessThanOrEqual(base.height);
    });

    test("ponto final fica dentro da area (nao cortado pela borda)", () => {
        const c = svg();
        SparklineBuilder.build(c, { ...base, values: [1, 2, 3], type: "line", showEndDot: true, endDotRadius: 3 });
        const dot = c.querySelector("circle")!;
        const cx = parseFloat(dot.getAttribute("cx")!);
        const r = parseFloat(dot.getAttribute("r")!);
        expect(cx + r).toBeLessThanOrEqual(base.width);
    });
});
