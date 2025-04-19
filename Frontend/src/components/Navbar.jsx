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

              {/* Notification */}
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

            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col gap-4 py-6">
                <Link to="/" className="text-lg font-semibold text-purple-700 hover:text-purple-900">
                  EmpowerHer
                </Link>

                {user && (
                  <div className="text-sm text-gray-500 font-medium">
                    Role: {variant}
                  </div>
                )}

               

                <div className="border-t pt-4 mt-4 flex flex-col gap-3">
                  {variant === "guest" ? (
                    <>
                      <Button variant="outline" onClick={() => navigate("/register")}>Register</Button>
                      <Button onClick={() => navigate("/login")}>Login</Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => navigate("/my-profile")}>Profile</Button>
                      <Button onClick={() => navigateToNotifications}>Notifications</Button>
                      <Button onClick={handleLogout} variant="destructive">Logout</Button>
                    </>
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