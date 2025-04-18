const { db, admin } = require("../config/firebase");

exports.createCourse = async (req, res) => {
  try {
    // Get the authorization token from headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: No token provided" 
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify the token and get the UID
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const { 
      title, 
      description, 
      category, 
      difficulty,
      tags,
      videoLink, 
      modules
    } = req.body;

    // Parse the JSON strings
    const parsedModules = JSON.parse(modules);
    const parsedTags = tags ? JSON.parse(tags) : [];

    let thumbnailUrl = "";

    if (req.file) {
      thumbnailUrl = `${req.protocol}://${req.get("host")}/uploads/thumbnails/${req.file.filename}`;
    }

    const courseDoc = {
      title,
      description,
      category,
      difficulty,
      tags: parsedTags,
      videoLink,
      thumbnailUrl,
      modules: parsedModules,
      createdBy: uid, // Store the creator's UID
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("courses").add(courseDoc);

    res.status(200).json({ 
      success: true, 
      id: docRef.id,
      data: {
        ...courseDoc,
        id: docRef.id
      }
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error",
      error: error.message 
    });
  }
};