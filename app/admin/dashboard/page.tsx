"use client"
import { useEffect, useState } from "react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Users, Package, DollarSign, ShoppingCart, Loader2 } from "lucide-react"

interface StatItem {
  label: string
  value: string
  icon: string
  color: string
  trend: string
}

interface SalesItem {
  month: string
  sales: number
}

interface OrderStatusItem {
  status: string
  count: number
}

interface RecentOrder {
  id: string
  customer: string
  amount: string
  status: string
  date: string
}

interface DashboardData {
  stats: StatItem[]
  sales: SalesItem[]
  orders: OrderStatusItem[]
  recentOrders: RecentOrder[]
}

const fallbackData: DashboardData = {
  stats: [
    { label: "إجمالي الطلبات", value: "0", icon: "ShoppingCart", color: "emerald", trend: "0%" },
    { label: "المستخدمون الجدد", value: "0", icon: "Users", color: "teal", trend: "0%" },
    { label: "المنتجات", value: "0", icon: "Package", color: "cyan", trend: "0%" },
    { label: "الإيرادات", value: "", icon: "DollarSign", color: "orange", trend: "0%" },
  ],
  sales: [
    { month: "يناير", sales: 0 },
    { month: "فبراير", sales: 0 },
    { month: "مارس", sales: 0 },
    { month: "أبريل", sales: 0 },
    { month: "مايو", sales: 0 },
    { month: "يونيو", sales: 0 },
  ],
  orders: [
    { status: "جديدة", count: 0 },
    { status: "قيد التوصيل", count: 0 },
    { status: "مكتملة", count: 0 },
  ],
  recentOrders: [],
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
}

const COLORS = ["#10b981", "#f97316", "#06b6d4"]

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const response = await fetch("/api/admin/dashboard")
        const result = await response.json()

        if (result.success) {
          setDashboardData(result.data)
        } else {
          setError(result.error || "فشل في جلب البيانات")
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("خطأ في الاتصال بالخادم")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const colorMap: Record<string, string> = {
    emerald: "#10b981",
    teal: "#14b8a6",
    cyan: "#06b6d4",
    orange: "#f97316",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="mr-2 text-gray-600">جاري تحميل البيانات...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 mx-auto block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              إعادة المحاولة
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {dashboardData.stats.map((stat) => {
          const IconComponent = iconMap[stat.icon] || ShoppingCart
          return (
            <Card key={stat.label} className="bg-white">
              <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{stat.value}</p>
                    <p
                      className={`text-xs mt-2 ${stat.trend.startsWith("+") ? "text-green-600" : stat.trend.startsWith("-") ? "text-red-600" : "text-gray-500"}`}
                    >
                      {stat.trend} من الشهر السابق
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${colorMap[stat.color]}20` }}
                  >
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2 bg-white">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-bold">المبيعات الشهرية</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dashboardData.sales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="sales" stroke="#10b981" name="المبيعات" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Status */}
        <Card className="bg-white">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-bold">حالة الطلبات</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardData.orders.map((item) => ({
                    name: item.status,
                    value: item.count,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {dashboardData.orders.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-white">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg font-bold">آخر الطلبات</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {dashboardData.recentOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8 px-4">لا توجد طلبات حتى الآن</p>
            ) : (
              <table className="w-full text-xs sm:text-sm min-w-[600px]">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-right py-3 px-3 sm:px-4 font-medium text-gray-700">رقم الطلب</th>
                    <th className="text-right py-3 px-3 sm:px-4 font-medium text-gray-700">العميل</th>
                    <th className="text-right py-3 px-3 sm:px-4 font-medium text-gray-700">المبلغ</th>
                    <th className="text-right py-3 px-3 sm:px-4 font-medium text-gray-700">الحالة</th>
                    <th className="text-right py-3 px-3 sm:px-4 font-medium text-gray-700">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3 sm:px-4 text-gray-800">#{order.id}</td>
                      <td className="py-3 px-3 sm:px-4 text-gray-800">{order.customer}</td>
                      <td className="py-3 px-3 sm:px-4 text-gray-800">{order.amount}</td>
                      <td className="py-3 px-3 sm:px-4">
                        <span
                          className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === "جديدة"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "قيد التوصيل"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-gray-500 text-xs sm:text-sm">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
