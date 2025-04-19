import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, CircleDollarSign } from "lucide-react"

const SalesDashboard = () => {
  const [salesData, setSalesData] = useState([
    { day: "Mon", sales: 1200 },
    { day: "Tue", sales: 1900 },
    { day: "Wed", sales: 800 },
    { day: "Thu", sales: 1600 },
    { day: "Fri", sales: 2500 },
    { day: "Sat", sales: 2200 },
    { day: "Sun", sales: 0 }
  ])

  const weeklyTotal = salesData.reduce((sum, day) => sum + day.sales, 0)
  const avgDaily = Math.round(weeklyTotal / salesData.filter(d => d.sales > 0).length)
  const bestDay = salesData.reduce((best, current) =>
    current.sales > best.sales ? current : best
  )

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Sales Performance</CardTitle>
          <Button variant="outline" size="sm">
            This Week
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Weekly Total</h3>
              <CircleDollarSign className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold mt-2">₹{weeklyTotal.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">7 days</p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Daily Average</h3>
              {avgDaily > 1500 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className="text-2xl font-bold mt-2">₹{avgDaily.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Per selling day</p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Best Day</h3>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {bestDay.day}
              </span>
            </div>
            <p className="text-2xl font-bold mt-2">₹{bestDay.sales.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((bestDay.sales / weeklyTotal) * 100).toFixed(0)}% of weekly
            </p>
          </div>
        </div>

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
