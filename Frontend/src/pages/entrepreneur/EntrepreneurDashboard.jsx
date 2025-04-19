// src/pages/EntrepreneurDashboard.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import InventoryTracker from "../../components/InventoryTracker";
import SalesDashboard from "../../components/SalesDashboard";

const EntrepreneurDashboard = () => {
    const [activeTab, setActiveTab] = useState("dashboard");

    // Mock data for dashboard
    const businessMetrics = {
        sales: { current: 12500, target: 20000 },
        customers: 42,
        inventoryAlerts: 3,
        pendingOrders: 5
    };

    const activeKits = [
        { name: "Handmade Soap Kit", progress: 65 },
        { name: "Embroidery Starter", progress: 30 }
    ];

    // Mock products data
    const [products, setProducts] = useState([
        { id: 1, name: "Handmade Soap", price: 150, stock: 25, category: "Beauty" },
        { id: 2, name: "Embroidered Bag", price: 450, stock: 12, category: "Fashion" },
        { id: 3, name: "Wooden Keychain", price: 80, stock: 38, category: "Accessories" }
    ]);

    // Mock orders data
    const [orders, setOrders] = useState([
        { id: 1024, customer: "Priya Sharma", amount: 450, status: "Pending", date: "2023-05-15" },
        { id: 1023, customer: "Rahul Patel", amount: 680, status: "Shipped", date: "2023-05-14" },
        { id: 1022, customer: "Neha Gupta", amount: 320, status: "Delivered", date: "2023-05-12" }
    ]);

    // Form state for new product
    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        stock: "",
        category: "",
        description: ""
    });

    const handleAddProduct = (e) => {
        e.preventDefault();
        const product = {
            id: products.length + 1,
            name: newProduct.name,
            price: Number(newProduct.price),
            stock: Number(newProduct.stock),
            category: newProduct.category,
            description: newProduct.description
        };
        setProducts([...products, product]);
        setNewProduct({
            name: "",
            price: "",
            stock: "",
            category: "",
            description: ""
        });
    };

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-orange-600">
                    My Business Dashboard
                </h1>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-50">
                        Active Entrepreneur
                    </Badge>
                    <Button size="sm">Help Center</Button>
                </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                </TabsList>

                {/* Dashboard Tab */}


                {/* Products Tab */}


                {/* Add Product Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Product</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Product Name</label>
                                    <Input
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        placeholder="Enter product name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Price (₹)</label>
                                    <Input
                                        type="number"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                        placeholder="Enter price"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Stock Quantity</label>
                                    <Input
                                        type="number"
                                        value={newProduct.stock}
                                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                        placeholder="Enter stock quantity"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <Input
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                        placeholder="Enter category"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <Textarea
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    placeholder="Enter product description"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit">Add Product</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>


                {/* Orders Tab */}


                {/* Inventory Tab */}


                {/* Marketplace Tab */}

            </Tabs>
        </div >
    );
};

export default EntrepreneurDashboard;

