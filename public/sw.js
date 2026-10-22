// Service Worker: caché de estáticos y una experiencia offline básica. Nunca guardo HTML con sesión,
// Server Actions, payloads RSC ni /api: solo lo que es igual para todos.
const VERSION = "v1";
const STATIC_CACHE = `kin-static-${VERSION}`;
const PAGES_CACHE = `kin-pages-${VERSION}`;
// Tope de archivos estáticos: cada despliegue trae nombres con hash nuevos y los viejos se acumulan
const STATIC_LIMIT = 150;

const OFFLINE_PAGES = { es: "/offline", en: "/en/offline" };
// Páginas públicas prerenderizadas (SSG/ISR): se pueden leer sin conexión si ya se visitaron
const PUBLIC_PAGE = /^\/(en\/?)?$|^\/(en\/)?guide\/(jump|squat)$/;

self.addEventListener("install", (event) => {
  event.waitUntil(precacheOfflinePages());
  self.skipWaiting();
});

// Guardo también los estáticos que la página offline referencia: sin su JS, la hidratación falla y Next
// muestra su pantalla de error. Van en la caché de páginas para que el recorte de estáticos no los saque.
async function precacheOfflinePages() {
  const cache = await caches.open(PAGES_CACHE);
  await cache.addAll([...Object.values(OFFLINE_PAGES), "/icon.svg"]);
  const assets = new Set();
  for (const page of Object.values(OFFLINE_PAGES)) {
    const html = await (await cache.match(page)).text();
    for (const [, path] of html.matchAll(/"(\/_next\/static\/[^"\\]+)/g)) assets.add(path);
  }
  await cache.addAll([...assets]);
}

self.addEventListener("activate", (event) => {
  const current = new Set([STATIC_CACHE, PAGES_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("kin-") && !current.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  // Navegaciones del router (RSC) y prefetch: los maneja Next, que reintenta cuando vuelve la red
  if (request.headers.get("RSC") || url.searchParams.has("_rsc") || url.pathname.startsWith("/api/")) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
  } else if (request.mode === "navigate") {
    event.respondWith(PUBLIC_PAGE.test(url.pathname) ? staleWhileRevalidate(request) : networkOrOffline(request, url));
  }
});

// Los estáticos llevan hash en el nombre: si están en caché, son los correctos
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    await cache.put(request, response.clone());
    trim(cache);
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(PAGES_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok && !response.redirected) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached ?? offlinePage(new URL(request.url)));
  return cached ?? network;
}

// Las páginas con sesión van siempre a la red; sin conexión muestro la página offline en su idioma
async function networkOrOffline(request, url) {
  try {
    return await fetch(request);
  } catch {
    return offlinePage(url);
  }
}

async function offlinePage(url) {
  const page = url.pathname === "/en" || url.pathname.startsWith("/en/") ? OFFLINE_PAGES.en : OFFLINE_PAGES.es;
  return (await caches.match(page)) ?? Response.error();
}

async function trim(cache) {
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - STATIC_LIMIT)).map((key) => cache.delete(key)));
}
