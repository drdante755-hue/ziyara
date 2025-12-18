import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import connectDB from "@/lib/mongodb"
import Ticket from "@/models/Ticket"
import User from "@/models/User"
import type { CreateMessageRequest, ApiResponse } from "@/types/ticket"

// GET /api/tickets/[id]/messages - Get all messages for a ticket
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "معرف التذكرة غير صالح" }, { status: 400 })
    }

    const ticket = await Ticket.findById(id).select("messages")
    if (!ticket) {
      return NextResponse.json({ success: false, error: "التذكرة غير موجودة" }, { status: 404 })
    }

    const messages = ticket.messages.map((msg: any) => ({
      id: msg._id.toString(),
      ticketId: id,
      content: msg.content,
      sender: msg.sender,
      senderId: msg.senderId?.toString(),
      senderName: msg.senderName,
      timestamp: msg.createdAt,
      type: msg.type,
      attachments: msg.attachments,
    }))

    const response: ApiResponse<any[]> = {
      success: true,
      data: messages,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ success: false, error: "فشل جلب الرسائل" }, { status: 500 })
  }
}

// POST /api/tickets/[id]/messages - Add a new message to a ticket
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "معرف التذكرة غير صالح" }, { status: 400 })
    }

    const body: CreateMessageRequest = await request.json()

    const ticket = await Ticket.findById(id)
    if (!ticket) {
      return NextResponse.json({ success: false, error: "التذكرة غير موجودة" }, { status: 404 })
    }

    // Validate required fields
    if (!body.content) {
      return NextResponse.json(
        {
          success: false,
          error: "محتوى الرسالة مطلوب",
        },
        { status: 400 },
      )
    }

    // Only allow customer or agent as sender
    if (body.sender !== "customer" && body.sender !== "agent") {
      return NextResponse.json(
        {
          success: false,
          error: "نوع المرسل غير صالح. يجب أن يكون 'customer' أو 'agent'",
        },
        { status: 400 },
      )
    }

    const isValidSenderId = body.senderId && mongoose.Types.ObjectId.isValid(body.senderId)

    let senderName = body.senderName
    if (isValidSenderId) {
      const sender = await User.findById(body.senderId).select("firstName lastName")
      if (sender) {
        senderName = `${sender.firstName} ${sender.lastName}`.trim()
      }
    }

    if (!senderName) {
      senderName = body.sender === "agent" ? "فريق الدعم" : "العميل"
    }

    const newMessage = {
      content: body.content,
      sender: body.sender,
      senderId: isValidSenderId ? new mongoose.Types.ObjectId(body.senderId) : undefined,
      senderName: senderName,
      type: body.type || "text",
    }

    // Update ticket with new message
    const updateQuery: any = {
      $push: { messages: newMessage },
      lastMessage: body.content,
      updatedAt: new Date(),
    }

    // Increment unread count based on sender
    if (body.sender === "customer") {
      updateQuery.$inc = { unreadCount: 1 }
    } else if (body.sender === "agent") {
      updateQuery.$inc = { unreadByCustomer: 1 }
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(id, updateQuery, { new: true })

    const addedMessage = updatedTicket!.messages[updatedTicket!.messages.length - 1]

    const response: ApiResponse<any> = {
      success: true,
      data: {
        id: addedMessage._id.toString(),
        ticketId: id,
        content: addedMessage.content,
        sender: addedMessage.sender,
        senderId: addedMessage.senderId?.toString(),
        senderName: addedMessage.senderName,
        timestamp: addedMessage.createdAt,
        type: addedMessage.type,
      },
      message: "تم إرسال الرسالة بنجاح",
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Error adding message:", error)
    return NextResponse.json({ success: false, error: "فشل إرسال الرسالة" }, { status: 500 })
  }
}
