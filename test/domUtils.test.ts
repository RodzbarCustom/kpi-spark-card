import {
    createSVGElement, createHTMLElement, setSVGAttribute, setSVGAttributes, clearElement,
} from "../src/utils/domUtils";

describe("domUtils", () => {
    test("createSVGElement cria no no namespace SVG", () => {
        const el = createSVGElement("rect");
        expect(el.namespaceURI).toBe("http://www.w3.org/2000/svg");
    });

    test("createHTMLElement aplica estilos e atributos da whitelist", () => {
        const el = createHTMLElement("div", { color: "red" }, { role: "img", id: "x" });
        expect(el.style.color).toBe("red");
        expect(el.getAttribute("role")).toBe("img");
        expect(el.getAttribute("id")).toBe("x");
    });

    test("createHTMLElement ignora atributos fora da whitelist (ex: style, onclick)", () => {
        const el = createHTMLElement("div", undefined, { style: "color:red", onclick: "x()" });
        expect(el.getAttribute("style")).toBeNull();
        expect(el.getAttribute("onclick")).toBeNull();
    });

    test("setSVGAttribute aplica permitido e ignora proibido", () => {
        const el = createSVGElement("path");
        setSVGAttribute(el, "d", "M0,0");
        setSVGAttribute(el, "onload", "evil()");
        expect(el.getAttribute("d")).toBe("M0,0");
        expect(el.getAttribute("onload")).toBeNull();
    });

    test("setSVGAttributes aplica multiplos atributos", () => {
        const el = createSVGElement("circle");
        setSVGAttributes(el, { cx: 1, cy: 2, r: 3 });
        expect(el.getAttribute("cx")).toBe("1");
        expect(el.getAttribute("r")).toBe("3");
    });

    test("clearElement remove todos os filhos", () => {
        const el = createHTMLElement("div");
        el.appendChild(createHTMLElement("span"));
        el.appendChild(createHTMLElement("span"));
        clearElement(el);
        expect(el.childNodes.length).toBe(0);
    });
});
