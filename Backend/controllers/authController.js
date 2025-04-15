  const { admin, db } = require("../config/firebase");
  const session = require("express-session");
  const handleGoogleAuth = async (req, res) => {
    const { idToken, role, contact, name: clientName } = req.body;
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email, name: firebaseName, picture } = decodedToken;
      const finalName = clientName || firebaseName;
  
      const usersRef = db.collection("users");
      const snapshot = await usersRef.where("email", "==", email).get();
  
      if (!snapshot.empty) {
        const existingUser = snapshot.docs[0].data();
        req.session.user = existingUser;
        return res.status(200).json({
          message: "User already exists. Please login.",
          ...existingUser,
          alreadyExists: true,
        });
      }
  
      const newUser = {
        uid,
        email,
        name: finalName,
        contact: contact || "",
        picture,
        role: role || "user",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
  
      await db.collection("users").doc(uid).set(newUser);
      req.session.user = newUser;
  
      res.status(200).json({
        message: "User created and session stored.",
        ...newUser,
        alreadyExists: false,
      });
    } catch (error) {
      console.error("Google Sign-in Error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };



  module.exports = {
    handleGoogleAuth,
  };
