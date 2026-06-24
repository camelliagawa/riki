// 力覚センサ CSV グラフビューア – Service Worker
// 方針: HTML（ページ本体）はネットワーク優先で常に最新を取得。
//       vendor 等の静的アセットはキャッシュ優先で高速化＋オフライン対応。
const CACHE = "riki-cache-v1";

self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== self.location.origin) return; // 自サイトのみ制御

  const isDoc = req.mode === "navigate" ||
                url.pathname.endsWith("/") ||
                url.pathname.endsWith("index.html");

  if (isDoc) {
    // ネットワーク優先（最新HTML）。失敗時のみキャッシュ。
    e.respondWith(
      fetch(req).then(res => {
        caches.open(CACHE).then(c => c.put(req, res.clone())).catch(()=>{});
        return res;
      }).catch(() => caches.match(req))
    );
  } else {
    // キャッシュ優先（vendor/sample 等の静的ファイル）。無ければ取得して保存。
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        caches.open(CACHE).then(c => c.put(req, res.clone())).catch(()=>{});
        return res;
      }))
    );
  }
});
