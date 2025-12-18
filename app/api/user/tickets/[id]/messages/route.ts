import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Ticket from "@/models/Ticket"
import mongoose from "mongoose"

// POST - Send a message to a ticket
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()

    const { id } = await params
    const body = await request.json()
    const { content, userId, senderName, attachments } = body

    if (!content || !userId || !senderName) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid ticket ID" }, { status: 400 })
    }

    const ticket = await Ticket.findById(id)

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 })
    }

    // Verify the user owns this ticket
    if (ticket.userId.toString() !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const now = new Date()

    // Create new message
    const newMessage = {
      _id: new mongoose.Types.ObjectId(),
      content,
      sender: "customer" as const,
      senderId: new mongoose.Types.ObjectId(userId),
      senderName,
      type: attachments?.length ? ("attachment" as const) : ("text" as const),
      attachments: attachments || [],
      createdAt: now,
    }

    // Add activity log
    const activityLog = {
      _id: new mongoose.Types.ObjectId(),
      action: "message" as const,
      actorId: new mongoose.Types.ObjectId(userId),
      actorName: senderName,
      actorType: "customer" as const,
      metadata: { messageId: newMessage._id.toString() },
      createdAt: now,
    }

    // Check if ticket is closed - if so, reject the message
    if (ticket.status === "closed" || ticket.status === "resolved") {
      return NextResponse.json(
        { success: false, error: "لا يمكن إرسال رسالة إلى تذكرة مغلقة. التذكرة تم حذفها نهائياً." },
        { status: 403 }
      )
    }

    // Update ticket
    ticket.messages.push(newMessage)
    ticket.activityLogs.push(activityLog)
    ticket.lastMessage = content
    ticket.updatedAt = now
    ticket.unreadCount = (ticket.unreadCount || 0) + 1 // Increment unread for agents

    await ticket.save()

    return NextResponse.json({
      success: true,
      data: {
        id: newMessage._id.toString(),
        content: newMessage.content,
        sender: newMessage.sender,
        senderName: newMessage.senderName,
        type: newMessage.type,
        attachments: newMessage.attachments,
        createdAt: newMessage.createdAt,
      },
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 })
  }
}
