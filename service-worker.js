const CURRENT_CACHE = "version8";

self.addEventListener("install", (event) => {
    console.log("Service worker installed...", event);

    if(!('caches' in self))
        return;

        // Zie: https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil
        // Zie: https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage/open
    event.waitUntil(caches.open(CURRENT_CACHE)
        .then((cache) => {
            console.log("Filling cache...");

            // Voeg bestanden toe aan de net geopende/gemaakte cache...
            // Zie: https://developer.mozilla.org/en-US/docs/Web/API/Cache/addAll
            return cache.addAll([
                'index.html',
                'schrijven.html',
                'uitlezen.html',
                'styles/style.css',
                'styles/carousel.css',
            ]);
        }));
})

self.addEventListener("activate", (event) => {
    console.log("Service worker activated...", event);
    
    event.waitUntil(
        caches.keys().then((cacheKeys) => {
            console.log("Cache keys: ", cacheKeys);

            return Promise.all(
                cacheKeys.map((cacheKey) => {
                    if(cacheKey != CURRENT_CACHE)
                    {
                        console.log("Deleting cache: ", cacheKey);

                        // Zie: https://developer.mozilla.org/en-US/docs/Web/API/Cache/delete
                        return caches.delete(cacheKey);
                    }
                })
            )
        })
    );
})

self.addEventListener("fetch", (event) => {
    console.log("Fetched...", event);

    // Zoek uit of je online of offline bent.
    if(!navigator.onLine && event.request.url.indexOf("index.html") !== -1)
        event.respondWith(showOfflineLandingPage(event));
    else    
        event.respondWith(pullFromCache(event));
})

function showOfflineLandingPage(event)
{
    return caches.match(new Request('offline.html'));
}

function pullFromCache(event)
{
    return caches.match(event.request)
    .then((response) => {
        return response || fetch(event.request)
        .then((response) => {
            console.log("Fetched from the network, not the cache list...");

            // Voeg het nieuwe bestand toe aan de cache.
            return caches.open(CURRENT_CACHE)
                .then((cache) => {
                    // Zie: https://developer.mozilla.org/en-US/docs/Web/API/Cache/put
                    cache.put(event.request, response.clone());
                    return response;
                })
        });
    })
}

// Luisteren naar notification events op de service worker.
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