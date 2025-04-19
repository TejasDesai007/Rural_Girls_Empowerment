import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FcGoogle } from "react-icons/fc";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";

import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandOnlyfans,
} from "@tabler/icons-react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";

import logo from "../assets/icons/logo.png";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await axios.post("http://localhost:5000/api/auth/google", {
        idToken,
        role,
        contact: formData.contact,
        name: formData.name,
      });

      const data = response.data;
      sessionStorage.setItem("user", JSON.stringify(data));

      // 🟢 If new user (i.e., just registered)
      if (!data.alreadyExists) {
        await addDoc(collection(db, "admin_notifications"), {
          title: `New ${role.charAt(0).toUpperCase() + role.slice(1)} Registered`,
          description: `${formData.name} registered with role "${role}" via Google.`,
          createdAt: serverTimestamp(),
          read: false,
          additionalData: {
            name: formData.name,
            email: user.email,
            contact: formData.contact,
            role,
          },
        });
      }

      alert(data.alreadyExists ? "Welcome back!" : "Account created!");
      navigate("/dashboard");

    } catch (error) {
      console.error("Google authentication failed:", error);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        ...formData,
        role,
      });

      const data = response.data;
      sessionStorage.setItem("user", JSON.stringify(data));
      alert("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        console.error("Registration failed:", err);
        alert("Something went wrong.");
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!emailRegex.test(formData.email)) newErrors.email = "Enter a valid email address.";
    if (!phoneRegex.test(formData.contact)) newErrors.contact = "Enter a valid 10-digit number.";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  useEffect(() => {
    document.title = "Register | Rural Empowerment";
  }, []);

  return (
    <div className="overflow-x-hidden relative flex w-full min-h-screen flex-col items-center justify-center bg-white dark:bg-black">
      <div className="shadow-input mx-auto w-full max-w-md rounded-lg bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="h-16 w-auto" />
        </div>

        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
          Register here
        </h2>

        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Create your account
        </p>

        <div className="flex flex-col mt-5 space-y-4">
          <button
            onClick={handleGoogleAuth}
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            type="button"
          >
            <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              Sign {role} with Google
            </span>
            <BottomGradient />
          </button>
        </div>

        {/* Link to log in */}
        <p className="max-w-sm mt-5 text-sm text-neutral-600 dark:text-neutral-300">
          Already have an account? <u><a href="/login">Log in</a></u>
        </p>
      </div>
    </div>

  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-pink-800 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
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

export default Register;
