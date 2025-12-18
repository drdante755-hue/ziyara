import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Order from "@/models/Order"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      console.warn(`/api/delivery/orders/${params.id}/status: no session found - development fallback enabled`)
    }

    const role = (session?.user as any)?.role
    if (process.env.NODE_ENV !== "development") {
      if (role !== "delivery" && role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const body = await req.json()
    const { status } = body
    if (!status) return NextResponse.json({ error: "Missing status" }, { status: 400 })

    await dbConnect()

    const order = await Order.findById(params.id)
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    // Only allow transitioning to delivered from out_for_delivery/shipped
    if (status === "delivered") {
      order.status = "delivered"
      await order.save()
      return NextResponse.json({ success: true, order })
    }

    // For other statuses, reject for now
    return NextResponse.json({ error: "Unsupported status" }, { status: 400 })
  } catch (err) {
    console.error("/api/delivery/orders/[id]/status POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
