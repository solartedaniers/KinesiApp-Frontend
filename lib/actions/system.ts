"use server";

import { unstable_rethrow } from "next/navigation";

import type { AiWakeOutcome } from "../ai-status/protocol";
import { grpcEnv } from "../grpc/env";
import { systemGateway } from "../grpc/system-gateway";

/**
 * Despierta la IA con WakeUpAi. Si no responde (o no hay sesión), el backend devuelve un error y aquí
 * queda como "unavailable": la UI lo muestra sin romperse.
 */
export async function wakeUpAi(): Promise<AiWakeOutcome> {
  try {
    return await systemGateway().wakeUpAi(grpcEnv().AI_WAKE_UP_TIMEOUT_MS);
  } catch (error) {
    unstable_rethrow(error);
    return "unavailable";
  }
}
