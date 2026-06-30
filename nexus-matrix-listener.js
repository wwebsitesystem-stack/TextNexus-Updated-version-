// =========================================================================
// NEXUS CORE GLOBAL INTERCEPT ENGINE (AUTO-CONFIGURED)
// =========================================================================

(function() {
    const FIREBASE_DB_URL = "https://nexus-web-development-official-default-rtdb.firebaseio.com"; 
    const eventSourceUrl = `${FIREBASE_DB_URL}/system.json`;
    
    function initializeMatrixListener() {
        // Poll database every 3.5 seconds to track overrides instantly
        setInterval(() => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", eventSourceUrl, true);
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 400) {
                    const data = JSON.parse(xhr.responseText);
                    if (data && data.status) {
                        executeSystemOverride(data.status);
                    }
                }
            };
            xhr.send();
        }, 3500);
    }

    function executeSystemOverride(status) {
        const oldOverlay = document.getElementById("nexus-override-screen");
        
        // Return layout back to normal if status is switched to "online"
        if (status === "online") {
            if (oldOverlay) oldOverlay.remove();
            return;
        }

        if (oldOverlay) return; // Overlay already visible, avoid duplicating items

        // 1. LOCKDOWN PROTOCOL
        if (status === "lockdown") {
            createOverrideOverlay(
                "☢️ SECURITY LOCKDOWN ACTIVE", 
                "The Nexus network has been temporarily locked down by the administration panel. Core interfaces are frozen.", 
                "#ff0055", 
                "rgba(255, 0, 85, 0.15)"
            );
        } 
        // 2. MAINTENANCE PROTOCOL
        else if (status === "maintenance") {
            createOverrideOverlay(
                "🔧 SYSTEM MAINTENANCE", 
                "Nexus is undergoing scheduled database upgrades. Standard access channels are paused.", 
                "#ffaa00", 
                "rgba(255, 170, 0, 0.1)"
            );
        }
        // 3. STAGING / TESTING PROTOCOL
        else if (status === "testing") {
            const testBadge = document.createElement("div");
            testBadge.id = "nexus-override-screen";
            testBadge.style = "position: fixed; bottom: 20px; right: 20px; background: #0b0d16; border: 1px solid #00f3ff; color: #00f3ff; padding: 10px 15px; border-radius: 6px; font-family: monospace; font-size: 0.8rem; z-index: 99999; box-shadow: 0 0 20px rgba(0,243,255,0.2); pointer-events: none;";
            testBadge.innerHTML = "⚡ NEXUS STAGING PROTOCOL // TESTING MODE ACTIVE";
            document.body.appendChild(testBadge);
        }
    }

    function createOverrideOverlay(title, description, brandColor, glowColor) {
        const overlay = document.createElement("div");
        overlay.id = "nexus-override-screen";
        overlay.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #030307; z-index: 999999; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; font-family: 'Segoe UI', system-ui, sans-serif; padding: 20px;";
        
        overlay.innerHTML = `
            <div style="max-width: 500px; padding: 40px 30px; background: #0b0d16; border: 1px solid ${brandColor}; border-radius: 12px; box-shadow: 0 0 40px ${glowColor};">
                <h1 style="color: ${brandColor}; font-size: 1.8rem; font-weight: 900; letter-spacing: 1px; margin-bottom: 15px; text-transform: uppercase;">${title}</h1>
                <p style="color: #646e82; font-size: 0.95rem; line-height: 1.6; font-weight: 500;">${description}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    if (document.readyState === "complete" || document.readyState === "interactive") {
        initializeMatrixListener();
    } else {
        document.addEventListener("DOMContentLoaded", initializeMatrixListener);
    }
})();
