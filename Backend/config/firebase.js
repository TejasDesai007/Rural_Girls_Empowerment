// config/firebase.js

const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://rural-girls-empowerment.firebaseio.com",
});

const db = admin.firestore(); // ✅ Initialize Firestore


module.exports = {
  admin,
  db
};
