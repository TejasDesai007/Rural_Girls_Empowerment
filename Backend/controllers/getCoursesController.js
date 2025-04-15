const { db } = require("../config/firebase");

exports.getCourses = async (req, res) => {
  try {
    // Get query parameters for filtering
    const { category, difficulty, search } = req.query;
    
    let query = db.collection("courses");
    
    // Apply filters if they exist
    if (category && category !== 'All') {
      query = query.where('category', '==', category);
    }
    
    if (difficulty && difficulty !== 'All') {
      query = query.where('difficulty', '==', difficulty);
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No courses found"
      });
    }
    
    let courses = [];
    snapshot.forEach(doc => {
      courses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Apply search filter if it exists
    if (search) {
      const searchTerm = search.toLowerCase();
      courses = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm)
      );
    }
    
    res.status(200).json({
      success: true,
      data: courses
    });
    
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message
    });
  }
};