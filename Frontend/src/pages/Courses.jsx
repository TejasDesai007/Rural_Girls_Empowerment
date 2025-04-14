// src/pages/Courses.jsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Placeholder data
  const courses = [
    { title: "Basic Sewing", category: "Skills", level: "Beginner" },
    { title: "Digital Literacy", category: "Tech", level: "Intermediate" },
    { title: "Starting a Small Business", category: "Business", level: "Beginner" },
  ];

  // Filtered course list
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PageHeader />
      <div className="flex flex-col lg:flex-row gap-6 px-6 py-10 max-w-7xl mx-auto">
        <CategorySidebar />
        <div className="flex-1">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <CourseGrid courses={filteredCourses} />
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

const CategorySidebar = () => {
  const categories = ["All", "Skills", "Tech", "Business"];
  const levels = ["Beginner", "Intermediate", "Advanced"];

  return (
    <aside className="lg:w-1/4 bg-gray-50 border p-4 rounded-xl">
      <h3 className="font-semibold mb-2">Categories</h3>
      <ul className="space-y-2 mb-6">
        {categories.map((cat) => (
          <li key={cat}>
            <Button variant="ghost" className="w-full justify-start">{cat}</Button>
          </li>
        ))}
      </ul>
      <h3 className="font-semibold mb-2">Difficulty</h3>
      <ul className="space-y-2">
        {levels.map((lvl) => (
          <li key={lvl}>
            <Button variant="ghost" className="w-full justify-start">{lvl}</Button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

const CourseGrid = ({ courses }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {courses.map((course, index) => (
      <CourseCard key={index} course={course} />
    ))}
  </div>
);

// 🧩 Placeholder for Member 2’s CourseCard component
const CourseCard = ({ course }) => (
  <Card className="hover:shadow-md transition">
    <CardHeader>
      <CardTitle>{course.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-600">Category: {course.category}</p>
      <p className="text-sm text-gray-600">Level: {course.level}</p>
    </CardContent>
  </Card>
);

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
