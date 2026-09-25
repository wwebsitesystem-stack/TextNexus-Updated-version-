import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        // If the user does not exist in Firestore yet, create their record automatically
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                name: user.displayName || 'New User', // Pulls name directly from Firebase Auth
                role: 'User',                         // Automatically assigns 'User' role
                isBanned: false,
                status: 'Active',
                createdAt: new Date().toISOString()
            });
        }
    }
});
