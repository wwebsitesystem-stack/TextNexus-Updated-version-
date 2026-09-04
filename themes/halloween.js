/* =========================================================
   NEXUS // PREPPY AFTER DARK
   Pink Edition 🎀
   Theme Behavior
   ========================================================= */

(function () {
    "use strict";

    /*
     * Theme variables exposed to the main Nexus interface.
     */
    document.documentElement.style.setProperty(
        "--theme-accent",
        "#ff4fa3"
    );

    document.documentElement.style.setProperty(
        "--theme-accent-soft",
        "#ff9ed0"
    );

    document.documentElement.style.setProperty(
        "--theme-accent-secondary",
        "#c58cff"
    );

    /*
     * Prevent duplicate decoration layers if Firebase
     * reapplies the theme.
     */
    if (document.getElementById("preppy-decoration-layer")) {
        return;
    }

    /*
     * Floating decorative layer.
     */
    const layer = document.createElement("div");

    layer.id = "preppy-decoration-layer";
    layer.setAttribute("aria-hidden", "true");

    Object.assign(layer.style, {
        position: "fixed",
        inset: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: "999999",
        overflow: "hidden"
    });

    /*
     * Preppy decoration symbols.
     */
    const symbols = [
        "♡",
        "✦",
        "✧",
        "⋆",
        "♥",
        "♡",
        "✦"
    ];

    /*
     * Create floating decorations.
     */
    for (let i = 0; i < 22; i++) {
        const element = document.createElement("span");

        element.textContent =
            symbols[i % symbols.length];

        const left =
            Math.random() * 100;

        const top =
            Math.random() * 100;

        const size =
            7 + Math.random() * 14;

        const duration =
            5 + Math.random() * 7;

        const delay =
            -Math.random() * 7;

        const rotation =
            Math.random() * 30 - 15;

        const opacity =
            0.07 + Math.random() * 0.17;

        let decorationColor;

        if (i % 5 === 0) {
            decorationColor = "#c58cff";
        } else if (i % 4 === 0) {
            decorationColor = "#8fdcff";
        } else {
            decorationColor = "#ff4fa3";
        }

        Object.assign(element.style, {
            position: "absolute",
            left: left + "%",
            top: top + "%",
            color: decorationColor,
            opacity: String(opacity),
            fontSize: size + "px",
            fontFamily:
                "-apple-system, BlinkMacSystemFont, " +
                "\"Segoe UI\", sans-serif",
            fontWeight: "600",
            transform:
                "rotate(" + rotation + "deg)",
            textShadow:
                "0 0 9px rgba(255,79,163,.55)",
            animation:
                "nexusPreppyFloat " +
                duration +
                "s ease-in-out infinite alternate",
            animationDelay: delay + "s"
        });

        layer.appendChild(element);
    }

    /*
     * Add animation stylesheet once.
     */
    if (!document.getElementById("preppy-animation-style")) {
        const style =
            document.createElement("style");

        style.id =
            "preppy-animation-style";

        style.textContent = `
            @keyframes nexusPreppyFloat {
                0% {
                    transform:
                        translate3d(0, 0, 0)
                        rotate(-8deg)
                        scale(.88);
                }

                50% {
                    transform:
                        translate3d(5px, -10px, 0)
                        rotate(3deg)
                        scale(1);
                }

                100% {
                    transform:
                        translate3d(-4px, -22px, 0)
                        rotate(8deg)
                        scale(1.08);
                }
            }

            #preppy-decoration-layer {
                animation:
                    nexusPreppyLayerFade
                    1.2s ease-out both;
            }

            @keyframes nexusPreppyLayerFade {
                from {
                    opacity: 0;
                }

                to {
                    opacity: 1;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /*
     * Add decorations to the Nexus page.
     */
    document.body.appendChild(layer);

    /*
     * Small theme metadata that other Nexus scripts can
     * optionally read.
     */
    window.NexusPreppyTheme = {
        name: "PREPPY",
        variant: "AFTER_DARK_PINK",
        primary: "#ff4fa3",
        secondary: "#c58cff",
        soft: "#ff9ed0",
        background: "#08040b"
    };

    /*
     * Dispatch an event so the main Nexus system knows
     * the theme has finished loading.
     */
    try {
        window.dispatchEvent(
            new CustomEvent(
                "nexus-preppy-theme-ready",
                {
                    detail: window.NexusPreppyTheme
                }
            )
        );
    } catch (error) {
        console.warn(
            "Nexus Preppy theme event unavailable.",
            error
        );
    }
})();
