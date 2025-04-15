const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { createCourse } = require("../controllers/courseController");
const { getCourses } = require("../controllers/getCoursesController");
const coursePlayerController = require('../controllers/getCoursePlayerController');
const authMiddleware = require('../middlewares/authMiddleware');

// Setup Multer with disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/thumbnails/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/addCourse", upload.single("thumbnail"), createCourse);
router.get("/getCourses", getCourses);
router.get('/:courseId', authMiddleware, coursePlayerController.getCourseDetails);
router.post('/:courseId/lessons/:lessonId/notes', authMiddleware, coursePlayerController.saveNotes);
router.get('/:courseId/lessons/:lessonId/notes', authMiddleware, coursePlayerController.getNotes);
module.exports = router;
