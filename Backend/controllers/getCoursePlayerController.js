const { db } = require('../config/firebase');
const admin = require('firebase-admin');

// Constants
const MAX_NOTES_LENGTH = 10000;
const COURSE_ID_REGEX = /^[a-zA-Z0-9_-]{20,}$/;

// Helper functions
const isValidCourseId = (id) => COURSE_ID_REGEX.test(id);
const validateNotes = (notes) => {
  if (typeof notes !== 'string') {
    return { valid: false, message: 'Notes must be a string' };
  }
  const trimmed = notes.trim();
  if (trimmed.length > MAX_NOTES_LENGTH) {
    return { valid: false, message: `Notes cannot exceed ${MAX_NOTES_LENGTH} characters` };
  }
  return { valid: true, data: trimmed };
};

// Cache configuration
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    const cacheKey = `course-${courseId}`;

    // Validate course ID format
    if (!isValidCourseId(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    // Get course document
    const courseRef = db.collection('courses').doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const courseData = courseDoc.data();

    // Process modules and lessons according to your structure
    const processedModules = (courseData.modules || []).map((module, moduleIndex) => {
      // Handle both array and object formats for lessons
      const lessonsArray = Array.isArray(module.lessons)
        ? module.lessons
        : Object.values(module.lessons || {});

      const processedLessons = lessonsArray.map((lesson, lessonIndex) => ({
        lessonId: `${courseId}-${moduleIndex}-${lessonIndex}`, // Generate unique ID
        moduleId: `${courseId}-${moduleIndex}`,
        title: lesson.title || `Lesson ${lessonIndex + 1}`,
        videoUrl: lesson.videoLink || lesson.videoUrl || '',
        duration: lesson.duration || 0,
        order: lessonIndex + 1
      }));

      return {
        moduleId: `${courseId}-${moduleIndex}`,
        title: module.title || `Module ${moduleIndex + 1}`,
        description: module.description || '',
        order: moduleIndex + 1,
        lessons: processedLessons
      };
    });

    // Flatten lessons for easy access
    const allLessons = processedModules.flatMap(module =>
      module.lessons.map(lesson => ({
        ...lesson,
        moduleTitle: module.title,
        moduleId: module.moduleId
      }))
    );

    const responseData = {
      course: {
        id: courseDoc.id,
        title: courseData.title,
        description: courseData.description,
        thumbnailUrl: courseData.thumbnailUrl,
        category: courseData.category,
        difficulty: courseData.difficulty,
        tags: courseData.tags || [],
        createdBy: courseData.createdBy,
        createdAt: courseData.createdAt?.toDate()?.toISOString() || null,
        updatedAt: courseData.updatedAt?.toDate()?.toISOString() || null
      },
      modules: processedModules,
      lessons: allLessons
    };

    // Cache the processed data
    cache.set(cacheKey, responseData);
    // console.log(responseData);

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.saveNotes = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.uid;
    const { notes } = req.body;

    // Validate input
    const validation = validateNotes(notes);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Create note data with timestamps
    const noteData = {
      userId,
      courseId,
      lessonId,
      notes: validation.data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save with transaction
    await db.runTransaction(async (transaction) => {
      const notesRef = db.collection('userNotes').doc(`${userId}_${courseId}_${lessonId}`);
      const doc = await transaction.get(notesRef);

      noteData.createdAt = doc.exists
        ? doc.data().createdAt
        : admin.firestore.FieldValue.serverTimestamp();

      transaction.set(notesRef, noteData, { merge: true });
    });

    res.status(200).json({
      success: true,
      message: 'Notes saved successfully',
      data: {
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error saving notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save notes',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        stack: error.stack
      })
    });
  }
};
exports.getNotes = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.uid; // Make sure this is coming from authenticated user

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const cacheKey = `notes-${userId}-${courseId}-${lessonId}`;

    // Check cache first
    const cachedNotes = cache.get(cacheKey);
    if (cachedNotes) {
      return res.status(200).json({
        success: true,
        data: cachedNotes,
        cached: true
      });
    }

    // Get notes from Firestore - ensure the document ID matches exactly
    const docId = `${userId}_${courseId}_${lessonId}`;
    const notesRef = db.collection('userNotes').doc(docId);
    const notesDoc = await notesRef.get();

    if (!notesDoc.exists) {
      // Return empty notes if document doesn't exist
      const emptyResponse = {
        notes: '',
        exists: false
      };
      cache.set(cacheKey, emptyResponse);
      return res.status(200).json({
        success: true,
        data: emptyResponse
      });
    }

    const noteData = notesDoc.data();

    // Verify the note belongs to the requesting user
    if (noteData.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to notes'
      });
    }

    const responseData = {
      notes: noteData.notes || '',
      updatedAt: noteData.updatedAt?.toDate()?.toISOString() || null,
      exists: true
    };

    // Cache the result
    cache.set(cacheKey, responseData);

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        stack: error.stack
      })
    });
  }
};