import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import connectDB from "@/lib/mongodb"
import Ticket from "@/models/Ticket"
import type { ApiResponse } from "@/types/ticket"

// GET /api/tickets/[id]/activity - Get activity log for a ticket
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "معرف التذكرة غير صالح" }, { status: 400 })
    }

    const ticket = await Ticket.findById(id).select("activityLogs")
    if (!ticket) {
      return NextResponse.json({ success: false, error: "التذكرة غير موجودة" }, { status: 404 })
    }

    const activityLogs = ticket.activityLogs
      .map((log: any) => ({
        id: log._id.toString(),
        ticketId: id,
        action: log.action,
        actorId: log.actorId?.toString(),
        actorName: log.actorName,
        actorType: log.actorType,
        metadata: log.metadata,
        createdAt: log.createdAt,
      }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const response: ApiResponse<any[]> = {
      success: true,
      data: activityLogs,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching activity logs:", error)
    return NextResponse.json({ success: false, error: "فشل جلب سجل النشاط" }, { status: 500 })
  }
}
