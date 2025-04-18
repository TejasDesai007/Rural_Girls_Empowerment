// src/pages/Courses.jsx
// npm install react-hot-toast --f
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";


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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
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
            <div className="text-center py-10">
              <p className="text-lg text-gray-600">No courses found matching your criteria</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const PageHeader = () => (
  <section className="w-full py-10 bg-pink-100 text-center">
    <h1 className="text-4xl font-bold">Browse Learning Modules</h1>
    <p className="mt-2 text-gray-700">Explore curated courses to grow your skills and knowledge.</p>
  </section>
);

const SearchBar = ({ searchTerm, setSearchTerm }) => (
  <div className="mb-6">
    <Input
      type="text"
      placeholder="Search courses..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full max-w-md border-gray-300"
    />
  </div>
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
    <aside className="lg:w-1/4 bg-gray-50 border p-4 rounded-xl h-fit sticky top-6">
      <h3 className="font-semibold mb-2">Categories</h3>
      <ul className="space-y-2 mb-6">
        {categories.map((cat) => (
          <li key={cat}>
            <Button
              variant={selectedCategory === cat ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          </li>
        ))}
      </ul>
      <h3 className="font-semibold mb-2">Difficulty</h3>
      <ul className="space-y-2">
        {difficulties.map((difficulty) => (
          <li key={difficulty}>
            <Button
              variant={selectedDifficulty === difficulty ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedDifficulty(difficulty)}
            >
              {difficulty}
            </Button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

const CourseGrid = ({ courses }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {courses.map((course) => (
      <CourseCard key={course.id} course={course} />
    ))}
  </div>
);

const CourseCard = ({ course }) => {
  const totalLessons = course.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0;
  const date = course.createdAt?._seconds
    ? new Date(course.createdAt._seconds * 1000).toLocaleDateString()
    : '';

  // Enhanced creator display logic
  const renderCreator = () => {
    if (course.creator) {
      return (
        <p className="mt-2">
          <span className="font-medium">Created by:</span> {course.creator.name || course.creator.email}
        </p>
      );
    }

    if (course.createdBy) {
      return (
        <p className="mt-2 text-gray-500">
          <span className="font-medium">Creator ID:</span> {course.createdBy.substring(0, 6)}...
        </p>
      );
    }

    return null;
  };

  return (
    <Card className="hover:shadow-md transition h-full flex flex-col">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnailUrl || "https://via.placeholder.com/300x200"}
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="outline">{course.category}</Badge>
          {course.difficulty && <Badge variant="outline">{course.difficulty}</Badge>}
         
        </div>
        <div className="text-sm text-gray-600">
          <p>Modules: {course.modules?.length || 0}</p>
          <p>Lessons: {totalLessons}</p>
          {date && <p>Created: {date}</p>}
          {renderCreator()}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/courses/${course.id}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const Footer = () => (
  <footer className="px-6 py-8 bg-white border-t text-center text-sm text-gray-500 mt-10">
    <div className="flex justify-center gap-6 mb-2">
      <a href="#contact" className="hover:underline">Contact</a>
      <a href="#about" className="hover:underline">About</a>
      <a href="#socials" className="hover:underline">Socials</a>
    </div>
    <p>© 2025 Rural Empower. All rights reserved.</p>
  </footer>
);

export default Courses;