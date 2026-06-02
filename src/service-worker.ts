/* eslint-disable no-restricted-globals, import/first, @typescript-eslint/no-unused-vars */
// Service Worker para Flashy

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

precacheAndRoute((self as any).__WB_MANIFEST);
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

registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "Flashy-images",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
);

registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new StaleWhileRevalidate({ cacheName: "Flashy-fonts" }),
);

registerRoute(
  ({ request, url }) =>
    request.method === "GET" &&
    url.origin === apiOrigin &&
    url.pathname.startsWith(`${apiPathPrefix}/`) &&
    !url.pathname.startsWith(`${apiPathPrefix}/auth/`),
  new NetworkFirst({
    cacheName: "Flashy-api-runtime",
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 24 * 60 * 60 }),
    ],
  }),
);

self.addEventListener("message", (event: MessageEvent) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    (self as any).skipWaiting();
  }
});
