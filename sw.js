/* Service worker: guarda la app en el móvil para que funcione sin conexión.
   Para publicar una versión nueva, cambia el número de CACHE (p. ej. v2). */
const CACHE = "carga-coche-v16";
const ASSETS = [
  "./", "index.html", "styles.css", "app.js", "manifest.webmanifest",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png",
  "fonts/inter-latin-400-normal.woff2", "fonts/inter-latin-500-normal.woff2", "fonts/inter-latin-600-normal.woff2",
  "fonts/space-grotesk-latin-500-normal.woff2", "fonts/space-grotesk-latin-600-normal.woff2", "fonts/space-grotesk-latin-700-normal.woff2"
];

self.addEventListener("install", (e) => {
  /* cache: "reload" evita copiar archivos viejos de la cache HTTP del navegador (GitHub Pages los guarda unos 10 min) */
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(ASSETS.map((a) => fetch(new Request(a, { cache: "reload" })).then((r) => { if (!r.ok) throw new Error(a); return c.put(a, r); }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Responde desde el móvil al instante y, si hay conexión, actualiza la copia para la próxima vez. */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      const net = fetch(req.url, { cache: "no-cache" })
        .then((res) => {
          if (res && res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => null);
      if (hit) return hit;
      return net.then((res) => res || (req.mode === "navigate" ? caches.match("index.html") : Response.error()));
    })
  );
});
