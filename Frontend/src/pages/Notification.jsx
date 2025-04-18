import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle, AlertCircle, Filter } from "lucide-react";
import { toast, Toaster } from "sonner";

const MentorNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalNotification, setModalNotification] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data);
        setFilteredNotifications(data);
        setLoading(false);
      } catch (err) {
        toast.error("Failed to fetch notifications");
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);

    if (value === "unread") {
      setFilteredNotifications(notifications.filter((n) => !n.read));
    } else if (value === "mentee") {
      setFilteredNotifications(notifications.filter((n) => n.type === "mentee"));
    } else if (value === "course") {
      setFilteredNotifications(notifications.filter((n) => n.type === "course"));
    } else {
      setFilteredNotifications(notifications);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      toast.success("Marked as read!");
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read!");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Toaster position="top-right" richColors />

      {/* Filter Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <Input
            className="w-48"
            placeholder="Filter notifications"
            value={filter}
            onChange={handleFilterChange}
          />
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Mark All as Read"}
          </Button>
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card key={notification.id} className="border-muted-foreground">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="font-medium text-lg">
                  {notification.title}
                </CardTitle>
                {notification.read ? (
                  <CheckCircle className="text-green-500 w-5 h-5" />
                ) : (
                  <AlertCircle className="text-red-500 w-5 h-5" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{notification.description}</p>
              <div className="flex justify-end mt-4">
                <Button
                  variant="link"
                  onClick={() => setModalNotification(notification)}
                  className="text-blue-600"
                >
                  View Details
                </Button>
                {!notification.read && (
                  <Button
                    variant="outline"
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="ml-2"
                  >
                    Mark as Read
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notification Details Modal */}
      {modalNotification && (
        <Dialog open={true} onOpenChange={() => setModalNotification(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{modalNotification.title}</DialogTitle>
            </DialogHeader>
            <p>{modalNotification.description}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalNotification(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MentorNotification;
