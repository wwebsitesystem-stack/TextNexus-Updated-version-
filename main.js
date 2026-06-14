import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Reference to your status in Firebase
const statusRef = ref(db, 'system_status');

onValue(statusRef, (snapshot) => {
    const status = snapshot.val();
    const frame = document.getElementById('nexusFrame');

    console.log("System Status Changed:", status);

    if (status === "SHUTDOWN") {
        frame.src = "shut_down.html";
    } else if (status === "ONLINE") {
        // If it was shutdown and comes back online, default to home
        if (frame.src.includes("shut_down.html")) {
            frame.src = "home.html";
        }
    }
});
