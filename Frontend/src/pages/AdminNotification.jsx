import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy
} from "firebase/firestore";
import { db } from "@/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";
import {
    Eye,
    Trash2,
    CheckCircle,
    Bell,
    Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const AdminNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "admin_notifications"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setNotifications(data);
        });

        return () => unsubscribe();
    }, []);

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

    const handleMarkAsRead = async (id) => {
        try {
            await updateDoc(doc(db, "admin_notifications", id), { read: true });
            toast.success("Marked as read", {
                icon: <CheckCircle className="w-4 h-4 text-green-500" />,
            });
        } catch (err) {
            toast.error("Failed to mark as read");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, "admin_notifications", id));
            setShowConfirmDelete(null);
            toast.success("Notification deleted", {
                icon: <Sparkles className="w-4 h-4 text-pink-500" />,
            });
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-8">
            <div className="max-w-3xl mx-auto p-6 bg-white bg-opacity-90 rounded-2xl shadow-lg backdrop-blur-sm">
                <Toaster position="top-right" richColors />
                
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-pink-300 to-purple-400 p-2 rounded-full">
                            <Bell className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-semibold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            Admin Notifications
                        </h2>
                    </div>

                    <Badge variant="outline" className="bg-gradient-to-r from-pink-100 to-purple-100 text-purple-600 border-purple-200 px-3 py-1.5 rounded-full shadow-sm">
                        <Bell className="w-4 h-4 mr-2 text-pink-500" />
                        {notifications.filter(n => !n.read).length} Unread
                    </Badge>
                </div>

                <AnimatePresence>
                    {notifications.length > 0 ? (
                        <motion.div 
                            className="space-y-3"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                        >
                            {notifications.map(n => (
                                <motion.div 
                                    key={n.id} 
                                    layout
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="show"
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    <Card className={`border overflow-hidden transition-all duration-300 hover:shadow-md ${
                                        n.read 
                                        ? "bg-gradient-to-r from-gray-50 to-white" 
                                        : "bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-l-pink-400"
                                    }`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className={`text-sm font-medium ${!n.read ? "text-purple-700" : ""}`}>
                                                        {n.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatDate(n.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedNotification(n)}
                                                        title="View Details"
                                                        className="h-8 w-8 p-0 rounded-full hover:bg-pink-100 hover:text-pink-600 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>

                                                    {!n.read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleMarkAsRead(n.id)}
                                                            title="Mark as Read"
                                                            className="h-8 w-8 p-0 rounded-full hover:bg-green-100 hover:text-green-600 transition-colors"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowConfirmDelete(n.id)}
                                                        title="Delete"
                                                        className="h-8 w-8 p-0 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-center py-16 border rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50"
                        >
                            <div className="bg-white bg-opacity-60 p-4 rounded-full inline-flex items-center justify-center mb-4">
                                <Bell className="w-12 h-12 text-pink-300" />
                            </div>
                            <p className="text-purple-500 font-medium">No notifications yet</p>
                            <p className="text-gray-500 text-sm mt-2">When you receive notifications, they'll appear here</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Notification detail modal */}
                {selectedNotification && (
                    <Dialog open={true} onOpenChange={() => setSelectedNotification(null)}>
                        <DialogContent className="max-w-md bg-gradient-to-br from-white to-pink-50 p-0 overflow-hidden">
                            <DialogHeader className="p-6 pb-2 bg-gradient-to-r from-pink-200 to-purple-200 bg-opacity-30">
                                <DialogTitle className="text-lg font-medium text-purple-800">
                                    {selectedNotification.title}
                                </DialogTitle>
                                <p className="text-xs text-pink-600">{formatDate(selectedNotification.createdAt)}</p>
                            </DialogHeader>
                            <div className="p-6">
                                <div className="text-sm text-gray-700 pt-2">
                                    {selectedNotification.description}
                                </div>
                                {selectedNotification.additionalData && (
                                    <div className="mt-6 pt-4 border-t border-pink-100 text-sm text-gray-600 space-y-2">
                                        <h4 className="font-medium text-pink-600 mb-2">Additional Information</h4>
                                        {Object.entries(selectedNotification.additionalData).map(([key, value]) => (
                                            <p key={key} className="flex">
                                                <span className="font-medium text-purple-700 mr-2">{key}:</span> 
                                                <span>{value}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}
                                <DialogFooter className="mt-6 pt-4 border-t border-pink-100">
                                    <Button 
                                        onClick={() => setSelectedNotification(null)}
                                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                                    >
                                        Close
                                    </Button>
                                </DialogFooter>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Confirm delete dialog */}
                {showConfirmDelete && (
                    <Dialog open={true} onOpenChange={() => setShowConfirmDelete(null)}>
                        <DialogContent className="max-w-xs">
                            <DialogHeader>
                                <DialogTitle className="text-center">Delete Notification?</DialogTitle>
                            </DialogHeader>
                            <div className="text-center text-sm text-gray-600 mt-2">
                                This action cannot be undone.
                            </div>
                            <DialogFooter className="flex gap-2 mt-4 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowConfirmDelete(null)}
                                    className="border-pink-200 text-pink-600 hover:bg-pink-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => handleDelete(showConfirmDelete)}
                                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                                >
                                    Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
};

export default AdminNotification;