# KPI Spark Card

Visual customizado para Power BI: **cartão de KPI com sparkline integrada, variância
(MoM/YoY/meta) e barra de progresso**, em três layouts (Standard, Compacto e Split).
Construído em SVG/HTML inline (sem D3 no bundle), pronto para AppSource e elegível ao
Selo de Certificação Microsoft, com suporte a monetização IAP via Licensing API nativa.

> Screenshots: ver `marketing/screenshots/` (a adicionar antes da submissão ao AppSource).

---

## 1. Descrição

O KPI Spark Card exibe uma medida principal em destaque, sua tendência em uma sparkline,
a variância contra um valor de comparação (mês anterior, ano anterior ou meta) e uma barra
de progresso vs. meta. Todos os textos usam tamanho em **pt** e todas as cores expõem o
botão **fx** (formatação condicional por DAX).

## 2. Data Roles (campos)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| Valor Principal (`mainValue`) | Medida | **Sim** | Valor em destaque no cartão |
| Eixo de Tempo (`timeSeries`) | Agrupamento/Medida | Não | Eixo X da sparkline |
| Valor da Sparkline (`sparkValue`) | Medida | Não | Pontos da sparkline (padrão: = Valor Principal) |
| Valor de Comparação (`comparisonValue`) | Medida | Não | Base da variância |
| Meta (`targetValue`) | Medida | Não | Barra de progresso e linha de referência |
| Categoria (`categoryLabel`) | Agrupamento | Não | Rótulo de contexto acima do título |
| KPI Secundário 1–4 (`secondaryMeasure1..4`) | Medida | Não | Chips secundários (**premium**) |

Mapeamento `categorical`, redução `top 500`. `privileges: []`.

## 3. Propriedades de formatação (por card)

| Card | Principais propriedades |
|---|---|
| **Aparência Geral** | layout (Standard/Compacto/Split), exibir categoria, exibir rodapé, densidade |
| **Cartão** | cor de fundo + **transparência (%)**, borda (cor/largura/raio), barra de destaque (on/cor/largura), padding |
| **Categoria** | fonte (família/tamanho pt/N/I/S), cor, alinhamento, CAIXA ALTA |
| **Título do KPI** | fonte, cor, alinhamento |
| **Valor Principal** | fonte, cor, alinhamento, unidades (Auto/Mil/Mi/Bi), casas decimais, prefixo, sufixo |
| **Variância** | on, modo (%/abs/ambos), rótulo, **indicador (triângulo/seta/nenhum)**, positivo=favorável, cores+fundos (pos/neg/neutro), **fonte (família/tamanho pt/N/I/S)**, limiar neutro |
| **Meta e Progresso** | on, rótulo, cores (barra/fundo/excedido), altura, raio, **fonte (família/tamanho pt/N/I/S)** |
| **Sparkline** | on, tipo (linha/área/barra/step), cor, **suavizar linha**, opacidade área, espessura, altura, linha ref/média, ponto final |
| **KPIs Secundários (Premium)** | on, **até 4 KPIs**, **formato independente por KPI** (cada um Auto = formato da medida / Manual com unidades e decimais próprios), cor de fundo, tamanhos pt e cores de rótulo/valor, negrito |
| **Rodapé** | tamanho pt, cor, cor da linha, período/frequência (texto **ou fx/medida**) |

Todas as propriedades de **cor** têm color picker + **fx** (`instanceKind: ConstantOrRule`).
Toda **cor de fundo** (cartão, badges de variância, fundo da barra de meta, chips dos secundários) tem um controle de **transparência (%)** próprio.

## 4. Layouts

- **Standard** — pilha vertical rica; sparkline em largura total abaixo do valor.
- **Compacto** — denso; valor e variância na mesma linha; ideal para grades de KPIs (gap reduz em cartões < 120 px).
- **Split** — informação à esquerda e sparkline à direita, que preenche a altura (premium; gap reduz em < 160 px).

### 4.1 Exemplos de uso
- **MoM (mês a mês):** `Valor Principal` = medida do mês atual; `Valor de Comparação` = `CALCULATE(..., PREVIOUSMONTH())`.
- **YoY (ano a ano):** `Valor de Comparação` = `CALCULATE(..., SAMEPERIODLASTYEAR())`.
- **vs. Meta:** preencha `Meta` para ativar a barra de progresso e a linha de referência na sparkline.

### 4.2 Variância
- `positiveIsGood`: define se aumentar é favorável (verde) ou desfavorável (vermelho). Para custos/detratores, desligue.
- `neutralThreshold` (%): variações de módulo ≤ esse valor são tratadas como **neutras**.
- **Indicador**: triângulo (▲▼), seta (↑↓) ou nenhum (mostra sinal ±). A cor nunca é o único sinal.
- `comparison = 0` não é neutro: a direção vem do sinal do valor.

### 4.3 Sparkline
- Tipos: **Linha, Área, Barra, Step**. "Suavizar linha" (Catmull-Rom) só em linha/área.
- **Linha de referência** (meta) entra na escala e fica sempre visível; **linha de média** opcional.
- A altura respeita a densidade (compacto menor, espaçoso maior).

### 4.4 Valores e rótulos (modelo do cartão nativo)
- **Valores** (principal e secundários): fonte, cor (+fx), **unidade** (Auto/Nenhum/Mil/Milhão/Bilhão/Trilhão),
  **casas decimais** (Auto ou manual) e **quebra de texto**. O formato da medida (%, R$) é sempre respeitado.
- **Rótulos** (categoria, título, secundários): caixa de **texto personalizada** com **fx** (medida de texto DAX);
  vazio assume o nome do campo/medida. Fonte, cor (+fx), alinhamento e quebra.
- **Secundários (1–4):** fonte/cor/quebra compartilhadas; unidade/decimais/rótulo por KPI (suporta R$ + % juntos).

### 4.5 Internacionalização
- **Idioma dos números** (card Aparência Geral): `Auto` segue o idioma do relatório (`host.locale`); ou force `pt-BR`/`en-US`.
  Unidades e separadores acompanham o locale (ex.: `1,5 mil` em pt-BR, `1.5K` em en-US).

### 4.6 Acessibilidade
- Root `role="group"` + `aria-label` descritivo; barra de progresso `role="progressbar"` (`aria-valuenow`);
  chips com `aria-label` "Rótulo: Valor"; sparkline `aria-hidden`. Contraste dos defaults ≥ 4.5:1.

## 5. Free vs. Premium

| Feature | Free | Premium |
|---|:--:|:--:|
| Layout Standard / Compacto | ✅ | ✅ |
| Layout Split | ⚠️ marca d'água | ✅ |
| Sparkline Linha / Área | ✅ | ✅ |
| Sparkline Barra / Step | ⚠️ marca d'água | ✅ |
| Variância (1) + barra de progresso | ✅ | ✅ |
| KPIs secundários | ⚠️ marca d'água | ✅ |
| Linha de referência / média | ⚠️ marca d'água | ✅ |
| Todas as opções de formatação | ✅ | ✅ |

Sem licença, as features free continuam funcionando (exigência Microsoft). Na fase de
desenvolvimento, `MONETIZATION_ENABLED = false` em `src/components/LicenseGuard.ts` libera tudo.

## 6. Build

```sh
npm install
npm run package   # gera dist/*.pbiviz
npm run start     # dev server com hot reload (requer certificado pbiviz)
npm run lint
```

Requer Node >= 18 e `powerbi-visuals-tools` (instalado como ferramenta global ou via `npx`).

## 7. Testes

```sh
npm test                 # Jest + jsdom + axe
npm run test:coverage    # com cobertura (limite global: 80% / branches 75%)
```

> **Nota de acessibilidade:** o axe roda sobre `jsdom`, que **não** calcula layout nem cores
> reais. A regra `color-contrast` é **desabilitada** nos testes — o contraste (≥ 4.5:1) é
> garantido pelos defaults do projeto, não pelo teste. O axe valida apenas semântica ARIA/roles.

## 8. Como contribuir

Branches: `feature/*`, `fix/*` → PR para `develop`. Commits no padrão
[Conventional Commits](https://www.conventionalcommits.org/). Rodar `npm run lint` e
`npm test` antes de abrir o PR. A branch `certification` espelha o pacote submetido ao
Partner Center (nunca merge direto).

## 9. Changelog

Ver [CHANGELOG.md](CHANGELOG.md).

## 10. Licença

[MIT](LICENSE).
