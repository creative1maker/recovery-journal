const CACHE_NAME = 'journal-app-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
];

// 1. تثبيت التطبيق وتخزين الملفات
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. تفعيل التحديثات وحذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

// 3. جلب الملفات (استراتيجية: الشبكة أولاً، ثم الكاش)
// هذا مهم لضمان أنك ترى دائماً أحدث نسخة من الكود، ولكن إذا انقطع النت يفتح التطبيق من الذاكرة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});