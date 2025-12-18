import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Product from "@/models/Product"
import Order from "@/models/Order"

export async function GET() {
  try {
    await dbConnect()

    const [totalUsers, totalProducts, totalOrders, completedOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ status: "delivered" }),
    ])

    // Calculate average delivery time (mock for now, can be calculated from actual data)
    const avgDeliveryTime = "30 دقيقة"

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        completedOrders,
        avgDeliveryTime,
      },
    })
  } catch (error: any) {
    console.error("Home stats API Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
