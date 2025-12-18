import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      // Allow a developer fallback in development to ease testing
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      console.warn("/api/delivery/orders: no session found - development fallback enabled")
    }

    // Allow delivery role or admin (role name may be customized)
    const role = (session?.user as any)?.role
    if (process.env.NODE_ENV !== "development") {
      if (!role || (role !== "delivery" && role !== "admin")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    await dbConnect()

    // Return orders that are out for delivery or shipped
    const orders = await Order.find({ status: { $in: ["out_for_delivery", "shipped"] } })
      .sort({ updatedAt: -1 })
      .lean()

    // Normalize fields for the delivery dashboard
    const normalized = orders.map((o: any) => ({
      id: o._id,
      orderNumber: o.orderNumber,
      status: o.status,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      address: o.shippingAddress,
      items: (o.items || []).map((it: any) => ({ name: it.productName || it.name || "", qty: it.quantity || it.qty || 0 })),
      updatedAt: o.updatedAt,
    }))

    return NextResponse.json({ orders: normalized })
  } catch (err) {
    console.error("/api/delivery/orders GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
