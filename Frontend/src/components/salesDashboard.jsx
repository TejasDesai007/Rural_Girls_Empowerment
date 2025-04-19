// src/components/SalesDashboard.jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, CircleDollarSign } from "lucide-react"
import React from "react";
const SalesDashboard = () => {
  // Sample sales data - in a real app, this would come from Firebase
 

  // Calculate metrics
  const weeklyTotal = salesData.reduce((sum, day) => sum + day.sales, 0)
  const avgDaily = Math.round(weeklyTotal / salesData.filter(d => d.sales > 0).length)
  const bestDay = salesData.reduce((best, current) => 
    current.sales > best.sales ? current : best
  )

  return (
    <Card>
      
      <CardContent className="space-y-4">
        

        {/* Sales Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                width={30}
              />
              <Bar 
                dataKey="sales" 
                fill="#EA580C" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 className="text-sm font-medium mb-2">Recent Sales</h3>
          <div className="space-y-2">
            {[
              { id: 1, item: "Handmade Bag", amount: 350, time: "Today 10:30 AM" },
              { id: 2, item: "Embroidery Set", amount: 600, time: "Today 9:15 AM" },
              { id: 3, item: "3 Cotton Masks", amount: 150, time: "Yesterday" }
            ].map(sale => (
              <div key={sale.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{sale.item}</p>
                  <p className="text-xs text-gray-500">{sale.time}</p>
                </div>
                <p className="font-bold">₹{sale.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SalesDashboard