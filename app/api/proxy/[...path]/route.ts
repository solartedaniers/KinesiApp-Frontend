import { NextResponse, type NextRequest } from "next/server";

import { apiRequest } from "@/lib/api";
import { ApiError } from "@/lib/errors";
import { isAllowedProxyRead } from "@/lib/proxy-allowlist";
import { readAccessToken } from "@/lib/session";

const NO_STORE = { "Cache-Control": "private, no-store" };

/**
 * Lecturas desde Client Components (polling, renovar la URL del video): agrega el Bearer desde la
 * cookie httpOnly, así el navegador nunca ve el token. proxy.ts ya renovó el access si hacía falta.
 */
export async function GET(_request: NextRequest, { params }: RouteContext<"/api/proxy/[...path]">) {
  const path = (await params).path.join("/");
  if (!isAllowedProxyRead(path)) return new NextResponse(null, { status: 404, headers: NO_STORE });

  try {
    const data = await apiRequest<unknown>(`/${path}`, { accessToken: (await readAccessToken()) ?? undefined });
    return NextResponse.json(data, { headers: NO_STORE });
  } catch (error) {
    const status = error instanceof ApiError && error.status > 0 ? error.status : 502;
    const code = error instanceof ApiError ? error.code : "generic";
    return NextResponse.json({ code }, { status, headers: NO_STORE });
  }
}
