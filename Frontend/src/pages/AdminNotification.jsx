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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);

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
            toast.success("Marked as read");
        } catch (err) {
            toast.error("Failed to mark as read");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, "admin_notifications", id));
            toast.success("Deleted");
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <Toaster position="top-right" richColors />
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Admin Notifications</h2>
                <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                    <Bell className="w-4 h-4 mr-1" />
                    {notifications.filter(n => !n.read).length} Unread
                </Badge>
            </div>

            {notifications.length > 0 ? (
                notifications.map(n => (
                    <Card key={n.id} className={`border ${n.read ? "bg-gray-50" : "bg-white border-l-4 border-l-orange-500"}`}>
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium">{n.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{formatDate(n.createdAt)}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedNotification(n)}
                                        title="View Details"
                                        className="h-7 w-7 p-0"
                                    >
                                        <Eye className="w-4 h-4 text-gray-500" />
                                    </Button>

                                    {!n.read && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleMarkAsRead(n.id)}
                                            title="Mark as Read"
                                            className="h-7 w-7 p-0"
                                        >
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(n.id)}
                                        title="Delete"
                                        className="h-7 w-7 p-0"
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
                    <p className="text-gray-500">No admin notifications</p>
                </div>
            )}

            {selectedNotification && (
                <Dialog open={true} onOpenChange={() => setSelectedNotification(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{selectedNotification.title}</DialogTitle>
                            <p className="text-xs text-gray-500">{formatDate(selectedNotification.createdAt)}</p>
                        </DialogHeader>
                        <div className="text-sm text-gray-700 border-t pt-3 mt-2">
                            {selectedNotification.description}
                        </div>
                        {selectedNotification.additionalData && (
                            <div className="mt-4 border-t pt-2 text-sm text-gray-600 space-y-1">
                                {Object.entries(selectedNotification.additionalData).map(([key, value]) => (
                                    <p key={key}><strong>{key}:</strong> {value}</p>
                                ))}
                            </div>
                        )}
                        <DialogFooter>
                            <Button onClick={() => setSelectedNotification(null)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default AdminNotification;
