// Error a mitad de un stream de gRPC-Web: el motivo viaja en el trailer, después de los mensajes. Correr con: npm test
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";

import { create, toBinary } from "@bufbuild/protobuf";
import { BinaryWriter, WireType } from "@bufbuild/protobuf/wire";
import { createClient } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-node";

import { SendMessageResponseSchema, ChatService } from "../gen/kinesiapp/chat/v1/chat_pb.ts";
import { Code, rpcReason } from "./errors.ts";

const errorInfo = (reason: string) => new BinaryWriter().tag(1, WireType.LengthDelimited).string(reason).tag(2, WireType.LengthDelimited).string("kinesiapp").finish();

/** google.rpc.Status con un ErrorInfo, armado a mano como lo manda grpcio. */
function statusBytes(code: Code, reason: string): Uint8Array {
  const detail = new BinaryWriter().tag(1, WireType.LengthDelimited).string("type.googleapis.com/google.rpc.ErrorInfo").tag(2, WireType.LengthDelimited).bytes(errorInfo(reason)).finish();
  return new BinaryWriter().tag(1, WireType.Varint).int32(code).tag(2, WireType.LengthDelimited).string("down").tag(3, WireType.LengthDelimited).bytes(detail).finish();
}

const frame = (flag: number, payload: Uint8Array) => {
  const head = Buffer.alloc(5);
  head.writeUInt8(flag, 0);
  head.writeUInt32BE(payload.length, 1);
  return Buffer.concat([head, payload]);
};

/** Servidor gRPC-Web falso: manda la pregunta guardada y después un trailer de error, como Envoy delante de grpcio. */
async function serve(trailer: string): Promise<{ server: Server; url: string }> {
  const server = createServer((_, res) => {
    res.writeHead(200, { "content-type": "application/grpc-web+proto" });
    const saved = toBinary(SendMessageResponseSchema, create(SendMessageResponseSchema, { event: { case: "textDelta", value: "Hola" } }));
    res.end(Buffer.concat([frame(0x00, saved), frame(0x80, Buffer.from(trailer))]));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { server, url: `http://127.0.0.1:${(server.address() as AddressInfo).port}` };
}

async function failureAfterFirstMessage(trailer: string): Promise<{ received: number; error: unknown }> {
  const { server, url } = await serve(trailer);
  const client = createClient(ChatService, createGrpcWebTransport({ baseUrl: url, httpVersion: "1.1" }));
  const received: unknown[] = [];
  try {
    for await (const response of client.sendMessage({ analysisId: "1", content: "¿Y el tronco?" })) received.push(response);
    return { received: received.length, error: null };
  } catch (error) {
    return { received: received.length, error };
  } finally {
    server.close();
  }
}

const details = Buffer.from(statusBytes(Code.Unavailable, "ASSISTANT_UNAVAILABLE"));

test("el motivo de un error a mitad del stream llega desde el trailer de gRPC-Web", async () => {
  const { received, error } = await failureAfterFirstMessage(`grpc-status:14\r\ngrpc-message:down\r\ngrpc-status-details-bin:${details.toString("base64")}\r\n`);
  assert.equal(received, 1);
  assert.equal(rpcReason(error), "ASSISTANT_UNAVAILABLE");
});

test("también con el base64 sin relleno que usa grpcio en los encabezados binarios", async () => {
  const unpadded = details.toString("base64").replace(/=+$/, "");
  const { error } = await failureAfterFirstMessage(`grpc-status:14\r\ngrpc-message:down\r\ngrpc-status-details-bin:${unpadded}\r\n`);
  assert.equal(rpcReason(error), "ASSISTANT_UNAVAILABLE");
});

test("la cuota agotada llega con su motivo y la interfaz tiene un mensaje para cada caso", async () => {
  const es = JSON.parse(readFileSync(new URL("../i18n/es.json", import.meta.url), "utf8"));
  for (const reason of ["ASSISTANT_BUSY", "ASSISTANT_DAILY_LIMIT"]) {
    const exhausted = Buffer.from(statusBytes(Code.ResourceExhausted, reason)).toString("base64");
    const { received, error } = await failureAfterFirstMessage(`grpc-status:8\r\ngrpc-message:quota\r\ngrpc-status-details-bin:${exhausted}\r\n`);
    assert.equal(received, 1);
    assert.equal(rpcReason(error), reason);
    assert.ok(es.errors[reason], `falta el texto de ${reason}`);
  }
});
