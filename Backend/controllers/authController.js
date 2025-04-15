// controllers/authController.js
const { admin, db } = require("../config/firebase");
const session = require("express-session");

const handleGoogleAuth = async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    console.log("Authenticated user:", { uid, email, name, picture });

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        uid,
        email,
        name,
        picture,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("User added to Firestore");
    
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
      console.log("User already exists in Firestore");
    
      req.session.user = { uid, email, name, picture };
    
      res.status(200).json({
        message: "User already exists. Redirect to login.",
        uid,
        email,
        name,
        picture,
        alreadyExists: true,
      });
    }
    

    req.session.user = { uid, email, name, picture };

    res.status(200).json({
      message: "User authenticated, session created, and stored in Firestore",
      uid,
      email,
      name,
      picture,
    });
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = {
  handleGoogleAuth,
};
