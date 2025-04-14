import firebase from 'firebase/app';
import 'firebase/firestore';  // Import Firestore SDK

// Firebase Configuration (get this from your Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyB1Vie6MaY1FpZjYj9j1s2lzFEE8X-SupI",
    authDomain: "rural-girls-empowerment.firebaseapp.com",
    projectId: "rural-girls-empowerment",
    storageBucket: "rural-girls-empowerment.firebasestorage.app",
    messagingSenderId: "670183967597",
    appId: "1:670183967597:web:8cb93df4e1375d0299e864",
    measurementId: "G-WJZ57QBK75"
};


// Initialize Firebase only once
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // Use the default app
}

const db = firebase.firestore(); // Firestore reference

export { db };  // Export the Firestore instance to use in your components
