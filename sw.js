const CACHE_NAME = 'journal-app-v4';
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


// Listen for Push events from the server
self.addEventListener('push', function(event) {
    // Parse the data sent from your server
    const data = event.data ? event.data.json() : { title: 'New Alert', message: 'You have a new notification.' };
    
    const options = {
        body: data.message,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        // You can add actions, vibrations, and custom data here
        data: { url: '/' } 
    };

    // Keep the service worker alive until the notification is shown
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle what happens when the user clicks the OS notification
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Close the notification
    
    // Open the app when the notification is clicked
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // If app is already open, focus it
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // If app is closed, open a new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});