// controllers/authController.js
const { admin, db } = require("../config/firebase");

exports.verifyGoogleToken = async (req, res) => {
  const idToken = req.body.idToken;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Optional: Add user to Firestore (if not exists)
    const userRef = db.collection("Users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        email: decodedToken.email,
        name: decodedToken.name || "",
        picture: decodedToken.picture || "",
        createdAt: new Date(),
      });
    }

    res.status(200).json({ message: "User verified", uid });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
