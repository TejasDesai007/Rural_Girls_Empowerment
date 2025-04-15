// src/pages/CoursePlayer.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft } from "lucide-react";
import { getAuth } from "firebase/auth";
import { toast } from "react-hot-toast";

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const [selectedLesson, setSelectedLesson] = useState(0);
  const [notes, setNotes] = useState("");
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const token = await user.getIdToken();
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to fetch course");

        setCourse(data.data.course);
        setLessons(data.data.lessons);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error(error.message);
        navigate("/courses");
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleSaveNotes = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const token = await user.getIdToken();
      const currentLesson = lessons[selectedLesson];

      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/lessons/${currentLesson.lessonId}/notes`,
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes })
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save notes");

      toast.success("Notes saved successfully!");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <LessonListSidebar
        lessons={lessons}
        selectedLesson={selectedLesson}
        setSelectedLesson={setSelectedLesson}
      />

      {/* Main Player & Notes */}
      <div className="flex-1 p-6 space-y-6">
        <BackToCoursesBtn onClick={() => navigate("/courses")} />

        <VideoPlayer
          videoUrl={lessons[selectedLesson].videoUrl}
          title={lessons[selectedLesson].title}
        />

        <NotesSection
          notes={notes}
          setNotes={setNotes}
          onSave={handleSaveNotes}
        />
      </div>
    </div>
  );
};

// 🎥 Video Player
const VideoPlayer = ({ videoUrl, title }) => (
  <div>
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <div className="aspect-video w-full rounded-xl overflow-hidden border">
      <iframe
        src={videoUrl}
        title={title}
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </div>
  </div>
);

// 📚 Sidebar
const LessonListSidebar = ({ lessons, selectedLesson, setSelectedLesson }) => (
  <aside className="lg:w-1/4 border-r px-4 py-6 bg-gray-50">
    <h3 className="text-lg font-bold mb-4">Chapters</h3>
    <ScrollArea className="h-[calc(100vh-100px)] pr-2">
      <ul className="space-y-2">
        {lessons.map((lesson, index) => (
          <li key={index}>
            <Button
              variant={index === selectedLesson ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedLesson(index)}
            >
              {lesson.title}
            </Button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  </aside>
);

// ✍️ Notes Section
const NotesSection = ({ notes, setNotes }) => (
  <div>
    <h3 className="text-lg font-semibold mb-2">Your Notes</h3>
    <Textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      placeholder="Write down your thoughts..."
      className="w-full min-h-[150px]"
    />
  </div>
);

// ⬅️ Back Button
const BackToCoursesBtn = ({ onClick }) => (
  <Button variant="outline" size="sm" onClick={onClick} className="flex items-center gap-2">
    <ChevronLeft size={16} />
    Back to Courses
  </Button>
);

export default CoursePlayer;
