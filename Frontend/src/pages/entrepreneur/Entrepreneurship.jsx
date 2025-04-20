// src/pages/entrepreneur/EntrepreneurDashboard.jsx
import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Star } from "lucide-react";
import { Link } from 'react-router-dom'
// Tab Components
import DashboardTab from "./tabs/DashboardTab";
import ProductsTab from "./tabs/ProductsTab";
import OrdersTab from "./tabs/OrdersTab";
import MarketplaceTab from "./tabs/MarketplaceTab";
import CartTab from "./tabs/CartTab";
import MySellsTab from "./tabs/SellsTab";

const floatingElements = Array(20).fill(null);

const EntrepreneurDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const tabs = [
    {
      key: "dashboard",
      label: "Dashboard",
      Component: DashboardTab,
      icon: "✨",
    },
    {
      key: "products",
      label: "My Products",
      Component: ProductsTab,
      icon: "🌸",
    },
    { key: "sells", label: "My Sells", Component: MySellsTab, icon: "💖" },
    { key: "orders", label: "Orders", Component: OrdersTab, icon: "📦" },
    { key: "cart", label: "Cart", Component: CartTab, icon: "🛒" },
    {
      key: "marketplace",
      label: "Marketplace",
      Component: MarketplaceTab,
      icon: "🏪",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-fuchsia-100 opacity-80 z-0">
        {mounted &&
          floatingElements.map((_, index) => (
            <motion.div
              key={index}
              className="absolute rounded-full opacity-30"
              style={{
                background:
                  index % 3 === 0
                    ? "linear-gradient(to right, #ff9a9e, #fad0c4)"
                    : index % 3 === 1
                    ? "linear-gradient(to right, #a18cd1, #fbc2eb)"
                    : "linear-gradient(to right, #fbc2eb, #a6c1ee)",
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 50 - 25],
                y: [0, Math.random() * 50 - 25],
                scale: [1, Math.random() * 0.4 + 0.8],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: Math.random() * 8 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 px-4 py-8 md:px-10"
      >
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
          className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-10 gap-4"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: 0, scale: 1 }}
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }}
              className="text-4xl drop-shadow-lg"
            >
              🌸
            </motion.div>
            <div>
              <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 tracking-tight">
                My Business Dashboard
              </h1>
              <p className="text-sm font-medium text-pink-600 mt-1">
                Welcome back, beautiful entrepreneur!
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <Link to="/entrepreneurship-corner">
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-green-100 to-emerald-100 border-green-300 text-green-700 rounded-full px-4 py-1 flex items-center gap-1 cursor-pointer hover:shadow-md transition"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="h-3 w-3 text-green-600" />
                </motion.div>
                Active Entrepreneur
              </Badge>
            </Link>
            <Button className="bg-gradient-to-r from-pink-400 to-fuchsia-500 hover:from-pink-500 hover:to-fuchsia-600 text-white rounded-full px-5 shadow-lg shadow-pink-200 transition duration-300 flex items-center gap-2">
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
              Help Center
            </Button>
          </div>
        </motion.header>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Tab Navigation */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <TabsList className="bg-white/80 backdrop-blur-md rounded-2xl p-3 flex flex-wrap gap-3 shadow-lg border border-pink-200 justify-center sm:justify-start">
              {tabs.map(({ key, label, icon }, index) => (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                >
                  <TabsTrigger
                    value={key}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                      activeTab === key
                        ? "bg-gradient-to-r from-pink-400 to-fuchsia-500 text-white shadow-lg shadow-pink-200/50"
                        : "bg-white/70 text-pink-600 border border-pink-200 hover:bg-pink-50"
                    }`}
                  >
                    <span className="mr-2">{icon}</span>
                    {label}
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="bg-white/70 mt-6 rounded-3xl p-6 shadow-xl backdrop-blur-lg border border-pink-100 min-h-[500px] relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-fuchsia-200/30 to-pink-200/30 rounded-full blur-3xl"></div>

            <AnimatePresence mode="wait">
              {tabs.map(
                ({ key, Component }) =>
                  activeTab === key && (
                    <TabsContent key={key} value={key} forceMount>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="w-full relative z-10"
                      >
                        <Component />
                      </motion.div>
                    </TabsContent>
                  )
              )}
            </AnimatePresence>
          </motion.div>
        </Tabs>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-2 text-pink-600 font-medium">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="h-4 w-4 text-pink-500" />
            </motion.div>
            Created with love for amazing entrepreneurs
          </div>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default EntrepreneurDashboard;
