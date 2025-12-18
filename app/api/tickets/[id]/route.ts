import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import connectDB from "@/lib/mongodb"
import Ticket from "@/models/Ticket"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    await connectDB()

    const { id } = await context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const ticket = await Ticket.findById(id).lean()

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error("GET /api/tickets/[id] error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    await connectDB()

    const { id } = await context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 })
    }

    const body = await req.json()
    const { status, priority, assigneeId, actorId, actorName, actorType } = body

    const ticket = await Ticket.findById(id)

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 })
    }

    const activities: Array<{
      action: "status_change" | "priority_change" | "assigned" | "unassigned"
      metadata: Record<string, unknown>
    }> = []

    if (status && status !== ticket.status) {
      const oldStatus = ticket.status
      ticket.status = status
      activities.push({
        action: "status_change",
        metadata: { oldStatus, newStatus: status },
      })

      // If closing ticket, mark all messages as read
      if (status === "closed") {
        ticket.unreadCount = 0
        ticket.unreadByCustomer = 0
      }
    }

    if (priority && priority !== ticket.priority) {
      const oldPriority = ticket.priority
      ticket.priority = priority
      activities.push({
        action: "priority_change",
        metadata: { oldPriority, newPriority: priority },
      })
    }

    if (assigneeId !== undefined) {
      const oldAssignee = ticket.assigneeId
      ticket.assigneeId = assigneeId
      ticket.assigneeName = body.assigneeName || null

      if (assigneeId) {
        activities.push({
          action: "assigned",
          metadata: { assigneeId, assigneeName: body.assigneeName || "" },
        })
      } else if (oldAssignee) {
        activities.push({
          action: "unassigned",
          metadata: { oldAssigneeId: oldAssignee },
        })
      }
    }

    // Add activity logs for changes
    if (activities.length > 0 && actorId) {
      for (const activity of activities) {
        ticket.activityLogs.push({
          action: activity.action,
          actorId,
          actorName: actorName || "Unknown",
          actorType: actorType || "agent",
          metadata: activity.metadata,
          createdAt: new Date(),
        } as any)
      }
    }

    ticket.updatedAt = new Date()
    await ticket.save()

    return NextResponse.json({
      success: true,
      data: ticket.toObject(),
    })
  } catch (error) {
    console.error("PATCH /api/tickets/[id] error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await connectDB()

    const { id } = await context.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 })
    }

    const ticket = await Ticket.findByIdAndDelete(id)

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { message: "Ticket deleted successfully" },
    })
  } catch (error) {
    console.error("DELETE /api/tickets/[id] error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
