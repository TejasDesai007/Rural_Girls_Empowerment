const { db } = require("../config/firebase");
const path = require("path");

exports.createCourse = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      difficulty, // Added difficulty
      tags,       // Added tags
      videoLink, 
      modules 
    } = req.body;

    // Parse the JSON strings
    const parsedModules = JSON.parse(modules);
    const parsedTags = tags ? JSON.parse(tags) : []; // Handle tags if they exist

    let thumbnailUrl = "";

    if (req.file) {
      // Create URL for frontend use
      thumbnailUrl = `${req.protocol}://${req.get("host")}/uploads/thumbnails/${req.file.filename}`;
    }

    const courseDoc = {
      title,
      description,
      category,
      difficulty, // Include difficulty
      tags: parsedTags, // Include parsed tags array
      videoLink,
      thumbnailUrl,
      modules: parsedModules,
      createdAt: new Date(),
      updatedAt: new Date(),
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