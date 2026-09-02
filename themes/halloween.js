/* =========================================================
   NEXUS HALLOWEEN THEME ENGINE
   ========================================================= */

(() => {

    console.log("[HALLOWEEN] Theme engine online 🎃");

    const halloweenOverlay = document.createElement("div");

    halloweenOverlay.id = "nexus-halloween-atmosphere";

    halloweenOverlay.innerHTML = `
        <div class="halloween-fog fog-one"></div>
        <div class="halloween-fog fog-two"></div>
        <div class="halloween-particle-layer"></div>
    `;

    halloweenOverlay.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 99998;
        overflow: hidden;
    `;

    document.body.appendChild(halloweenOverlay);

    const style = document.createElement("style");

    style.textContent = `
        .halloween-fog {
            position: absolute;
            width: 70vw;
            height: 30vh;
            border-radius: 50%;
            filter: blur(50px);
            opacity: .08;
            animation: halloweenFogMove 12s ease-in-out infinite alternate;
        }

        .fog-one {
            background: #8b2cff;
            top: 15%;
            left: -20%;
        }

        .fog-two {
            background: #ff6a00;
            bottom: 5%;
            right: -20%;
            animation-delay: -5s;
        }

        @keyframes halloweenFogMove {
            from {
                transform: translateX(-5%) translateY(0);
            }

            to {
                transform: translateX(25%) translateY(30px);
            }
        }
    `;

    document.head.appendChild(style);

})();
