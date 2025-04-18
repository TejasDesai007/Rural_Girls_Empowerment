import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-hot-toast";
import { ChevronDown, ChevronUp, Play } from "lucide-react";


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
  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };
  const isModuleExpanded = (moduleId) => {
    return expandedModules[moduleId] ?? true; // Default to expanded
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
      const token = await user.getIdToken();
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch course");
      }

      const data = await response.json();
      setCourse(data.data.course);
      setLessons(data.data.lessons);
      setModules(data.data.modules);

      if (data.data.lessons.length > 0) {
        const firstLesson = data.data.lessons[0];
        await handleLessonChange(firstLesson); // Use the proper function to handle lesson change
      }
    } catch (error) {
      console.error("Error in course data fetch:", error);
      toast.error(error.message);
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };


  const loadNotesForLesson = async (lessonId, user) => {
    if (!lessonId || !user?.uid) {
      setNotes("");
      return;
    }

    try {
      setIsLoadingNotes(true);
      const token = await user.getIdToken();
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/lessons/${lessonId}/notes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setNotes(result.data.notes || "");
        } else {
          setNotes("");
        }
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

    // Update selected lesson immediately
    setSelectedLesson({
      moduleId: lesson.moduleId,
      lessonId: lesson.lessonId
    });

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
    if (isSavingNotes || !selectedLesson.lessonId) return;

    try {
      setIsSavingNotes(true);
      const user = auth.currentUser;
      if (!user?.uid) throw new Error("User not authenticated");

      const token = await user.getIdToken();

      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/lessons/${selectedLesson.lessonId}/notes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save notes");
      }

      toast.success("Notes saved successfully!");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error(error.message);
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
                        <button
                          className={`w-full text-left p-3 flex items-center gap-2 hover:bg-gray-50 ${selectedLesson.lessonId === lesson.lessonId
                            ? "bg-blue-50 text-blue-600"
                            : ""
                            }`}
                          onClick={() => handleLessonChange(lesson)}  // Pass the lesson object
                        >
                          <Play size={14} className="flex-shrink-0" />
                          <span className="truncate">{lesson.title}</span>
                          {lesson.duration > 0 && (
                            <span className="ml-auto text-xs text-gray-500">
                              {formatDuration(lesson.duration)}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          ))}

        </div>
      </div>

      {/* Main Player & Notes */}
      <div className="flex-1 p-6 space-y-6">
        <BackToCoursesBtn onClick={() => navigate("/courses")} />

        <VideoPlayer
          videoUrl={currentLesson.videoUrl}
          title={currentLesson.title}
        />

        <NotesSection
          notes={notes}
          setNotes={setNotes}
          onSave={handleSaveNotes}
          isSaving={isSavingNotes}
        />
      </div>
    </div>
  );
};

// 🎥 Video Player Component
// In your CoursePlayer.jsx component, modify the VideoPlayer component:
const VideoPlayer = ({ videoUrl, title }) => {
  // Extract YouTube video ID from various URL formats
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);
  const embedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
    : null;

  if (!embedUrl) {
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden border bg-gray-100 flex items-center justify-center">
        <p>Invalid video URL</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="aspect-video w-full rounded-xl overflow-hidden border">
        <iframe
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    </div>
  );
};

// 📚 Sidebar Component
const LessonListSidebar = ({ lessons, selectedLesson, onLessonSelect, courseTitle }) => (
  <aside className="lg:w-1/4 border-r px-4 py-6 bg-gray-50">
    <h3 className="text-lg font-bold mb-1">{courseTitle}</h3>
    <h4 className="text-sm text-gray-500 mb-4">Chapters</h4>
    <ScrollArea className="h-[calc(100vh-150px)] pr-2">
      <ul className="space-y-2">
        {lessons.map((lesson, index) => (
          <li key={lesson.lessonId}>
            <Button
              variant={index === selectedLesson ? "default" : "ghost"}
              className="w-full justify-start truncate"
              onClick={() => onLessonSelect(index)}
            >
              {index + 1}. {lesson.title}
            </Button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  </aside>
);

// ✍️ Notes Section Component
const NotesSection = ({ notes, setNotes, onSave, isSaving, isLoading }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">Your Notes</h3>
      <Button
        onClick={onSave}
        disabled={isSaving || isLoading}
        size="sm"
      >
        {isSaving ? "Saving..." : "Save Notes"}
      </Button>
    </div>
    {isLoading ? (
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
);


// ⬅️ Back Button Component
const BackToCoursesBtn = ({ onClick }) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onClick}
    className="flex items-center gap-2 mb-4"
  >
    <ChevronLeft size={16} />
    Back to Courses
  </Button>
);

export default CoursePlayer;