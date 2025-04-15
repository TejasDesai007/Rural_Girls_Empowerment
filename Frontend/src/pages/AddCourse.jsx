import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // ✅ correctly used
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AddCourse() {
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    thumbnail: null,
    videoLink: "",
    modules: [],
  });

  const [moduleInput, setModuleInput] = useState("");
  const [lessonInput, setLessonInput] = useState("");
  const [selectedModule, setSelectedModule] = useState(null);

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setCourseData((prev) => ({ ...prev, thumbnail: file }));
  };

  const addModule = () => {
    if (!moduleInput.trim()) return;
    const newModule = {
      title: moduleInput,
      lessons: [],
    };
    setCourseData((prev) => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }));
    setModuleInput("");
  };

  const addLesson = () => {
    if (!lessonInput.trim() || selectedModule === null) return;

    const updatedModules = courseData.modules.map((mod, index) =>
      index === selectedModule
        ? { ...mod, lessons: [...mod.lessons, lessonInput] }
        : mod
    );

    setCourseData((prev) => ({ ...prev, modules: updatedModules }));
    setLessonInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission before validation
    const { title, description, category, videoLink, thumbnail, modules } = courseData;

    // Basic field validation
    if (!title.trim() || !description.trim() || !category.trim() || !videoLink.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Validate video link (basic YouTube/Drive check)
    const videoRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|drive\.google\.com)\/.+$/;
    if (!videoRegex.test(videoLink)) {
      toast.error("Please enter a valid YouTube or Google Drive link.");
      return;
    }

    // Validate thumbnail file type
    if (thumbnail) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!allowedTypes.includes(thumbnail.type)) {
        toast.error("Only JPG, PNG, or WEBP images are allowed as thumbnails.");
        return;
      }
    }

    // Optional: ensure at least one module added
    if (modules.length === 0) {
      toast.error("Please add at least one module to the course.");
      return;
    }

    try {
      const { thumbnail, ...dataToSubmit } = courseData;

      const docRef = await addDoc(collection(db, "courses"), {
        ...dataToSubmit,
        createdAt: new Date(),
      });

      toast.success("Course added successfully.");
      setCourseData({
        title: "",
        description: "",
        category: "",
        thumbnail: null,
        videoLink: "",
        modules: [],
      });
    } catch (err) {
      console.error("Error adding course:", err);
      toast.error("Failed to add course.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-purple-700">Add New Course</h1>

      {/* Course Form */}
      <form onSubmit={handleSubmit}> {/* Ensure the form has onSubmit */}
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Title</Label>
                <Input
                  name="title"
                  value={courseData.title}
                  onChange={handleCourseChange}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  name="category"
                  value={courseData.category}
                  onChange={handleCourseChange}
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={courseData.description}
                onChange={handleCourseChange}
              />
            </div>

            <div>
              <Label>Video Link</Label>
              <Input
                name="videoLink"
                value={courseData.videoLink}
                onChange={handleCourseChange}
                placeholder="YouTube/Drive link"
              />
            </div>

            <div>
              <Label>Thumbnail Upload</Label>
              <Input type="file" onChange={handleThumbnailChange} />
              {courseData.thumbnail && (
                <img
                  src={URL.createObjectURL(courseData.thumbnail)}
                  alt="Thumbnail Preview"
                  className="h-32 mt-2 rounded-md border"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Module & Lessons */}
        <Card>
          <CardHeader>
            <CardTitle>Modules & Lessons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Module Title"
                value={moduleInput}
                onChange={(e) => setModuleInput(e.target.value)}
              />
              <Button onClick={addModule}>Add Module</Button>
            </div>

            {courseData.modules.map((mod, index) => (
              <div key={index} className="border rounded-md p-4 space-y-2">
                <h3 className="font-semibold text-lg">
                  {index + 1}. {mod.title}
                </h3>
                <div className="flex gap-4 items-center">
                  <Input
                    placeholder="Lesson Title"
                    value={selectedModule === index ? lessonInput : ""}
                    onChange={(e) => {
                      setSelectedModule(index);
                      setLessonInput(e.target.value);
                    }}
                  />
                  <Button onClick={addLesson}>Add Lesson</Button>
                </div>
                {mod.lessons.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {mod.lessons.map((lesson, idx) => (
                      <li key={idx}>{lesson}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
            Save & Publish
          </Button>
        </div>
      </form>
    </div>
  );
}
