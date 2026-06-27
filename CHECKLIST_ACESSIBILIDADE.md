# Checklist de Acessibilidade — KPI Spark Card

> Status: `[x]` implementado · `[ ]` pendente.

## 1. Contraste de Cores
- [x] Todas as cores em `DEFAULT_COLORS` têm contraste ≥ 4.5:1 sobre #FFFFFF.
- [x] Variância positiva/negativa com contraste adequado (texto escuro sobre fundo claro).
- [x] Footer com contraste suficiente (`#767676`).

## 2. Texto e Ícones
- [x] Nenhum texto depende apenas de cor para significado.
- [x] Badge de variância usa sinais (▲/▼; +/− quando indicador = nenhum) além de cor.
- [x] Indicadores (triângulo, seta) são complementares, não exclusivos.

## 3. ARIA & Roles
- [x] **Modo Alto Contraste** suportado (`host.colorPalette.isHighContrast` → cores foreground/background do host + strokes visiveis).
- [x] `aria-label` no valor principal e no badge de variancia.
- [x] Sparkline tem `aria-hidden="true"`.
- [x] Progress bar tem `role="progressbar"` e `aria-valuemin/max/now`.
- [x] Root tem `role="group"` com `aria-label` descritivo (categoria + título + valor).
- [x] Chips secundários têm `aria-label` "Rótulo: Valor".

## 4. Navegação
- [x] Nenhum elemento interativo sem foco (visual não-interativo).
- [x] Visual não captura teclado indevidamente.
- [x] Sem `tabindex` customizado.

## 5. Leitura de Tela
- [x] Título do KPI claro e descritivo (medida ou texto/medida via fx).
- [x] Categoria opcional, não confunde a leitura.
- [x] Footer descreve período e frequência de forma textual.

## 6. Testes
- [x] `jest-axe` roda sem violações (`test/a11y.test.ts`).
- [x] Regra `color-contrast` desabilitada no axe (jsdom não calcula layout/cor) — contraste garantido pelos defaults.
- [x] Sparkline é complementar (`aria-hidden`), não anunciada como essencial.
