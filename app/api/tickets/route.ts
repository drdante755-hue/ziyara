import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import connectDB from "@/lib/mongodb"
import Ticket from "@/models/Ticket"
import User from "@/models/User"
import type { ApiResponse } from "@/types/ticket"

function formatTicket(doc: any) {
  const getFullName = (user: any, fallbackName?: string) => {
    if (!user) return fallbackName || "عميل"
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim() || fallbackName || "عميل"
    }
    return fallbackName || "عميل"
  }

  return {
    id: doc._id.toString(),
    ticketNumber: doc.ticketNumber,
    title: doc.title,
    category: doc.category,
    customer: {
      id: doc.userId?._id?.toString() || doc.userId?.toString() || doc.customerId?.toString(),
      name: getFullName(doc.userId, doc.customerName) || "عميل",
      email: doc.userId?.email || doc.customerEmail || "غير متوفر",
      avatar: doc.userId?.avatar || doc.customerAvatar || "/placeholder.svg",
    },
    customerId: doc.userId?._id?.toString() || doc.userId?.toString(),
    status: doc.status === "resolved" ? "closed" : doc.status,
    priority: doc.priority === "urgent" ? "high" : doc.priority,
    assignee: doc.assigneeId
      ? {
          id: doc.assigneeId?._id?.toString() || doc.assigneeId?.toString(),
          name: getFullName(doc.assigneeId, doc.assigneeName),
          avatar: doc.assigneeId?.avatar || doc.assigneeAvatar || "/placeholder.svg",
        }
      : null,
    assigneeId: doc.assigneeId?._id?.toString() || doc.assigneeId?.toString() || null,
    tags: doc.tags || [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    lastMessage: doc.lastMessage || "",
    unreadCount: doc.unreadCount || 0,
    slaDeadline: doc.slaDeadline || null,
    messages: (doc.messages || []).map((msg: any) => ({
      id: msg._id.toString(),
      ticketId: doc._id.toString(),
      content: msg.content,
      sender: msg.sender,
      senderId: msg.senderId?.toString(),
      senderName: msg.senderName,
      timestamp: msg.createdAt,
      type: msg.type,
      attachments: msg.attachments,
    })),
  }
}

// GET /api/tickets - Get all tickets with optional filters
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)

    // Build query filters
    const query: any = {}

    const status = searchParams.get("status")
    if (status && ["open", "pending", "closed"].includes(status)) {
      query.status = status === "closed" ? { $in: ["closed", "resolved"] } : status
    }

    const priority = searchParams.get("priority")
    if (priority && ["low", "medium", "high"].includes(priority)) {
      query.priority = priority === "high" ? { $in: ["high", "urgent"] } : priority
    }

    const assigneeId = searchParams.get("assigneeId")
    if (assigneeId && mongoose.Types.ObjectId.isValid(assigneeId)) {
      query.assigneeId = new mongoose.Types.ObjectId(assigneeId)
    }

    const customerId = searchParams.get("customerId")
    if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
      query.userId = new mongoose.Types.ObjectId(customerId)
    }

    const unassigned = searchParams.get("unassigned")
    if (unassigned === "true") {
      query.assigneeId = { $exists: false }
    }

    const tickets = await Ticket.find(query)
      .populate("userId", "name email avatar firstName lastName")
      .populate("assigneeId", "name email avatar firstName lastName")
      .sort({ updatedAt: -1 })
      .lean()

    const [allCount, openCount, pendingCount, closedCount, highCount, unassignedCount] = await Promise.all([
      Ticket.countDocuments({}),
      Ticket.countDocuments({ status: "open" }),
      Ticket.countDocuments({ status: "pending" }),
      Ticket.countDocuments({ status: { $in: ["closed", "resolved"] } }),
      Ticket.countDocuments({ priority: { $in: ["high", "urgent"] } }),
      Ticket.countDocuments({ assigneeId: { $exists: false } }),
    ])

    const response: ApiResponse<any> = {
      success: true,
      data: {
        tickets: tickets.map(formatTicket),
        counts: {
          all: allCount,
          open: openCount,
          pending: pendingCount,
          closed: closedCount,
          high: highCount,
          unassigned: unassignedCount,
        },
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch tickets" }, { status: 500 })
  }
}

// POST /api/tickets - Create a new ticket
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    if (!body.title || !body.description) {
      return NextResponse.json(
        {
          success: false,
          error: "الحقول المطلوبة: العنوان والوصف",
        },
        { status: 400 },
      )
    }

    let customerData = {
      userId: body.customerId || body.userId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerAvatar: body.customerAvatar,
    }

    if (body.customerId && mongoose.Types.ObjectId.isValid(body.customerId)) {
      const customer = await User.findById(body.customerId).select("email firstName lastName")
      if (customer) {
        customerData = {
          userId: customer._id,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerEmail: customer.email,
          customerAvatar: undefined,
        }
      }
    }

    // Validate we have customer info
    if (!customerData.customerName || !customerData.customerEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "معلومات العميل مطلوبة (الاسم والبريد الإلكتروني)",
        },
        { status: 400 },
      )
    }

    // Create new ticket
    const ticket = await Ticket.create({
      title: body.title,
      category: body.category || "general",
      priority: body.priority || "medium",
      userId: customerData.userId,
      customerName: customerData.customerName,
      customerEmail: customerData.customerEmail,
      customerAvatar: customerData.customerAvatar,
      lastMessage: body.description,
      messages: [
        {
          content: body.description,
          sender: "customer",
          senderId: customerData.userId,
          senderName: customerData.customerName,
          type: "text",
        },
        {
          content: "تم فتح التذكرة",
          sender: "system",
          senderName: "النظام",
          type: "system",
        },
      ],
      activityLogs: [
        {
          action: "created",
          actorId: customerData.userId,
          actorName: customerData.customerName,
          actorType: "customer",
          metadata: { title: body.title },
        },
      ],
      slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours SLA
    })

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("userId", "name email avatar firstName lastName")
      .populate("assigneeId", "name email avatar firstName lastName")
      .lean()

    const response: ApiResponse<any> = {
      success: true,
      data: formatTicket(populatedTicket),
      message: "تم إنشاء التذكرة بنجاح",
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json({ success: false, error: "فشل إنشاء التذكرة" }, { status: 500 })
  }
}
