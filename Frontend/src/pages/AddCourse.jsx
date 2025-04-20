import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useRef } from "react";

import { motion } from "framer-motion";

export default function AddCourse() {
  const navigate = useNavigate();
  const lessonVideoInputRef = useRef(null);
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    tags: [],
    thumbnail: null,
    previewVideo: null,
    modules: [],
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];
  const availableTags = ["Business", "Technology", "Design", "Marketing", "Development", "Skills"];
  const [moduleInput, setModuleInput] = useState("");
  const [lessonInput, setLessonInput] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [selectedModule, setSelectedModule] = useState(null);
  const [lessonVideo, setLessonVideo] = useState(null);

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

  const handlePreviewVideoChange = (e) => {
    const file = e.target.files[0];
    setCourseData((prev) => ({ ...prev, previewVideo: file }));
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
    if (!lessonInput.trim() || selectedModule === null) {
      toast.warning("Lesson title cannot be empty");
      return;
    }

    if (!lessonVideo) {
      toast.warning("Please upload a video for the lesson");
      return;
    }

    const newLesson = {
      title: lessonInput.trim(),
      description: lessonDescription.trim(),
      video: lessonVideo
    };

    const updatedModules = courseData.modules.map((mod, index) =>
      index === selectedModule
        ? { ...mod, lessons: [...mod.lessons, newLesson] }
        : mod
    );

    setCourseData((prev) => ({ ...prev, modules: updatedModules }));
    setLessonInput("");
    setLessonDescription("");
    setLessonVideo(null);
    if (lessonVideoInputRef.current) {
      lessonVideoInputRef.current.value = "";
    }
    toast.success("Lesson added successfully");
  };

  const uploadToCloudinary = async (file, resourceType = 'auto') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', "ruralEmpowerment");
    formData.append('resource_type', resourceType);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dczpxrdq1/auto/upload`,
        {
          method: 'POST',
          body: formData,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("You must be logged in to create a course");
      }

      // Upload thumbnail
      const thumbnailUrl = await uploadToCloudinary(courseData.thumbnail, 'image');
      setUploadProgress(20);

      // Upload preview video
      const previewVideoUrl = await uploadToCloudinary(courseData.previewVideo, 'video');
      setUploadProgress(40);

      // Upload all lesson videos
      const modulesWithVideoUrls = await Promise.all(
        courseData.modules.map(async (module) => {
          const lessonsWithUrls = await Promise.all(
            module.lessons.map(async (lesson) => {
              const videoUrl = await uploadToCloudinary(lesson.video, 'video');
              return {
                title: lesson.title,
                description: lesson.description,
                videoUrl: videoUrl
              };
            })
          );
          return {
            title: module.title,
            lessons: lessonsWithUrls
          };
        })
      );

      setUploadProgress(90);

      // Create course data for Firebase
      const course = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        difficulty: courseData.difficulty,
        tags: courseData.tags,
        thumbnailUrl,
        previewVideoUrl,
        modules: modulesWithVideoUrls,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        instructorId: user.uid,
        instructorName: user.displayName || "Anonymous",
        studentsEnrolled: 0,
        rating: 0,
        reviewsCount: 0
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, "courses"), course);
      setUploadProgress(100);

      toast.success("Course created successfully!");
      navigate(`/courses/${docRef.id}`);
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error(error.message || "Failed to create course");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-purple-700">Add New Course</h1>

      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-medium mb-4">Uploading Course Content</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-purple-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">{uploadProgress}% complete</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Course Details */}
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
                  required
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  name="category"
                  value={courseData.category}
                  onChange={handleCourseChange}
                  required
                />
              </div>
            </div>

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
              <Label>Video Upload</Label>
              <Input
                type="file"
                accept="video/*"
                onChange={handlePreviewVideoChange}
              />
            </div>

            <div>
              <Label>Thumbnail Upload</Label>
              <Input type="file" accept="image/*" onChange={handleThumbnailChange} />
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

        {/* Modules & Lessons */}
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
                  <div key={index} className="border rounded-md p-4 space-y-4">
                    <h3 className="font-semibold text-lg">
                      {index + 1}. {mod.title}
                    </h3>

                    <div className="space-y-4">
                      <div className="flex gap-4 items-center">
                        <Input
                          placeholder="Lesson Title"
                          value={selectedModule === index ? lessonInput : ""}
                          onChange={(e) => {
                            setSelectedModule(index);
                            setLessonInput(e.target.value);
                          }}
                        />
                      </div>
                      <div>
                        <Textarea
                          placeholder="Lesson Description"
                          value={selectedModule === index ? lessonDescription : ""}
                          onChange={(e) => {
                            setSelectedModule(index);
                            setLessonDescription(e.target.value);
                          }}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="flex gap-4 items-center">
                        <Input
                          type="file"
                          accept="video/*"
                          ref={lessonVideoInputRef}
                          onChange={(e) => {
                            setSelectedModule(index);
                            setLessonVideo(e.target.files[0]);
                          }}
                        />
                        <Button type="button" onClick={addLesson}>
                          Add Lesson
                        </Button>
                      </div>
                    </div>

                    {mod.lessons.length > 0 && (
                      <div className="space-y-2">
                        {mod.lessons.map((lesson, idx) => (
                          <div key={idx} className="border p-3 rounded-md">
                            <div className="font-medium">{idx + 1}. {lesson.title}</div>
                            {lesson.description && (
                              <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No modules added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <motion.button
            type="submit"
            className="mt-5 inline-flex items-center justify-center px-8 py-3 font-semibold text-white bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-700 rounded-2xl shadow-lg"
            initial={{ backgroundPosition: '200% 0%' }}
            whileHover={{
              backgroundPosition: '0% 100%',
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 30,
                duration: 3,
                ease: "easeInOut"
              }
            }}
            style={{
              backgroundSize: '200% 200%',
              backgroundImage: 'linear-gradient(to right, #9b4d96, #4c6eb1, #7f3fb2)',
            }}
          >
            Save & Publish
          </motion.button>
        </div>

      </form>
    </div>
  );
}