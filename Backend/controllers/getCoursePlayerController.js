// controllers/coursePlayerController.js
const { db } = require('../config/firebase');
const admin = require('firebase-admin');

exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.uid; // From auth middleware

    // Get course details
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Get lessons (assuming modules contain lessons)
    const courseData = courseDoc.data();
    const lessons = courseData.modules.flatMap(module => 
      module.lessons.map(lesson => ({
        moduleTitle: module.title,
        lessonId: lesson.id,
        title: lesson.title,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration
      }))
    );

    res.status(200).json({
      success: true,
      data: {
        course: {
          id: courseDoc.id,
          title: courseData.title,
          description: courseData.description,
          thumbnailUrl: courseData.thumbnailUrl
        },
        lessons
      }
    });
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.saveNotes = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.uid;
    const { notes } = req.body;

    // Save notes to Firestore
    const notesRef = db.collection('userNotes').doc(`${userId}_${courseId}_${lessonId}`);
    await notesRef.set({
      userId,
      courseId,
      lessonId,
      notes,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.status(200).json({ success: true, message: 'Notes saved successfully' });
  } catch (error) {
    console.error('Error saving notes:', error);
    res.status(500).json({ success: false, message: 'Failed to save notes', error: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.uid;

    // Get notes from Firestore
    const notesRef = db.collection('userNotes').doc(`${userId}_${courseId}_${lessonId}`);
    const notesDoc = await notesRef.get();

    if (!notesDoc.exists) {
      return res.status(200).json({ success: true, data: { notes: '' } });
    }

    res.status(200).json({ success: true, data: notesDoc.data() });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notes', error: error.message });
  }
};