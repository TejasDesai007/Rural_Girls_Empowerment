import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const OrdersTab = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sellerInfo, setSellerInfo] = useState({});

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                await fetchOrders(user.uid);
            } else {
                setOrders([]);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (filterStatus === "all") {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(
                orders.filter((order) => order.status?.toLowerCase() === filterStatus)
            );
        }
    }, [orders, filterStatus]);

    useEffect(() => {
        const fetchSellersInfo = async () => {
            if (orders.length === 0) return;

            const sellerIds = new Set();

            // Extract all seller IDs from the orders' items
            orders.forEach(order => {
                if (order.items && order.items.length > 0) {
                    order.items.forEach(item => {
                        if (item.sellerId) sellerIds.add(item.sellerId);
                    });
                }
            });

            const fetchedSellerInfo = {};

            // Fetch data for each seller
            for (const sellerId of sellerIds) {
                try {
                    const userDoc = await getDoc(doc(db, "users", sellerId));
                    if (userDoc.exists()) {
                        fetchedSellerInfo[sellerId] = userDoc.data();
                    } else {
                        fetchedSellerInfo[sellerId] = { displayName: "Unknown Seller" };
                    }
                } catch (error) {
                    console.error(`Error fetching seller info for ${sellerId}:`, error);
                    fetchedSellerInfo[sellerId] = { displayName: "Error Loading" };
                }
            }

            setSellerInfo(fetchedSellerInfo);
        };

        fetchSellersInfo();
    }, [orders]);

    const fetchOrders = async (uid) => {
        try {
            setLoading(true);
            const ordersRef = collection(db, "orders");
            const q = query(ordersRef, where("userId", "==", uid));
            const querySnapshot = await getDocs(q);

            const fetchedOrders = [];

            for (const docSnapshot of querySnapshot.docs) {
                const orderData = {
                    id: docSnapshot.id,
                    ...docSnapshot.data()
                };

                // For each item in the order, fetch the product to get the sellerId
                if (orderData.items && orderData.items.length > 0) {
                    for (let i = 0; i < orderData.items.length; i++) {
                        const item = orderData.items[i];
                        try {
                            if (item.productId) {
                                const productDoc = await getDoc(doc(db, "products", item.productId));
                                if (productDoc.exists()) {
                                    const productData = productDoc.data();
                                    // Add seller ID to the item
                                    orderData.items[i] = {
                                        ...item,
                                        sellerId: productData.sellerId || "unknown"
                                    };
                                }
                            }
                        } catch (error) {
                            console.error(`Error fetching product ${item.productId}:`, error);
                        }
                    }
                }

                fetchedOrders.push(orderData);
            }

            setOrders(fetchedOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const openOrderModal = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Customer Orders</CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant={filterStatus === "pending" ? "default" : "outline"}
                                onClick={() => setFilterStatus("pending")}
                            >
                                Pending ({orders.filter((o) => o.status?.toLowerCase() === "pending").length})
                            </Button>
                            <Button
                                variant={filterStatus === "delivered" ? "default" : "outline"}
                                onClick={() => setFilterStatus("delivered")}
                            >
                                Completed ({orders.filter((o) => o.status?.toLowerCase() === "delivered").length})
                            </Button>
                            <Button
                                variant={filterStatus === "all" ? "default" : "outline"}
                                onClick={() => setFilterStatus("all")}
                            >
                                All
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="animate-spin mr-2" />
                            <span>Loading orders...</span>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">No orders found.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Date</TableHead>

                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.map((order) => {
                                    const firstItem = order.items?.[0];


                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell>#{order.id}</TableCell>
                                            <TableCell>
                                                {order.createdAt
                                                    ? new Date(order.createdAt).toLocaleDateString()
                                                    : "N/A"}
                                            </TableCell>
                                            
                                            <TableCell>₹{order.totalAmount || 0}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        order.status?.toLowerCase() === "delivered"
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openOrderModal(order)}
                                                >
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>

                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
                        <DialogDescription>
                            <p><strong>Name:</strong> {selectedOrder?.name}</p>
                            <p><strong>Email:</strong> {selectedOrder?.email}</p>
                            <p><strong>Phone:</strong> {selectedOrder?.phone}</p>
                            <p><strong>Address:</strong> {selectedOrder?.address}</p>
                            <p><strong>Status:</strong> {selectedOrder?.status}</p>
                            <p><strong>Total:</strong> ₹{selectedOrder?.totalAmount}</p>
                        </DialogDescription>
                        <div className="mt-4">
                            <p className="font-semibold mb-2">Items:</p>
                            <ul className="list-disc list-inside space-y-1">
                                {selectedOrder?.items?.map((item, index) => (
                                    <li key={index}>
                                        {item.name} × {item.quantity} = ₹{item.quantity * item.price}
                                        {item.sellerId && sellerInfo[item.sellerId] && (
                                            <span className="text-sm text-gray-500 ml-2">
                                                (Seller: {sellerInfo[item.sellerId].displayName || "Unknown"})
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OrdersTab;