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
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [variant, setVariant] = useState("guest");
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const notificationRef = useRef(null);

  // Auth state management with proper synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Get role from session storage or default to "user"
        const currentRole = sessionStorage.getItem("role") || "user";
        
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: currentRole,
        };
        
        // Update state first
        setUser(userData);
        setVariant(currentRole);
        
        // Then update session storage
        sessionStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("role", currentRole);
      } else {
        // Clear everything when logged out
        setUser(null);
        setVariant("guest");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("role");
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

  // Add click outside handler for notifications dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleLogout = async () => {
    try {
      // First clear session storage
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("role");
      
      // Then sign out from Firebase
      await signOut(auth);
      
      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getLinksByVariant = () => {
    // Common home link for all roles
    const homeLink = { 
      name: "Home", 
      path: "/", 
      type: "simple" 
    };
    
    // Explore dropdown configuration - can customize per role
    const exploreDropdown = {
      name: "Explore",
      type: "dropdown",
      items: [
        { name: "Courses", path: "/courses" },
        { name: "Mentorship", path: "/mentor-match" },
        { name: "Toolkits", path: "/toolkit" },
        { name: "Assistant", path: "/chat-assistant" },
        { name: "Entrepreneur Tools", path: "/entrepreneur-toolkit" }
      ]
    };
    
    // Base links available to all logged-in users (user role)
    const userLinks = [
      homeLink,
      exploreDropdown,
      // Add any other links for normal users here
    ];
    
    // Links for mentors (includes all user links plus mentor-specific ones)
    const mentorLinks = [
      ...userLinks,
      { name: "Add Course", path: "/addcourse", type: "simple" }
    ];
    
    // Links for admins
    const adminLinks = [
      { name: "Dashboard", path: "/admin-panel", type: "simple" },
      exploreDropdown,
      { name: "User Management", path: "/user-management", type: "simple" },
      { name: "Add Course", path: "/addcourse", type: "simple" }
      // Any other admin-specific links
    ];
    
    // Guest links (for non-logged-in users)
    const guestLinks = [
      homeLink,
      exploreDropdown
    ];

    switch (variant) {
      case "admin":
        return adminLinks;
      case "mentor":
        return mentorLinks;
      case "user":
        return userLinks;
      default:
        return guestLinks;
    }
  };

  const roleLinks = getLinksByVariant();

  // Helper component for Notifications (shared by desktop & mobile)
  const NotificationDropdown = (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
      <div className="p-3 font-semibold text-gray-700 border-b border-gray-200 text-sm">
        Notifications
      </div>
      {loadingNotifications ? (
        <div className="p-4 text-center text-gray-500">Loading...</div>
      ) : unreadNotifications.length > 0 ? (
        <>
          <div className="max-h-72 overflow-y-auto">
            {unreadNotifications.map((notif) => (
              <div key={notif.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                <p className="text-sm text-gray-800">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(notif.timestamp.seconds * 1000).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-gray-200 flex justify-between items-center">
            <Button variant="link" size="sm" onClick={markNotificationsAsRead} disabled={unreadNotifications.length === 0}>
              Mark all as read
            </Button>
            <Button variant="link" size="sm" onClick={() => { navigate("/mentor-notification"); setIsNotificationOpen(false); }}>
              See All
            </Button>
          </div>
        </>
      ) : (
        <div className="p-4 text-center text-gray-500 text-sm">
          No unread notifications.
          <div className="mt-2">
            <Button variant="outline" size="sm" className="w-full" onClick={() => { navigate("/mentor-notification"); setIsNotificationOpen(false); }}>
              See All Notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Render link based on its type (simple link or dropdown)
  const renderNavLink = (link) => {
    if (link.type === "simple") {
      return (
        <Link 
          key={link.name} 
          to={link.path} 
          className="text-gray-700 hover:text-purple-600 font-medium text-sm"
        >
          {link.name}
        </Link>
      );
    } else if (link.type === "dropdown") {
      return (
        <DropdownMenu key={link.name}>
          <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 hover:text-purple-600 font-medium text-sm outline-none focus:ring-0">
            {link.name}
            <ChevronDown className="w-4 h-4 mt-0.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {link.items.map((item) => (
              <DropdownMenuItem key={item.name} asChild>
                <Link to={item.path}>{item.name}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return null;
  };

  // Render mobile nav link based on its type
  const renderMobileNavLink = (link) => {
    if (link.type === "simple") {
      return (
        <Link 
          key={link.name} 
          to={link.path} 
          className="text-gray-700 hover:text-purple-600"
        >
          {link.name}
        </Link>
      );
    } else if (link.type === "dropdown") {
      return (
        <div key={link.name} className="space-y-2">
          <div className="text-sm text-gray-600 font-semibold">{link.name}</div>
          <div className="flex flex-col gap-2 ml-2">
            {link.items.map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                className="text-gray-700 hover:text-purple-600"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

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
          {roleLinks.map(link => renderNavLink(link))}
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

                <div className="flex flex-col gap-4">
                  {roleLinks.map(link => renderMobileNavLink(link))}
                </div>

                <div className="border-t pt-4 mt-4 flex flex-col gap-3">
                  {variant === "guest" ? (
                    <>
                      <Button variant="outline" onClick={() => navigate("/register")}>Register</Button>
                      <Button onClick={() => navigate("/login")}>Login</Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => navigate("/my-profile")}>Profile</Button>
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