import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Menu, Bell, ChevronDown } from "lucide-react";
import logo from "../assets/icons/logo.png";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "../firebase";
import { collection, query, where, getDocs, writeBatch, doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [variant, setVariant] = useState("guest");
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const notificationRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user role from database based on email
          const userRole = await fetchUserRole(firebaseUser.email);

          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: userRole,
          };

          setUser(userData);
          setVariant(userRole);
        } catch (error) {
          console.error("Error fetching user role:", error);
          // Default to "user" role if there's an error
          setVariant("user");
        }
      } else {
        // Clear everything when logged out
        setUser(null);
        setVariant("guest");
        setUnreadNotifications([]);
        setIsNotificationOpen(false);
      }
    });

    // Handle page reload - get data from session storage first
    const storedUserJSON = sessionStorage.getItem("user");
    const storedRole = sessionStorage.getItem("role");

    if (storedUserJSON && storedRole) {
      try {
        const storedUser = JSON.parse(storedUserJSON);
        setUser(storedUser);
        setVariant(storedRole);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        // Clear invalid data
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("role");
      }
    }

    return () => unsubscribe();
  }, []);

  // Function to fetch user role from database
  const fetchUserRole = async (email) => {
    try {
      // First try to find the user in the 'users' collection
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // User found in users collection
        const userData = querySnapshot.docs[0].data();
        return userData.role || "user"; // Default to "user" if role is not specified
      }

      // If not found in users collection, check admin collection
      const adminsRef = collection(db, "admins");
      const adminQuery = query(adminsRef, where("email", "==", email));
      const adminSnapshot = await getDocs(adminQuery);

      if (!adminSnapshot.empty) {
        return "admin";
      }

      // If not found in admins, check mentors collection
      const mentorsRef = collection(db, "mentors");
      const mentorQuery = query(mentorsRef, where("email", "==", email));
      const mentorSnapshot = await getDocs(mentorQuery);

      if (!mentorSnapshot.empty) {
        return "mentor";
      }

      // If no role is found in any collection, default to "user"
      return "user";
    } catch (error) {
      console.error("Error fetching user role:", error);
      return "user"; // Default role
    }
  };

  const fetchUnreadNotifications = async () => {
    if (!user || loadingNotifications) return;
    setLoadingNotifications(true);

    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("userId", "==", user.uid), where("read", "==", false));

    try {
      const querySnapshot = await getDocs(q);
      const unreadNotificationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })).sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
      setUnreadNotifications(unreadNotificationsData);
    } catch (error) {
      console.error("Error fetching notifications: ", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchUnreadNotifications();
    }
  }, [user]);

  const handleNotificationToggle = () => {
    const nextState = !isNotificationOpen;
    setIsNotificationOpen(nextState);
    if (nextState && user) {
      fetchUnreadNotifications();
    }
  };

  const markNotificationsAsRead = async () => {
    if (!user || unreadNotifications.length === 0) return;

    const batch = writeBatch(db);
    unreadNotifications.forEach(notification => {
      const notificationRef = doc(db, "notifications", notification.id);
      batch.update(notificationRef, { read: true });
    });

    try {
      await batch.commit();
      setUnreadNotifications([]);
    } catch (error) {
      console.error("Error marking notifications as read: ", error);
    }
  };

  // Function to navigate to the appropriate notification page based on user role
  const navigateToNotifications = () => {
    if (variant === "mentor" || variant === "admin") {
      navigate("/mentor-notification");
    } else {
      navigate("/user-notification");
    }
    setIsNotificationOpen(false);
  };

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);

      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const currentLinks = {
    guest: [],
    user: [
      { name: "Dashboard", path: "/user-dashboard" },
      { name: "My Profile", path: "/my-profile" },
      { name: "Notifications", path: "/user-notification" },
    ],
    mentor: [
      { name: "Dashboard", path: "/mentor-dashboard" },
      { name: "Add Course", path: "/addcourse" },
      { name: "My Profile", path: "/my-profile" },
      { name: "notification", path: "/mentor-notification" },
      { name: "Add ToolKits", path: "/addtoolkit" },
    ],
    admin: [
      { name: "Dashboard", path: "/admin-panel" },
      { name: "User Management", path: "/user-management" },
      { name: "Add Course", path: "/addcourse" },
      { name: "My Profile", path: "/my-profile" },
      { name: "Notifications", path: "/notification" },
      { name: "Add ToolKits", path: "/addtoolkit" },
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
              <DropdownMenuItem asChild><Link to="/Entrepreneurship">Entrepreneur Tools</Link></DropdownMenuItem>
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

        {/* Right-side buttons */}
        <div className="hidden md:flex items-center gap-4">
          {variant === "guest" ? (
            <>
              <Button variant="outline" onClick={() => navigate("/register")}>Register</Button>
              <Button onClick={() => navigate("/login")}>Login</Button>
            </>
          ) : (
            <>
              {/* Avatar */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/my-profile")}
                  className="rounded-full bg-purple-100 h-8 w-8 flex items-center justify-center"
                >
                  <span className="text-purple-700 font-medium">
                    {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                </Button>
                <div className="absolute opacity-0 group-hover:opacity-100 z-10 -left-12 top-full mt-2 p-2 bg-white shadow-lg rounded-lg w-36 text-center text-sm transition-opacity">
                  {user?.displayName || user?.email}
                </div>
              </div>

              {/* Notification - Desktop version with dropdown */}
              <div className="relative" ref={notificationRef}>
                <button onClick={handleNotificationToggle} className="relative p-1">
                  <Bell className="h-6 w-6 text-gray-700 hover:text-purple-600" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>
                {isNotificationOpen && NotificationDropdown}
              </div>

              <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">Logout</Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <img src={logo} alt="Logo" className="h-8 w-8 rounded-full" />
                    <span className="text-xl font-bold tracking-wide text-purple-700">
                      EmpowerHer
                    </span>
                  </div>

                  {user && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="bg-purple-100 rounded-full h-8 w-8 flex items-center justify-center">
                        <span className="text-purple-700 font-medium">
                          {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.displayName || user?.email}</span>
                        <span className="text-xs text-gray-500 capitalize">{variant}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Links */}
                <div className="py-4 px-3 flex-1 overflow-y-auto">
                  <div className="space-y-6">
                    {roleLinks.map(link => {
                      if (link.type === "simple") {
                        // Check if this link matches the current path
                        const isActive = window.location.pathname === link.path;
                        return (
                          <Link
                            key={link.name}
                            to={link.path}
                            className={`flex items-center py-2 px-3 rounded-md transition-colors ${isActive
                                ? "bg-purple-100 text-purple-700 font-medium"
                                : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                              }`}
                          >
                            {link.name}
                            {isActive && (
                              <div className="ml-auto w-1.5 h-5 bg-purple-500 rounded-full"></div>
                            )}
                          </Link>
                        );
                      } else if (link.type === "dropdown") {
                        return (
                          <div key={link.name} className="space-y-1">
                            <div className="px-3 text-sm font-medium text-gray-900">
                              {link.name}
                            </div>
                            <div className="mt-1 pl-3 border-l-2 border-gray-200">
                              {link.items.map((item) => {
                                // Check if this dropdown item matches the current path
                                const isActive = window.location.pathname === item.path;
                                return (
                                  <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center py-2 px-3 text-sm transition-colors ${isActive
                                        ? "text-purple-700 font-medium"
                                        : "text-gray-600 hover:text-purple-700"
                                      }`}
                                  >
                                    {item.name}
                                    {isActive && (
                                      <div className="ml-auto w-1.5 h-4 bg-purple-500 rounded-full"></div>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}

               

                {/* Footer Actions */}
                <div className="border-t p-4 bg-gray-50">
                  {variant === "guest" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" onClick={() => navigate("/register")} className="w-full">Register</Button>
                      <Button onClick={() => navigate("/login")} className="w-full">Login</Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Mobile notification button - Direct navigation */}
                      <Button
                        onClick={navigateToNotifications}
                        className={`w-full flex items-center justify-center gap-2 ${
                          window.location.pathname.includes("notification") 
                            ? "bg-purple-100 border-purple-300" 
                            : "bg-purple-600 hover:bg-purple-700 text-white"
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                        Notifications
                        {unreadNotifications.length > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadNotifications.length}
                          </span>
                        )}
                      </Button>
                      <Button onClick={handleLogout} variant="destructive" className="w-full">Logout</Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}