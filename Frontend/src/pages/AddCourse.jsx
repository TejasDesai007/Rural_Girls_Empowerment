import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";
import { Upload, Book, Video, Image, Tag, BarChart, Plus } from "lucide-react";

const AddCourse = () => {
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
  const [loading, setLoading] = useState(true);

  const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];
  const availableTags = ["Business", "Technology", "Design", "Marketing", "Development", "Skills"];
  const [moduleInput, setModuleInput] = useState("");
  const [lessonInput, setLessonInput] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [selectedModule, setSelectedModule] = useState(null);
  const [lessonVideo, setLessonVideo] = useState(null);
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          toast.error("Please login to create courses");
          navigate("/login");
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error("Authentication error:", error);
        toast.error(error.message || "Authentication failed");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

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
      toast.error("Module title cannot be empty");
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
      toast.error("Lesson title cannot be empty");
      return;
    }

    if (!lessonVideo) {
      toast.error("Please upload a video for the lesson");
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
    
    if (!courseData.title || !courseData.description || !courseData.category || !courseData.difficulty) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!courseData.thumbnail) {
      toast.error("Please upload a course thumbnail");
      return;
    }
    
    if (courseData.modules.length === 0) {
      toast.error("Please add at least one module to your course");
      return;
    }
    
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

      // Upload preview video if exists
      let previewVideoUrl = null;
      if (courseData.previewVideo) {
        previewVideoUrl = await uploadToCloudinary(courseData.previewVideo, 'video');
      }
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
        createdBy: user.uid,
        creator: {
          name: user.displayName || null,
          email: user.email || null,
        },
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <motion.div 
          className="h-20 w-20 rounded-full border-4 border-pink-400 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 text-gray-900">
      <PageHeader />
      <div className="max-w-5xl mx-auto px-4 py-12">
        {isUploading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-xl shadow-2xl w-96 border border-pink-100"
            >
              <h3 className="text-xl font-bold text-pink-600 mb-4">Uploading Course Content</h3>
              <div className="w-full bg-pink-100 rounded-full h-3 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-gray-600">{uploadProgress}% complete</p>
              
              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">Please don't close this window while upload is in progress</p>
              </div>
            </motion.div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Course Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-pink-100 bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-pink-600">Course Details</CardTitle>
                <CardDescription>
                  Provide the basic information about your course
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Course Title</Label>
                    <Input
                      name="title"
                      value={courseData.title}
                      onChange={handleCourseChange}
                      required
                      className="border-pink-200 focus-visible:ring-pink-400"
                      placeholder="Enter a descriptive title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Category</Label>
                    <Input
                      name="category"
                      value={courseData.category}
                      onChange={handleCourseChange}
                      required
                      className="border-pink-200 focus-visible:ring-pink-400"
                      placeholder="e.g. Business, Technology"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Difficulty Level</Label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {difficultyLevels.map(level => {
                      const isSelected = courseData.difficulty === level;
                      const difficultyColorClass = level === "Beginner" 
                        ? "from-green-500 to-green-600" 
                        : level === "Intermediate" 
                          ? "from-blue-500 to-blue-600" 
                          : "from-purple-500 to-purple-600";
                      
                      return (
                        <Button
                          key={level}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className={`${isSelected 
                            ? `bg-gradient-to-r ${difficultyColorClass} border-0 text-white` 
                            : "border-pink-200 text-gray-700 hover:text-pink-600 hover:bg-pink-50"}`}
                          onClick={() => setCourseData(prev => ({ ...prev, difficulty: level }))}
                        >
                          <BarChart className={`h-4 w-4 mr-2 ${isSelected ? "text-white" : "text-pink-400"}`} />
                          {level}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={courseData.tags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer px-3 py-1 text-sm ${
                          courseData.tags.includes(tag)
                            ? "bg-pink-100 text-pink-600 hover:bg-pink-200"
                            : "bg-white text-gray-600 hover:bg-pink-50 border-pink-200"
                        }`}
                        onClick={() => handleTagToggle(tag)}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Description</Label>
                  <Textarea
                    name="description"
                    value={courseData.description}
                    onChange={handleCourseChange}
                    placeholder="Describe your course in detail"
                    className="min-h-32 border-pink-200 focus-visible:ring-pink-400"
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Course Preview Video</Label>
                    <div className="border-2 border-dashed border-pink-200 rounded-lg p-4 transition-colors hover:border-pink-400">
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={handlePreviewVideoChange}
                        className="border-0 p-0 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-100 file:text-pink-600 hover:file:bg-pink-200"
                      />
                      <div className="flex items-center justify-center mt-4">
                        <Video className="h-6 w-6 text-pink-400 mr-2" />
                        <span className="text-sm text-gray-500">Optional: Add a preview video to showcase your course</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700">Course Thumbnail</Label>
                    <div className="border-2 border-dashed border-pink-200 rounded-lg p-4 transition-colors hover:border-pink-400">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleThumbnailChange}
                        className="border-0 p-0 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-100 file:text-pink-600 hover:file:bg-pink-200"
                      />
                      {courseData.thumbnail ? (
                        <div className="mt-4 relative">
                          <img
                            src={URL.createObjectURL(courseData.thumbnail)}
                            alt="Thumbnail Preview"
                            className="h-32 w-full object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-md"></div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center mt-4">
                          <Image className="h-6 w-6 text-pink-400 mr-2" />
                          <span className="text-sm text-gray-500">Upload an image that represents your course</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Modules & Lessons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card className="border-pink-100 bg-white/90 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-pink-600">Modules & Lessons</CardTitle>
                <CardDescription>
                  Structure your course content into modules and lessons
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-pink-50/50 p-4 rounded-lg border border-pink-100">
                  <div className="flex gap-4">
                    <Input
                      placeholder="Enter module title..."
                      value={moduleInput}
                      onChange={(e) => setModuleInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault() && addModule()}
                      className="border-pink-200 focus-visible:ring-pink-400"
                    />
                    <Button 
                      type="button" 
                      onClick={addModule}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Module
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {courseData.modules.length > 0 ? (
                    courseData.modules.map((mod, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="border border-pink-100 rounded-xl p-5 space-y-5 bg-white/70 shadow-sm hover:shadow-md transition-shadow duration-300"
                      >
                        <h3 className="font-bold text-lg text-pink-600 flex items-center">
                          <Book className="h-5 w-5 mr-2 text-pink-500" />
                          Module {index + 1}: {mod.title}
                        </h3>

                        <div className="space-y-4 bg-pink-50/70 p-4 rounded-lg border border-pink-100">
                          <div className="flex flex-col md:flex-row gap-4">
                            <Input
                              placeholder="Lesson title..."
                              value={selectedModule === index ? lessonInput : ""}
                              onChange={(e) => {
                                setSelectedModule(index);
                                setLessonInput(e.target.value);
                              }}
                              className="border-pink-200 focus-visible:ring-pink-400"
                            />
                          </div>
                          <div>
                            <Textarea
                              placeholder="Lesson description..."
                              value={selectedModule === index ? lessonDescription : ""}
                              onChange={(e) => {
                                setSelectedModule(index);
                                setLessonDescription(e.target.value);
                              }}
                              className="min-h-24 border-pink-200 focus-visible:ring-pink-400"
                            />
                          </div>
                          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="flex-grow">
                              <Input
                                type="file"
                                accept="video/*"
                                ref={lessonVideoInputRef}
                                onChange={(e) => {
                                  setSelectedModule(index);
                                  setLessonVideo(e.target.files[0]);
                                }}
                                className="border-0 p-0 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-100 file:text-pink-600 hover:file:bg-pink-200"
                              />
                            </div>
                            <Button 
                              type="button" 
                              onClick={addLesson}
                              className="bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
                            >
                              <Video className="h-4 w-4 mr-2" /> Add Lesson
                            </Button>
                          </div>
                        </div>

                        {mod.lessons.length > 0 && (
                          <div className="space-y-3 mt-4">
                            <h4 className="font-medium text-gray-700">Lessons:</h4>
                            {mod.lessons.map((lesson, idx) => (
                              <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05, duration: 0.3 }}
                                className="border border-pink-100 p-4 rounded-md hover:bg-pink-50/50 transition-colors duration-200 bg-white/70"
                              >
                                <div className="font-medium text-pink-600">Lesson {idx + 1}: {lesson.title}</div>
                                {lesson.description && (
                                  <p className="text-sm text-gray-600 mt-2">{lesson.description}</p>
                                )}
                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                  <Video className="h-3 w-3 mr-1 text-pink-400" />
                                  {lesson.video.name}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white/70 rounded-xl border border-pink-100">
                      <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-pink-50 flex items-center justify-center">
                        <Book className="h-8 w-8 text-pink-300" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-800 mb-2">No modules yet</h3>
                      <p className="text-gray-600 mb-6">Add your first module to structure your course content</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            className="flex justify-end pt-6 pb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Button 
              type="submit"
              disabled={isUploading}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl px-8 py-6 text-lg"
            >
              <Upload className="h-5 w-5 mr-2" />
              {isUploading ? 'Publishing...' : 'Save & Publish Course'}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

const PageHeader = () => (
  <motion.section 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="w-full py-16 bg-gradient-to-r from-pink-100 via-purple-100 to-pink-50 text-center relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
    <div className="relative z-10">
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600"
      >
        Create New Course
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="mt-4 text-gray-700 max-w-2xl mx-auto"
      >
        Share your knowledge and empower rural entrepreneurs with valuable skills and resources
      </motion.p>
    </div>
    <motion.div 
      className="absolute -bottom-12 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.8 }}
    ></motion.div>
  </motion.section>
);

export default AddCourse;