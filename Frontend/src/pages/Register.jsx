import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FcGoogle } from "react-icons/fc";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";

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
      });

      const data = response.data;
      sessionStorage.setItem("user", JSON.stringify(data));

      alert(data.alreadyExists ? "Welcome back!" : "Account created!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Google authentication failed:", error);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // TODO: Hook into your backend or Firebase signup logic here
    alert(`Registered as ${role} successfully!`);
    navigate("/dashboard");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  useEffect(() => {
    document.title = "Register | Rural Empowerment";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Register as a {role === "user" ? "User" : "Mentor"}
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
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={formData.name} onChange={handleChange} />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleChange} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="contact">Contact Number</Label>
            <Input id="contact" value={formData.contact} onChange={handleChange} />
            {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={formData.password} onChange={handleChange} />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="text-right text-sm">
            <a href="/forgot-password" className="text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>

          <Button type="submit" className="w-full bg-blue-600 text-white">
            Register as {role === "user" ? "User" : "Mentor"}
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
          Sign in or Sign up with Google
        </Button>

        <div className="text-center text-sm text-gray-600">
          Already a {role}?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in here
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
