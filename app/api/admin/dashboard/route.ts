import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Product from "@/models/Product"
import Order from "@/models/Order"

// Helper to get Arabic month names
const arabicMonths = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
]

// Helper to translate order status to Arabic
const statusTranslations: Record<string, string> = {
  pending: "جديدة",
  processing: "قيد المعالجة",
  shipped: "قيد التوصيل",
  delivered: "مكتملة",
  cancelled: "ملغية",
}

export async function GET() {
  try {
    await dbConnect()

    // Get current date info for monthly calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Parallel queries for better performance
    const [
      totalOrders,
      totalOrdersLastMonth,
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      totalProducts,
      productsLastMonth,
      totalRevenue,
      revenueLastMonth,
      monthlySales,
      ordersByStatus,
      recentOrders,
    ] = await Promise.all([
      // Total orders
      Order.countDocuments(),
      // Orders last month
      Order.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      // Total users
      User.countDocuments(),
      // New users this month
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      // New users last month
      User.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      // Total products
      Product.countDocuments({ isActive: true }),
      // Products last month
      Product.countDocuments({
        createdAt: { $lte: endOfLastMonth },
      }),
      // Total revenue (sum of all completed orders)
      Order.aggregate([
        { $match: { status: { $in: ["delivered", "shipped", "processing"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      // Revenue last month
      Order.aggregate([
        {
          $match: {
            status: { $in: ["delivered", "shipped", "processing"] },
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      // Monthly sales for chart (last 6 months)
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
            },
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            sales: { $sum: "$total" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      // Orders by status for pie chart
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      // Recent orders (last 10)
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("orderNumber customerName total status createdAt")
        .lean(),
    ])

    // Calculate trends
    const currentRevenue = totalRevenue[0]?.total || 0
    const lastMonthRevenue = revenueLastMonth[0]?.total || 0

    const ordersTrend =
      totalOrdersLastMonth > 0 ? Math.round(((totalOrders - totalOrdersLastMonth) / totalOrdersLastMonth) * 100) : 0

    const usersTrend =
      newUsersLastMonth > 0 ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100) : 0

    const productsTrend =
      productsLastMonth > 0 ? Math.round(((totalProducts - productsLastMonth) / productsLastMonth) * 100) : 0

    const revenueTrend =
      lastMonthRevenue > 0 ? Math.round(((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0

    // Format stats
    const stats = [
      {
        label: "إجمالي الطلبات",
        value: totalOrders.toLocaleString("ar-SA"),
        icon: "ShoppingCart",
        color: "emerald",
        trend: `${ordersTrend >= 0 ? "+" : ""}${ordersTrend}%`,
      },
      {
        label: "المستخدمون الجدد",
        value: newUsersThisMonth.toLocaleString("ar-SA"),
        icon: "Users",
        color: "teal",
        trend: `${usersTrend >= 0 ? "+" : ""}${usersTrend}%`,
      },
      {
        label: "المنتجات",
        value: totalProducts.toLocaleString("ar-SA"),
        icon: "Package",
        color: "cyan",
        trend: `${productsTrend >= 0 ? "+" : ""}${productsTrend}%`,
      },
      {
        label: "الإيرادات",
        value: `${currentRevenue.toLocaleString("ar-eg")} ج.م`,
        icon: "DollarSign",
        color: "orange",
        trend: `${revenueTrend >= 0 ? "+" : ""}${revenueTrend}%`,
      },
    ]

    // Format monthly sales for chart
    const sales = monthlySales.map((item: { _id: { month: number }; sales: number }) => ({
      month: arabicMonths[item._id.month - 1],
      sales: item.sales,
    }))

    // Fill missing months with 0
    const last6Months = []
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (now.getMonth() - i + 12) % 12
      const monthName = arabicMonths[monthIndex]
      const existingSales = sales.find((s: { month: string }) => s.month === monthName)
      last6Months.push({
        month: monthName,
        sales: existingSales?.sales || 0,
      })
    }

    // Format orders by status
    const orders = ordersByStatus.map((item: { _id: string; count: number }) => ({
      status: statusTranslations[item._id] || item._id,
      count: item.count,
    }))

    // Ensure all statuses are represented
    const allStatuses = ["جديدة", "قيد التوصيل", "مكتملة"]
    allStatuses.forEach((status) => {
      if (!orders.find((o: { status: string }) => o.status === status)) {
        orders.push({ status, count: 0 })
      }
    })

    // Format recent orders
    const formattedRecentOrders = recentOrders.map((order: any) => ({
      id: order.orderNumber,
      customer: order.customerName,
      amount: `${order.total.toLocaleString("ar-EG")} ج.م`,
      status: statusTranslations[order.status] || order.status,
      date: new Date(order.createdAt).toISOString().split("T")[0],
    }))

    return NextResponse.json({
      success: true,
      data: {
        stats,
        sales: last6Months,
        orders,
        recentOrders: formattedRecentOrders,
      },
    })
  } catch (error: any) {
    console.error("Dashboard API Error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "خطأ في جلب بيانات لوحة التحكم" },
      { status: 500 },
    )
  }
}
