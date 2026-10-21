import "server-only";

import { cache } from "react";

import { systemGateway } from "../grpc/system-gateway";
import type { ClientPolicy, RiskCuts } from "../types";

/** Límites y reglas vigentes del backend (consentimiento, video, contraseña, chat). Es pública. */
export const getClientPolicy = cache((): Promise<ClientPolicy> => systemGateway().clientPolicy());

/** Cortes de nivel de riesgo para lo que la app calcula por su cuenta: promedios, la peor repetición y medidores. */
export const getRiskCuts = async (): Promise<RiskCuts> => (await getClientPolicy()).risk_scale;

/**
 * Para las páginas estáticas: si el backend no responde en el build (Render dormido), la página sale
 * sin la sección de límites y la siguiente regeneración la completa.
 */
export async function getClientPolicyOrNull(): Promise<ClientPolicy | null> {
  try {
    return await systemGateway().clientPolicy();
  } catch (error) {
    console.warn("GetClientPolicy failed while rendering a static page", error);
    return null;
  }
}
