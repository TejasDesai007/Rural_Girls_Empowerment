import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FcGoogle } from "react-icons/fc";
import { auth, provider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await axios.post("http://localhost:5000/api/auth/login", {
        idToken,
        role,
      });

      const data = response.data;
      sessionStorage.setItem("user", JSON.stringify(data));
      alert("Login successful!");
      navigate("/dashboard");
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

      const response = await axios.post("http://localhost:5000/api/auth/google", {
        idToken,
        role,
      });

      const data = response.data;
      sessionStorage.setItem("user", JSON.stringify(data));
      alert("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  useEffect(() => {
    document.title = "Login | Rural Empowerment";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Log in as a {role === "user" ? "User" : "Mentor"}
        </h2>

        <ToggleGroup
          type="single"
          value={role}
          onValueChange={(val) => val && setRole(val)}
          className="flex justify-center gap-4"
        >
          <ToggleGroupItem value="user" className="px-4 py-2 rounded-xl">
            User
          </ToggleGroupItem>
          <ToggleGroupItem value="mentor" className="px-4 py-2 rounded-xl">
            Mentor
          </ToggleGroupItem>
        </ToggleGroup>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleChange} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={formData.password} onChange={handleChange} />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          <div className="text-right text-sm">
            <a href="/forgot-password" className="text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>

          <Button type="submit" className="w-full bg-blue-600 text-white">
            Log in as {role === "user" ? "User" : "Mentor"}
          </Button>
        </form>

        <div className="relative text-center text-sm text-gray-500">
          <span className="bg-white px-2">OR</span>
          <div className="border-t mt-2" />
        </div>

        <Button
          onClick={handleGoogleAuth}
          className="w-full gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
        >
          <FcGoogle size={20} />
          Sign in with Google
        </Button>

        <div className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
