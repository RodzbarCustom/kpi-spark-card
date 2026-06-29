# AppSource / Partner Center — material da oferta

Documento de apoio para publicar o **KPI Spark Card** como visual **pago (freemium)** no
Marketplace Comercial (Partner Center). Conta: `rodrigo@rodzbar.com.br` · Publisher **Rodzbar** (`rodzbar`).

- **GUID do visual** (lido do pacote): `kpiSparkCard77244AEC40844616B4ACFEE140540B9F`
- **ID do Plano** (digitar no Partner Center, idêntico ao código): `KPI_SPARK_CARD_PREMIUM`
- **Pacote a submeter:** build da branch `certification` (`MONETIZATION_ENABLED=true`).
- **URL de suporte:** https://github.com/RodzbarCustom/kpi-spark-card/issues
- **URL de privacidade:** https://github.com/RodzbarCustom/kpi-spark-card/blob/main/PRIVACY.md

---

## 1. Texto oficial da oferta

### 1.1. Português (pt-BR)

**Nome da oferta** (máx. ~50 caracteres)
```
KPI Spark Card
```

**Resumo / descrição curta** (aparece na busca, ~100 caracteres)
```
Cartão de KPI com sparkline, variância (MoM/YoY/meta) e barra de progresso, em 3 layouts elegantes.
```

**Descrição longa** (campo Descrição — aceita HTML básico)
```
O KPI Spark Card transforma um único indicador em um cartão executivo completo: o valor
principal, uma sparkline integrada para mostrar a tendência, a variância contra o período
anterior ou a meta, e uma barra de progresso — tudo em um visual leve e elegante.

Pensado para dashboards corporativos, oferece três layouts (Standard, Compacto e Split)
que se adaptam a qualquer grade de relatório, do cartão isolado a painéis com dezenas de KPIs.

PRINCIPAIS RECURSOS
• Valor principal com formatação herdada da medida (R$, %, moeda) ou manual, com prefixo,
  sufixo, unidades (mil/mi/bi/tri) e casas decimais.
• Sparkline integrada nos estilos Linha, Área, Barra e Step, com suavização opcional,
  linha de referência, linha de média e ponto final destacado.
• Variância automática (mês a mês, ano a ano ou contra a meta) com indicador configurável
  (triângulo, seta ou apenas sinal) e cores condicionais.
• Barra de progresso até a meta, com rótulo "Sem meta" quando não há alvo.
• Até 4 KPIs secundários, cada um com formato independente (ideal para misturar R$ e %).
• Três layouts responsivos e controle total de tipografia (em pt), cores e transparências,
  todos com formatação condicional (fx) por medidas DAX.
• Acessibilidade: suporte a Alto Contraste, rótulos ARIA e navegação por teclado.

PRIVACIDADE E SEGURANÇA
O visual não faz chamadas externas de rede, não coleta dados, não usa cookies nem
armazenamento local. Todo o processamento ocorre dentro do relatório. Compatível com os
requisitos de certificação da Microsoft.

VERSÃO GRATUITA E PREMIUM
A versão gratuita já entrega um cartão de KPI completo (valor, sparkline linha/área,
variância e barra de progresso). A licença Premium libera os layouts Split, as sparklines
Barra/Step, os KPIs secundários e as linhas de referência/média.
```

**Instruções de introdução** (campo "Getting started")
```
Adicione uma medida ao campo "Valor Principal" para começar. Para a tendência, conecte uma
medida ao "Spark/Série temporal". Variância e meta aparecem ao preencher "Comparação" e "Meta".
Personalize tudo no painel de formatação. Recursos Premium exigem licença (ative em
Arquivo > Opções, ou compre pelo botão da loja).
```

**Palavras-chave de busca** (até 3): `KPI`, `sparkline`, `card`

---

### 1.2. Inglês (en-US)

**Offer name**
```
KPI Spark Card
```

**Short summary**
```
KPI card with sparkline, variance (MoM/YoY/target) and progress bar, in three elegant layouts.
```

**Long description**
```
KPI Spark Card turns a single metric into a complete executive card: the main value, an
integrated sparkline for trend, the variance against the previous period or target, and a
progress bar — all in one lightweight, elegant visual.

Built for corporate dashboards, it offers three layouts (Standard, Compact and Split) that
fit any report grid, from a single card to panels with dozens of KPIs.

KEY FEATURES
• Main value with format inherited from the measure (currency, %) or manual, with prefix,
  suffix, display units (K/M/B/T) and decimals.
• Integrated sparkline in Line, Area, Bar and Step styles, with optional smoothing,
  reference line, mean line and highlighted end dot.
• Automatic variance (month-over-month, year-over-year or vs. target) with a configurable
  indicator (triangle, arrow or sign only) and conditional colors.
• Progress bar to target, with a "No target" label when none is set.
• Up to 4 secondary KPIs, each with independent formatting (great for mixing currency and %).
• Three responsive layouts and full control of typography (in pt), colors and transparency,
  all with conditional formatting (fx) driven by DAX measures.
• Accessibility: High Contrast support, ARIA labels and keyboard navigation.

PRIVACY & SECURITY
The visual makes no external network calls, collects no data, uses no cookies or local
storage. All processing happens inside the report. Compliant with Microsoft certification
requirements.

FREE & PREMIUM
The free version already delivers a complete KPI card (value, line/area sparkline, variance
and progress bar). The Premium license unlocks Split layout, Bar/Step sparklines, secondary
KPIs and reference/mean lines.
```

---

## 2. Guia de captura dos screenshots (1366 × 768)

> Requisito Microsoft: PNG de **1366×768 px exatos**, de 1 a 5 imagens, mostrando o visual
> em funcionamento. **Use o pacote `kpiSparkCard_SCREENSHOTS_v1.1.4_dev.pbiviz`** (build dev,
> sem marca d'água) — NÃO o pacote pago, que marca os recursos premium.

### 2.1. Preparar o Power BI Desktop
1. Abra o Power BI Desktop.
2. **Importar visual:** painel Visualizações → "..." → *Importar um visual de um arquivo* →
   selecione `kpiSparkCard_SCREENSHOTS_v1.1.4_dev.pbiviz`.
3. **Dados de exemplo:** Página Inicial → *Inserir dados*, cole a tabela abaixo e clique em
   Carregar:

   | Mes      | Valor | Anterior | Meta  |
   |----------|-------|----------|-------|
   | Jan      | 820   | 760      | 1000  |
   | Fev      | 910   | 800      | 1000  |
   | Mar      | 880   | 845      | 1000  |
   | Abr      | 1040  | 900      | 1000  |
   | Mai      | 1180  | 980      | 1000  |
   | Jun      | 1325  | 1120     | 1000  |

   Crie medidas rápidas se preferir (`SUM(Valor)` etc.), ou use as colunas direto.

### 2.2. Capturar no tamanho certo
Há duas formas — a primeira é a mais limpa:

**Opção A (recomendada) — captura crua + eu enquadro:**
1. Deixe o visual grande na tela e capture com **Win + Shift + S** (recorte retangular) ou a
   tela inteira com **PrtScn**.
2. Salve os PNGs e **me mande** — eu entrego cada um já em **1366×768** enquadrado e limpo.

**Opção B — você mesmo gera o 1366×768:**
1. Defina o tamanho da página: aba *Formato* → *Tamanho da tela* → *Personalizado* →
   Largura **1366**, Altura **768**.
2. Posicione o(s) visual(is) na página preenchendo bem o espaço.
3. Exporte a página (ou capture e recorte exatamente 1366×768 num editor; evite redimensionar,
   pois distorce).

### 2.3. O que mostrar em cada imagem (sugestão de 5)
1. **Standard (herói):** 1 cartão grande — valor + sparkline Linha + variância ▲ + barra de progresso.
2. **Split (premium):** info à esquerda, sparkline grande à direita preenchendo a altura.
3. **KPIs secundários (premium):** cartão com 4 chips secundários (misture R$ e %).
4. **Compacto em grade:** 4–6 cartões pequenos lado a lado (mostra densidade em dashboard).
5. **Sparkline Barra/Step + linhas de referência/média (premium):** destaca a riqueza visual.

Dica: ative *Geral → Fundo* claro e use a cor de destaque azul do visual para consistência
com o ícone.

---

## 3. Sugestão de preço

O licenciamento de visuais do Power BI é **por usuário** (assinatura), gerenciado pela
Microsoft (que retém uma comissão do marketplace). Você define preço e mercados.

### 3.1. Referência de mercado
- **Suítes completas** (Zebra BI, Inforiver, xViz): ~US$ 10–40/usuário/mês (vários visuais).
- **Visuais individuais pagos de publishers menores:** ~US$ 1–3/usuário/mês.

Como o KPI Spark Card é **um visual** (não uma suíte) e tem forte versão gratuita, o
posicionamento ideal é **entrada acessível** para maximizar adoção e converter pela
necessidade dos recursos premium (Split, secundários, barra/step).

### 3.2. Preço DEFINIDO
| Modelo | Preço | Observação |
|---|---|---|
| **Mensal por usuário** | **US$ 1,00/usuário/mês** | Entrada acessível para maximizar adoção |
| **Anual por usuário** | **US$ 12,00/usuário/ano** | Preço cheio (12 × US$ 1,00), **sem desconto** |

> Decisão do publisher (2026-06-28): US$ 1,00/mês e US$ 12,00/ano (anual cobrado integral, sem
> incentivo de desconto). Reposicionar depois conforme a tração — baixar preço é fácil, subir
> incomoda quem já comprou.

### 3.2.1. EULA
**Contrato Padrão da Microsoft** (Standard Contract) — selecionado no Partner Center, sem EULA
próprio. Nada a hospedar.

### 3.3. Mercados
Habilite ao menos: **Brasil, Estados Unidos, União Europeia, Reino Unido**. Quanto mais
mercados, maior o alcance; a Microsoft cuida de impostos/conversão. Defina o preço em USD
(base) e deixe a conversão automática, ou ajuste manualmente por mercado se quiser.
