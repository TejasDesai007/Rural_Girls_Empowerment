import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import logo from "../assets/icons/logo.png";

// Firebase Imports
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set user state based on auth status
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase logout
      setUser(null); // Clear user state
      navigate("/"); // Redirect to home
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { name: "Home", path: "/" }, // Change this to root path
    { name: "Courses", path: "/courses" },
    { name: "Mentorship", path: "/mentor-match" }, // Updated route to "/mentor-match"
    { name: "Toolkits", path: "/toolkit" },
    { name: "Assistant", path: "/chat-assistant" }, // Updated route to "/chat-assistant"
    { name: "Entrepreneur Tools", path: "/entrepreneur-toolkit" }, // Updated route to "/entrepreneur-toolkit"
  ];

  return (
    <nav className="w-full sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-10 w-10 rounded-full animate-pulse" />
          <span className="text-xl font-bold tracking-wide text-purple-700 hover:text-purple-900 transition-all">
            EmpowerHer
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-gray-700 hover:text-purple-600 transition font-medium text-sm tracking-wide"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <Button variant="outline" onClick={() => navigate("/register")}>
                Register
              </Button>
              <Button onClick={() => navigate("/login")}>Login</Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
              <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
                Logout
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger>
              <Menu className="h-6 w-6 text-gray-700 hover:text-purple-600" />
            </SheetTrigger>
            <SheetContent className="bg-white">
              <div className="flex flex-col gap-4 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-gray-800 hover:text-purple-600 transition font-medium"
                  >
                    {link.name}
                  </Link>
                ))}
                <hr className="border-t border-gray-300 my-3" />
                {!user ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </Button>
                    <Button onClick={() => navigate("/register")}>
                      Register
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                    >
                      Dashboard
                    </Button>
                    <Button
                      onClick={handleLogout}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
