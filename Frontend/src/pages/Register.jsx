import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FcGoogle } from "react-icons/fc";
import { auth, provider } from "../firebase";
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandOnlyfans,
  IconUser,
  IconBriefcase,
  IconHeartHandshake,
} from "@tabler/icons-react";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import logo from "../assets/icons/logo.png";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { toast } from "react-hot-toast";

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
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save user data to Firestore
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name: user.displayName || formData.name,
        email: user.email,
        contact: formData.contact,
        role,
        createdAt: serverTimestamp(),
      });

      // Add admin notification
      await addDoc(collection(db, "admin_notifications"), {
        title: `New ${role.charAt(0).toUpperCase() + role.slice(1)} Registered`,
        description: `${user.displayName || formData.name} registered with role "${role}" via Google.`,
        createdAt: serverTimestamp(),
        read: false,
        additionalData: {
          name: user.displayName || formData.name,
          email: user.email,
          contact: formData.contact,
          role,
        },
      });

      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Google authentication failed:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: formData.name,
      });

      // Save additional user data to Firestore
      await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
        role,
        createdAt: serverTimestamp(),
      });

      // Add admin notification
      await addDoc(collection(db, "admin_notifications"), {
        title: `New ${role.charAt(0).toUpperCase() + role.slice(1)} Registered`,
        description: `${formData.name} registered with role "${role}".`,
        createdAt: serverTimestamp(),
        read: false,
        additionalData: {
          name: formData.name,
          email: formData.email,
          contact: formData.contact,
          role,
        },
      });

      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
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
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex w-full min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-black overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-200 dark:bg-purple-900 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-200 dark:bg-pink-900 rounded-full opacity-20 blur-3xl"></div>
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

          <h2 className="text-2xl font-bold text-center text-neutral-800 dark:text-neutral-200 mb-1">
            Join Rural Empowerment
          </h2>

          <p className="text-center mb-6 text-neutral-600 dark:text-neutral-400">
            Empower communities, create change
          </p>

          {/* Role selection */}
          <div className="mb-6">
            <ToggleGroup 
              type="single" 
              value={role} 
              onValueChange={setRole}
              className="grid grid-cols-2 gap-2"
            >
              <ToggleGroupItem value="user" className="flex-col h-16 gap-2">
                <IconUser className="h-5 w-5" />
                <span>Community Member</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="entrepreneur" className="flex-col h-16 gap-2">
                <IconBriefcase className="h-5 w-5" />
                <span>Entrepreneur</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <LabelInputContainer>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="contact">Phone Number</Label>
              <Input
                id="contact"
                type="tel"
                placeholder="Enter your 10-digit phone number"
                value={formData.contact}
                onChange={handleChange}
                className={errors.contact ? "border-red-500" : ""}
              />
              {errors.contact && <p className="text-red-500 text-xs">{errors.contact}</p>}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
            </LabelInputContainer>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-700"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 dark:bg-black/50 px-2 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              onClick={handleGoogleAuth}
              className="group/btn relative flex h-12 w-full items-center justify-center space-x-2 rounded-lg bg-white px-4 font-medium text-black shadow-md transition-all hover:shadow-lg dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              type="button"
              disabled={loading}
            >
              <IconBrandGoogle className="h-5 w-5 text-neutral-800 dark:text-neutral-300" />
              <span className="text-sm">Sign up with Google</span>
              <BottomGradient />
            </button>
          </div>

          {/* Benefits section */}
          <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-6">
            <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-3">
              Benefits of joining:
            </h3>
            <ul className="text-xs space-y-2 text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start">
                <div className="mr-2 h-4 w-4 text-purple-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Connect with rural communities and make a meaningful impact</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 h-4 w-4 text-purple-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Access to exclusive resources and collaborative opportunities</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 h-4 w-4 text-purple-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Participate in community development initiatives</span>
              </li>
            </ul>
          </div>

          {/* Link to log in */}
          <p className="max-w-sm mt-6 text-sm text-center text-neutral-600 dark:text-neutral-400">
            Already have an account?{" "}
            <a href="/login" className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors">
              Log in
            </a>
          </p>
        </div>

        {/* Testimonial */}
        <div className="mt-4 mx-auto max-w-md px-4 py-3 bg-white/70 dark:bg-black/30 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-gray-800 shadow-md">
          <p className="text-xs italic text-gray-600 dark:text-gray-400">
            "Joining Rural Empowerment has allowed our NGO to connect with communities that truly need our services. The platform has been instrumental in our growth."
          </p>
          <p className="text-xs font-medium mt-1 text-right text-gray-700 dark:text-gray-300">
            — Priya S., Community Leader
          </p>
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

export default Register;