import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FcGoogle } from "react-icons/fc";
import { auth, provider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import axios from "axios";

import React from "react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconUser,
  IconHeartHandshake,
  IconBriefcase,
  IconLock,
} from "@tabler/icons-react";

import logo from "../assets/icons/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("user");
  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) newErrors.email = "Enter a valid email address.";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRedirectAfterLogin = (userRole) => {
    // Use the role from the authenticated user data to determine redirect
    const actualRole = userRole || role;
    let from = location.state?.from || "/admin-panel";

    // If the user is not an admin but is being redirected to admin panel,
    // redirect them to an appropriate dashboard based on their role
    if (from === "/admin-panel" && actualRole !== "admin") {
      from = actualRole === "mentor" ? "/mentor-dashboard" : "/user-dashboard";
    }

    const mentorId = location.state?.mentorId;

    if (from === "/mentor-match" && mentorId) {
      navigate(from, { state: { mentorId } });
    } else {
      navigate(from);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
          role,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const data = response.data;
      sessionStorage.setItem("user", JSON.stringify(data));
      sessionStorage.setItem("role", data.role);
      alert(`Welcome ${data.name}`);
      handleRedirectAfterLogin(data.role);
    } catch (err) {
      console.error("Login failed:", err);
      alert("Invalid credentials or user does not exist.");
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await axios.post(
        "http://localhost:5000/api/auth/google",
        { idToken, role },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const data = response.data;

      sessionStorage.setItem("user", JSON.stringify(data));
      sessionStorage.setItem("role", data.role);

      alert(`Welcome ${data.name}!`);
      handleRedirectAfterLogin(data.role);
    } catch (error) {
      console.error("Google sign-in failed:", error);
      alert("Google sign-in failed. Please try again.");
    }
  };

  useEffect(() => {
    document.title = "Login | Rural Empowerment";
    // Animate content visibility on component mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex w-full min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-black overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-200 dark:bg-purple-900 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-200 dark:bg-pink-900 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-300 dark:bg-purple-800 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="shadow-xl backdrop-blur-sm mx-auto w-full max-w-md rounded-xl bg-white/80 p-6 md:p-8 dark:bg-black/50 border border-gray-100 dark:border-gray-800">
          {/* Logo with animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <img src={logo} alt="Logo" className="relative h-20 w-auto drop-shadow-lg" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-neutral-800 dark:text-neutral-200 mb-1">
            Rural Empowerment
          </h1>
          <p className="text-center mb-6 text-neutral-600 dark:text-neutral-400">
            Helping women grow, one step at a time
          </p>

          <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-purple-300 to-transparent dark:via-purple-700 opacity-50" />

          <h2 className="text-xl font-bold text-center text-neutral-800 dark:text-neutral-200 mb-4">
            Welcome Back
          </h2>


          <form className="mt-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Email field - uncomment if needed
              <LabelInputContainer>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="email@example.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </LabelInputContainer>
              */}

              <div className="relative flex items-center justify-center my-6">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                <div className="bg-white/80 dark:bg-black/50 text-sm px-3 text-neutral-500 absolute">Sign in with</div>
              </div>

              <button
                onClick={handleGoogleAuth}
                type="button"
                className="group/btn relative flex h-12 w-full items-center justify-center space-x-2 rounded-lg bg-white px-4 font-medium text-black shadow-md transition-all hover:shadow-lg dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              >
                <IconBrandGoogle className="h-5 w-5 text-neutral-800 dark:text-neutral-300" />
                <span className="text-sm">Google</span>
                <BottomGradient />
              </button>
            </div>
          </form>


          {/* Link to sign up */}
          <p className="max-w-sm mt-6 text-sm text-center text-neutral-600 dark:text-neutral-400">
            Don't have an account?{" "}
            <a href="/register" className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors">
              Sign up
            </a>
          </p>
        </div>

        {/* Floating message */}
        <div className="mt-4 mx-auto max-w-md px-4 py-3 bg-white/70 dark:bg-black/30 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-gray-800 shadow-md">
          <div className="flex items-center">
            <div className="mr-3 flex-shrink-0 bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Login to access your dashboard, track initiatives, and connect with the community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-purple-800 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

export default Login;