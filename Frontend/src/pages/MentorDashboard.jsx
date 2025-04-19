import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Layers3, MessageCircle } from "lucide-react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function MentorDashboard() {
  const [mentor, setMentor] = useState(null);
  const [coursesCount, setCoursesCount] = useState(0);
  const [toolkitsCount, setToolkitsCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && isMounted) {
        setMentor(user);
        await fetchMentorStats(user.uid);
      } else {
        navigate("/login");
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const fetchMentorStats = async (uid) => {
    try {
      setLoading(true);

      const coursesRef = collection(db, "courses");
      const toolkitsRef = collection(db, "toolkits");
      const sessionsRef = collection(db, "sessionRequests");

      const coursesQuery = query(coursesRef, where("mentorId", "==", uid));
      const toolkitsQuery = query(toolkitsRef, where("mentorId", "==", uid));
      const requestsQuery = query(sessionsRef, where("mentorId", "==", uid), where("status", "==", "pending"));

      const [coursesSnap, toolkitsSnap, requestsSnap] = await Promise.all([
        getDocs(coursesQuery),
        getDocs(toolkitsQuery),
        getDocs(requestsQuery),
      ]);

      console.log("Courses Found:", coursesSnap.size);
      console.log("Toolkits Found:", toolkitsSnap.size);
      console.log("Requests Found:", requestsSnap.size);

      setCoursesCount(coursesSnap.size);
      setToolkitsCount(toolkitsSnap.size);
      setRequestsCount(requestsSnap.size);
    } catch (error) {
      console.error("Error fetching mentor data:", error);
    } finally {
      setLoading(false);
    }
  };

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
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-pink-700">Mentor Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Welcome, {mentor?.displayName || "Mentor"}! Manage your learning resources.
        </p>
      </header>

      <Separator className="mb-8" />

      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
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

      {/* Stats */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Contributions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Courses Created</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse h-8 w-16 bg-gray-200 rounded" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-pink-600">{coursesCount}</p>
                  <p className="text-xs text-muted-foreground">Published courses</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toolkits Added</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse h-8 w-16 bg-gray-200 rounded" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-pink-600">{toolkitsCount}</p>
                  <p className="text-xs text-muted-foreground">Resources for users</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse h-8 w-16 bg-gray-200 rounded" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-pink-600">{requestsCount}</p>
                  <p className="text-xs text-muted-foreground">Requests awaiting response</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
