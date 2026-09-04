/* =========================================================
   ULTRA PREPPY PINK MODE — Add-on Layer
   Turns the theme more pink, girly, glossy, and sparkly.
   ========================================================= */

body.nexus-preppy-theme {
    /* Overwrite core palette to be pink‑forward */
    --preppy-navy: #e98ca5;
    --preppy-ink: #b45d77;
    --preppy-cream: #fff6f9;
    --preppy-pink: #ff8fb8;
    --preppy-blush: #ffd3e6;
    --preppy-baby-blue: #f3d9ff;
    --preppy-lilac: #f0c8ff;
    --preppy-gold: #f7c27d;

    background:
        radial-gradient(circle at 12% 10%, rgba(255,182,210,.55), transparent 24%),
        radial-gradient(circle at 90% 15%, rgba(255,210,240,.45), transparent 25%),
        radial-gradient(circle at 80% 90%, rgba(255,160,210,.42), transparent 25%),
        #fff6f9;
}

/* Stronger pink gingham */
body.nexus-preppy-theme::before {
    opacity: .42;
    background-image:
        linear-gradient(rgba(255,140,180,.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,140,180,.06) 1px, transparent 1px);
}

/* Banner becomes fully pink‑luxury */
.preppy-nexus-banner {
    border-color: rgba(255,140,180,.65);
    background: linear-gradient(135deg, #fff6f9, #ffe4f1);
    box-shadow:
        0 16px 45px rgba(255,140,180,.22),
        0 0 30px rgba(255,140,180,.18);
}

.preppy-banner-title {
    color: #ff5f9d;
    text-shadow: 0 3px 14px rgba(255,140,180,.28);
}

/* Navigation becomes pink‑dominant */
body.nexus-preppy-theme .nav-btn:hover {
    background: linear-gradient(90deg, rgba(255,182,210,.45), rgba(255,210,240,.28));
    color: #ff5f9d;
}

body.nexus-preppy-theme .nav-btn.active-tab {
    background: linear-gradient(90deg, rgba(255,182,210,.75), rgba(255,240,250,.95));
    border-color: rgba(255,140,180,.55);
    box-shadow:
        inset 4px 0 0 #ff8fb8,
        0 7px 20px rgba(255,140,180,.18);
}

/* Workspace frame becomes glossy pink */
body.nexus-preppy-theme .app-view-frame {
    border-color: rgba(255,140,180,.35);
    box-shadow:
        0 20px 55px rgba(255,140,180,.18),
        0 0 0 5px rgba(255,240,250,.7);
}

/* Decorations more sparkly */
.preppy-bow {
    color: #ff8fb8;
    filter: drop-shadow(0 5px 9px rgba(255,140,180,.25));
}

.preppy-heart {
    color: #ff5f9d;
    opacity: .9;
}

.preppy-sparkles {
    color: #f7c27d;
    opacity: .85;
}

/* Status pill becomes pink glass */
.preppy-status-pill {
    background: rgba(255,240,250,.92);
    border-color: rgba(255,140,180,.35);
    color: #b45d77;
}

.preppy-status-dot {
    background: #ff5f9d;
    box-shadow: 0 0 12px rgba(255,140,180,.75);
}
