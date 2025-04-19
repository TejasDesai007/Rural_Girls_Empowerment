"use client"

import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, CircleDollarSign } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const SalesDashboard = () => {
  const [salesData, setSalesData] = useState([
    { day: "Mon", sales: 1200 },
    { day: "Tue", sales: 1900 },
    { day: "Wed", sales: 800 },
    { day: "Thu", sales: 1600 },
    { day: "Fri", sales: 2500 },
    { day: "Sat", sales: 2200 },
    { day: "Sun", sales: 0 },
  ])

  const weeklyTotal = salesData.reduce((sum, day) => sum + day.sales, 0)
  const avgDaily = Math.round(weeklyTotal / salesData.filter((d) => d.sales > 0).length)
  const bestDay = salesData.reduce((best, current) =>
    current.sales > best.sales ? current : best
  )

  const [activeChart, setActiveChart] = useState("sales")

  const total = useMemo(
    () => ({
      sales: weeklyTotal,
      avg: avgDaily,
    }),
    [weeklyTotal, avgDaily]
  )

  const chartConfig = {
    sales: { label: "Total Sales", color: "hsl(var(--chart-1))" },
    avg: { label: "Daily Average", color: "hsl(var(--chart-2))" },
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Sales Performance</CardTitle>
          <CardDescription>
            Showing sales data for the week
          </CardDescription>
        </div>
        <div className="flex">
          {["sales", "avg"].map((key) => {
            const chart = key
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  ₹{total[chart].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={salesData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => value}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="sales"
                    labelFormatter={(value) => value}
                  />
                }
              />
              <Bar
                dataKey={activeChart}
                fill={chartConfig[activeChart].color}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
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
      </CardContent>
    </Card>
  )
}

export default SalesDashboard
