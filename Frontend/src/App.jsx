// src/App.jsx
import React from "react";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CoursePlayer from "./pages/CoursePlayer";
import MentorMatch from "./pages/MentorMatch";
import Toolkit from "./pages/Toolkit";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ChatAssistant from "./pages/ChatAssistant";

import Footer from "./pages/Footer";

import About from "./pages/About";
import PrivacyTerms from "./pages/PrivacyTerms";
import Navbar from "./components/Navbar";
import DownloadFile from "./pages/testCloudinary";

// Admin imports
import AdminPanel from "./pages/AdminPanel";
import UserManagement from "./pages/UserManagement";
import Reports from "./pages/Reports";
import AddCourse from "./pages/AddCourse";
import MyProfile from "./pages/MyProfile";
import AddToolkit from "./pages/AddToolkit";
import ProductDetails from "./pages/entrepreneur/ProductsDetails";

import Entrepreneurship from "./pages/entrepreneur/Entrepreneurship";
import Checkout from "./pages/entrepreneur/Checkout";
import PaymentMethodPage from "./pages/entrepreneur/PaymentMethod";
import AdminNotification from "./pages/AdminNotification";



//Mentor imports
import MentorNotification from "./pages/MentorNotification";
import MentorRequests from "./pages/MentorRequests";
import MentorDashboard from "./pages/MentorDashboard";

//User imports
import UserNotification from "./pages/UserNotification";
import UserDashboard from "./pages/UserDashboard";


//Career import
import CareerPage from "./pages/CareerPage";

//Google translate API widget
import CustomTranslator from "./components/GoogleTranslateWidget";

function App() {
  const [variant, setVariant] = useState("guest");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const storedRole = sessionStorage.getItem("role");
        if (storedRole === "admin") {
          setVariant("admin");
        } else if (storedRole === "mentor") {
          setVariant("mentor");
        } else {
          setVariant("user");
        }
      } else {
        setVariant("guest");
      }
    });

    return () => unsubscribe();
  }, []);


  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <CustomTranslator />
        <Navbar variant={variant} />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CoursePlayer />} />
            <Route path="/mentor-match" element={<MentorMatch />} />
            <Route path="/testCloud" element={<DownloadFile />} />


            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            <Route path="/chat-assistant" element={<ChatAssistant />} />

            <Route path="/about" element={<About />} />
            <Route path="/privacy-terms" element={<PrivacyTerms />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/addtoolkit" element={<AddToolkit />} />
            <Route path="/toolkit" element={<Toolkit />} />
            <Route path="/Entrepreneurship" element={<Entrepreneurship />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-method" element={<PaymentMethodPage />} />




            {/* Admin Routes */}
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/addcourse" element={<AddCourse />} />
            <Route path="/add-toolkit" element={<AddToolkit />} />
            <Route path="/admin-notification" element={<AdminNotification />} />

            {/* Notifications */}
            <Route path="/mentor-notification" element={<MentorNotification />} />
            <Route path="/mentor-requests" element={<MentorRequests />} />
            <Route path="/mentor-dashboard" element={<MentorDashboard />} />

            {/* User Routes */}
            <Route path="/user-notification" element={<UserNotification />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />

            {/* Career Routes */}
            <Route path="/career" element={<CareerPage />} />


          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}
export default App;