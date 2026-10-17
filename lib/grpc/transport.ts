import "server-only";

import type { Transport } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-node";

import { grpcEnv } from "./env";

let transport: Transport | undefined;

/**
 * Transporte gRPC-Web hacia Envoy, compartido por todos los clientes del servidor de Next.
 * Uso gRPC-Web sobre HTTP/1.1 porque Render no acepta gRPC nativo desde internet.
 */
export function grpcTransport(): Transport {
  if (!transport) {
    const { GRPC_WEB_BASE_URL, GRPC_TIMEOUT_MS } = grpcEnv();
    transport = createGrpcWebTransport({
      baseUrl: GRPC_WEB_BASE_URL,
      httpVersion: "1.1",
      defaultTimeoutMs: GRPC_TIMEOUT_MS,
    });
  }
  return transport;
}
