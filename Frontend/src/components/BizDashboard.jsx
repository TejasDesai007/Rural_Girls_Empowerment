// src/components/BizDashboard.jsx
import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { db } from "../firebase"
import { collection, getDocs } from "firebase/firestore"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const BizDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    estimatedRevenue: 0,
    templatesDownloaded: 23, // dummy value, can be updated dynamically
    chartData: [],
  })

  useEffect(() => {
    const fetchStats = async () => {
      const querySnapshot = await getDocs(collection(db, "products"))
      let totalRevenue = 0
      let productCounts = {}

      const products = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const revenue = parseFloat(data.price || 0) * parseInt(data.quantity || 0)
        totalRevenue += revenue
        const name = data.name || "Product"
        productCounts[name] = (productCounts[name] || 0) + parseInt(data.quantity || 0)
        products.push(data)
      })

      const chartData = Object.keys(productCounts).map((name) => ({
        name,
        quantity: productCounts[name],
      }))

      setStats({
        totalProducts: querySnapshot.size,
        estimatedRevenue: totalRevenue,
        templatesDownloaded: stats.templatesDownloaded,
        chartData,
      })
    }

    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {/* Total Products */}
      <Card>
        <CardHeader>
          <CardTitle>Total Products Listed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
        </CardContent>
      </Card>

      {/* Templates Downloaded */}
      <Card>
        <CardHeader>
          <CardTitle>Templates Downloaded</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.templatesDownloaded}</p>
        </CardContent>
      </Card>

      {/* Estimated Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Estimated Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">₹{stats.estimatedRevenue.toFixed(2)}</p>
        </CardContent>
      </Card>

      {/* Optional Chart */}
      <Card className="col-span-1 md:col-span-3">
        <CardHeader>
          <CardTitle>Product Popularity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#fb923c" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default BizDashboard
