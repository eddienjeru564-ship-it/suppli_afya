/**
 * The service worker, written as one self-contained function so it can be
 * type-checked here and served (with the deploy's version) from /sw.js.
 * It must not reference anything outside itself.
 *
 * Strategy
 * - Built JS/CSS (/_next/static, content-hashed): cache first, kept forever.
 * - Icons, launch images, fonts: stale while revalidate.
 * - Portal pages: network first. The last good copy of each is kept on this
 *   phone, so the app still opens without signal. Copies are dropped the moment
 *   the server says you're signed out, and on log out.
 * - Everything else (data requests, saves, API, other pages): straight to the
 *   network. Next.js retries saves itself when the connection returns.
 */

export interface WorkerConfig {
  version: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function serviceWorker(config: WorkerConfig) {
  const sw = self as any;
  const STATIC = `sa-static-${config.version}`;
  const ASSETS = "sa-assets-v1";
  const PAGES = "sa-pages-v1";
  const OFFLINE = "/offline";
  const PRECACHE = [OFFLINE, "/icons/icon-192.png", "/icons/badge-96.png"];
  const MAX_PAGES = 40;
  const NETWORK_TIMEOUT = 6000;

  // Pages served from the saved copy, so the page can say so. url → saved at.
  const servedFromCache = new Map<string, string>();

  sw.addEventListener("install", (event: any) => {
    event.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)));
    // Don't take over from an older version on our own: the page asks first,
    // so nobody loses what they're typing. A first install has nothing to replace.
  });

  sw.addEventListener("activate", (event: any) => {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter((k) => k.startsWith("sa-static-") && k !== STATIC).map((k) => caches.delete(k)));
        if (sw.registration.navigationPreload) await sw.registration.navigationPreload.enable();
        await sw.clients.claim();
      })(),
    );
  });

  sw.addEventListener("message", (event: any) => {
    const msg = event.data || {};
    if (msg.type === "SKIP_WAITING") sw.skipWaiting();
    if (msg.type === "CLEAR_PRIVATE") event.waitUntil(caches.delete(PAGES));
    if (msg.type === "WARM" && Array.isArray(msg.urls)) event.waitUntil(warm(msg.urls));
    if (msg.type === "WAS_CACHED" && event.source) {
      const savedAt = servedFromCache.get(msg.url) ?? null;
      servedFromCache.delete(msg.url);
      event.source.postMessage({ type: "CACHED_COPY", url: msg.url, savedAt });
    }
  });

  const isPortal = (url: URL) => url.pathname === "/portal" || url.pathname.startsWith("/portal/");
  const signedOut = (res: Response) => res.redirected && new URL(res.url).pathname.startsWith("/login");

  async function savePage(req: Request | string, res: Response) {
    const cache = await caches.open(PAGES);
    await cache.put(req, res);
    const keys = await cache.keys();
    for (const k of keys.slice(0, Math.max(0, keys.length - MAX_PAGES))) await cache.delete(k);
  }

  /** Keep fresh copies of the main portal pages, so they open offline even if not visited today. */
  async function warm(urls: string[]) {
    for (const u of urls) {
      try {
        const res = await fetch(u, { credentials: "same-origin", headers: { Accept: "text/html" } });
        if (signedOut(res)) return caches.delete(PAGES);
        if (res.ok && !res.redirected) await savePage(u, res);
      } catch {
        return;
      }
    }
  }

  async function navigation(event: any) {
    const req: Request = event.request;
    const url = new URL(req.url);
    const portal = isPortal(url);
    const network = (async () => {
      const preload = await event.preloadResponse;
      return preload || fetch(req);
    })();

    if (!portal) {
      try {
        return await network;
      } catch {
        return (await caches.match(OFFLINE)) || Response.error();
      }
    }

    const cache = await caches.open(PAGES);
    const saved = await cache.match(req, { ignoreSearch: true });
    const fromCache = (r: Response) => {
      servedFromCache.set(req.url, r.headers.get("date") || "");
      return r;
    };

    const fresh = network.then(async (res: Response) => {
      if (signedOut(res)) await caches.delete(PAGES);
      else if (res.ok && res.type === "basic") await savePage(req, res.clone());
      return res;
    });
    // Keep the fetch alive even if we answer from the saved copy first.
    event.waitUntil(fresh.catch(() => undefined));

    if (!saved) {
      try {
        return await fresh;
      } catch {
        return (await caches.match(OFFLINE)) || Response.error();
      }
    }
    // With a saved copy, don't leave someone staring at a blank screen on a weak signal.
    const timeout = new Promise<Response>((resolve) => setTimeout(() => resolve(fromCache(saved.clone())), NETWORK_TIMEOUT));
    try {
      return await Promise.race([fresh, timeout]);
    } catch {
      return fromCache(saved);
    }
  }

  async function cacheFirst(req: Request) {
    const cache = await caches.open(ASSETS);
    const hit = await cache.match(req);
    if (hit) return hit;
    const res = await fetch(req);
    if (res.ok) await cache.put(req, res.clone());
    return res;
  }

  async function staleWhileRevalidate(event: any) {
    const cache = await caches.open(ASSETS);
    const hit = await cache.match(event.request);
    const update = fetch(event.request)
      .then(async (res) => {
        if (res.ok) await cache.put(event.request, res.clone());
        return res;
      })
      .catch(() => hit || Response.error());
    if (hit) {
      event.waitUntil(update);
      return hit;
    }
    return update;
  }

  sw.addEventListener("fetch", (event: any) => {
    const req: Request = event.request;
    if (req.method !== "GET") return;
    const url = new URL(req.url);
    if (url.origin !== sw.location.origin) return;
    if (req.mode === "navigate") return event.respondWith(navigation(event));
    if (url.pathname.startsWith("/_next/static/")) return event.respondWith(cacheFirst(req));
    if (/^\/(icons\/|splash\/|icon\.svg|apple-icon|favicon)/.test(url.pathname)) return event.respondWith(staleWhileRevalidate(event));
  });

  // Morning reminders.
  sw.addEventListener("push", (event: any) => {
    let data: { title?: string; body?: string; url?: string; count?: number; tag?: string } = {};
    try {
      data = event.data ? event.data.json() : {};
    } catch {
      data = { body: event.data ? event.data.text() : "" };
    }
    event.waitUntil(
      (async () => {
        if (typeof data.count === "number" && sw.navigator.setAppBadge) {
          await (data.count > 0 ? sw.navigator.setAppBadge(data.count) : sw.navigator.clearAppBadge()).catch(() => undefined);
        }
        await sw.registration.showNotification(data.title || "Suppli Afya", {
          body: data.body || "",
          icon: "/icons/icon-192.png",
          badge: "/icons/badge-96.png",
          tag: data.tag || "suppli-afya",
          renotify: false,
          data: { url: data.url || "/portal" },
        });
      })(),
    );
  });

  sw.addEventListener("notificationclick", (event: any) => {
    event.notification.close();
    const target = new URL(event.notification.data?.url || "/portal", sw.location.origin).href;
    event.waitUntil(
      (async () => {
        const windows = await sw.clients.matchAll({ type: "window", includeUncontrolled: true });
        for (const w of windows) {
          if (new URL(w.url).origin === sw.location.origin && "focus" in w) {
            await w.focus();
            if ("navigate" in w) await w.navigate(target).catch(() => undefined);
            return;
          }
        }
        await sw.clients.openWindow(target);
      })(),
    );
  });
}
