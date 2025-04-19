import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import SalesDashboard from "@/components/SalesDashboard";
import InventoryTracker from "@/components/InventoryTracker";

const DashboardTab = () => {
    // Mock data
    const businessMetrics = {
        sales: { current: 12500, target: 20000 },
        customers: 42,
        pendingOrders: 5
    };

    const activeKits = [
        { name: "Handmade Soap Kit", progress: 65 },
        { name: "Embroidery Starter", progress: 30 }
    ];

    const recentOrders = [
        { id: 1024, customer: "Priya Sharma", amount: 450, status: "Pending" },
        { id: 1023, customer: "Rahul Patel", amount: 680, status: "Shipped" }
    ];

    return (
        <div className="space-y-6">
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Business Overview */}
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
                                <p className="text-xs text-gray-500 mt-1">+5 this week</p>
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

                    {/* Active Kits */}
                    <Card>
                        <CardHeader>
                            <CardTitle>My Business Kits</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {activeKits.map((kit, index) => (
                                <div key={index}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{kit.name}</span>
                                        <span>{kit.progress}%</span>
                                    </div>
                                    <Progress value={kit.progress} className="h-2" />
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm">Explore More Kits</Button>
                        </CardFooter>
                    </Card>

                    {/* Sales Dashboard */}
                    <SalesDashboard />
                </div>

                {/* Column 2: Tools & Resources */}
                <div className="space-y-6">
                    {/* Inventory Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <InventoryTracker simplified />
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
                                            <TableCell>#{order.id}</TableCell>
                                            <TableCell>{order.customer}</TableCell>
                                            <TableCell>₹{order.amount}</TableCell>
                                            <TableCell>
                                                <Badge variant={order.status === "Delivered" ? "default" : "secondary"}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Resources */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Resources</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            {[
                                { title: "Invoice Generator", icon: "📊" },
                                { title: "Pricing Calculator", icon: "🧮" },
                                { title: "Marketing Templates", icon: "📢" }
                            ].map((item, i) => (
                                <Button key={i} variant="ghost" className="justify-start gap-2">
                                    <span>{item.icon}</span>
                                    {item.title}
                                </Button>
                            ))}
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
                        <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            New order #1024 (₹450)
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Completed "Pricing Strategies" lesson
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardTab;