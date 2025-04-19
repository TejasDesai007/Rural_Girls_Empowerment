"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { auth, db } from "../firebase";
import logo from "../assets/icons/logo.png";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";

const generateColorFromName = (name) => {
  const colors = ["#7c3aed", "#db2777", "#0ea5e9", "#059669", "#f59e0b", "#ef4444", "#10b981"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};


export default function MainNavbar() {
  const [user, setUser] = useState(null);
  const [variant, setVariant] = useState("guest");
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [loadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const exploreMenuRef = useRef(null);

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

          // Store user data in session storage for page reloads
          sessionStorage.setItem("user", JSON.stringify(userData));
          sessionStorage.setItem("role", userRole);
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

        // Clear session storage
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("role");
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

    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (exploreMenuRef.current && !exploreMenuRef.current.contains(event.target)) {
        setIsExploreOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      unsubscribe();
    };
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
    setIsLoadingNotifications(true);

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
      setIsLoadingNotifications(false);
    }
  };

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchUnreadNotifications();
    }
  }, [user]);

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
    // Route to different notification pages based on user role
    switch (variant) {
      case "admin":
        navigate("/admin-notification");
        break;
      case "mentor":
        navigate("/mentor-notification");
        break;
      case "user":
      default:
        navigate("/user-notification");
        break;
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

  // Define navigation items based on role
  const getNavItems = () => {
    const exploreItems = [
      {
        name: "Courses",
        link: "/courses",
      },
      {
        name: "Mentorship",
        link: "/mentor-match",
      },
      {
        name: "Toolkits",
        link: "/toolkit",
      },
      {
        name: "AI Assistant",
        link: "/chat-assistant",
      },
      {
        name: "Entrepreneur Tools",
        link: "/Entrepreneurship",
      },
    ];

    // Role-specific navigation items
    switch (variant) {
      case "user":
        return [
          {
            name: "User Dashboard",
            link: "/user-dashboard",
          },
          {
            name: "Explore",
            dropdown: true,
            items: exploreItems,
          },
        ];
      case "mentor":
        return [
          {
            name: "Dashboard",
            link: "/mentor-dashboard",
          },
          {
            name: "Explore",
            dropdown: true,
            items: exploreItems,
          },
          {
            name: "Add Toolkits",
            link: "/addtoolkit",
          },
        ];
      case "admin":
        return [
          {
            name: "Admin Dashboard",
            link: "/admin-panel",
          },
          {
            name: "Explore",
            dropdown: true,
            items: exploreItems,
          },
          {
            name: "User Management",
            link: "/user-management",
          },
          {
            name: "Add Course",
            link: "/addcourse",
          },
          {
            name: "Add Toolkits",
            link: "/addtoolkit",
          },
        ];
      default:
        return [
          {
            name: "Home",
            link: "/",
          },
          {
            name: "Courses",
            link: "/courses",
          },
          {
            name: "Mentorship",
            link: "/mentor-match",
          },
          {
            name: "Toolkits",
            link: "/toolkit",
          },
          {
            name: "AI Assistant",
            link: "/chat-assistant",
          },
          {
            name: "Entrepreneur Tools",
            link: "/Entrepreneurship",
          },
        ];
    }
  };

  const navItems = getNavItems();

  // Custom logo component that matches the pasted navbar design
  const CustomNavbarLogo = () => (
    <div className="flex items-center space-x-2 transition-transform duration-300 hover:scale-105">
      <img src={logo} alt="Logo" className="h-8 w-8 rounded-full" />
      <span className="text-lg font-bold tracking-wide text-neutral-800 dark:text-white">
        EmpowerHer
      </span>
    </div>
  );

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo>
            <Link to="/" className="outline-none">
              <CustomNavbarLogo />
            </Link>
          </NavbarLogo>

          {/* Custom navigation with dropdown support */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item, idx) => (
              item.dropdown ? (
                <div key={`dropdown-${idx}`} className="relative" ref={exploreMenuRef}>
                  <button
                    onClick={() => setIsExploreOpen(!isExploreOpen)}
                    className="flex items-center space-x-1 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 font-medium relative group"
                  >
                    <span>{item.name}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform duration-300 ${isExploreOpen ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-neutral-900 dark:bg-white group-hover:w-full transition-all duration-300 ease-in-out"></span>
                  </button>
                  {isExploreOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 rounded-md bg-white dark:bg-neutral-800 shadow-lg z-50 animate-fadeIn">
                      <div className="py-1">
                        {item.items.map((subItem, subIdx) => (
                          <Link
                            key={`submenu-${subIdx}`}
                            to={subItem.link}
                            onClick={() => setIsExploreOpen(false)}
                            className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200 relative overflow-hidden group"
                          >
                            <span className="relative z-10">{subItem.name}</span>
                            <span className="absolute inset-0 bg-neutral-200 dark:bg-neutral-600 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out"></span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={`desktop-link-${idx}`}
                  to={item.link}
                  className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 font-medium relative group"
                >
                  <span>{item.name}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-neutral-900 dark:bg-white group-hover:w-full transition-all duration-300 ease-in-out"></span>
                </Link>
              )
            ))}
          </div>

          <div className="flex items-center gap-4">
            {variant === "guest" ? (
              <>
                <NavbarButton
                  variant="secondary"
                  onClick={() => navigate("/register")}
                  className="transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-0.5"
                >
                  Register
                </NavbarButton>
                <NavbarButton
                  variant="primary"
                  onClick={() => navigate("/login")}
                  className="transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-0.5"
                >
                  Login
                </NavbarButton>
              </>
            ) : (
              <>
                {/* Notification Bell Icon */}
                <div className="relative">
                  <button
                    onClick={navigateToNotifications}
                    className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 hover:scale-110 transform"
                    aria-label="Notifications"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-300 ease-in-out hover:rotate-12"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    {unreadNotifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white animate-pulse">
                        {unreadNotifications.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Profile Icon */}
                <NavbarButton
                  variant="secondary"
                  onClick={() => navigate("/my-profile")}
                  className="transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2">
                    {user?.photoURL && user.photoURL.trim() !== "" ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="h-6 w-6 rounded-full ring-2 ring-transparent hover:ring-pink-500 transition-all duration-300"
                      />
                    ) : (
                      <div
                        className="h-6 w-6 flex items-center justify-center rounded-full text-sm font-medium text-white transition-all duration-300"
                        style={{
                          backgroundColor: generateColorFromName(user?.displayName || user?.email || "User"),
                        }}
                      >
                        {(user?.displayName || user?.email || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <span>{user?.displayName || user?.email?.split('@')[0] || "Profile"}</span>
                  </div>
                </NavbarButton>

                <NavbarButton
                  variant="primary"
                  onClick={handleLogout}
                  className="transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-0.5"
                >
                  Logout
                </NavbarButton>
              </>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo>
              <Link to="/" className="outline-none">
                <CustomNavbarLogo />
              </Link>
            </NavbarLogo>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="transition-transform duration-300"
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            className={`transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          >
            {/* Flatten all menu items for mobile */}
            {navItems.flatMap((item, idx) =>
              item.dropdown
                ? [
                  <div key={`mobile-dropdown-${idx}`} className="px-4 py-2 text-sm font-medium text-neutral-900 dark:text-white">
                    {item.name}
                  </div>,
                  ...item.items.map((subItem, subIdx) => (
                    <Link
                      key={`mobile-submenu-${idx}-${subIdx}`}
                      to={subItem.link}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-8 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                    >
                      {subItem.name}
                    </Link>
                  ))
                ]
                : [
                  <Link
                    key={`mobile-link-${idx}`}
                    to={item.link}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                ]
            )}

            {variant !== "guest" && (
              <Link
                to={variant === "admin" ? "/admin-notification" : variant === "mentor" ? "/mentor-notification" : "/user-notification"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative block px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <span>Notifications</span>
                  {unreadNotifications.length > 0 && (
                    <span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white animate-pulse">
                      {unreadNotifications.length}
                    </span>
                  )}
                </div>
              </Link>
            )}

            <div className="flex w-full flex-col gap-4 px-4 py-2">
              {variant === "guest" ? (
                <>
                  <NavbarButton
                    onClick={() => {
                      navigate("/register");
                      setIsMobileMenuOpen(false);
                    }}
                    variant="secondary"
                    className="w-full transition-all duration-300 ease-in-out hover:shadow-md active:scale-95"
                  >
                    Register
                  </NavbarButton>
                  <NavbarButton
                    onClick={() => {
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                    variant="primary"
                    className="w-full transition-all duration-300 ease-in-out hover:shadow-md active:scale-95"
                  >
                    Login
                  </NavbarButton>
                </>
              ) : (
                <>
                  <NavbarButton
                    onClick={() => {
                      navigate("/my-profile");
                      setIsMobileMenuOpen(false);
                    }}
                    variant="secondary"
                    className="w-full transition-all duration-300 ease-in-out hover:shadow-md active:scale-95"
                  >
                    My Profile
                  </NavbarButton>
                  <NavbarButton
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="primary"
                    className="w-full transition-all duration-300 ease-in-out hover:shadow-md active:scale-95"
                  >
                    Logout
                  </NavbarButton>
                </>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}