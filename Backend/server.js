const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const serviceAccount = require('./serviceAccountKey.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://testproject-a1536.firebaseio.com'
});

const db = admin.firestore();


app.listen(5000, () => console.log('Server running on port 5000'));
