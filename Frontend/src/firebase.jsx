import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Export Firestore, Auth, and Provider
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };
