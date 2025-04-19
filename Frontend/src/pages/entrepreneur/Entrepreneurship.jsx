import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

// Import tab components
import DashboardTab from "./tabs/DashboardTab";
import ProductsTab from "./tabs/ProductsTab";
import OrdersTab from "./tabs/OrdersTab";
import MarketplaceTab from "./tabs/MarketplaceTab";
import CartTab from "./tabs/CartTab";
import MySellsTab from "./tabs/SellsTab";

const EntrepreneurDashboard = () => {
    const [activeTab, setActiveTab] = useState("dashboard");

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-orange-600">
                    My Business Dashboard
                </h1>
                <div className="flex gap-2">
                    <Link to="/entrepreneur-corner">
                        <Badge variant="outline" className="bg-green-50 hover:bg-green-100 cursor-pointer">
                            Entrepreneur Corner
                        </Badge>
                    </Link>
                    <Button size="sm">Help Center</Button>
                </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="products">My Products</TabsTrigger>
                    <TabsTrigger value="sells">My Sells</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="cart">Cart</TabsTrigger>
                    <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                </TabsList>

                {/* Tab Contents */}
                <TabsContent value="dashboard">
                    <DashboardTab />
                </TabsContent>

                <TabsContent value="products">
                    <ProductsTab />
                </TabsContent>

                <TabsContent value="sells">
                    <MySellsTab />
                </TabsContent>

                <TabsContent value="orders">
                    <OrdersTab />
                </TabsContent>

                <TabsContent value="cart">
                    <CartTab />
                </TabsContent>

                <TabsContent value="marketplace">
                    <MarketplaceTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default EntrepreneurDashboard;