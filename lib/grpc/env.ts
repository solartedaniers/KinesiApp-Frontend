import "server-only";

import { z } from "zod";

const grpcEnvSchema = z.object({
  GRPC_WEB_BASE_URL: z.url({ protocol: /^https?$/ }).transform((url) => url.replace(/\/$/, "")),
  // Render dormido retiene la primera petición mientras arranca el contenedor (30 a 60 s): con este plazo la
  // espera completa en vez de cortarla. No reintento un corte por tiempo porque la petición pudo procesarse
  GRPC_TIMEOUT_MS: z.coerce.number().int().positive().default(75_000),
  // Los streams (progreso del análisis y chat) viven más que una llamada simple: con la IA fría el análisis
  // tarda ~70 s. Debe quedar por debajo del maxDuration de las funciones de Vercel
  GRPC_STREAM_TIMEOUT_MS: z.coerce.number().int().positive().default(240_000),
  // WakeUpAi con la réplica de Azure en cero tarda ~35 s
  AI_WAKE_UP_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),
  // A veces Render dormido responde 503 en vez de retener la petición: reintento con espera creciente hasta
  // este tope total. Con un último intento de GRPC_TIMEOUT_MS queda bajo el maxDuration de Vercel (300 s)
  GRPC_COLD_START_FIRST_DELAY_MS: z.coerce.number().int().positive().default(1_000),
  GRPC_COLD_START_MAX_DELAY_MS: z.coerce.number().int().positive().default(15_000),
  GRPC_COLD_START_MAX_WAIT_MS: z.coerce.number().int().positive().default(90_000),
  // El ping que despierta a Render cuando la persona empieza a escribir no espera la respuesta: las Server
  // Actions van de a una por cliente y un ping largo retrasaría el envío del formulario
  GRPC_WAKE_PING_TIMEOUT_MS: z.coerce.number().int().positive().default(3_000),
});

export type GrpcEnv = z.infer<typeof grpcEnvSchema>;

let cached: GrpcEnv | undefined;

/** Variables del cliente gRPC-Web, validadas la primera vez que se piden. */
export function grpcEnv(): GrpcEnv {
  cached ??= grpcEnvSchema.parse(process.env);
  return cached;
}
