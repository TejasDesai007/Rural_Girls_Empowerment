const { admin, db } = require("../config/firebase");
const session = require("express-session");

const handleGoogleAuth = async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    console.log("Authenticated user:", { uid, email, name, picture });

    // Check if the user already exists in Firestore
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // If the user doesn't exist, add the user to Firestore
      await userRef.set({
        uid,
        email,
        name,
        picture,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("User added to Firestore");

      // Create session and send response for new user
      req.session.user = { uid, email, name, picture };

      res.status(200).json({
        message: "User authenticated, session created, and stored in Firestore",
        uid,
        email,
        name,
        picture,
        alreadyExists: false,
      });
    } else {
      // If the user already exists, don't save again to Firestore, just create session
      console.log("User already exists in Firestore");

      // Create session without saving user to Firestore
      req.session.user = { uid, email, name, picture };

      res.status(200).json({
        message: "User already exists. Session created.",
        uid,
        email,
        name,
        picture,
        alreadyExists: true,
      });
    }
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = {
  handleGoogleAuth,
};
