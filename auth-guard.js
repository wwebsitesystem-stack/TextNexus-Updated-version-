<!-- GLOBAL AUTH SYNC & BAN GUARD -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
  import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
  import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

  // YOUR EXACT FIREBASE CONFIG
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
  const auth = getAuth(app);
  const db = getFirestore(app);

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // 1. CHECK IF USER IS BANNED BY BRODY
      if (userSnap.exists() && userSnap.data().isBanned) {
        alert("ACCESS DENIED: Your account has been suspended by the Administrator.");
        await signOut(auth);
        window.location.href = "login.html"; // Redirect banned user
        return;
      }

      // 2. AUTO-SYNC AUTH USER TO GOVERNANCE PANEL (FIRESTORE)
      const isOwner = user.email.toLowerCase() === "brodywilliams0226@gmail.com";
      
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        role: isOwner ? "Owner" : (userSnap.exists() ? (userSnap.data().role || "User") : "User"),
        status: userSnap.exists() && userSnap.data().isBanned ? "Banned" : "Active",
        isBanned: userSnap.exists() ? (userSnap.data().isBanned || false) : false,
        lastSeen: new Date().toISOString()
      }, { merge: true });
    }
  });
</script>
