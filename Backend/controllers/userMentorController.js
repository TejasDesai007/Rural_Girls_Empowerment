const { admin, db } = require("../config/firebase");
const bcrypt = require("bcrypt");
const handleRegister = async (req, res) => {
  const { name, email, contact, password, role } = req.body;

  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (!snapshot.empty) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      name,
      email,
      contact,
      password: hashedPassword,
      role: role || "user",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Use email or uid from Auth as the Firestore document ID
    const docRef = await usersRef.doc(email).set(newUser); // Use doc(email) to make sure the ID matches

    const userWithId = { ...newUser, id: email }; // You can also use the uid here if needed

    req.session.user = userWithId;

    res.status(201).json({
      message: "User registered successfully.",
      ...userWithId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  handleRegister,
};
