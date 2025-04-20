"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import logo from "../assets/icons/logo.png";
import { requestForToken, onMessageListener } from "../services/notificationService";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const navigate = useNavigate();
  const exploreMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Function to update user's FCM token in Firestore
  const updateUserToken = async (userId, token) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        fcmToken: token,
        tokenUpdatedAt: new Date()
      });
      console.log("FCM token updated successfully");
    } catch (error) {
      console.error("Error updating FCM token:", error);
    }
  };

  // Function to fetch user notifications from Firestore
  const fetchUserNotifications = async (userId) => {
    try {
      const notificationsRef = collection(db, "notifications");
      const q = query(notificationsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const userNotifications = [];
      let unreadCount = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userNotifications.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        });
        if (!data.read) unreadCount++;
      });
      
      // Sort by timestamp (newest first)
      userNotifications.sort((a, b) => b.timestamp - a.timestamp);
      
      setNotifications(userNotifications);
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    // Auth state change handler
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
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

          // Initialize notifications only when we have a valid user
          initializeNotifications(userData.uid);
        } catch (error) {
          console.error("Error fetching user role:", error);
          // Default to "user" role if there's an error
          setVariant("user");
        }
      } else {
        // Clear everything when logged out
        setUser(null);
        setVariant("guest");
        setNotifications([]);
        setNotificationCount(0);

        // Clear session storage
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("role");
      }
    });

    // Notification initialization function
    const initializeNotifications = async (userId) => {
      try {
        // Request notification permission and get token
        const token = await requestForToken();
        if (token) {
          await updateUserToken(userId, token);
        }

        // Fetch existing notifications from database
        await fetchUserNotifications(userId);

        // Set up message listener
        const messageUnsubscribe = onMessageListener().then((payload) => {
          console.log("Message received. ", payload);
          setNotificationCount(prev => prev + 1);
          setNotifications(prev => [
            {
              id: Date.now().toString(),
              title: payload?.notification?.title || "New Notification",
              message: payload?.notification?.body || "You have a new message",
              link: payload?.data?.link || "#",
              read: false,
              timestamp: new Date()
            },
            ...prev
          ]);
        });

        return messageUnsubscribe;
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    };

    // Handle page reload - get data from session storage first
    const storedUserJSON = sessionStorage.getItem("user");
    const storedRole = sessionStorage.getItem("role");

    if (storedUserJSON && storedRole) {
      try {
        const storedUser = JSON.parse(storedUserJSON);
        setUser(storedUser);
        setVariant(storedRole);

        // Initialize notifications for stored user
        initializeNotifications(storedUser.uid);
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
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      unsubscribeAuth();
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
          {
            name: "Career",
            link: "/career",
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
              name: "Manage",
              dropdown: true,
              items: [
                {
                  name: "Add Toolkits",
                  link: "/add-toolkit",
                },
                {
                  name: "Career",
                  link: "/career",
                },
                {
                  name: "Requests",
                  link: "/mentor-requests",
                },
              ],
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
            link: "/add-toolkit",
          },
          {
            name: "Career",
            link: "/career",
          },
        ];
        default:
          return [
            {
              name: "Home",
              link: "/",
            },
            {
              name: "Explore",
              dropdown: true,
              items: [
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
                  name: "Entrepreneur Tools",
                  link: "/Entrepreneurship",
                },
              ],
            },
            {
              name: "AI Assistant",
              link: "/chat-assistant",
            },
          ];
        
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
  };

  // Function to toggle notification dropdown
  const toggleNotificationDropdown = () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen && notificationCount > 0) {
      setNotificationCount(0); // Reset counter when dropdown is opened
    }
  };

  return (
    <div className="relative w-full sticky top-0 z-50 bg-transparent dark:bg-neutral-900">
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
            {navItems.map((item, idx) =>
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
            )}
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
                {/* Notification Bell Icon with Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={toggleNotificationDropdown}
                    className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 hover:scale-110 transform relative"
                    aria-label="Notifications"
                  >
                    {/* Bell Icon */}
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
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {notificationCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-72 md:w-96 bg-white dark:bg-neutral-800 rounded-md shadow-lg z-50 animate-fadeIn overflow-hidden">
                      <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                        <h3 className="font-medium text-neutral-800 dark:text-white">Notifications</h3>
                        <button 
                          onClick={navigateToNotifications}
                          className="text-sm text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
                        >
                          View All
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 5).map((notification) => (
                            <Link
                              key={notification.id}
                              to={notification.link || "#"}
                              onClick={() => setIsNotificationOpen(false)}
                              className="block px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200 border-b border-neutral-100 dark:border-neutral-700"
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 mt-1">
                                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                </div>
                                <div className="ml-3 flex-1">
                                  <p className="text-sm font-medium text-neutral-800 dark:text-white">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-neutral-400 mt-1">
                                    {new Date(notification.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-sm text-neutral-500 dark:text-neutral-400">
                            No notifications yet
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
              <>
                <Link
                  to={variant === "admin" ? "/admin-notification" : variant === "mentor" ? "/mentor-notification" : "/user-notification"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                >
                  Notifications
                  {notificationCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {notificationCount}
                    </span>
                  )}
                </Link>
              </>
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
          50% { opacity: 0.5; }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}