import "server-only";

import { timestampDate } from "@bufbuild/protobuf/wkt";
import { type Client, createClient } from "@connectrpc/connect";

import { SystemService } from "@/lib/gen/kinesiapp/system/v1/system_pb";

import { grpcTransport } from "./transport";

export type PingResult = { message: string; serverTime: Date | null; roundTripMs: number };

/** Adaptador de kinesiapp.system.v1.SystemService: el resto de la app no ve tipos de Protobuf. */
export class SystemGateway {
  constructor(private readonly client: Client<typeof SystemService>) {}

  async ping(message: string): Promise<PingResult> {
    const startedAt = performance.now();
    const response = await this.client.ping({ message });
    return {
      message: response.message,
      serverTime: response.serverTime ? timestampDate(response.serverTime) : null,
      roundTripMs: Math.round(performance.now() - startedAt),
    };
  }
}

export function systemGateway(): SystemGateway {
  return new SystemGateway(createClient(SystemService, grpcTransport()));
}
