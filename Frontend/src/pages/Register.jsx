import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Send the token to the backend for verification
      const response = await axios.post("http://localhost:5000/api/auth/google", {
        idToken,
      });

      const data = response.data;

      // Store user data in sessionStorage
      sessionStorage.setItem("user", JSON.stringify(data));

      // Navigate based on whether the user already exists
      if (data.alreadyExists) {
        // If user exists, redirect to dashboard (or any page)
        alert("Welcome back! Redirecting to your dashboard...");
        navigate("/dashboard");
      } else {
        // If user is new, redirect to the dashboard (or welcome page)
        alert("User created! Redirecting to your dashboard...");
        navigate("/dashboard"); // Or any other desired route
      }
    } catch (error) {
      console.error("Google authentication failed:", error);
    }
  };

  useEffect(() => {
    document.title = "Register | Rural Empowerment";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Sign in or Sign up with Google
        </h2>

        <Button
          onClick={handleGoogleAuth}
          className="w-full gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
        >
          <FcGoogle size={20} />
          Sign in or Sign up with Google
        </Button>

        
      </div>
    </div>
  );
};

export default Register;
