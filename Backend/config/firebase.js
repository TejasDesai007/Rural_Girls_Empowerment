const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // Adjust path if needed

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://testproject-a1536.firebaseio.com',
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };
