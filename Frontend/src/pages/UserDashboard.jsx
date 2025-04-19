import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Layers3, BookOpenCheck, CalendarCheck2, Bot } from "lucide-react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currUser) => {
      if (currUser) {
        setUser(currUser);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const quickActions = [
    {
      icon: <BookOpenCheck className="h-6 w-6 text-pink-600" />,
      title: "Explore Courses",
      description: "Browse learning opportunities",
      onClick: () => navigate("/courses"),
    },
    {
      icon: <Layers3 className="h-6 w-6 text-pink-600" />,
      title: "View Toolkits",
      description: "Check entrepreneur resources",
      onClick: () => navigate("/toolkit"),
    },
    {
      icon: <CalendarCheck2 className="h-6 w-6 text-pink-600" />,
      title: "Book Session",
      description: "Request a mentor session",
      onClick: () => navigate("/mentor-match"),
    },
    {
      icon: <Bot className="h-6 w-6 text-pink-600" />,
      title: "AI Assistant",
      description: "Get instant help anytime",
      onClick: () => navigate("/chat-assistant"),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-pink-700">User Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Hello, {user?.displayName || "Learner"}! Your growth starts here.
        </p>
      </header>

      <Separator className="mb-8" />

      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, idx) => (
          <Card
            key={idx}
            className="cursor-pointer hover:shadow-lg transition"
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
