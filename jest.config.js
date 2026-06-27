/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    roots: ["<rootDir>/test"],
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/types/**",
        "!src/visual.ts", // glue do host; coberto por testes manuais no Power BI
    ],
    coverageThreshold: {
        global: { lines: 80, branches: 75, functions: 80, statements: 80 },
    },
    transform: {
        "^.+\\.ts$": ["ts-jest", { isolatedModules: false, diagnostics: false }],
    },
    moduleNameMapper: {
        // Os pacotes reais sao ESM e nao sao transformados pelo Jest em node_modules.
        "^powerbi-visuals-utils-formattingmodel$": "<rootDir>/test/__mocks__/formattingmodel.js",
        "^powerbi-visuals-utils-formattingutils$": "<rootDir>/test/__mocks__/formattingutils.js",
    },
};
