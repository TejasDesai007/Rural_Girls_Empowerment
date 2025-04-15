import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Users, FileText, PlusCircle } from "lucide-react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminPanel() {
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Assume a claim or role-based check is handled elsewhere
      if (user) setAdmin(user);
      else navigate("/login");
    });
    return () => unsubscribe();
  }, []);

  const quickActions = [
    {
      icon: <Users className="h-6 w-6 text-purple-600" />,
      title: "Manage Users",
      description: "View and manage user accounts",
      onClick: () => navigate("/user-management"),
    },
    {
      icon: <FileText className="h-6 w-6 text-purple-600" />,
      title: "Reports",
      description: "View usage and progress reports",
      onClick: () => navigate("/reports"),
    },
    {
      icon: <PlusCircle className="h-6 w-6 text-purple-600" />,
      title: "Add Course",
      description: "Create and manage new courses",
      onClick: () => navigate("/addcourse"),
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-purple-600" />,
      title: "Analytics",
      description: "View platform performance and trends",
      onClick: () => navigate("/admin/reports"), // redirecting to reports for now
    },
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
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {quickActions.map((action, idx) => (
          <Card key={idx} className="cursor-pointer hover:shadow-lg transition" onClick={action.onClick}>
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

      {/* Stats (Optional) */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">1,024</p>
              <p className="text-xs text-muted-foreground">+8% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Courses Published</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">78</p>
              <p className="text-xs text-muted-foreground">+3 new this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reports Filed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">21</p>
              <p className="text-xs text-muted-foreground">-2 from last month</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
