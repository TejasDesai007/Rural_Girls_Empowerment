import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { db } from "../../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import InventoryTracker from "@/components/InventoryTracker";

const Loader = () => (
  <div className="flex justify-center items-center space-x-2">
    <div className="w-4 h-4 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
    <span>Loading...</span>
  </div>
);

const DashboardTab = () => {
  const [businessMetrics, setBusinessMetrics] = useState({
    sales: { current: 0, target: 20000 },
    customers: 0,
    pendingOrders: 0
  });

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersSnapshot, productsSnapshot] = await Promise.all([
          getDocs(query(collection(db, "orders"), where("status", "in", ["paid", "pending"]))),
          getDocs(collection(db, "products"))
        ]);

        const fetchedOrders = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const fetchedProducts = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setOrders(fetchedOrders);
        setProducts(fetchedProducts);

        const totalSales = fetchedOrders.reduce((acc, order) => acc + order.totalAmount, 0);
        setBusinessMetrics({
          sales: { current: totalSales, target: 20000 },
          pendingOrders: fetchedOrders.filter(order => order.status === "pending").length,
          customers: new Set(fetchedOrders.map(order => order.userId)).size
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeProducts = products.filter(product => product.category === "tech");
  const recentOrders = orders.slice(0, 5);
  const inventoryItems = products.map(product => ({
    id: product.id,
    name: product.name,
    quantity: product.stock,
    unit: "units",
    lowStock: 3
  }));

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Business Overview Column */}
        <div className="space-y-6 md:col-span-2">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₹{businessMetrics.sales.current.toLocaleString()}</p>
                <Progress
                  value={(businessMetrics.sales.current / businessMetrics.sales.target) * 100}
                  className="h-2 mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((businessMetrics.sales.current / businessMetrics.sales.target) * 100)}% of ₹{businessMetrics.sales.target.toLocaleString()} target
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{businessMetrics.customers}</p>
                <p className="text-xs text-gray-500 mt-1">+{businessMetrics.customers} this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{businessMetrics.pendingOrders}</p>
                <p className="text-xs text-gray-500 mt-1">Need your attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Products */}
          <Card>
            <CardHeader>
              <CardTitle>My Active Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeProducts.map((product) => (
                <div key={product.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{product.name}</span>
                    <span>{product.stock} in stock</span>
                  </div>
                  <Progress value={(product.stock / 10) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">Explore More Products</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Tools & Resources Column */}
        <div className="space-y-6">
          {/* Inventory Management */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <InventoryTracker simplified inventory={inventoryItems} />
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer">
                      <TableCell>#{order.id.substring(0, 8)}</TableCell>
                      <TableCell>{order.name}</TableCell>
                      <TableCell>₹{order.totalAmount}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === "paid" ? "default" : "secondary"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-500">No recent orders</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity Footer */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <ul className="space-y-2">
            {orders.slice(0, 5).map((order) => (
              <li key={order.id} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                New order #{order.id.substring(0, 8)} from {order.name} (₹{order.totalAmount})
              </li>
            ))}
            {orders.length === 0 && (
              <li className="text-gray-500">No recent activity</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;