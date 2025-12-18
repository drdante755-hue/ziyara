import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Ticket from "@/models/Ticket"
import mongoose from "mongoose"

// GET - Get all tickets for a user
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 })
    }

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, error: "Invalid userId" }, { status: 400 })
    }

    // Build query
    const query: Record<string, unknown> = { userId: new mongoose.Types.ObjectId(userId) }

    if (status) {
      if (status === "open") {
        query.status = { $in: ["open", "pending"] }
      } else if (status === "resolved") {
        query.status = { $in: ["resolved", "closed"] }
      } else {
        query.status = status
      }
    }

    const tickets = await Ticket.find(query).sort({ updatedAt: -1 }).lean()

    // Get counts
    const allTickets = await Ticket.find({ userId: new mongoose.Types.ObjectId(userId) }).lean()
    const counts = {
      all: allTickets.length,
      open: allTickets.filter((t) => t.status === "open" || t.status === "pending").length,
      resolved: allTickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
    }

    return NextResponse.json({
      success: true,
      data: {
        tickets: tickets.map((t) => ({
          id: t._id.toString(),
          ticketNumber: t.ticketNumber,
          title: t.title,
          category: t.category,
          status: t.status,
          priority: t.priority,
          customerName: t.customerName,
          customerEmail: t.customerEmail,
          lastMessage: t.lastMessage,
          unreadByCustomer: t.unreadByCustomer || 0,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          messagesCount: t.messages?.length || 0,
        })),
        counts,
      },
    })
  } catch (error) {
    console.error("Error fetching user tickets:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch tickets" }, { status: 500 })
  }
}

// POST - Create a new ticket
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const {
      userId,
      title,
      category,
      description,
      priority = "medium",
      customerName,
      customerEmail,
      customerAvatar,
    } = body

    // Validate required fields
    if (!userId || !title || !category || !description || !customerName || !customerEmail) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, error: "Invalid userId" }, { status: 400 })
    }

    const now = new Date()

    // Create initial message
    const initialMessage = {
      _id: new mongoose.Types.ObjectId(),
      content: description,
      sender: "customer" as const,
      senderId: new mongoose.Types.ObjectId(userId),
      senderName: customerName,
      type: "text" as const,
      createdAt: now,
    }

    // Create system message
    const systemMessage = {
      _id: new mongoose.Types.ObjectId(),
      content: "تم فتح التذكرة",
      sender: "system" as const,
      senderName: "النظام",
      type: "system" as const,
      createdAt: now,
    }

    // Create activity log
    const activityLog = {
      _id: new mongoose.Types.ObjectId(),
      action: "created" as const,
      actorId: new mongoose.Types.ObjectId(userId),
      actorName: customerName,
      actorType: "customer" as const,
      metadata: { title },
      createdAt: now,
    }

    // Create ticket
    const ticket = new Ticket({
      title,
      category,
      userId: new mongoose.Types.ObjectId(userId),
      customerName,
      customerEmail,
      customerAvatar: customerAvatar || "/default-avatar.png",
      status: "open",
      priority,
      tags: [category],
      messages: [initialMessage, systemMessage],
      lastMessage: description,
      unreadCount: 1, // Unread by agent
      unreadByCustomer: 0,
      activityLogs: [activityLog],
      slaDeadline: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours SLA
    })

    await ticket.save()

    return NextResponse.json({
      success: true,
      data: {
        id: ticket._id.toString(),
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        category: ticket.category,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        messages: ticket.messages.map((m) => ({
          id: m._id.toString(),
          content: m.content,
          sender: m.sender,
          senderName: m.senderName,
          type: m.type,
          createdAt: m.createdAt,
        })),
      },
    })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json({ success: false, error: "Failed to create ticket" }, { status: 500 })
  }
}
