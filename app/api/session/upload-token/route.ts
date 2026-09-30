// Fase 4: access token vigente sólo para el XHR de subida, verifica Origin (§5.4). Ver docs/design/web-frontend-architecture.md.
export function GET() {
  return new Response(null, { status: 404 });
}
