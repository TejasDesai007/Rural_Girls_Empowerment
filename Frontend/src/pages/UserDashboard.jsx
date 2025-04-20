import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Layers3,
  BookOpenCheck,
  CalendarCheck2,
  Bot,
  User,
  ChevronRight,
} from "lucide-react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currUser) => {
      if (currUser) {
        setUser(currUser);
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const quickActions = [
    {
      icon: <BookOpenCheck className="h-6 w-6 text-pink-600" />,
      title: "Explore Courses",
      description: "Browse learning opportunities",
      onClick: () => navigate("/courses"),
      badge: "Popular",
    },
    {
      icon: <Layers3 className="h-6 w-6 text-fuchsia-600" />,
      title: "View Toolkits",
      description: "Check entrepreneur resources",
      onClick: () => navigate("/toolkit"),
    },
    {
      icon: <CalendarCheck2 className="h-6 w-6 text-purple-600" />,
      title: "Book Session",
      description: "Request a mentor session",
      onClick: () => navigate("/mentor-match"),
      badge: "New",
    },
    {
      icon: <Bot className="h-6 w-6 text-violet-600" />,
      title: "AI Assistant",
      description: "Get instant help anytime",
      onClick: () => navigate("/chat-assistant"),
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    }),
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pink-100 via-fuchsia-100 to-indigo-200">
        <div className="text-pink-600 text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen px-4 sm:px-6 py-10 bg-gradient-to-br from-pink-100 via-fuchsia-100 to-indigo-200"
      style={{
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
      }}
    >
      {/* Header with welcome message */}
      <motion.header
        variants={fadeIn}
        className="mb-8 text-center"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="inline-flex items-center justify-center mb-4"
        >
          <div className="p-3 rounded-full bg-white/50 backdrop-blur-sm shadow-md">
            <User className="h-12 w-12 text-pink-600" />
          </div>
        </motion.div>
        
        <motion.h1 
          className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          Welcome Back!
        </motion.h1>
        
        <motion.p 
          className="text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Hello, {user?.displayName || "Learner"}! Ready to continue your growth journey?
        </motion.p>
      </motion.header>

      <motion.div variants={fadeIn}>
        <Separator className="mb-10 bg-pink-200" />
      </motion.div>

      {/* Quick Actions */}
      <motion.section
        variants={containerVariants}
      >
        <motion.h2 
          variants={fadeIn} 
          className="text-2xl font-bold text-pink-700 mb-6"
        >
          Quick Actions
        </motion.h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
              }}
              whileTap={{ scale: 0.97 }}
            >
              <Card
                onClick={action.onClick}
                className="cursor-pointer h-full bg-white/70 border border-pink-200 backdrop-blur-md shadow-md transition-all duration-300 rounded-2xl overflow-hidden hover:border-pink-300"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex flex-col">
                    <CardTitle className="text-lg font-bold text-gray-800">
                      {action.title}
                    </CardTitle>
                    {action.badge && (
                      <Badge className="w-fit mt-1 bg-pink-500 hover:bg-pink-600">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="p-2 rounded-full bg-pink-50 border border-pink-100">
                    {action.icon}
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-gray-500 mb-3">
                    {action.description}
                  </p>
                  <div className="flex items-center text-xs font-medium text-pink-600">
                    <span>Get started</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Custom CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </motion.div>
  );
}