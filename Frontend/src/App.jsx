// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CoursePlayer from "./pages/CoursePlayer";
import MentorMatch from "./pages/MentorMatch";
import Toolkit from "./pages/Toolkit";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ChatAssistant from "./pages/ChatAssistant";
import EntrepreneurToolkit from "./pages/EntrepreneurToolkit";

import About from "./pages/About";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<CoursePlayer />} />
        <Route path="/mentor-match" element={<MentorMatch />} />
        <Route path="/toolkit" element={<Toolkit />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/chat-assistant" element={<ChatAssistant />} />
        <Route path="/entrepreneur-toolkit" element={<EntrepreneurToolkit />} />
        <Route path="/about" element={<About />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
