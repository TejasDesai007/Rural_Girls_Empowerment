import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
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
import { Loader2, CheckCircle, Bell, Trash2, Eye, Calendar, Clock, Video, MessageSquare, Link as LinkIcon, Heart, Sparkles } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

const UserNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalNotification, setModalNotification] = useState(null);
    const [filter, setFilter] = useState("all");
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                toast.error("Please log in to view your notifications");
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!userId) return;

        const fetchNotifications = async () => {
            setLoading(true);
            try {
                // Query notifications specifically for this mentee/user
                const notifRef = query(
                    collection(db, "notifications"),
                    where("menteeId", "==", userId)
                );

                // Real-time listener for notifications
                const unsub = onSnapshot(notifRef, (snapshot) => {
                    const data = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })).sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());

                    setNotifications(data);
                    applyFilter(filter, data);
                });

                return unsub; // Cleanup listener on unmount
            } catch (err) {
                toast.error("Failed to fetch notifications");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [userId]);

    const applyFilter = (type, notifList = notifications) => {
        setFilter(type);
        if (type === "unread") {
            setFilteredNotifications(notifList.filter((n) => !n.read));
        } else if (type === "accepted" || type === "declined") {
            setFilteredNotifications(notifList.filter((n) => 
                n.sessionDetails && n.sessionDetails.status === type
            ));
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

    const getStatusBadge = (status) => {
        switch (status) {
            case "accepted":
                return <Badge className="bg-pink-100 text-pink-800 border-pink-200">Accepted</Badge>;
            case "declined":
                return <Badge className="bg-red-100 text-red-800 border-red-200">Declined</Badge>;
            case "pending":
                return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Pending</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
        }
    };

    const getMeetingPlatformLabel = (platform) => {
        switch (platform) {
            case "google-meet":
                return "Google Meet";
            case "zoom":
                return "Zoom";
            case "ms-teams":
                return "Microsoft Teams";
            case "discord":
                return "Discord"; 
            case "other":
                return "Other Platform";
            default:
                return platform;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            <div className="max-w-3xl mx-auto p-4 pt-8 pb-16">
                <Toaster position="top-right" richColors />

                <motion.div 
                    className="flex justify-between items-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold text-pink-900 flex items-center">
                            <Sparkles className="w-5 h-5 text-pink-500 mr-2" />
                            My Notifications
                        </h2>
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Badge variant="outline" className="bg-pink-100 text-pink-600 border-pink-200 px-3 py-1">
                                <Bell className="w-3 h-3 mr-1" />
                                {notifications.filter((n) => !n.read).length} Unread
                            </Badge>
                        </motion.div>
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={filter}
                            onChange={(e) => applyFilter(e.target.value)}
                            className="border rounded-md px-3 py-1 text-sm bg-white border-pink-200 focus:ring-pink-500 focus:border-pink-500"
                        >
                            <option value="all">All</option>
                            <option value="unread">Unread</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                        </select>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant="outline"
                                onClick={handleMarkAllAsRead}
                                disabled={loading}
                                size="sm"
                                className="text-xs bg-white border-pink-300 text-pink-700 hover:bg-pink-50"
                            >
                                {loading ? <Loader2 className="animate-spin w-3 h-3" /> : "Mark All Read"}
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="relative">
                            <div className="absolute -inset-4 rounded-lg bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 opacity-75 blur animate-pulse"></div>
                            <div className="relative bg-white p-6 rounded-lg flex items-center space-x-4">
                                <Loader2 className="animate-spin w-8 h-8 text-pink-500" />
                                <p className="text-pink-800">Loading your notifications...</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((n, index) => (
                                <motion.div
                                    key={n.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                                >
                                    <Card
                                        className={`border shadow-md overflow-hidden ${
                                            n.read 
                                                ? "bg-white bg-opacity-80" 
                                                : "bg-gradient-to-r from-pink-100 to-purple-50 border-l-4 border-l-pink-500"
                                        }`}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-medium text-pink-900">
                                                            {n.title}
                                                        </h3>
                                                        {n.sessionDetails && (
                                                            getStatusBadge(n.sessionDetails.status)
                                                        )}
                                                        {!n.read && (
                                                            <motion.span 
                                                                className="inline-block w-2 h-2 bg-pink-500 rounded-full"
                                                                animate={{ 
                                                                    scale: [1, 1.2, 1],
                                                                    opacity: [0.7, 1, 0.7]
                                                                }}
                                                                transition={{ 
                                                                    duration: 2, 
                                                                    repeat: Infinity, 
                                                                    ease: "easeInOut" 
                                                                }}
                                                            ></motion.span>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {formatDate(n.createdAt)}
                                                        {n.sessionDetails && (
                                                            <>
                                                                <span className="mx-1">•</span>
                                                                <span className="text-pink-600">
                                                                    {n.sessionDetails.date}, {n.sessionDetails.timeSlot}
                                                                </span>
                                                            </>
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="flex gap-1">
                                                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setModalNotification(n)}
                                                            className="h-8 w-8 p-0 text-pink-600 hover:text-pink-800 hover:bg-pink-100 rounded-full"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </motion.div>

                                                    {!n.read && (
                                                        <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleMarkAsRead(n.id)}
                                                                className="h-8 w-8 p-0 text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full"
                                                                title="Mark as Read"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </Button>
                                                        </motion.div>
                                                    )}

                                                    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteNotification(n.id)}
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="text-center py-16 border rounded-lg bg-white bg-opacity-80 shadow-inner"
                            >
                                <div className="relative w-20 h-20 mx-auto mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full opacity-50 blur animate-pulse"></div>
                                    <div className="relative flex items-center justify-center h-full">
                                        <Bell className="w-12 h-12 text-pink-300" />
                                    </div>
                                </div>
                                <p className="text-gray-500 text-lg">No notifications found</p>
                                <p className="text-pink-400 text-sm mt-2">Your notifications will appear here</p>
                            </motion.div>
                        )}
                    </div>
                )}

                {modalNotification && (
                    <Dialog open={true} onOpenChange={() => setModalNotification(null)}>
                        <DialogContent className="max-w-md bg-gradient-to-br from-white to-pink-50 border-pink-200">
                            <DialogHeader>
                                <div className="flex items-center gap-2">
                                    <DialogTitle className="text-pink-900 flex items-center">
                                        <Heart className="w-4 h-4 text-pink-500 mr-2" />
                                        {modalNotification.title}
                                    </DialogTitle>
                                    {modalNotification.sessionDetails && (
                                        getStatusBadge(modalNotification.sessionDetails.status)
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{formatDate(modalNotification.createdAt)}</p>
                            </DialogHeader>
                            
                            <div className="text-sm text-gray-700 border-t border-pink-100 pt-3 mt-2">
                                <p className="mb-4">{modalNotification.description}</p>
                                
                                {/* Display meeting details if available */}
                                {modalNotification.sessionDetails && modalNotification.sessionDetails.status === "accepted" && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.2 }}
                                        className="mt-4 bg-gradient-to-r from-green-50 to-teal-50 border border-green-100 rounded-md p-4"
                                    >
                                        <h4 className="font-medium text-green-800 mb-3 flex items-center">
                                            <Sparkles className="w-4 h-4 mr-2 text-green-500" />
                                            Meeting Details
                                        </h4>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 text-green-600 mr-2" />
                                                <span>{modalNotification.sessionDetails.date}</span>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 text-green-600 mr-2" />
                                                <span>{modalNotification.sessionDetails.timeSlot}</span>
                                            </div>
                                            
                                            {modalNotification.sessionDetails.meetingDetails && (
                                                <>
                                                    {modalNotification.sessionDetails.meetingDetails.meetingPlatform && (
                                                        <div className="flex items-center">
                                                            <Video className="w-4 h-4 text-green-600 mr-2" />
                                                            <span>{getMeetingPlatformLabel(modalNotification.sessionDetails.meetingDetails.meetingPlatform)}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {modalNotification.sessionDetails.meetingDetails.meetingLink && (
                                                        <div className="flex items-center">
                                                            <LinkIcon className="w-4 h-4 text-green-600 mr-2" />
                                                            <a 
                                                                href={modalNotification.sessionDetails.meetingDetails.meetingLink} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="text-blue-600 hover:underline break-all"
                                                            >
                                                                {modalNotification.sessionDetails.meetingDetails.meetingLink}
                                                            </a>
                                                        </div>
                                                    )}
                                                    
                                                    {modalNotification.sessionDetails.meetingDetails.message && (
                                                        <div className="flex items-start">
                                                            <MessageSquare className="w-4 h-4 text-green-600 mr-2 mt-1" />
                                                            <div className="bg-white p-3 rounded border border-green-100 w-full shadow-inner">
                                                                <p className="whitespace-pre-line">{modalNotification.sessionDetails.meetingDetails.message}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                            
                            <DialogFooter className="flex justify-between items-center">
                                <div>
                                    {!modalNotification.read && (
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    handleMarkAsRead(modalNotification.id);
                                                    setModalNotification({ ...modalNotification, read: true });
                                                }}
                                                className="bg-white text-pink-700 border-pink-300 hover:bg-pink-50"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Mark as Read
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button 
                                        onClick={() => setModalNotification(null)}
                                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                                    >
                                        Close
                                    </Button>
                                </motion.div>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
};

export default UserNotification;