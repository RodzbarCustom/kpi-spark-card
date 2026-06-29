# Guia de submissão — Partner Center (passo a passo)

Visual **KPI Spark Card**, oferta **paga (freemium)**. Conta: `rodrigo@rodzbar.com.br` ·
Publisher **Rodzbar** (`rodzbar`) · programa **Marketplace Comercial**.
Portal: https://partner.microsoft.com/dashboard/commercial-marketplace/overview

## Valores prontos (copiar/colar)
| Campo | Valor |
|---|---|
| Tipo de oferta | **Visual do Power BI** |
| ID da oferta (imutável) | `kpi-spark-card` |
| Alias da oferta | `KPI Spark Card` |
| GUID (lido do pacote) | `kpiSparkCard77244AEC40844616B4ACFEE140540B9F` |
| **ID do Plano** (digitar igual!) | `kpi_spark_card_premium` |
| Preço mensal | **US$ 1,00** / usuário / mês |
| Preço anual | **US$ 12,00** / usuário / ano (cheio) |
| Pacote a subir | `Desktop\kpiSparkCard_PAGO_v1.1.5_PartnerCenter.pbiviz` |
| Screenshots (1366×768) | `marketing/screenshots/screenshot{1,2,3}_*.png` |
| Logo (listagem) | `marketing/thumbnail.png` (300×300) — reservas: logo_216/150/48 |
| URL de suporte | https://github.com/RodzbarCustom/kpi-spark-card/issues |
| URL de privacidade | https://github.com/RodzbarCustom/kpi-spark-card/blob/main/PRIVACY.md |
| EULA | **Contrato Padrão da Microsoft** |
| Textos (nome/resumo/descrição) | ver `marketing/APPSOURCE.md` §1 |

---

## FASE 0 — Pré-requisitos de conta (OBRIGATÓRIO p/ oferta paga)
> Sem isto a oferta **paga** não fica disponível, mesmo publicada.
1. Partner Center → **Configurações da conta** → **Perfil de pagamento (Payout)**: preencher
   dados bancários (conta que recebe os repasses).
2. **Perfil fiscal (Tax)**: preencher o formulário de impostos (W-8/declaração).
3. Aguardar os dois ficarem com status **Concluído/Active**. (Pode levar alguns dias.)

## FASE 1 — Criar a oferta
1. Marketplace Comercial → **Visão geral** → **+ Nova oferta** → **Visual do Power BI**.
2. **ID da oferta:** `kpi-spark-card` · **Alias:** `KPI Spark Card` → **Criar**.

## FASE 2 — Configuração da oferta
1. Em "Como você quer vender": escolha **Sim** para vender pela Microsoft / licenciamento
   gerenciado pela Microsoft (habilita o licenciamento por plano).
2. Conexão de leads (CRM): opcional — pode deixar em branco.
3. Salvar rascunho.

## FASE 3 — Propriedades
1. **Categorias:** Análise / Visualização de dados (selecione 1–2).
2. **Termos legais:** marcar **Contrato Padrão (Standard Contract)**.
3. Salvar rascunho.

## FASE 4 — Listagem da oferta (idioma pt-BR; repita em en-US se desejar)
1. **Nome:** `KPI Spark Card`
2. **Resumo/descrição curta** e **Descrição:** colar de `marketing/APPSOURCE.md` §1.1 (e §1.2 p/ inglês).
3. **Instruções de introdução:** §1.1 (campo "Getting started").
4. **Links:**
   - Suporte: `https://github.com/RodzbarCustom/kpi-spark-card/issues`
   - Privacidade: `https://github.com/RodzbarCustom/kpi-spark-card/blob/main/PRIVACY.md`
5. **Contato:** seu nome + `rodrigo@rodzbar.com.br`.
6. **Mídia:**
   - **Logo:** `marketing/thumbnail.png` (300×300). Se pedir outro tamanho, use `logo_216.png`.
   - **Capturas de tela (1366×768):** subir nesta ordem →
     `screenshot1_overview.png` (capa), `screenshot2_financeiro.png`, `screenshot3_clientes.png`.
   - Vídeo: opcional.
7. Salvar rascunho.

## FASE 5 — Disponibilidade / público de versão prévia
1. **Público de versão prévia (Preview):** adicione seu próprio e-mail / um tenant de teste
   (necessário para validar antes de publicar ao público).
2. Salvar rascunho.

## FASE 6 — Planos e preços  ⚠️ (o "código" que tem que bater)
1. **+ Criar novo plano.**
2. **ID do plano:** `kpi_spark_card_premium`  ← **idêntico** ao código (sensível a maiúsculas/sublinhado).
3. **Nome do plano:** `KPI Spark Card Premium`.
4. **Modelo de preços:** por usuário (assinatura).
5. **Preços:**
   - Mensal: **US$ 1,00** / usuário / mês.
   - Anual: **US$ 12,00** / usuário / ano.
6. **Mercados:** habilitar (mín.) Brasil, Estados Unidos, União Europeia, Reino Unido —
   ou "Selecionar todos" para alcance máximo.
7. Salvar.

## FASE 7 — Configuração técnica (pacote)
1. Subir o **pacote da branch certification**: `Desktop\kpiSparkCard_PAGO_v1.1.5_PartnerCenter.pbiviz`.
   (NÃO o `_SCREENSHOTS_dev`.)
2. O portal lê o **GUID** e a **versão (1.1.5.0)** automaticamente.
3. Salvar.

## FASE 8 — Revisar e publicar
1. Botão **Revisar e publicar**.
2. Corrigir qualquer item sinalizado (campos faltando, tamanho de imagem, etc.).
3. **Publicar** → a oferta entra em validação automática + revisão da Microsoft.

## FASE 9 — Depois de publicar
- A Microsoft valida o pacote e a listagem (pode levar de dias a ~2 semanas).
- Sai primeiro em **Preview** (só seu público de versão prévia vê) → você aprova → vai ao público.
- **Selo "Certificado"** (export PDF/PowerPoint, e-mail) é um pedido **separado e opcional**,
  com revisão de código mais rígida; a venda NÃO depende dele.

---

### Checklist relâmpago
- [ ] Payout + Tax concluídos (Fase 0)
- [ ] Oferta criada (`kpi-spark-card`)
- [ ] Vender pela Microsoft = Sim
- [ ] Contrato Padrão marcado
- [ ] Textos colados (pt-BR)
- [ ] 3 screenshots + logo enviados
- [ ] Preview audience definido
- [ ] Plano `kpi_spark_card_premium` · US$ 1,00/mês · US$ 12,00/ano · mercados
- [ ] Pacote `_PAGO_v1.1.5` enviado
- [ ] Revisar e publicar
