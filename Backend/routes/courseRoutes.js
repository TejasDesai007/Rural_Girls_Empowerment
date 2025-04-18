const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { createCourse } = require("../controllers/courseController");
const { getCourses } = require("../controllers/getCoursesController");
const coursePlayerController = require('../controllers/getCoursePlayerController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateCourseId } = require('../middlewares/validationMiddleware');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Better for cloud storage
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

// Course management routes
router.post("/addCourse", 
  authMiddleware,
  upload.single("thumbnail"),
  createCourse
);

router.get("/getCourses", 
  authMiddleware,
  getCourses
);

// Course player routes with validation
router.get('/:courseId', 
  authMiddleware,
  validateCourseId,
  coursePlayerController.getCourseDetails
);

router.post('/:courseId/lessons/:lessonId/notes', 
  authMiddleware,
  validateCourseId,
  coursePlayerController.saveNotes
);

router.get('/:courseId/lessons/:lessonId/notes', 
  authMiddleware,
  validateCourseId,
  coursePlayerController.getNotes
);

module.exports = router;