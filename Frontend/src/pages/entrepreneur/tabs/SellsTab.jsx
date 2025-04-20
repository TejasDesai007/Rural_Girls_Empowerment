import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const SellsTab = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchSales(user.uid);
      } else {
        setSales([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchSales = async (uid) => {
    setLoading(true);
    try {
      const ordersRef = collection(db, "orders");
      const ordersSnap = await getDocs(ordersRef);
      const salesList = [];

      for (const orderDoc of ordersSnap.docs) {
        const order = { id: orderDoc.id, ...orderDoc.data() };

        const matchingItems = [];
        for (const item of order.items || []) {
          if (item.productId) {
            const productDoc = await getDoc(doc(db, "products", item.productId));
            if (productDoc.exists()) {
              const product = productDoc.data();
              if (product.sellerid === uid) {
                matchingItems.push({ ...item, productName: product.name });
              }
            }
          }
        }

        if (matchingItems.length > 0) {
          salesList.push({
            ...order,
            items: matchingItems
          });
        }
      }

      setSales(salesList);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Products You've Sold</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin mr-2" />
              <span>Loading sales...</span>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No sales yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>{order.name || "Unknown"}</TableCell>
                    <TableCell>
                      <Badge variant={order.status?.toLowerCase() === "delivered" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openModal(order)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
              <p><strong>Customer Name:</strong> {selectedOrder?.name}</p>
              <p><strong>Email:</strong> {selectedOrder?.email}</p>
              <p><strong>Phone:</strong> {selectedOrder?.phone}</p>
              <p><strong>Address:</strong> {selectedOrder?.address}</p>
              <p><strong>Status:</strong> {selectedOrder?.status}</p>
              <p className="mt-2 font-semibold">Items You Sold:</p>
              <ul className="list-disc list-inside space-y-1">
                {selectedOrder?.items.map((item, index) => (
                  <li key={index}>
                    {item.name} × {item.quantity} = ₹{item.quantity * item.price}
                  </li>
                ))}
              </ul>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellsTab;
