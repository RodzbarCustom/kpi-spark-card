// LicenseGuard.ts
// Controle de features free vs. premium via Microsoft Licensing API (nativa do host).
// NENHUMA chamada de rede externa — a validacao e resolvida pelo host.

import powerbi from "powerbi-visuals-api";
import IVisualHost = powerbi.extensibility.visual.IVisualHost;

// ===============================
// MONETIZACAO — ALTERAR SOMENTE NA CERTIFICACAO
// ===============================
const MONETIZATION_ENABLED = false; // TODO[certificacao]: alterar para true

const PREMIUM_SERVICE_PLAN = "KPI_SPARK_CARD_PREMIUM";
const SERVICE_PLAN_STATE_ACTIVE = 1; // powerbi.extensibility.ServicePlanState.Active

export class LicenseGuard {
    private readonly host: IVisualHost;
    private cachedStatus: boolean | null = null;

    constructor(host: IVisualHost) {
        this.host = host;
    }

    /** Sincrono: usado pelos renderers. Em dev (MONETIZATION_ENABLED=false) retorna sempre true. */
    public isPremium(): boolean {
        /* istanbul ignore if: bloco de producao, ativado so na certificacao */
        if (MONETIZATION_ENABLED) {
            return this.cachedStatus ?? false;
        }
        return true; // modo desenvolvimento: tudo liberado
    }

    /**
     * Consulta assincrona a Licensing API. Chamar no update() quando a monetizacao
     * estiver ativa; o resultado fica em cache para isPremium().
     */
    public async refreshLicense(): Promise<void> {
        /* istanbul ignore if: bloco de producao, ativado so na certificacao */
        if (MONETIZATION_ENABLED) {
            const licenseManager = this.host.licenseManager;
            if (!licenseManager) {
                this.cachedStatus = false;
                return;
            }
            try {
                const result = await licenseManager.getAvailableServicePlans();
                if (result.isLicenseUnsupportedEnv) {
                    // Ambiente sem suporte a licenca: nao bloquear (exigencia MS).
                    this.cachedStatus = true;
                    return;
                }
                const plans = result.plans ?? [];
                this.cachedStatus = plans.some(
                    (plan) =>
                        plan.spIdentifier === PREMIUM_SERVICE_PLAN &&
                        Number(plan.state) === SERVICE_PLAN_STATE_ACTIVE
                );
            } catch {
                this.cachedStatus = false;
            }
            return;
        }
        this.cachedStatus = true; // modo desenvolvimento
    }

    public invalidateCache(): void {
        this.cachedStatus = null;
    }
}
