import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Ticket from "@/models/Ticket"
import mongoose from "mongoose"

// GET - Get single ticket with messages
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ticket ID" }, { status: 400 })
    }

    const ticket = await Ticket.findById(id).lean()

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 })
    }

    // Mark as read by customer
    await Ticket.findByIdAndUpdate(id, { unreadByCustomer: 0 })

    return NextResponse.json({
      success: true,
      data: {
        id: ticket._id.toString(),
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        category: ticket.category,
        status: ticket.status,
        priority: ticket.priority,
        customerName: ticket.customerName,
        customerEmail: ticket.customerEmail,
        assigneeName: ticket.assigneeName,
        assigneeAvatar: ticket.assigneeAvatar,
        tags: ticket.tags,
        lastMessage: ticket.lastMessage,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        messages: ticket.messages.map((m) => ({
          id: m._id.toString(),
          content: m.content,
          sender: m.sender,
          senderName: m.senderName,
          type: m.type,
          attachments: m.attachments,
          createdAt: m.createdAt,
        })),
      },
    })
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch ticket" }, { status: 500 })
  }
}
