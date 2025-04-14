// src/pages/CoursePlayer.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CoursePlayer = () => {
  const navigate = useNavigate();
  const [selectedLesson, setSelectedLesson] = useState(0);
  const [notes, setNotes] = useState("");

  const lessons = [
    { title: "Introduction to Business", videoUrl: "https://www.youtube.com/embed/z2B1XP9mIr4" },
    { title: "Market Research", videoUrl: "https://www.youtube.com/embed/1M2iP-yy1rA" },
    { title: "Managing Finances", videoUrl: "https://www.youtube.com/embed/gN0OH_xk4IU" },
  ];

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

        <VideoPlayer videoUrl={lessons[selectedLesson].videoUrl} title={lessons[selectedLesson].title} />

        <NotesSection notes={notes} setNotes={setNotes} />
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
