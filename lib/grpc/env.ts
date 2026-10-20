import "server-only";

import { z } from "zod";

const grpcEnvSchema = z.object({
  GRPC_WEB_BASE_URL: z.url({ protocol: /^https?$/ }).transform((url) => url.replace(/\/$/, "")),
  // Le doy margen al plan free de Render, que tarda en despertar el contenedor
  GRPC_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  // Los streams (progreso del análisis y chat) viven más que una llamada simple: con la IA fría el análisis
  // tarda ~70 s. Debe quedar por debajo del maxDuration de las funciones de Vercel
  GRPC_STREAM_TIMEOUT_MS: z.coerce.number().int().positive().default(240_000),
  // WakeUpAi con la réplica de Azure en cero tarda ~35 s
  AI_WAKE_UP_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
});

export type GrpcEnv = z.infer<typeof grpcEnvSchema>;

let cached: GrpcEnv | undefined;

/** Variables del cliente gRPC-Web, validadas la primera vez que se piden. */
export function grpcEnv(): GrpcEnv {
  cached ??= grpcEnvSchema.parse(process.env);
  return cached;
}
