import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge"; // For displaying selected tags
import { Navigate } from "react-router-dom";


export default function AddCourse() {
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "", // Added difficulty level
    tags: [], // Added tags array
    thumbnail: null,
    videoLink: "",
    modules: [],
  });

  const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];
  const availableTags = ["Business", "Technology", "Design", "Marketing", "Development", "Skills"];
  const [moduleInput, setModuleInput] = useState("");
  const [lessonInput, setLessonInput] = useState("");
  const [selectedModule, setSelectedModule] = useState(null);

  const handleTagToggle = (tag) => {
    setCourseData(prev => {
      if (prev.tags.includes(tag)) {
        return {
          ...prev,
          tags: prev.tags.filter(t => t !== tag)
        };
      } else {
        return {
          ...prev,
          tags: [...prev.tags, tag]
        };
      }
    });
  };

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setCourseData((prev) => ({ ...prev, thumbnail: file }));
  };

  const addModule = () => {
    if (!moduleInput.trim()) {
      toast.warning("Module title cannot be empty");
      return;
    }

    const newModule = {
      title: moduleInput.trim(),
      lessons: [],
    };

    setCourseData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));

    setModuleInput("");
    toast.success("Module added successfully");
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
    e.preventDefault();
    const {
      title,
      description,
      category,
      difficulty,
      tags,
      videoLink,
      thumbnail,
      modules
    } = courseData;

    // Basic validation
    if (!title.trim() || !description.trim() || !category.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!thumbnail) {
      toast.error("Please upload a thumbnail image");
      return;
    }

    if (modules.length === 0) {
      toast.error("Please add at least one module");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("difficulty", difficulty);
      formData.append("tags", JSON.stringify(tags)); // Convert array to JSON string
      formData.append("videoLink", videoLink);
      formData.append("thumbnail", thumbnail);
      formData.append("modules", JSON.stringify(modules));

      const res = await fetch("http://localhost:5000/api/courses/addCourse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save course");
      }

      toast.success("Course added successfully!");
      setCourseData({
        title: "",
        description: "",
        category: "",
        difficulty: "",
        tags: [],
        thumbnail: null,
        videoLink: "",
        modules: [],
      });
      Navigate("/courses");
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.message || "Failed to add course. Please try again.");
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
            {/* Difficulty Level Selection */}
            <div>
              <Label>Difficulty Level</Label>
              <div className="flex gap-4 mt-2">
                {difficultyLevels.map(level => (
                  <Button
                    key={level}
                    type="button"
                    variant={courseData.difficulty === level ? "default" : "outline"}
                    onClick={() => setCourseData(prev => ({ ...prev, difficulty: level }))}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={courseData.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="mt-2">
                {courseData.tags.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {courseData.tags.join(", ")}
                  </p>
                )}
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
                onKeyDown={(e) => e.key === 'Enter' && addModule()}
              />
              <Button type="button" onClick={addModule}>
                Add Module
              </Button>
            </div>

            <div className="space-y-4">
              {courseData.modules.length > 0 ? (
                courseData.modules.map((mod, index) => (
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
                        onKeyDown={(e) => e.key === 'Enter' && addLesson()}
                      />
                      <Button type="button" onClick={addLesson}>
                        Add Lesson
                      </Button>
                    </div>
                    {mod.lessons.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {mod.lessons.map((lesson, idx) => (
                          <li key={idx}>{lesson}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No modules added yet</p>
              )}
            </div>
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
