// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CoursePlayer from "./pages/CoursePlayer";
import MentorMatch from "./pages/MentorMatch";
import Toolkit from "./pages/Toolkit";
import Register from "./pages/Register";
import ChatAssistant from "./pages/ChatAssistant";
import EntrepreneurToolkit from "./pages/EntrepreneurToolkit";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<CoursePlayer />} />
        <Route path="/mentor-match" element={<MentorMatch />} />
        <Route path="/toolkit" element={<Toolkit />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat-assistant" element={<ChatAssistant />} />
        <Route path="/entrepreneur-toolkit" element={<EntrepreneurToolkit />} />
      </Routes>
    </Router>
  );
}

export default App;
