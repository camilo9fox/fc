/* eslint-disable no-restricted-globals */
// Service Worker para StudyAI — estrategia Cache-First para assets,
// Network-First para llamadas de API.

// CRA inyecta __WB_MANIFEST en el build — declararlo para evitar error TS
declare const __WB_MANIFEST: Array<{ url: string; revision: string | null }>;

import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  StaleWhileRevalidate,
  NetworkFirst,
  CacheFirst,
} from "workbox-strategies";

clientsClaim();

// Precachear todos los assets generados por CRA (inyectados por workbox en build)
precacheAndRoute(__WB_MANIFEST);

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

// API /api/flashcards GET — Network First con fallback a cache (permite repaso offline)
registerRoute(
  ({ url }) =>
    url.pathname.startsWith("/api/flashcards") &&
    location.origin === url.origin,
  new NetworkFirst({
    cacheName: "studyai-api-flashcards",
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 }),
    ],
  }),
);

// API /api/categories GET — Network First con fallback a cache
registerRoute(
  ({ url }) =>
    url.pathname.startsWith("/api/categories") &&
    location.origin === url.origin,
  new NetworkFirst({
    cacheName: "studyai-api-categories",
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 24 * 60 * 60 }),
    ],
  }),
);

// Escuchar mensaje SKIP_WAITING para activar nueva versión inmediatamente
(self as any).addEventListener("message", (event: MessageEvent) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    (self as any).skipWaiting();
  }
});
