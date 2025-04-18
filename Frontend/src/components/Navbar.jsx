import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown } from "lucide-react";
import logo from "../assets/icons/logo.png";

import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const storedRole = sessionStorage.getItem("role") || "user";
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: storedRole,
        };
        setUser(userData);
        sessionStorage.setItem("user", JSON.stringify(userData));
      } else {
        setUser(null);
        sessionStorage.removeItem("user");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const currentLinks = {
    guest: [],
    user: [
      { name: "My Profile", path: "/my-profile" },
      { name: "Notifications", path: "/mentor-notification" },
    ],
    mentor: [
      { name: "Add Course", path: "/addcourse" },
      { name: "My Profile", path: "/my-profile" },
      { name: "Notifications", path: "/mentor-notification" },
    ],
    admin: [
      { name: "Dashboard", path: "/admin-panel" },
      { name: "User Management", path: "/user-management" },
      { name: "Add Course", path: "/addcourse" },
      { name: "My Profile", path: "/my-profile" },
    ],
  }[user?.role || "guest"];

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
          <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium text-sm">Home</Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 hover:text-purple-600 font-medium text-sm">
              Explore
              <ChevronDown className="w-4 h-4 mt-0.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild><Link to="/courses">Courses</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/mentor-match">Mentorship</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/toolkit">Toolkits</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/chat-assistant">Assistant</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/entrepreneur-toolkit">Entrepreneur Tools</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {currentLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-gray-700 hover:text-purple-600 font-medium text-sm"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <Button variant="outline" onClick={() => navigate("/register")}>Register</Button>
              <Button onClick={() => navigate("/login")}>Login</Button>
            </>
          ) : (
            <>
              <div className="text-sm text-gray-600 mr-2">
                {user.displayName || user.email}
              </div>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>Dashboard</Button>
              <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">Logout</Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger>
              <Menu className="h-6 w-6 text-gray-700 hover:text-purple-600" />
            </SheetTrigger>
            <SheetContent className="bg-white">
              <div className="flex flex-col gap-4 mt-6">
                <Link to="/" className="text-gray-800 hover:text-purple-600 font-medium">Home</Link>
                <hr className="border-gray-300" />
                <p className="text-sm font-semibold text-gray-500">Explore</p>
                <Link to="/courses" className="text-gray-800 hover:text-purple-600">Courses</Link>
                <Link to="/mentor-match" className="text-gray-800 hover:text-purple-600">Mentorship</Link>
                <Link to="/toolkit" className="text-gray-800 hover:text-purple-600">Toolkits</Link>
                <Link to="/chat-assistant" className="text-gray-800 hover:text-purple-600">Assistant</Link>
                <Link to="/entrepreneur-toolkit" className="text-gray-800 hover:text-purple-600">Entrepreneur Tools</Link>
                {currentLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-gray-800 hover:text-purple-600"
                  >
                    {link.name}
                  </Link>
                ))}
                <hr className="border-gray-300" />
                {!user ? (
                  <>
                    <Button variant="outline" onClick={() => navigate("/login")}>Login</Button>
                    <Button onClick={() => navigate("/register")}>Register</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => navigate("/dashboard")}>Dashboard</Button>
                    <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">Logout</Button>
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
