import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import connectDB from "@/lib/mongodb"
import Ticket from "@/models/Ticket"
import type { ApiResponse, TicketCounts } from "@/types/ticket"

// GET /api/tickets/counts - Get ticket counts
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")

    const baseQuery: any = {}
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      baseQuery.userId = new mongoose.Types.ObjectId(customerId)
    }

    const [all, open, pending, closed, high, unassigned] = await Promise.all([
      Ticket.countDocuments(baseQuery),
      Ticket.countDocuments({ ...baseQuery, status: "open" }),
      Ticket.countDocuments({ ...baseQuery, status: "pending" }),
      Ticket.countDocuments({ ...baseQuery, status: { $in: ["closed", "resolved"] } }),
      Ticket.countDocuments({ ...baseQuery, priority: { $in: ["high", "urgent"] } }),
      Ticket.countDocuments({ ...baseQuery, assigneeId: { $exists: false } }),
    ])

    const counts: TicketCounts = {
      all,
      open,
      pending,
      closed,
      high,
      unassigned,
    }

    const response: ApiResponse<TicketCounts> = {
      success: true,
      data: counts,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching ticket counts:", error)
    return NextResponse.json({ success: false, error: "فشل جلب إحصائيات التذاكر" }, { status: 500 })
  }
}
