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
import { Loader2, CheckCircle, AlertCircle, Bell, Trash2, Eye, Sparkles } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getAuth } from "firebase/auth";
import { motion } from "framer-motion";

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

    // Animation variants for cards
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: i => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-8 pb-12">
            <div className="max-w-3xl mx-auto p-6 rounded-xl backdrop-blur-sm bg-white/80 shadow-lg border border-pink-100 animate-fade-in">
                <Toaster position="top-right" richColors />

                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Notifications</h2>
                        <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-200 animate-pulse">
                            <Bell className="w-3 h-3 mr-1" />
                            {notifications.filter((n) => !n.read).length} Unread
                        </Badge>
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={filter}
                            onChange={(e) => applyFilter(e.target.value)}
                            className="border rounded-md px-3 py-1 text-sm bg-white/80 backdrop-blur-sm border-pink-200 focus:border-purple-400 focus:ring focus:ring-purple-200 transition-all duration-300"
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
                            className="text-xs bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 border-pink-200 text-pink-700 transition-all duration-300"
                        >
                            {loading ? <Loader2 className="animate-spin w-3 h-3" /> : "Mark All Read"}
                        </Button>
                    </div>
                </div>

                <div className="flex gap-3 mb-8">
                    <Button
                        onClick={async () => {
                            try {
                                await addDoc(collection(db, "notifications"), {
                                    title: "✨ New Test Notification",
                                    description: "This is a test notification with some sparkle!",
                                    type: "course",
                                    read: false,
                                    createdAt: new Date(),
                                });
                                toast.success("Test notification added!");
                            } catch (error) {
                                toast.error("Failed to add test notification");
                                console.error(error);
                            }
                        }}
                        size="sm"
                        className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                    >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Add Test Notification
                    </Button>

                    <Button
                        onClick={handleDeleteAll}
                        variant="destructive"
                        size="sm"
                        className="text-xs bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500 border-none transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete All
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-t-purple-500 border-r-pink-500 border-b-blue-500 border-l-pink-300 animate-spin"></div>
                            <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-pink-500 animate-pulse" />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((n, i) => (
                                <motion.div
                                    key={n.id}
                                    custom={i}
                                    initial="hidden"
                                    animate="visible"
                                    variants={cardVariants}
                                    whileHover={{ scale: 1.02 }}
                                    className="transform transition-all duration-300"
                                >
                                    <Card
                                        className={`border shadow-sm overflow-hidden ${n.read ? "bg-white/60" : "bg-white/90 border-l-4 border-l-pink-400"}`}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-medium text-gray-800">
                                                            {n.title}
                                                        </h3>
                                                        <Badge variant="outline" className={`text-xs py-0 h-5 ${n.type === 'mentee' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                                                            'bg-pink-50 text-pink-600 border-pink-200'
                                                            }`}>
                                                            {n.type}
                                                        </Badge>
                                                        {!n.read && (
                                                            <span className="inline-block w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-gray-500 mt-1">{formatDate(n.createdAt)}</p>
                                                    
                                                    <p className="text-xs text-gray-600 mt-2 line-clamp-1">{n.description}</p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setModalNotification(n)}
                                                        className="h-8 w-8 p-0 rounded-full hover:bg-pink-100 hover:text-pink-600 transition-all duration-300"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>

                                                    {!n.read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleMarkAsRead(n.id)}
                                                            className="h-8 w-8 p-0 rounded-full hover:bg-green-100 hover:text-green-600 transition-all duration-300"
                                                            title="Mark as Read"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteNotification(n.id)}
                                                        className="h-8 w-8 p-0 rounded-full hover:bg-red-100 hover:text-red-600 transition-all duration-300"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-center py-16 border rounded-lg bg-white/60 backdrop-blur-sm shadow-inner"
                            >
                                <div className="bg-gradient-to-r from-purple-200 to-pink-200 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                                    <Bell className="w-10 h-10 text-purple-500" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-600 mb-1">No notifications yet</h3>
                                <p className="text-gray-500">Your notifications will appear here</p>
                            </motion.div>
                        )}
                    </div>
                )}

                {modalNotification && (
                    <Dialog open={true} onOpenChange={() => setModalNotification(null)}>
                        <DialogContent className="max-w-md bg-gradient-to-br from-white to-pink-50 border border-pink-100">
                            <DialogHeader>
                                <div className="flex items-center gap-2">
                                    <DialogTitle className="text-lg text-gray-800">{modalNotification.title}</DialogTitle>
                                    <Badge variant="outline" className={`text-xs ${modalNotification.type === 'mentee' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-pink-50 text-pink-600 border-pink-200'
                                        }`}>
                                        {modalNotification.type}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{formatDate(modalNotification.createdAt)}</p>
                            </DialogHeader>
                            <div className="text-sm text-gray-700 border-t border-pink-100 pt-4 mt-2">
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
                                            className="bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-600 border-green-200"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Mark as Read
                                        </Button>
                                    )}
                                </div>
                                <Button 
                                    onClick={() => setModalNotification(null)}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow transition-all duration-300"
                                >
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
};

export default MentorNotification;