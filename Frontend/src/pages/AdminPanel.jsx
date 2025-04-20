import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, PlusCircle, Sparkles, BookOpen, Heart } from "lucide-react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";

export default function AdminPanel() {
  const [admin, setAdmin] = useState(null);
  const [usersCount, setUsersCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (isMounted) setAdmin(user);
        await fetchData();
      } else {
        navigate("/login");
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersSnapshot, coursesSnapshot] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "courses")),
      ]);

      setUsersCount(usersSnapshot.size);
      setCoursesCount(coursesSnapshot.size);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: <Users className="h-6 w-6 text-pink-500" />,
      title: "Manage Users",
      description: "View and manage user accounts",
      onClick: () => navigate("/user-management"),
      color: "from-pink-200 to-purple-100",
    },
    {
      icon: <PlusCircle className="h-6 w-6 text-violet-500" />,
      title: "Add Course",
      description: "Create and manage new courses",
      onClick: () => navigate("/addcourse"),
      color: "from-violet-200 to-fuchsia-100",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-fuchsia-500" />,
      title: "Course Analytics",
      description: "View enrollment and performance data",
      onClick: () => navigate("/course-analytics"),
      color: "from-fuchsia-200 to-rose-100",
    },
    {
      icon: <Heart className="h-6 w-6 text-rose-500" />,
      title: "User Feedback",
      description: "Review comments and ratings",
      onClick: () => navigate("/user-feedback"),
      color: "from-rose-200 to-pink-100",
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    }),
  };

  const floatingAnimation = {
    initial: { y: 0 },
    animate: {
      y: [-5, 5, -5],
      transition: {
        duration: 6,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  };

  const statsData = [
    {
      title: "Total Users",
      value: usersCount,
      subtext: "Registered users",
      icon: <Users className="h-8 w-8 text-pink-500" />,
      color: "bg-gradient-to-br from-pink-50 to-fuchsia-100",
      borderColor: "border-pink-300",
    },
    {
      title: "Courses Published",
      value: coursesCount,
      subtext: "Available courses",
      icon: <BookOpen className="h-8 w-8 text-violet-500" />,
      color: "bg-gradient-to-br from-violet-50 to-fuchsia-100",
      borderColor: "border-violet-300",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-fuchsia-100 to-violet-200">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 opacity-10">
        <motion.div
          initial={{ rotate: 0, scale: 1 }}
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="h-40 w-40 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 blur-xl"
        />
      </div>
      <div className="absolute bottom-10 left-10 opacity-10">
        <motion.div
          initial={{ rotate: 0, scale: 1 }}
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="h-60 w-60 rounded-full bg-gradient-to-r from-fuchsia-400 to-rose-500 blur-xl"
        />
      </div>

      <div className="relative z-10 px-6 py-10 container mx-auto max-w-6xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10 text-center relative"
        >
          <motion.div
            {...floatingAnimation}
            className="inline-block mb-2"
          >
            <Sparkles className="h-8 w-8 text-fuchsia-500 mx-auto" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-500">
            Admin Dashboard
          </h1>
          <p className="text-sm mt-2 text-fuchsia-700">
            Welcome back! Manage your platform with ease.
          </p>
          
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="mt-4"
          >
            <Button
              variant="outline"
              className="bg-white/20 border border-pink-300 text-fuchsia-700 backdrop-blur-sm hover:bg-white/40 transition duration-300"
              onClick={() => navigate("/my-profile")}
            >
              View Profile
            </Button>
          </motion.div>
        </motion.header>

        <Separator className="mb-10 bg-gradient-to-r from-transparent via-pink-300 to-transparent h-px" />

        {/* Quick Actions */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="mb-12"
        >
          <motion.h2
            variants={cardVariants}
            className="text-xl font-semibold text-fuchsia-700 mb-6 flex items-center"
          >
            <span>Quick Actions</span>
            <div className="h-1 w-16 bg-gradient-to-r from-pink-400 to-fuchsia-400 rounded-full ml-3" />
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <motion.div
                key={idx}
                custom={idx}
                variants={cardVariants}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  onClick={action.onClick}
                  className={`cursor-pointer bg-gradient-to-br ${action.color} border-pink-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl h-full overflow-hidden`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="p-2 rounded-full bg-white/60 backdrop-blur-sm">
                        {action.icon}
                      </div>
                    </div>
                    <CardTitle className="text-base font-semibold text-fuchsia-800 mt-2">
                      {action.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-fuchsia-600">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Stats */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
          }}
          className="space-y-6"
        >
          <motion.h2
            variants={cardVariants}
            className="text-xl font-semibold text-fuchsia-700 flex items-center"
          >
            <span>Platform Overview</span>
            <div className="h-1 w-16 bg-gradient-to-r from-pink-400 to-fuchsia-400 rounded-full ml-3" />
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {statsData.map((stat, idx) => (
              <motion.div
                key={idx}
                custom={idx}
                variants={cardVariants}
                whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(249, 168, 212, 0.2)" }}
                className="relative overflow-hidden"
              >
                <Card className={`${stat.color} backdrop-blur-lg border ${stat.borderColor} shadow-lg rounded-2xl overflow-hidden`}>
                  {/* Decorative curved shape */}
                  <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/20 blur-md" />
                  
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold text-fuchsia-700">
                      {stat.title}
                    </CardTitle>
                    <motion.div
                      {...floatingAnimation}
                      className="p-2 rounded-full bg-white/40 backdrop-blur-sm"
                    >
                      {stat.icon}
                    </motion.div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {loading ? (
                      <div className="flex items-center space-x-4">
                        <div className="animate-pulse h-12 w-16 bg-white/60 rounded" />
                        <div className="animate-pulse h-4 w-20 bg-white/60 rounded" />
                      </div>
                    ) : (
                      <div className="flex items-end space-x-2">
                        <motion.p 
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5, type: "spring" }}
                          className="text-4xl font-bold text-fuchsia-700"
                        >
                          {stat.value}
                        </motion.p>
                        <p className="text-xs text-fuchsia-600 mb-2">
                          {stat.subtext}
                        </p>
                      </div>
                    )}
                    
                    {/* Progress indicator */}
                    <div className="mt-4 h-1.5 bg-white/40 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: loading ? "30%" : `${Math.min(100, stat.value > 0 ? (idx === 0 ? stat.value/2 : stat.value*10) : 30)}%` }}
                        transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-fuchsia-400 to-pink-500 rounded-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {/* Additional information card */}
          <motion.div
            custom={3}
            variants={cardVariants}
            whileHover={{ y: -5 }}
            className="mt-6"
          >
            <Card className="bg-gradient-to-br from-violet-100 to-fuchsia-100 border border-violet-200 overflow-hidden rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-fuchsia-700">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4">
                        <div className="rounded-full bg-white/60 h-8 w-8"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-white/60 rounded w-3/4"></div>
                          <div className="h-2 bg-white/60 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="flex justify-center mb-3"
                    >
                      <Sparkles className="h-6 w-6 text-fuchsia-500" />
                    </motion.div>
                    <p className="text-sm text-fuchsia-700">Your dashboard is up to date!</p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-4"
                    >
                      <Button
                        onClick={() => fetchData()}
                        className="bg-gradient-to-r from-fuchsia-400 to-pink-500 hover:opacity-90 text-white border-none shadow-md"
                      >
                        Refresh Data
                      </Button>
                    </motion.div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}