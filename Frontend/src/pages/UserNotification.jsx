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
import { Loader2, CheckCircle, Bell, Trash2, Eye, Calendar, Clock, Video, MessageSquare, Link as LinkIcon } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
                // User is not logged in - handle accordingly
                // Could redirect to login page or show a message
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
                return <Badge className="bg-green-100 text-green-800 border-green-200">Accepted</Badge>;
            case "declined":
                return <Badge className="bg-red-100 text-red-800 border-red-200">Declined</Badge>;
            case "pending":
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
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
        <div className="max-w-3xl mx-auto p-4">
            <Toaster position="top-right" richColors />

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">My Notifications</h2>
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
                        <option value="accepted">Accepted</option>
                        <option value="declined">Declined</option>
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
                                                {n.sessionDetails && (
                                                    getStatusBadge(n.sessionDetails.status)
                                                )}
                                                {!n.read && (
                                                    <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                                                )}
                                            </div>

                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDate(n.createdAt)}
                                                {n.sessionDetails && (
                                                    <>
                                                        <span className="mx-1">•</span>
                                                        <span className="text-gray-600">
                                                            {n.sessionDetails.date}, {n.sessionDetails.timeSlot}
                                                        </span>
                                                    </>
                                                )}
                                            </p>
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
                                {modalNotification.sessionDetails && (
                                    getStatusBadge(modalNotification.sessionDetails.status)
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(modalNotification.createdAt)}</p>
                        </DialogHeader>
                        
                        <div className="text-sm text-gray-700 border-t pt-3 mt-2">
                            <p className="mb-4">{modalNotification.description}</p>
                            
                            {/* Display meeting details if available */}
                            {modalNotification.sessionDetails && modalNotification.sessionDetails.status === "accepted" && (
                                <div className="mt-4 bg-green-50 border border-green-100 rounded-md p-4">
                                    <h4 className="font-medium text-green-800 mb-3">Meeting Details</h4>
                                    
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
                                                        <div className="bg-white p-3 rounded border border-green-100 w-full">
                                                            <p className="whitespace-pre-line">{modalNotification.sessionDetails.meetingDetails.message}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
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

export default UserNotification;