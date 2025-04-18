import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, PlusCircle } from "lucide-react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

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
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [usersSnapshot, coursesSnapshot] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "courses"))
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
      icon: <Users className="h-6 w-6 text-purple-600" />,
      title: "Manage Users",
      description: "View and manage user accounts",
      onClick: () => navigate("/user-management"),
    },
    {
      icon: <PlusCircle className="h-6 w-6 text-purple-600" />,
      title: "Add Course",
      description: "Create and manage new courses",
      onClick: () => navigate("/addcourse"),
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-purple-700">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Welcome, Admin! Manage everything from here.
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
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse h-8 w-16 bg-gray-200 rounded" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-purple-600">{usersCount}</p>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Courses Published</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse h-8 w-16 bg-gray-200 rounded" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-purple-600">{coursesCount}</p>
                  <p className="text-xs text-muted-foreground">Available courses</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
