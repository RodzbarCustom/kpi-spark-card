# Changelog

Todos os registros relevantes deste projeto seguem o formato
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
e [Versionamento Semantico](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [1.1.3] - 2026-06-27

### Added
- **Suporte a Alto Contraste** (acessibilidade): quando o tema de alto contraste do Windows/Power BI esta ativo, o visual passa a usar as cores foreground/background do host (`host.colorPalette.isHighContrast`) com bordas/strokes visiveis em cartao, texto, badge de variancia, sparkline, barra de progresso e chips.
- `aria-label` no valor principal ("titulo: valor").
- Sparkline com **1 ponto** renderiza um ponto unico (degradacao graciosa).

### Notas (relatorio de auditoria)
- Itens "recomendados" anteriores ja estavam implementados (aria-label variancia, watermark dark-safe, ordenacao temporal, tabindex) — confirmado.
- NAO adotados por serem regressao/conflito: NaN->0 (mantem filtragem de nao-finitos, correto); telemetria via host (contradiz PRIVACY.md "sem telemetria"; erros ja tratados por try/catch + renderingFailed); auto-sobrescrita de cor do usuario (Alto Contraste e o mecanismo correto); downsampling (sparkline ja eficiente, path unico).

## [1.1.2] - 2026-06-27

### Added
- `aria-label` no badge de variância (direção + valor + rótulo).
- `tabindex="0"` nos chips de KPIs secundários (navegação por teclado).
- Ordenação automática da série temporal quando o eixo é Data/número (sparkline correta com dados fora de ordem); ordem de texto preservada.
- `README.en.md` (listing em inglês para o AppSource).

### Changed
- Watermark adaptável a temas claros/escuros (scrim neutro + pílula com contraste próprio) e `featureName` sanitizado.
- Teste de acessibilidade usa `role="group"` (reflete o comportamento real do root).

### Notas de certificação
- `style/visual.less` contém apenas CSS (verificado).
- `MONETIZATION_ENABLED = true` é definido **somente na branch `certification`**; `main` permanece `false` (dev).
- `PREMIUM_SERVICE_PLAN = "KPI_SPARK_CARD_PREMIUM"` deve coincidir exatamente com o plano cadastrado no Partner Center.

## [1.1.1] - 2026-06-27

### Added
- **i18n**: opção "Idioma dos números" (Auto = idioma do relatório / pt-BR / en-US); unidades e separadores por locale.
- **Responsividade**: gap menor no Compacto (< 120 px) e no Split (< 160 px).
- **Rodapé com fonte própria** (família/tamanho/N/I/S), independente do título.
- **Sparkline respeita densidade** (compacto menor, espaçoso maior).
- Documentação expandida no README (variância, sparkline, valores/rótulos, i18n, acessibilidade).

### Changed
- `pbiviz.json`: removida a duplicação do campo `version` (mantido só `visual.version`).
- `dataViewMapper`: cache de roles (uma passada) em vez de varrer colunas por consulta.
- `watermark`: remove overlay anterior antes de adicionar (evita duplicação).

## [1.1.0] - 2026-06-27

### Added
- Modelo de **valor estilo cartao nativo** em Valor Principal e KPIs Secundarios: fonte
  (familia/tamanho pt/N/I/S), cor (+fx), unidade (Auto/Nenhum/Mil/Milhao/Bilhao/**Trilhao**),
  casas decimais (Auto ou manual) e quebra de texto.
- Modelo de **rotulo** em Categoria, Titulo e rotulos dos Secundarios: caixa de texto
  personalizada (vazio = nome do campo/medida) com **fx** para medidas de texto DAX, fonte,
  cor (+fx), alinhamento e quebra de texto.
- KPIs Secundarios: fonte/cor/quebra compartilhadas; unidade/decimais/rotulo por KPI (1–4) —
  suporta tipos mistos (R$ + %) lendo o format de cada medida.
- Acessibilidade: root `role="group"`, progress bar `role="progressbar"` + `aria-value*`,
  chips com `aria-label` "Rotulo: Valor".
- 3 checklists (Certificacao, Acessibilidade, Monetizacao), `PRIVACY.md`, `DOCS/architecture.md`, `DOCS/testing.md`.

### Fixed
- `VarianceCalculator`: `comparison = 0` deixa de ser tratado como neutro (direcao pelo sinal).
- `ValueFormatter`: sinal negativo vem antes do prefixo (`-R$1,2K`).
- `ProgressBarRenderer`: meta = 0 mostra "Sem meta" (nao parece meta nao atingida).
- `SparklineBuilder`: `range = 0` em area desenha so a linha; min/max via loop (arrays grandes).
- `LicenseGuard.refreshLicense()` chamado no `update()`.

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
- Novo icone do visual: cartao com barra de destaque + valor + sparkline (estilo flat nativo), substituindo o placeholder.
- Controle de **transparencia (%)** (campo numerico com setas, 0=opaco / 100=transparente) para cada cor de fundo: cartao, badges de variancia (positivo/negativo/neutro), fundo da barra de meta e chips dos secundarios.
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
