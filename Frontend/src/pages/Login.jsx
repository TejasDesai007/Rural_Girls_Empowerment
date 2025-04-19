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
  IconBrandOnlyfans,
} from "@tabler/icons-react";

import logo from "../assets/icons/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("user");

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
        { idToken },
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
  }, []);

  return (
    <div className="overflow-x-hidden relative flex w-full min-h-auto flex-col items-center justify-center bg-white dark:bg-black">
      <div className="flex items-center justify-center mt-20 mb-20 min-h-auto w-full bg-white dark:bg-black px-4">
        <div className="shadow-input w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
          {/* Logo + App name */}
          <div className="mb-4 flex flex-col items-center">
            <img src={logo} alt="Logo" className="h-10 w-10 mb-2" />
            <h1 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">Rural Empowerment</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Helping women grow, one step at a time.</p>
          </div>

          {/* Divider */}
          <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

          {/* Login Title */}
          <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">Login</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            Sign in with your Google account to continue.
          </p>

          <form className="my-8" onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleGoogleAuth}
                type="button"
                className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
              >
                <FcGoogle className="h-4 w-4" />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Sign in with Google
                </span>
                <BottomGradient />
              </button>
            </div>

            <p className="max-w-sm mt-5 text-sm text-neutral-600 dark:text-neutral-300">
              Don't have an account? <u><a href="/register">Sign Up</a></u>
            </p>
          </form>

          {/* Footer Note */}
          <p className="text-xs text-center text-neutral-400 dark:text-neutral-600">
            Empowering rural women through tech 💪
          </p>
        </div>
      </div>


    </div>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span
        className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span
        className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

export default Login;