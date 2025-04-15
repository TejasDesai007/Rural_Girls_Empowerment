import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  BookOpen,
  Users,
  Wrench,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { onAuthChange, logout } from "../services/authService";

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthChange(setUser); // Sets the user when auth state changes
    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  const handleLogout = async () => {
    await logout(); // Calls the logout function from authService
    navigate("/"); // Redirect to home page after logging out
  };

  const links = [
    { name: "My Courses", icon: <BookOpen className="w-5 h-5" />, path: "/courses" },
    { name: "My Mentors", icon: <Users className="w-5 h-5" />, path: "/mentorship" },
    { name: "Toolkit", icon: <Wrench className="w-5 h-5" />, path: "/toolkit" },
    { name: "Settings", icon: <Settings className="w-5 h-5" />, path: "/settings" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-gray-200 shadow-sm px-4 py-6 space-y-6 sticky top-0">
      {/* Profile */}
      <div className="flex flex-col items-center">
        <Avatar className="h-16 w-16 ring-2 ring-purple-500 shadow-md animate-fade-in">
          <AvatarImage src={user?.photoURL} alt={user?.displayName} />
          <AvatarFallback>
            {user?.displayName?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <h2 className="mt-3 text-lg font-semibold text-gray-800">{user?.displayName || "Guest"}</h2>
        <p className="text-sm text-gray-500">{user?.email || "guest@example.com"}</p>
      </div>

      <Separator />

      {/* Navigation Links */}
      <nav className="flex flex-col gap-3">
        {links.map((link) => (
          <Tooltip key={link.name}>
            <TooltipTrigger asChild>
              <Link
                to={link.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-purple-100 hover:text-purple-800 ${
                  location.pathname === link.path
                    ? "bg-purple-100 text-purple-800 font-semibold"
                    : "text-gray-700"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{link.name}</TooltipContent>
          </Tooltip>
        ))}
      </nav>

      <Separator />

      {/* Logout Button */}
      <div className="mt-auto">
        <Button
          variant="destructive"
          className="w-full flex items-center gap-2"
          onClick={handleLogout} // Calls handleLogout on click
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
