# Changelog

Todos os registros relevantes deste projeto seguem o formato
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
e [Versionamento Semantico](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [1.0.0] - 2026-06-26

### Added
- Layout **Standard** com sparkline de linha, area, barra e step.
- Layout **Compacto** para paineis densos (valor e variancia na mesma linha).
- Layout **Split** com sparkline lateral (premium).
- Seletor de layout no painel de formato.
- Variancia MoM/YoY/vs. meta com modo Percentual, Absoluto ou Ambos.
- Indicador de variancia configuravel: triangulo (▲▼), seta (↑↓) ou nenhum (sinal +/-).
- Direcao semantica de variancia (positivo = favoravel | desfavoravel) com indicador + cor.
- Suavizacao opcional da linha (Catmull-Rom) nos tipos linha e area.
- Sparkline: linha de referencia (meta) entra no dominio da escala e fica sempre visivel mesmo quando a meta esta fora do range dos dados.
- Sparkline: insets evitam que o ponto final e as barras sejam cortados nas bordas.
- Layout Split: a sparkline preenche a altura disponivel da coluna direita (sem espaco sobrando).
- Painel de formato adaptativo: opcoes da sparkline aparecem conforme o tipo (suavizar so em linha/area, opacidade so em area, espessura/ponto final ocultos em barra; cor/estilo de ref e media so quando ativos) e unidades/decimais dos secundarios so no modo Manual.
- KPIs secundarios com formato **independente por KPI**: cada medida tem seu proprio modo **Auto** (le o format string da medida: %, moeda, etc., via `powerbi-visuals-utils-formattingutils`) ou **Manual** (unidades/decimais proprios). Permite, ex., KPI 1 em R$ e KPI 2 em %.
- Rodape: campos Periodo e Frequencia com **fx** (medida DAX pode gerar o texto).
- Ate **4 KPIs secundarios** (secondaryMeasure1..4), cada um com formato proprio.
- Controles de **fonte completos** (familia, tamanho pt, negrito, italico, sublinhado) nos cards Variancia e Meta e Progresso.
- Novo icone do visual (sparkline + tendencia KPI, estilo flat nativo) substituindo o placeholder.
- Barra de progresso vs. meta com cor condicional ao superar 100%.
- KPIs secundarios (ate 3 medidas) — feature premium.
- Barra de destaque (accent bar) lateral configuravel.
- Escala automatica de valores (K / M / B) com locale pt-BR (`Intl.NumberFormat`).
- Linha de referencia (meta) e linha de media na sparkline.
- Marca d'agua para features premium (inserida dentro do root, sem rede/alert).
- `fx` (formatacao condicional por DAX) em todas as cores.
- Fontes em **pt** em todos os textos.
- Rendering events (`eventService`) para suporte a export PDF/PowerPoint.
- Acessibilidade: `role="img"` + `aria-label` dinamico; defaults com contraste >= 4.5:1.
- Cobertura de testes (Jest + axe) > 80%.
