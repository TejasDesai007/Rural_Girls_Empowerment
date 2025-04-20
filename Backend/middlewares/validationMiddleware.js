exports.validateCourseId = (req, res, next) => {
    const { courseId } = req.params;
    if (!/^[a-zA-Z0-9_-]{20,}$/.test(courseId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid course ID format'
        });
    }
    next();
};

exports.validateLessonId = (req, res, next) => {
    const { lessonId } = req.params;
    if (!lessonId || typeof lessonId !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Invalid lesson ID'
        });
    }
    next();
};