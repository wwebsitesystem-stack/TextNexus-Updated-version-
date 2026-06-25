import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Firebase configuration using your exact project variables
const firebaseConfig = {
    apiKey: "AIzaSyAO_ffupJOIMPE9m4ARtaqSzC1vGDkIAco",
    authDomain: "nexus-web-development-official.firebaseapp.com",
    databaseURL: "https://nexus-web-development-official-default-rtdb.firebaseio.com",
    projectId: "nexus-web-development-official",
    storageBucket: "nexus-web-development-official.firebasestorage.app",
    messagingSenderId: "553556577139",
    appId: "1:553556577139:web:ea4469b06c2c01cc999306",
    measurementId: "G-S6K1M5PZLE"
};

// Initialize App Connections
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const provider = new GoogleAuthProvider();

const authZone = document.getElementById("auth-zone");

// -------------------------------------------------------------
// LIVE GLOBAL REALTIME DATABASE COMMAND LISTENER
// -------------------------------------------------------------
const systemCommandRef = ref(database, 'system/command');

onValue(systemCommandRef, (snapshot) => {
    const currentCommand = snapshot.val();
    
    if (currentCommand === "SHUTDOWN") {
        triggerGlobalShutdown();
    } else {
        removeGlobalShutdown();
    }
});

function triggerGlobalShutdown() {
    if (document.getElementById("nexus-shutdown-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "nexus-shutdown-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "#000000";
    overlay.style.zIndex = "999999"; /* Overrides all elements & frames */
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.fontFamily = "monospace";
    overlay.style.color = "#ff3333";

    overlay.innerHTML = `
        <div style="border: 2px solid #ff3333; padding: 40px; border-radius: 8px; text-align: center; max-width: 500px; box-shadow: 0 0 20px rgba(255,51,51,0.2);">
            <h1 style="letter-spacing: 3px; font-weight: 800; margin-bottom: 15px; font-size: 1.8rem;">🚨 EMERGENCY SHUTDOWN</h1>
            <p style="color: #8a8a93; font-size: 0.9rem; line-height: 1.6;">
                The Nexus interface terminal has received a hard terminal override command from central core administration. 
            </p>
            <div style="margin-top: 25px; font-size: 0.75rem; color: #ff3333; opacity: 0.6; letter-spacing: 1px;">
                ALL MODULE SYSTEM ACCESS // TERMINATED
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

function removeGlobalShutdown() {
    const activeOverlay = document.getElementById("nexus-shutdown-overlay");
    if (activeOverlay) {
        activeOverlay.remove();
    }
}

// -------------------------------------------------------------
// USER AUTHENTICATION STATE WATCHER
// -------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
    if (user) {
        authZone.innerHTML = `<img src="${user.photoURL || 'https://via.placeholder.com/36'}" id="logout-trigger" class="user-avatar-nav" title="Click to Sign Out">`;
        
        document.getElementById('logout-trigger').addEventListener('click', () => {
            if(confirm("Log out of your Nexus session?")) {
                signOut(auth);
            }
        });

        // Write/Update user details safely into database logs
        set(ref(database, 'users/' + user.uid), {
            username: user.displayName,
            email: user.email,
            lastLogin: new Date().toISOString()
        }).catch(err => console.error("Database log dropped:", err.message));

        // Refresh viewport frame to propagate session info
        const iframe = document.getElementById('main-viewport-iframe');
        if(iframe && iframe.contentWindow) {
            iframe.contentWindow.location.reload();
        }
    } else {
        authZone.innerHTML = `<button class="auth-button" id="login-trigger-btn">Sign In / Up</button>`;
        
        document.getElementById('login-trigger-btn').addEventListener('click', () => {
            signInWithPopup(auth, provider).catch(err => console.error("Login dropped:", err.message));
        });

        const iframe = document.getElementById('main-viewport-iframe');
        if(iframe && iframe.contentWindow) {
            iframe.contentWindow.location.reload();
        }
    }
});
