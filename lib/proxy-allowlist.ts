// Lecturas que un Client Component puede pedir por /api/proxy (§8 del diseño): lista blanca, no túnel.
const ALLOWED_READS: readonly RegExp[] = [
  /^jump-analyses\/\d+$/, // polling del estado de un análisis
  /^jump-analyses\/\d+\/video-access$/, // renovar la URL del video al vencer
];

export function isAllowedProxyRead(path: string): boolean {
  return ALLOWED_READS.some((pattern) => pattern.test(path));
}

/** URL del proxy para un endpoint de API_PATHS: proxyUrl(API_PATHS.analysis(7)) → "/api/proxy/jump-analyses/7". */
export function proxyUrl(apiPath: string): string {
  return `/api/proxy${apiPath}`;
}
