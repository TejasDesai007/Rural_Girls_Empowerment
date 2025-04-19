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
import { auth, db } from "../firebase"; // Assuming you're using Firestore for storing roles
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // To fetch the role from Firestore

export default function MentorDashboard() {
  const [mentor, setMentor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && isMounted) {
        // Fetch the user's role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid)); // "users" collection, assuming uid is the document id
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === "mentor") {
            setMentor(user);
          } else {
            navigate("/unauthorized"); // Redirect to unauthorized page or any other page
          }
        } else {
          navigate("/unauthorized"); // If no user document exists, redirect
        }
      } else {
        navigate("/login"); // Redirect to login page if not authenticated
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const quickActions = [
    {
      icon: <PlusCircle className="h-6 w-6 text-pink-600" />,
      title: "Add Course",
      description: "Create a new learning course",
      onClick: () => navigate("/addcourse"),
    },
    {
      icon: <Layers3 className="h-6 w-6 text-pink-600" />,
      title: "Add Toolkit",
      description: "Add new entrepreneurship toolkit",
      onClick: () => navigate("/add-toolkit"),
    },
    {
      icon: <Bell className="h-6 w-6 text-pink-600" />,
      title: "Mentor Notification",
      description: "View all mentorship requests",
      onClick: () => navigate("/mentor-notification"),
    },
    {
      icon: <Box className="h-6 w-6 text-pink-600" />,
      title: "Entrepreneurship Toolkit",
      description: "Explore and manage toolkits",
      onClick: () => navigate("/Entrepreneurship"),
    },
    {
      icon: <Bot className="h-6 w-6 text-pink-600" />,
      title: "AI Chat Assistant",
      description: "Your AI-powered support system",
      onClick: () => navigate("/chat-assistant"),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-pink-700">Mentor Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Welcome, {mentor?.displayName || "Mentor"}! Manage your resources and sessions.
        </p>
      </header>

      <Separator className="mb-8" />

      {/* Quick Actions Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, idx) => (
          <Card
            key={idx}
            className="cursor-pointer hover:shadow-lg transition wobble"
            onClick={action.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-800">
                {action.title}
              </CardTitle>
              {action.icon}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
