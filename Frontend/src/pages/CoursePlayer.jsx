import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Check, ChevronDown, ChevronUp, Play } from "lucide-react";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-hot-toast";
import { collection, query, where, getDocs, addDoc, doc, setDoc, getDoc } from "firebase/firestore";

const formatDuration = (seconds) => {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const [selectedLesson, setSelectedLesson] = useState({
    moduleId: '',
    lessonId: ''
  });
  const [notes, setNotes] = useState("");
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [completedLessons, setCompletedLessons] = useState({});
  const [currentLessonDescription, setCurrentLessonDescription] = useState("");

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const isModuleExpanded = (moduleId) => {
    return expandedModules[moduleId] ?? true;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthChecked(true);

      if (!user) {
        toast.error("Please login to view this course");
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        await fetchCourseData(user);
        await fetchCompletedLessons(user.uid);
      } catch (error) {
        console.error("Error in course data fetch:", error);
        toast.error(error.message);
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate, courseId]);

  const fetchCourseData = async (user) => {
    try {
      setLoading(true);

      const q = query(collection(db, "courses"), where("__name__", "==", courseId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Course not found.");
      }

      const courseDoc = querySnapshot.docs[0];
      const courseData = courseDoc.data();
      setCourse(courseData);

      const transformedModules = courseData.modules.map((module, moduleIndex) => ({
        moduleId: `module-${moduleIndex}`,
        title: module.title,
        order: moduleIndex + 1,
      }));

      const transformedLessons = [];
      courseData.modules.forEach((module, moduleIndex) => {
        module.lessons.forEach((lesson, lessonIndex) => {
          transformedLessons.push({
            lessonId: `${courseDoc.id}-${moduleIndex}-${lessonIndex}`,
            moduleId: `module-${moduleIndex}`,
            title: lesson.title,
            description: lesson.description || "",
            videoUrl: lesson.videoUrl,
            order: lessonIndex + 1,
            duration: 0,
          });
        });
      });

      setModules(transformedModules);
      setLessons(transformedLessons);

      if (transformedLessons.length > 0) {
        handleLessonChange(transformedLessons[0]);
      }

    } catch (error) {
      console.error("Error fetching course from collection:", error);
      toast.error(error.message || "Could not fetch course.");
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedLessons = async (userId) => {
    try {
      const docRef = doc(db, "userProgress", `${userId}_${courseId}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCompletedLessons(docSnap.data().completedLessons || {});
      } else {
        setCompletedLessons({});
      }
    } catch (error) {
      console.error("Error fetching completed lessons:", error);
      setCompletedLessons({});
    }
  };

  const toggleLessonCompletion = async (lessonId) => {
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const newCompletedLessons = { ...completedLessons };
    
    if (newCompletedLessons[lessonId]) {
      delete newCompletedLessons[lessonId];
    } else {
      newCompletedLessons[lessonId] = true;
    }

    try {
      const docRef = doc(db, "userProgress", `${userId}_${courseId}`);
      await setDoc(docRef, {
        userId,
        courseId,
        completedLessons: newCompletedLessons,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setCompletedLessons(newCompletedLessons);
    } catch (error) {
      console.error("Error updating lesson completion:", error);
      toast.error("Failed to update completion status");
    }
  };

  const loadNotesForLesson = async (lessonId, user) => {
    if (!lessonId || !user?.uid) {
      setNotes("");
      return;
    }

    try {
      setIsLoadingNotes(true);

      const lessonParts = lessonId.split("-");
      const formattedLessonId = `${courseId}-${lessonParts[1]}-${lessonParts[2]}`;

      const q = query(
        collection(db, "userNotes"),
        where("userId", "==", user.uid),
        where("courseId", "==", courseId),
        where("lessonId", "==", formattedLessonId)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const noteDoc = querySnapshot.docs[0];
        const noteData = noteDoc.data();
        setNotes(noteData.notes || "");
      } else {
        setNotes("");
      }
    } catch (error) {
      console.error("Error loading notes:", error);
      setNotes("");
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleLessonChange = async (lesson) => {
    if (!lesson) return;

    setSelectedLesson({
      moduleId: lesson.moduleId,
      lessonId: lesson.lessonId
    });

    setCurrentVideoUrl(lesson.videoUrl);
    setCurrentLessonDescription(lesson.description || "");

    try {
      const user = auth.currentUser;
      if (!user) return;
      await loadNotesForLesson(lesson.lessonId, user);
    } catch (error) {
      console.error("Error loading notes for lesson:", error);
      setNotes("");
    }
  };

  const handleSaveNotes = async () => {
    if (isSavingNotes || !selectedLesson.lessonId || !auth.currentUser) return;

    try {
      setIsSavingNotes(true);

      const user = auth.currentUser;
      const now = new Date();

      const noteData = {
        courseId,
        lessonId: `${courseId}-${selectedLesson.moduleId.split('-')[1]}-${selectedLesson.lessonId.split('-')[2]}`,
        userId: user.uid,
        notes,
        createdAt: now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        updatedAt: now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      };

      await addDoc(collection(db, "userNotes"), noteData);

      toast.success("Notes saved successfully!");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error(error.message || "Failed to save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const currentLesson = lessons.find(
    lesson => lesson.lessonId === selectedLesson.lessonId
  ) || lessons[0];

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!course || lessons.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No course data available
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="lg:w-1/4 border-r px-4 py-6 bg-gray-50">
        <h3 className="text-lg font-bold mb-1">{course.title}</h3>
        <h4 className="text-sm text-gray-500 mb-4">Course Content</h4>

        <div className="space-y-2">
          {modules.map((module) => (
            <div key={module.moduleId} className="border rounded-md overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-3 bg-gray-100 hover:bg-gray-200"
                onClick={() => toggleModule(module.moduleId)}
              >
                <div>
                  <span className="font-medium">Module {module.order}:</span> {module.title}
                </div>
                {isModuleExpanded(module.moduleId) ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>

              {isModuleExpanded(module.moduleId) && (
                <ul className="divide-y">
                  {lessons
                    .filter((lesson) => lesson.moduleId === module.moduleId)
                    .sort((a, b) => a.order - b.order)
                    .map((lesson) => (
                      <li key={lesson.lessonId}>
                        <div className="flex items-center">
                          <button
                            className={`w-full text-left p-3 flex items-center gap-2 hover:bg-gray-50 ${
                              selectedLesson.lessonId === lesson.lessonId
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            }`}
                            onClick={() => handleLessonChange(lesson)}
                          >
                            <Play size={14} className="flex-shrink-0" />
                            <span className="truncate">{lesson.title}</span>
                            {lesson.duration > 0 && (
                              <span className="ml-auto text-xs text-gray-500">
                                {formatDuration(lesson.duration)}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLessonCompletion(lesson.lessonId);
                            }}
                            className={`p-2 mr-2 rounded-full ${
                              completedLessons[lesson.lessonId]
                                ? "text-green-600 bg-green-50"
                                : "text-gray-400 hover:bg-gray-100"
                            }`}
                            aria-label={
                              completedLessons[lesson.lessonId]
                                ? "Mark as incomplete"
                                : "Mark as complete"
                            }
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {lessons.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Course Progress</span>
              <span>
                {Object.keys(completedLessons).length} / {lessons.length} lessons
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${(Object.keys(completedLessons).length / lessons.length) * 100}%`
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Main Player & Notes */}
      <div className="flex-1 p-6 space-y-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/courses")}
          className="flex items-center gap-2 mb-4"
        >
          <ChevronLeft size={16} />
          Back to Courses
        </Button>

        {currentLesson?.videoUrl ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">{currentLesson?.title}</h2>
              {currentLessonDescription && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-medium text-gray-700 mb-2">Lesson Description:</h3>
                  <p className="text-gray-700 whitespace-pre-line">{currentLessonDescription}</p>
                </div>
              )}
              <div className="aspect-video w-full rounded-xl overflow-hidden border shadow-lg">
                <video
                  src={currentLesson.videoUrl}
                  controls
                  className="w-full h-full"
                  poster=""
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        ) : (
          <div className="aspect-video w-full rounded-xl overflow-hidden border bg-gray-100 flex items-center justify-center">
            <p>No video available</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Notes</h3>
            <Button
              onClick={handleSaveNotes}
              disabled={isSavingNotes || isLoadingNotes}
              size="sm"
            >
              {isSavingNotes ? "Saving..." : "Save Notes"}
            </Button>
          </div>
          {isLoadingNotes ? (
            <div className="min-h-[200px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write down your thoughts, key points, or questions..."
              className="w-full min-h-[200px]"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;