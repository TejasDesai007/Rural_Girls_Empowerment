import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMessaging, onMessage } from "firebase/messaging";

// Firebase config (from your Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyB1Vie6MaY1FpZjYj9j1s2lzFEE8X-SupI",
  authDomain: "rural-girls-empowerment.firebaseapp.com",
  projectId: "rural-girls-empowerment",
  storageBucket: "rural-girls-empowerment.appspot.com",
  messagingSenderId: "670183967597",
  appId: "1:670183967597:web:8cb93df4e1375d0299e864",
  measurementId: "G-WJZ57QBK75",
};

// Check if Firebase has already been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firestore, Auth, and Provider
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// For Cloud Messaging
const messaging = getMessaging(app);

export { db, auth, provider, messaging, onMessage };
