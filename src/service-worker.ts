/* eslint-disable no-restricted-globals */
// Service Worker para StudyAI — estrategia Cache-First para assets,
// Network-First para llamadas de API.

// CRA inyecta __WB_MANIFEST en el build — declararlo para evitar error TS
declare const __WB_MANIFEST: Array<{ url: string; revision: string | null }>;

import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import {
  precacheAndRoute,
  createHandlerBoundToURL,
  cleanupOutdatedCaches,
} from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  StaleWhileRevalidate,
  NetworkFirst,
  CacheFirst,
} from "workbox-strategies";

clientsClaim();

// Precachear todos los assets generados por CRA (inyectados por workbox en build)
precacheAndRoute(__WB_MANIFEST);
cleanupOutdatedCaches();

const resolvedApiBase =
  process.env.REACT_APP_API_URL || `${self.location.origin}/api`;

let apiOrigin = self.location.origin;
let apiPathPrefix = "/api";

try {
  const parsedApiBase = new URL(resolvedApiBase, self.location.origin);
  apiOrigin = parsedApiBase.origin;
  apiPathPrefix = parsedApiBase.pathname.replace(/\/$/, "") || "/api";
} catch {
  apiOrigin = self.location.origin;
  apiPathPrefix = "/api";
}

// SPA fallback — cualquier GET que no sea API devuelve index.html
const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
registerRoute(
  ({ request, url }) => {
    if (request.mode !== "navigate") return false;
    if (url.pathname.startsWith("/_")) return false;
    if (url.pathname.match(fileExtensionRegexp)) return false;
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + "/index.html"),
);

// Imágenes — Cache First (30 días)
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "studyai-images",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
);

// Google Fonts / fuentes externas — Stale While Revalidate
registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new StaleWhileRevalidate({ cacheName: "studyai-fonts" }),
);

// API GET (excepto auth) — Network First con fallback a cache.
// Soporta backend en mismo origen o REACT_APP_API_URL distinto.
registerRoute(
  ({ request, url }) =>
    request.method === "GET" &&
    url.origin === apiOrigin &&
    url.pathname.startsWith(`${apiPathPrefix}/`) &&
    !url.pathname.startsWith(`${apiPathPrefix}/auth/`),
  new NetworkFirst({
    cacheName: "studyai-api-runtime",
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 24 * 60 * 60 }),
    ],
  }),
);

// Escuchar mensaje SKIP_WAITING para activar nueva versión inmediatamente
(self as any).addEventListener("message", (event: MessageEvent) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    (self as any).skipWaiting();
  }
});
