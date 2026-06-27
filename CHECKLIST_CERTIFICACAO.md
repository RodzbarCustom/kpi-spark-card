# Checklist de Certificação AppSource — KPI Spark Card

> Status: `[x]` implementado/verificado · `[ ]` pendente (etapa de submissão/monetização).

## 1. Segurança
- [x] Nenhum uso de `innerHTML` com dados do usuário (apenas `textContent`).
- [x] Atributos HTML e SVG passam por whitelist (`domUtils.ts`).
- [x] `ValueFormatter.sanitizeText` é usado em todos os textos vindos de dados.
- [x] `safeColor` e `applyOpacity` garantem cores válidas.
- [x] Nenhuma chamada de rede externa (apenas APIs do host Power BI).
- [x] `LicenseGuard` usa apenas `licenseManager.getAvailableServicePlans()`.
- [x] `"privileges": []` em `capabilities.json`.

## 2. Acessibilidade
- [x] Cores padrão têm contraste ≥ 4.5:1 sobre branco (`constants.ts`).
- [x] Badge de variância usa sinais (▲/▼ ou +/−) além de cor.
- [x] Sparkline tem `aria-hidden="true"`.
- [x] Progress bar tem `role="progressbar"` e `aria-valuemin/max/now`.
- [x] Root tem `role="group"` com `aria-label` dinâmico; chips com `aria-label` "Rótulo: Valor".
- [x] Texto nunca é renderizado via HTML bruto (apenas `textContent`).

## 3. Performance
- [x] `dataViewMapper` é O(n).
- [x] `SparklineBuilder` usa loop para min/max (não `Math.min(...arr)`).
- [x] `availableWidth(ctx)` calculado uma vez por renderer.
- [x] Nenhum `setTimeout`/`setInterval`.
- [x] `dataReductionAlgorithm.top.count = 500`.

## 4. UX & Layout
- [x] Layout Standard funciona em vários tamanhos.
- [x] Layout Compact não quebra em cartões estreitos.
- [x] Layout Split: sparkline preenche a altura disponível.
- [x] Badge de variância com `min-width` (evita jitter).
- [x] Footer mostra período e frequência (texto ou medida via fx).

## 5. Semântica de Dados
- [x] `mainValue` é o último valor finito da medida.
- [x] `comparisonValue` usado para variância.
- [x] `targetValue` usado para barra de progresso.
- [x] Secundários respeitam slots (1–4) e formato da medida.
- [x] `VarianceCalculator` trata `comparison = 0` corretamente (não vira neutro).

## 6. Monetização
- [ ] `MONETIZATION_ENABLED = true` na versão de certificação (hoje `false` em DEV).
- [x] `LicenseGuard.refreshLicense()` é chamado no `update()`.
- [x] Ambientes sem suporte de licença não bloqueiam features (`isLicenseUnsupportedEnv`).
- [x] `applyWatermark` é usado apenas quando `isPremium() === false`.
- [ ] `serviceCode`/plano registrado no Partner Center.

## 7. Empacotamento
- [x] `pbiviz.json` com `version` único em `visual.version` (duplicata top-level removida).
- [x] `apiVersion` (5.11.0) compatível com `powerbi-visuals-api`.
- [x] `icon.png` 20×20 presente e referenciado.
- [x] `style/visual.less` compila sem erros.
- [x] `npm run lint` sem erros · `npm test` ≥ 80% cobertura.
- [ ] Screenshots 1366×768 e `.pbix` de exemplo (etapa de submissão).
