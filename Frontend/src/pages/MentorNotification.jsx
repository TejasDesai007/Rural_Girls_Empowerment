import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    addDoc,
    onSnapshot,
    deleteDoc,
    query,
    where,
} from "firebase/firestore";
import { db } from "@/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle, AlertCircle, Bell, Trash2, Eye } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getAuth } from "firebase/auth";

const MentorNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalNotification, setModalNotification] = useState(null);
    const [filter, setFilter] = useState("all");

    // const auth = getAuth();
    // const currentUser = auth.currentUser;

    // const notifRef = query(
    //     collection(db, "notifications"),
    //     where("mentorId", "==", currentUser.uid)
    // );

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const notifRef = collection(db, "notifications");

                // Real-time listener for notifications
                const unsub = onSnapshot(notifRef, (snapshot) => {
                    const data = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })).sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());

                    setNotifications(data);
                    applyFilter(filter, data);
                });

                // If no notifications exist, create one
                if ((await getDocs(notifRef)).empty) {
                    const defaultNotification = {
                        title: "Welcome to Mentor Notifications!",
                        description:
                            "This is a sample notification to get you started. You can customize or delete it later.",
                        read: false,
                        type: "mentee",
                        createdAt: new Date(),
                    };
                    await addDoc(notifRef, defaultNotification);
                    toast.success("Sample notification created!");
                }

                return unsub; // Cleanup listener on unmount
            } catch (err) {
                toast.error("Failed to fetch notifications");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const applyFilter = (type, notifList = notifications) => {
        setFilter(type);
        if (type === "unread") {
            setFilteredNotifications(notifList.filter((n) => !n.read));
        } else if (type === "mentee" || type === "course") {
            setFilteredNotifications(notifList.filter((n) => n.type === type));
        } else {
            setFilteredNotifications(notifList);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            const docRef = doc(db, "notifications", id);
            await updateDoc(docRef, { read: true });
            toast.success("Marked as read");
        } catch (err) {
            toast.error("Failed to update status");
            console.error(err);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await deleteDoc(doc(db, "notifications", id));
            toast.success("Notification deleted!");
        } catch (err) {
            toast.error("Failed to delete notification");
            console.error(err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const unread = notifications.filter((n) => !n.read);
            if (unread.length === 0) {
                toast.info("No unread notifications");
                return;
            }

            const updates = unread.map((n) =>
                updateDoc(doc(db, "notifications", n.id), { read: true })
            );
            await Promise.all(updates);
            toast.success("All marked as read!");
        } catch (err) {
            toast.error("Failed to update all");
            console.error(err);
        }
    };

    const handleDeleteAll = async () => {
        try {
            const notifRef = collection(db, "notifications");
            const snapshot = await getDocs(notifRef);

            if (snapshot.docs.length === 0) {
                toast.info("No notifications to delete");
                return;
            }

            const deletePromises = snapshot.docs.map((doc) =>
                deleteDoc(doc.ref)
            );
            await Promise.all(deletePromises);
            toast.success("All notifications deleted!");
        } catch (err) {
            toast.error("Failed to delete all notifications");
            console.error(err);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <Toaster position="top-right" richColors />

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">Notifications</h2>
                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                        <Bell className="w-3 h-3 mr-1" />
                        {notifications.filter((n) => !n.read).length} Unread
                    </Badge>
                </div>

                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => applyFilter(e.target.value)}
                        className="border rounded-md px-3 py-1 text-sm bg-white"
                    >
                        <option value="all">All</option>
                        <option value="unread">Unread</option>
                        <option value="mentee">Mentee</option>
                        <option value="course">Course</option>
                    </select>
                    <Button
                        variant="outline"
                        onClick={handleMarkAllAsRead}
                        disabled={loading}
                        size="sm"
                        className="text-xs"
                    >
                        {loading ? <Loader2 className="animate-spin w-3 h-3" /> : "Mark All Read"}
                    </Button>
                </div>
            </div>

            <div className="flex gap-3 mb-6">
                <Button
                    onClick={async () => {
                        try {
                            await addDoc(collection(db, "notifications"), {
                                title: "🔔 Manual Test Notification",
                                description: "This is a test triggered by the button.",
                                type: "course",
                                read: false,
                                createdAt: new Date(),
                            });
                            toast.success("Manual test notification added!");
                        } catch (error) {
                            toast.error("Failed to add test notification");
                            console.error(error);
                        }
                    }}
                    size="sm"
                    className="text-xs"
                >
                    ➕ Add Test Notification
                </Button>

                <Button
                    onClick={handleDeleteAll}
                    variant="destructive"
                    size="sm"
                    className="text-xs"
                >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete All
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((n) => (
                            <Card
                                key={n.id}
                                className={`border shadow-sm ${n.read ? "bg-gray-50" : "bg-white border-l-4 border-l-orange-500"}`}
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-medium">
                                                    {n.title}
                                                </h3>
                                                <Badge variant="outline" className={`text-xs py-0 h-5 ${n.type === 'mentee' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                        'bg-green-50 text-green-600 border-green-200'
                                                    }`}>
                                                    {n.type}
                                                </Badge>
                                                {!n.read && (
                                                    <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                                                )}
                                            </div>

                                            <p className="text-xs text-gray-500 mt-1">{formatDate(n.createdAt)}</p>
                                        </div>

                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setModalNotification(n)}
                                                className="h-7 w-7 p-0"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4 text-gray-500" />
                                            </Button>

                                            {!n.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleMarkAsRead(n.id)}
                                                    className="h-7 w-7 p-0"
                                                    title="Mark as Read"
                                                >
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                </Button>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteNotification(n.id)}
                                                className="h-7 w-7 p-0"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-10 border rounded-lg bg-gray-50">
                            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500">No notifications found</p>
                        </div>
                    )}
                </div>
            )}

            {modalNotification && (
                <Dialog open={true} onOpenChange={() => setModalNotification(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <DialogTitle>{modalNotification.title}</DialogTitle>
                                <Badge variant="outline" className={`text-xs ${modalNotification.type === 'mentee' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                    }`}>
                                    {modalNotification.type}
                                </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(modalNotification.createdAt)}</p>
                        </DialogHeader>
                        <div className="text-sm text-gray-700 border-t pt-3 mt-2">
                            {modalNotification.description}
                        </div>
                        <DialogFooter className="flex justify-between items-center">
                            <div>
                                {!modalNotification.read && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            handleMarkAsRead(modalNotification.id);
                                            setModalNotification({ ...modalNotification, read: true });
                                        }}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Mark as Read
                                    </Button>
                                )}
                            </div>
                            <Button onClick={() => setModalNotification(null)}>
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