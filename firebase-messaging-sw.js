// Service Worker for TextNexus Push Notifications
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'New message received on TextNexus.',
            icon: '/icon.png',
            badge: '/badge.png'
        };
        event.waitUntil(
            self.registration.showNotification(data.title || 'TextNexus OS', options)
        );
    }
});
