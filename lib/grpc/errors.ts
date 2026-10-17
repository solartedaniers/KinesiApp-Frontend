import { Code, ConnectError } from "@connectrpc/connect";

export type RpcErrorKind = "unavailable" | "timeout" | "generic";

const KIND_BY_CODE: Partial<Record<Code, RpcErrorKind>> = {
  [Code.Unavailable]: "unavailable",
  [Code.DeadlineExceeded]: "timeout",
};

/** Único punto donde un status code de gRPC se convierte en el tipo de error que muestra la UI. */
export function rpcErrorKind(error: unknown): RpcErrorKind {
  return KIND_BY_CODE[ConnectError.from(error).code] ?? "generic";
}
