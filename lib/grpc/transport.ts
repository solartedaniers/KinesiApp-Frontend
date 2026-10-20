import "server-only";

import type { Interceptor, Transport } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-node";
import { cookies } from "next/headers";

import { SESSION_COOKIE } from "../config";
import { grpcEnv } from "./env";

let publicTransport: Transport | undefined;
let sessionTransport: Transport | undefined;

/** Pongo el access token de la cookie httpOnly en la metadata; el interceptor del backend lo verifica. */
const bearerFromSession: Interceptor = (next) => async (request) => {
  const token = (await cookies()).get(SESSION_COOKIE.access)?.value;
  if (token) request.header.set("authorization", `Bearer ${token}`);
  return next(request);
};

function createTransport(interceptors: Interceptor[]): Transport {
  const { GRPC_WEB_BASE_URL, GRPC_TIMEOUT_MS } = grpcEnv();
  // Uso gRPC-Web sobre HTTP/1.1 porque Render no acepta gRPC nativo desde internet
  return createGrpcWebTransport({
    baseUrl: GRPC_WEB_BASE_URL,
    httpVersion: "1.1",
    defaultTimeoutMs: GRPC_TIMEOUT_MS,
    interceptors,
  });
}

/** Sin credenciales: RPCs públicos y proxy.ts, donde todavía no hay cookies de la petición que leer. */
export function grpcTransport(): Transport {
  publicTransport ??= createTransport([]);
  return publicTransport;
}

/** Con la sesión de la petición en curso: Server Components y Server Actions. */
export function authedTransport(): Transport {
  sessionTransport ??= createTransport([bearerFromSession]);
  return sessionTransport;
}
