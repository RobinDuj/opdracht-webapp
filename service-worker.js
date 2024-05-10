const CURRENT_CACHE = "version8";

self.addEventListener("install", (event) => {
    console.log("Service worker installed...", event);

    if(!('caches' in self))
        return;

    event.waitUntil(
        caches.open(CURRENT_CACHE).then((cache) => {
            console.log("Filling cache...");
            return cache.addAll([
                'index.html',
                'schrijven.html',
                'uitlezen.html',
                'styles/style.css',
                'styles/carousel.css',
            ]);
        })
    );
});

self.addEventListener("activate", (event) => {
    console.log("Service worker activated...", event);
    
    event.waitUntil(
        caches.keys().then((cacheKeys) => {
            console.log("Cache keys: ", cacheKeys);
            return Promise.all(
                cacheKeys.map((cacheKey) => {
                    if(cacheKey != CURRENT_CACHE) {
                        console.log("Deleting cache: ", cacheKey);
                        return caches.delete(cacheKey);
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", (event) => {
    console.log("Fetched...", event);

    if(!navigator.onLine && event.request.url.indexOf("index.html") !== -1)
        event.respondWith(showOfflineLandingPage(event));
    else    
        event.respondWith(pullFromCache(event));
});

function showOfflineLandingPage(event) {
    return caches.match(new Request('index.html'));
}

function pullFromCache(event) {
    return caches.match(event.request)
    .then((response) => {
        return response || fetch(event.request)
        .then((response) => {
            console.log("Fetched from the network, not the cache list...");
            return caches.open(CURRENT_CACHE)
                .then((cache) => {
                    cache.put(event.request, response.clone());
                    return response;
                });
        });
    });
}

self.addEventListener('notificationclick', event => {
    console.log("Notification clicked.");
});

self.addEventListener('notificationclose', event => {
    console.log("Notification closed.");
});

self.addEventListener("push", event => {
    console.log("Push-bericht ontvangen...");
    event.waitUntil(
        self.registration.showNotification(event.data.text())
    );
});