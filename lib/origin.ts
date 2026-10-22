import type { NextRequest } from "next/server";

/** CSRF en Route Handlers que mutan: el POST debe venir de una página de esta misma app. */
export function isSameOrigin(request: NextRequest): boolean {
  return request.headers.get("origin") === request.nextUrl.origin;
}
