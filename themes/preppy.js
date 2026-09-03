/* =========================================================
   NEXUS // PREPPY EDITION THEME ENGINE
   Girly • Preppy • Polished • Luxury
   ========================================================= */

(function () {
    "use strict";

    const THEME_CLASS = "nexus-preppy-theme";

    function addDecor(className, html) {
        let element = document.querySelector("." + className);

        if (!element) {
            element = document.createElement("div");
            element.className = className;
            element.innerHTML = html;
            document.body.appendChild(element);
        }

        return element;
    }

    function applyPreppyTheme() {
        document.body.classList.add(THEME_CLASS);

        /* PREPPY NEXUS HEADER */
        addDecor(
            "preppy-nexus-banner",
            `
                <span class="preppy-banner-kicker">
                    ♡ NEXUS • SIGNATURE EDITION ♡
                </span>

                <span class="preppy-banner-title">
                    PREPPY NEXUS ✦
                </span>

                <span class="preppy-banner-subtitle">
                    polished • playful • perfectly preppy
                </span>
            `
        );

        /* Floating bow */
        addDecor(
            "preppy-decoration preppy-bow",
            "🎀"
        );

        /* Floating heart */
        addDecor(
            "preppy-decoration preppy-heart",
            "♡"
        );

        /* Sparkles */
        addDecor(
            "preppy-decoration preppy-sparkles",
            "✦ ♡ ✦"
        );

        /* Online status */
        addDecor(
            "preppy-status-pill",
            `
                <span class="preppy-status-dot"></span>
                <span>Preppy Mode // Online</span>
            `
        );

        document.documentElement.dataset.nexusTheme = "PREPPY";

        window.NEXUS_ACTIVE_THEME = "PREPPY";

        console.log("[NEXUS THEME] PREPPY activated.");
    }

    function removePreppyTheme() {
        document.body.classList.remove(THEME_CLASS);

        document.querySelectorAll(
            ".preppy-nexus-banner, " +
            ".preppy-decoration, " +
            ".preppy-status-pill"
        ).forEach(element => {
            element.remove();
        });

        document.documentElement.dataset.nexusTheme = "DEFAULT";

        window.NEXUS_ACTIVE_THEME = "DEFAULT";

        console.log("[NEXUS THEME] PREPPY removed.");
    }

    /*
     * Expose the theme controls globally.
     *
     * Your Firebase-connected index.html can use:
     *
     * NexusPreppyTheme.apply();
     *
     * or:
     *
     * NexusPreppyTheme.remove();
     */

    window.NexusPreppyTheme = {
        apply: applyPreppyTheme,
        remove: removePreppyTheme
    };

    /*
     * Automatically activate if the main Nexus system
     * has already selected PREPPY before this script loads.
     */

    if (window.NEXUS_ACTIVE_THEME === "PREPPY") {

        if (document.readyState === "loading") {

            document.addEventListener(
                "DOMContentLoaded",
                applyPreppyTheme
            );

        } else {

            applyPreppyTheme();

        }
    }

})();
