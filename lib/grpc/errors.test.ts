import assert from "node:assert/strict";
import test from "node:test";

import { BinaryWriter, WireType } from "@bufbuild/protobuf/wire";
import { Code, ConnectError } from "@connectrpc/connect";

import { rpcReason } from "./errors.ts";

function errorInfo(reason: string): Uint8Array {
  // Pongo domain antes que reason para comprobar que salto los campos que no me interesan
  return new BinaryWriter().tag(2, WireType.LengthDelimited).string("kinesiapp").tag(1, WireType.LengthDelimited).string(reason).finish();
}

test("rpcReason lee el motivo del ErrorInfo en minúsculas", () => {
  const error = new ConnectError("blocked", Code.PermissionDenied);
  error.details.push({ type: "google.rpc.ErrorInfo", value: errorInfo("EMAIL_NOT_VERIFIED") });
  assert.equal(rpcReason(error), "email_not_verified");
});

test("rpcReason cae al status code cuando no hay ErrorInfo", () => {
  assert.equal(rpcReason(new ConnectError("down", Code.Unavailable)), "network");
  assert.equal(rpcReason(new ConnectError("bad", Code.InvalidArgument)), "validation_error");
  assert.equal(rpcReason(new Error("boom")), "generic");
});
