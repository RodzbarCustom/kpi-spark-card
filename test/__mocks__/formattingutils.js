// Mock minimo de powerbi-visuals-utils-formattingutils (ESM, nao transformado pelo
// Jest em node_modules). Reproduz valueFormatter.format respeitando "%" no format.

const valueFormatter = {
    create: () => ({ format: (v) => (v == null ? "" : String(v)) }),
    format: (value, format) => {
        if (value == null) return "";
        const n = Number(value);
        if (typeof format === "string" && format.indexOf("%") !== -1) {
            return (Math.round(n * 1000) / 10).toString().replace(".", ",") + "%";
        }
        return n.toString().replace(".", ",");
    },
};

module.exports = { valueFormatter };
