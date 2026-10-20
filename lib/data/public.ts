import "server-only";

import { cache } from "react";

import { systemGateway } from "../grpc/system-gateway";
import type { ClientPolicy } from "../types";

/** Límites y reglas vigentes del backend (consentimiento, video, contraseña, chat). Es pública. */
export const getClientPolicy = cache((): Promise<ClientPolicy> => systemGateway().clientPolicy());

/**
 * Para las páginas estáticas: si el backend no responde en el build (Render dormido), la página sale
 * igual con los límites del cliente y la siguiente regeneración trae los del servidor.
 */
export async function getClientPolicyOrNull(): Promise<ClientPolicy | null> {
  try {
    return await systemGateway().clientPolicy();
  } catch (error) {
    console.warn("GetClientPolicy failed while rendering a static page", error);
    return null;
  }
}
