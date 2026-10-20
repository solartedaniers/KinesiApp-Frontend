import "server-only";

import { cache } from "react";

import { systemGateway } from "../grpc/system-gateway";
import type { ClientPolicy } from "../types";

/** Límites y reglas vigentes del backend (consentimiento, video, contraseña, chat). Es pública. */
export const getClientPolicy = cache((): Promise<ClientPolicy> => systemGateway().clientPolicy());
