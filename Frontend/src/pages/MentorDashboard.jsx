import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  PlusCircle,
  Layers3,
  Bell,
  Bot,
  Box,
} from "lucide-react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function MentorDashboard() {
  const [mentor, setMentor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && isMounted) {
        // Fetch the user's role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === "mentor") {
            setMentor(user);
          } else {
            navigate("/unauthorized");
          }
        } else {
          navigate("/unauthorized");
        }
      } else {
        navigate("/login");
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  const quickActions = [
    {
      icon: <PlusCircle className="h-6 w-6 text-fuchsia-600" />,
      title: "Add Course",
      description: "Create a new learning course",
      onClick: () => navigate("/addcourse"),
      color: "from-pink-100 to-fuchsia-200"
    },
    {
      icon: <Layers3 className="h-6 w-6 text-purple-600" />,
      title: "Add Toolkit",
      description: "Add new entrepreneurship toolkit",
      onClick: () => navigate("/add-toolkit"),
      color: "from-purple-100 to-fuchsia-200"
    },
    {
      icon: <Bell className="h-6 w-6 text-pink-600" />,
      title: "Mentor Notification",
      description: "View all mentorship requests",
      onClick: () => navigate("/mentor-notification"),
      color: "from-pink-100 to-rose-200"
    },
    {
      icon: <Box className="h-6 w-6 text-violet-600" />,
      title: "Entrepreneurship Toolkit",
      description: "Explore and manage toolkits",
      onClick: () => navigate("/Entrepreneurship"),
      color: "from-violet-100 to-purple-200"
    },
    {
      icon: <Bot className="h-6 w-6 text-indigo-600" />,
      title: "AI Chat Assistant",
      description: "Your AI-powered support system",
      onClick: () => navigate("/chat-assistant"),
      color: "from-indigo-100 to-violet-200"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.3
      } 
    },
    exit: { 
      opacity: 0,
      transition: { staggerChildren: 0.05, staggerDirection: -1 }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        duration: 0.8 
      } 
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 70, 
        damping: 12,
        duration: 0.6 
      } 
    },
    hover: { 
      scale: 1.05, 
      boxShadow: "0 10px 25px -5px rgba(249, 168, 212, 0.5)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      } 
    },
    tap: { 
      scale: 0.98,
      boxShadow: "0 5px 15px -3px rgba(249, 168, 212, 0.4)",
      transition: { type: "spring", stiffness: 400, damping: 10 } 
    }
  };

  const separatorVariants = {
    hidden: { scaleX: 0 },
    visible: { 
      scaleX: 1,
      transition: { 
        duration: 0.8, 
        ease: "easeInOut" 
      } 
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-200 to-fuchsia-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: [0.8, 1.2, 1],
            rotate: [0, 0, 360]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop"
          }}
          className="text-4xl text-fuchsia-600"
        >
          <PlusCircle className="h-16 w-16" />
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
        className="min-h-screen bg-gradient-to-br from-pink-50 via-fuchsia-100 to-purple-200 p-6 lg:p-10 overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <motion.div 
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-pink-200/40 to-fuchsia-300/40 blur-3xl"
            animate={{
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-violet-200/40 to-purple-300/40 blur-3xl"
            animate={{
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-gradient-to-tl from-rose-200/30 to-pink-300/30 blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Header */}
        <motion.header
          variants={headerVariants}
          className="text-center mb-12 relative"
        >
          <motion.h1 
            className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-purple-600 drop-shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Mentor Dashboard
          </motion.h1>
          <motion.p 
            className="text-lg mt-4 text-gray-700 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Welcome, <span className="text-fuchsia-600 font-semibold">{mentor?.displayName || "Mentor"}</span>! Inspire and guide your students today.
          </motion.p>

          <motion.div 
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-pink-500 to-fuchsia-500 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          />
        </motion.header>

        <motion.div variants={separatorVariants}>
          <Separator className="mb-12 bg-gradient-to-r from-transparent via-pink-300 to-transparent h-0.5 rounded-full" />
        </motion.div>

        {/* Quick Actions Section */}
        <motion.section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10"
        >
          {quickActions.map((action, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              custom={idx}
            >
              <Card
                onClick={action.onClick}
                className={`cursor-pointer border-0 backdrop-blur-lg shadow-lg rounded-3xl overflow-hidden h-full`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-50`} />
                <div className="absolute inset-0 bg-white/40" />
                
                <CardHeader className="flex flex-row items-center justify-between relative z-10 pb-2">
                  <CardTitle className="text-xl font-bold text-gray-800">
                    {action.title}
                  </CardTitle>
                  <motion.div
                    whileHover={{ 
                      rotate: 15,
                      scale: 1.2,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                  >
                    {action.icon}
                  </motion.div>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <p className="text-sm text-gray-600 font-medium">
                    {action.description}
                  </p>
                </CardContent>
                
                <motion.div 
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-fuchsia-400 to-pink-400"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </Card>
            </motion.div>
          ))}
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}