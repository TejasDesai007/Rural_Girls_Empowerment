// src/pages/Courses.jsx
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { Search, Book, Star, Clock, User } from "lucide-react";

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setLoading(true);

        if (!user) {
          toast.error("Please login to view courses");
          navigate("/login");
          return;
        }

        const token = await user.getIdToken();
        const response = await fetch("http://localhost:5000/api/courses/getCourses", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch courses");
        }

        const result = await response.json();
        setCourses(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error(error.message || "Failed to load courses");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  // Get unique categories from courses
  const defaultCategories = ["Business", "Technology", "Design", "Marketing", "Development", "Skills"];
  const categories = ["All", ...new Set([...defaultCategories, ...courses.map(course => course.category).filter(Boolean)])];
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  const filteredCourses = courses.filter(course => {
    const title = course.title || '';
    const category = course.category || '';
    const difficulty = course.difficulty || '';

    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "All" || difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

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
      <div className="flex flex-col lg:flex-row gap-6 px-6 py-10 max-w-7xl mx-auto">
        <CategorySidebar
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          difficulties={difficulties}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
        />
        <div className="flex-1">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          {filteredCourses.length > 0 ? (
            <CourseGrid courses={filteredCourses} />
          ) : (
            <EmptyState setSearchTerm={setSearchTerm} setSelectedCategory={setSelectedCategory} setSelectedDifficulty={setSelectedDifficulty} />
          )}
        </div>
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
        Browse Learning Modules
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="mt-4 text-gray-700 max-w-2xl mx-auto"
      >
        Explore curated courses designed to empower rural entrepreneurs with essential skills and knowledge
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

const SearchBar = ({ searchTerm, setSearchTerm }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mb-8 relative"
  >
    <div className="relative max-w-md mx-auto">
      <Input
        type="text"
        placeholder="Search courses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border-pink-200 border-2 rounded-full bg-white/70 backdrop-blur-sm focus-visible:ring-pink-400 shadow-md"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400 h-5 w-5" />
    </div>
  </motion.div>
);

const CategorySidebar = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  difficulties,
  selectedDifficulty,
  setSelectedDifficulty
}) => {
  return (
    <motion.aside 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="lg:w-1/4 bg-white/80 backdrop-blur-sm border border-pink-100 p-6 rounded-2xl shadow-lg h-fit sticky top-6"
    >
      <h3 className="font-bold mb-4 text-pink-600 text-lg">Categories</h3>
      <ul className="space-y-2 mb-8">
        {categories.map((cat, index) => (
          <motion.li 
            key={cat}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
          >
            <Button
              variant={selectedCategory === cat ? "default" : "ghost"}
              className={`w-full justify-start text-left ${
                selectedCategory === cat 
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white" 
                  : "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          </motion.li>
        ))}
      </ul>
      
      <h3 className="font-bold mb-4 text-pink-600 text-lg">Difficulty</h3>
      <ul className="space-y-2">
        {difficulties.map((difficulty, index) => (
          <motion.li 
            key={difficulty}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
          >
            <Button
              variant={selectedDifficulty === difficulty ? "default" : "ghost"}
              className={`w-full justify-start text-left ${
                selectedDifficulty === difficulty 
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white" 
                  : "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
              }`}
              onClick={() => setSelectedDifficulty(difficulty)}
            >
              {difficulty}
            </Button>
          </motion.li>
        ))}
      </ul>
    </motion.aside>
  );
};

const CourseGrid = ({ courses }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
  >
    {courses.map((course, index) => (
      <CourseCard key={course.id} course={course} index={index} />
    ))}
  </motion.div>
);

const CourseCard = ({ course, index }) => {
  const totalLessons = course.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0;
  const date = course.createdAt?._seconds
    ? new Date(course.createdAt._seconds * 1000).toLocaleDateString()
    : '';

  // Enhanced creator display logic
  const renderCreator = () => {
    if (course.creator) {
      return (
        <div className="flex items-center gap-2 mt-3">
          <User className="h-4 w-4 text-pink-400" />
          <span className="text-gray-600 text-sm">{course.creator.name || course.creator.email}</span>
        </div>
      );
    }

    if (course.createdBy) {
      return (
        <div className="flex items-center gap-2 mt-3">
          <User className="h-4 w-4 text-pink-400" />
          <span className="text-gray-500 text-sm">ID: {course.createdBy.substring(0, 6)}...</span>
        </div>
      );
    }

    return null;
  };

  // Determine difficulty color
  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return "bg-gray-100 text-gray-600";
    
    switch(difficulty.toLowerCase()) {
      case 'beginner':
        return "bg-green-100 text-green-700 border-green-200";
      case 'intermediate':
        return "bg-blue-100 text-blue-700 border-blue-200";
      case 'advanced':
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl border-pink-100 bg-white/90 backdrop-blur-sm h-full flex flex-col transform hover:-translate-y-1">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnailUrl || "https://via.placeholder.com/300x200"}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="absolute right-2 top-2">
            <Badge className={`${getDifficultyColor(course.difficulty)}`}>
              {course.difficulty || "All Levels"}
            </Badge>
          </div>
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold group-hover:text-pink-600 transition-colors duration-300">
            {course.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-gray-600">
            {course.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow pt-0">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100 transition-colors duration-300">
              {course.category}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Book className="h-4 w-4 text-pink-400" />
              <span className="text-gray-600">Modules: {course.modules?.length || 0}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-pink-400" />
              <span className="text-gray-600">Lessons: {totalLessons}</span>
            </div>
            
            {date && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-pink-400" />
                <span className="text-gray-600">Created: {date}</span>
              </div>
            )}
            
            {renderCreator()}
          </div>
        </CardContent>
        
        <CardFooter className="pt-2">
          <Button 
            asChild 
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Link to={`/courses/${course.id}`}>
              <span className="flex items-center justify-center gap-2">
                View Course
                <motion.span 
                  animate={{ x: [0, 4, 0] }} 
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                >
                  →
                </motion.span>
              </span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const EmptyState = ({ setSearchTerm, setSelectedCategory, setSelectedDifficulty }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="text-center py-16 px-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-pink-100 shadow-lg"
  >
    <div className="mx-auto w-24 h-24 mb-6 rounded-full bg-pink-50 flex items-center justify-center">
      <Search className="h-10 w-10 text-pink-300" />
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-2">No courses found</h3>
    <p className="text-lg text-gray-600 mb-6">We couldn't find any courses matching your current filters</p>
    <Button
      variant="outline"
      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
      onClick={() => {
        setSearchTerm("");
        setSelectedCategory("All");
        setSelectedDifficulty("All");
      }}
    >
      Clear all filters
    </Button>
  </motion.div>
);

export default Courses;