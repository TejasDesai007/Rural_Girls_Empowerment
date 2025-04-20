const { db, admin } = require("../config/firebase"); // Fixed import

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
    
    // Process courses and fetch creator info in parallel
    const coursesPromises = snapshot.docs.map(async (doc) => {
      const courseData = doc.data();
      let creatorInfo = null;
      
      // Fetch creator information if exists
      if (courseData.createdBy) {
        try {
          const userRecord = await admin.auth().getUser(courseData.createdBy);
          creatorInfo = {
            name: userRecord.displayName || userRecord.email.split('@')[0],
            email: userRecord.email
          };
        } catch (error) {
          console.error(`Error fetching user ${courseData.createdBy}:`, error);
          creatorInfo = {
            name: "Unknown",
            email: ""
          };
        }
      }
      
      return {
        id: doc.id,
        ...courseData,
        creator: creatorInfo
      };
    });
    
    let courses = await Promise.all(coursesPromises);
    
    // Apply search filter if it exists (case insensitive)
    if (search) {
      const searchTerm = search.toLowerCase();
      courses = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm) ||
        (course.description && course.description.toLowerCase().includes(searchTerm)) ||
        (course.creator && course.creator.name.toLowerCase().includes(searchTerm))
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