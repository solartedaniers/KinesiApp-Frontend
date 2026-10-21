import { Code, ConnectError } from "@connectrpc/connect";
import { BinaryReader } from "@bufbuild/protobuf/wire";

import { ErrorReason } from "../gen/kinesiapp/common/v1/errors_pb.ts";

export { Code, ErrorReason };

export type RpcErrorKind = "unavailable" | "timeout" | "generic";

const KIND_BY_CODE: Partial<Record<Code, RpcErrorKind>> = {
  [Code.Unavailable]: "unavailable",
  [Code.DeadlineExceeded]: "timeout",
};

const ERROR_INFO_TYPE = "google.rpc.ErrorInfo";
const ERROR_INFO_REASON_FIELD = 1;

// Motivo que uso cuando el backend no manda ErrorInfo: depende solo del status code
const FALLBACK_REASON_BY_CODE: Partial<Record<Code, string>> = {
  [Code.Unavailable]: "NETWORK",
  [Code.DeadlineExceeded]: "NETWORK",
  [Code.InvalidArgument]: "BAD_REQUEST",
  [Code.Unauthenticated]: "UNAUTHORIZED",
  [Code.PermissionDenied]: "FORBIDDEN",
  [Code.NotFound]: "NOT_FOUND",
};

/** Único punto donde un status code de gRPC se convierte en el tipo de error que muestra la UI. */
export function rpcErrorKind(error: unknown): RpcErrorKind {
  return KIND_BY_CODE[ConnectError.from(error).code] ?? "generic";
}

export function rpcCode(error: unknown): Code {
  return ConnectError.from(error).code;
}

/**
 * Motivo estable del error tal como llega en ErrorInfo ("EMAIL_NOT_VERIFIED"), que es la clave de errors en i18n.
 * Lo saco del google.rpc.ErrorInfo de los detalles; sin él, del status code.
 */
export function rpcReason(error: unknown): string {
  const connectError = ConnectError.from(error);
  for (const detail of connectError.details) {
    if ("type" in detail && detail.type === ERROR_INFO_TYPE) {
      const reason = errorInfoReason(detail.value);
      if (reason) return reason;
    }
  }
  return FALLBACK_REASON_BY_CODE[connectError.code] ?? "GENERIC";
}

/** ¿El error trae este motivo? Comparo contra el enum del contrato, nunca contra un string suelto. */
export function hasReason(error: unknown, reason: ErrorReason): boolean {
  return rpcReason(error) === ErrorReason[reason];
}

// Leo solo el campo reason a mano: no vale la pena generar todo googleapis para un string
function errorInfoReason(bytes: Uint8Array): string | undefined {
  const reader = new BinaryReader(bytes);
  while (reader.pos < reader.len) {
    const [field, wireType] = reader.tag();
    if (field === ERROR_INFO_REASON_FIELD) return reader.string();
    reader.skip(wireType);
  }
  return undefined;
}
