# Política de Privacidade — KPI Spark Card

O **KPI Spark Card** é um visual personalizado para Power BI que processa exclusivamente
os dados fornecidos pelo relatório, dentro do ambiente do host (Power BI Desktop / Service).

## Coleta de dados
- O visual **não coleta**, armazena ou transmite dados pessoais ou de negócio.
- Não há uso de `localStorage`, `sessionStorage`, `IndexedDB` ou cookies.

## Comunicação externa
- O visual **não faz** chamadas de rede (`fetch`, `XMLHttpRequest`, WebSocket, etc.).
- Toda a renderização é local, a partir do `DataView` fornecido pelo host.

## APIs utilizadas
- Apenas APIs nativas do host Power BI:
  - `IVisualHost` (renderização, eventos).
  - `IVisualEventService` (rendering started/finished/failed).
  - `licenseManager.getAvailableServicePlans()` — verificação de licença (IAP), resolvida
    inteiramente pelo host, **sem** comunicação externa do visual.

## Telemetria
- O visual não implementa telemetria própria.

## Contato
- Suporte: https://github.com/RodzbarCustom/kpi-spark-card/issues
