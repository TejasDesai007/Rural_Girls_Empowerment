import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { signInWithGoogle } from "../services/authService";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

const Register = () => {
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      console.error("Google signup failed:", error);
    }
  };

  useEffect(() => {
    document.title = "Register | Rural Empowerment";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create Your Account
        </h2>

        <Button
          onClick={handleGoogleSignup}
          className="w-full gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
        >
          <FcGoogle size={20} />
          Sign up with Google
        </Button>

        <p className="text-sm text-center mt-6 text-gray-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
