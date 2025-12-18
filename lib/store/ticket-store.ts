// In-Memory Ticket Store
// This can be replaced with any database later (Supabase, MongoDB, etc.)

import type { Ticket, Message, Agent, ActivityLogEntry, Attachment, TicketStatus, TicketPriority } from "@/types/ticket"

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Sample Agents
const initialAgents: Agent[] = [
  {
    id: "agent-1",
    name: "علي أحمد",
    email: "ali@support.com",
    avatar: "/ali-agent.jpg",
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "agent-2",
    name: "فاطمة حسن",
    email: "fatima@support.com",
    avatar: "/fatima-agent.jpg",
    role: "agent",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "agent-3",
    name: "يوسف محمد",
    email: "youssef@support.com",
    avatar: "/youssef-agent.jpg",
    role: "agent",
    createdAt: new Date("2024-02-01"),
  },
]

// Sample Tickets
const initialTickets: Ticket[] = [
  {
    id: "ticket-1001",
    title: "تأخر في شحنة",
    category: "shipping",
    customer: {
      id: "customer-1",
      name: "أحمد محمد",
      email: "ahmed@example.com",
      avatar: "/ahmed-avatar.png",
    },
    customerId: "customer-1",
    status: "open",
    priority: "high",
    assignee: null,
    assigneeId: null,
    tags: ["شحن", "عاجل"],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000),
    lastMessage: "أين طلبي؟ لقد مر أسبوع ولم يصل بعد",
    unreadCount: 3,
    slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
    messages: [
      {
        id: "msg-1",
        ticketId: "ticket-1001",
        content: "مرحباً، أريد الاستفسار عن طلبي رقم #12345",
        sender: "customer",
        senderId: "customer-1",
        senderName: "أحمد محمد",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: "text",
      },
      {
        id: "msg-2",
        ticketId: "ticket-1001",
        content: "تم فتح التذكرة",
        sender: "system",
        senderName: "النظام",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: "system",
      },
      {
        id: "msg-3",
        ticketId: "ticket-1001",
        content: "لقد مر أسبوع ولم يصل الطلب بعد",
        sender: "customer",
        senderId: "customer-1",
        senderName: "أحمد محمد",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        type: "text",
      },
      {
        id: "msg-4",
        ticketId: "ticket-1001",
        content: "أين طلبي؟ لقد مر أسبوع ولم يصل بعد",
        sender: "customer",
        senderId: "customer-1",
        senderName: "أحمد محمد",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        type: "text",
      },
    ],
  },
  {
    id: "ticket-1002",
    title: "خطأ في الفاتورة",
    category: "billing",
    customer: {
      id: "customer-2",
      name: "سارة علي",
      email: "sara@example.com",
      avatar: "/sara-avatar-woman.jpg",
    },
    customerId: "customer-2",
    status: "pending",
    priority: "medium",
    assignee: {
      id: "agent-1",
      name: "علي أحمد",
      avatar: "/ali-agent-avatar.jpg",
    },
    assigneeId: "agent-1",
    tags: ["فواتير", "مالية"],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    lastMessage: "شكراً، سأنتظر التحديث",
    unreadCount: 0,
    slaDeadline: new Date(Date.now() + 5 * 60 * 60 * 1000),
    messages: [
      {
        id: "msg-5",
        ticketId: "ticket-1002",
        content: "مرحباً، هناك خطأ في الفاتورة الأخيرة",
        sender: "customer",
        senderId: "customer-2",
        senderName: "سارة علي",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        type: "text",
      },
      {
        id: "msg-6",
        ticketId: "ticket-1002",
        content: "تم تعيين التذكرة إلى علي أحمد",
        sender: "system",
        senderName: "النظام",
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
        type: "system",
      },
      {
        id: "msg-7",
        ticketId: "ticket-1002",
        content: "مرحباً سارة، سأراجع الفاتورة وأعود إليك",
        sender: "agent",
        senderId: "agent-1",
        senderName: "علي أحمد",
        timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
        type: "text",
      },
      {
        id: "msg-8",
        ticketId: "ticket-1002",
        content: "شكراً، سأنتظر التحديث",
        sender: "customer",
        senderId: "customer-2",
        senderName: "سارة علي",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        type: "text",
      },
    ],
  },
  {
    id: "ticket-1003",
    title: "استفسار عن منتج",
    category: "inquiry",
    customer: {
      id: "customer-3",
      name: "محمد خالد",
      email: "mohamed@example.com",
      avatar: "/mohamed-avatar-man.jpg",
    },
    customerId: "customer-3",
    status: "closed",
    priority: "low",
    assignee: {
      id: "agent-2",
      name: "فاطمة حسن",
      avatar: "/fatima-agent-avatar-woman.jpg",
    },
    assigneeId: "agent-2",
    tags: ["استفسار", "منتجات"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastMessage: "شكراً جزيلاً على المساعدة!",
    unreadCount: 0,
    slaDeadline: null,
    messages: [
      {
        id: "msg-9",
        ticketId: "ticket-1003",
        content: "هل يتوفر المنتج X باللون الأزرق؟",
        sender: "customer",
        senderId: "customer-3",
        senderName: "محمد خالد",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        type: "text",
      },
      {
        id: "msg-10",
        ticketId: "ticket-1003",
        content: "نعم، المنتج متوفر باللون الأزرق والأحمر والأسود",
        sender: "agent",
        senderId: "agent-2",
        senderName: "فاطمة حسن",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        type: "text",
      },
      {
        id: "msg-11",
        ticketId: "ticket-1003",
        content: "شكراً جزيلاً على المساعدة!",
        sender: "customer",
        senderId: "customer-3",
        senderName: "محمد خالد",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        type: "text",
      },
      {
        id: "msg-12",
        ticketId: "ticket-1003",
        content: "تم إغلاق التذكرة",
        sender: "system",
        senderName: "النظام",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        type: "system",
      },
    ],
  },
]

// Initial Activity Logs
const initialActivityLogs: ActivityLogEntry[] = [
  {
    id: "activity-1",
    ticketId: "ticket-1001",
    action: "created",
    actorId: "customer-1",
    actorName: "أحمد محمد",
    actorType: "customer",
    metadata: { title: "تأخر في شحنة" },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "activity-2",
    ticketId: "ticket-1002",
    action: "created",
    actorId: "customer-2",
    actorName: "سارة علي",
    actorType: "customer",
    metadata: { title: "خطأ في الفاتورة" },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "activity-3",
    ticketId: "ticket-1002",
    action: "assigned",
    actorId: "agent-1",
    actorName: "علي أحمد",
    actorType: "agent",
    metadata: { assigneeName: "علي أحمد" },
    createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
  },
]

// In-Memory Store
class TicketStore {
  private tickets: Map<string, Ticket> = new Map()
  private agents: Map<string, Agent> = new Map()
  private activityLogs: Map<string, ActivityLogEntry[]> = new Map()
  private attachments: Map<string, Attachment> = new Map()

  constructor() {
    // Initialize with sample data
    initialTickets.forEach((t) => this.tickets.set(t.id, t))
    initialAgents.forEach((a) => this.agents.set(a.id, a))

    // Group activity logs by ticket
    initialActivityLogs.forEach((log) => {
      const existing = this.activityLogs.get(log.ticketId) || []
      existing.push(log)
      this.activityLogs.set(log.ticketId, existing)
    })
  }

  // ============ TICKETS ============

  getAllTickets(filters?: {
    status?: TicketStatus
    priority?: TicketPriority
    assigneeId?: string
    customerId?: string
    unassigned?: boolean
  }): Ticket[] {
    let tickets = Array.from(this.tickets.values())

    if (filters) {
      if (filters.status) {
        tickets = tickets.filter((t) => t.status === filters.status)
      }
      if (filters.priority) {
        tickets = tickets.filter((t) => t.priority === filters.priority)
      }
      if (filters.assigneeId) {
        tickets = tickets.filter((t) => t.assigneeId === filters.assigneeId)
      }
      if (filters.customerId) {
        tickets = tickets.filter((t) => t.customerId === filters.customerId)
      }
      if (filters.unassigned) {
        tickets = tickets.filter((t) => !t.assigneeId)
      }
    }

    // Sort by updatedAt descending
    return tickets.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  getTicketById(id: string): Ticket | undefined {
    return this.tickets.get(id)
  }

  createTicket(data: {
    title: string
    category: string
    priority: TicketPriority
    description: string
    customerId: string
    customerName: string
    customerEmail: string
    customerAvatar?: string
  }): Ticket {
    const id = `ticket-${generateId()}`
    const now = new Date()

    const ticket: Ticket = {
      id,
      title: data.title,
      category: data.category,
      customer: {
        id: data.customerId,
        name: data.customerName,
        email: data.customerEmail,
        avatar: data.customerAvatar || "/default-avatar.png",
      },
      customerId: data.customerId,
      status: "open",
      priority: data.priority,
      assignee: null,
      assigneeId: null,
      tags: [data.category],
      createdAt: now,
      updatedAt: now,
      lastMessage: data.description,
      unreadCount: 1,
      slaDeadline: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours SLA
      messages: [
        {
          id: `msg-${generateId()}`,
          ticketId: id,
          content: data.description,
          sender: "customer",
          senderId: data.customerId,
          senderName: data.customerName,
          timestamp: now,
          type: "text",
        },
        {
          id: `msg-${generateId()}`,
          ticketId: id,
          content: "تم فتح التذكرة",
          sender: "system",
          senderName: "النظام",
          timestamp: now,
          type: "system",
        },
      ],
    }

    this.tickets.set(id, ticket)

    // Add activity log
    this.addActivityLog(id, {
      action: "created",
      actorId: data.customerId,
      actorName: data.customerName,
      actorType: "customer",
      metadata: { title: data.title },
    })

    return ticket
  }

  updateTicket(
    id: string,
    updates: {
      status?: TicketStatus
      priority?: TicketPriority
      assigneeId?: string | null
      tags?: string[]
    },
    actor: { id: string; name: string; type: "agent" | "system" },
  ): Ticket | undefined {
    const ticket = this.tickets.get(id)
    if (!ticket) return undefined

    const now = new Date()
    const systemMessages: Message[] = []

    // Handle status change
    if (updates.status && updates.status !== ticket.status) {
      const statusLabels: Record<TicketStatus, string> = {
        open: "مفتوحة",
        pending: "قيد الانتظار",
        closed: "مغلقة",
      }
      systemMessages.push({
        id: `msg-${generateId()}`,
        ticketId: id,
        content: `تم تغيير حالة التذكرة إلى "${statusLabels[updates.status]}"`,
        sender: "system",
        senderName: "النظام",
        timestamp: now,
        type: "system",
      })

      this.addActivityLog(id, {
        action: "status_change",
        actorId: actor.id,
        actorName: actor.name,
        actorType: actor.type,
        metadata: { from: ticket.status, to: updates.status },
      })
    }

    // Handle priority change
    if (updates.priority && updates.priority !== ticket.priority) {
      const priorityLabels: Record<TicketPriority, string> = {
        low: "منخفضة",
        medium: "متوسطة",
        high: "عالية",
      }
      systemMessages.push({
        id: `msg-${generateId()}`,
        ticketId: id,
        content: `تم تغيير الأولوية إلى "${priorityLabels[updates.priority]}"`,
        sender: "system",
        senderName: "النظام",
        timestamp: now,
        type: "system",
      })

      this.addActivityLog(id, {
        action: "priority_change",
        actorId: actor.id,
        actorName: actor.name,
        actorType: actor.type,
        metadata: { from: ticket.priority, to: updates.priority },
      })
    }

    // Handle assignee change
    if (updates.assigneeId !== undefined && updates.assigneeId !== ticket.assigneeId) {
      if (updates.assigneeId) {
        const agent = this.agents.get(updates.assigneeId)
        if (agent) {
          ticket.assignee = {
            id: agent.id,
            name: agent.name,
            avatar: agent.avatar,
          }
          systemMessages.push({
            id: `msg-${generateId()}`,
            ticketId: id,
            content: `تم تعيين التذكرة إلى ${agent.name}`,
            sender: "system",
            senderName: "النظام",
            timestamp: now,
            type: "system",
          })

          this.addActivityLog(id, {
            action: "assigned",
            actorId: actor.id,
            actorName: actor.name,
            actorType: actor.type,
            metadata: { assigneeId: agent.id, assigneeName: agent.name },
          })
        }
      } else {
        ticket.assignee = null
        systemMessages.push({
          id: `msg-${generateId()}`,
          ticketId: id,
          content: "تم إلغاء تعيين التذكرة",
          sender: "system",
          senderName: "النظام",
          timestamp: now,
          type: "system",
        })

        this.addActivityLog(id, {
          action: "unassigned",
          actorId: actor.id,
          actorName: actor.name,
          actorType: actor.type,
          metadata: {},
        })
      }
    }

    // Apply updates
    const updatedTicket: Ticket = {
      ...ticket,
      status: updates.status ?? ticket.status,
      priority: updates.priority ?? ticket.priority,
      assigneeId: updates.assigneeId !== undefined ? updates.assigneeId : ticket.assigneeId,
      tags: updates.tags ?? ticket.tags,
      updatedAt: now,
      messages: [...ticket.messages, ...systemMessages],
    }

    if (systemMessages.length > 0) {
      updatedTicket.lastMessage = systemMessages[systemMessages.length - 1].content
    }

    this.tickets.set(id, updatedTicket)
    return updatedTicket
  }

  // ============ MESSAGES ============

  addMessage(
    ticketId: string,
    data: {
      content: string
      sender: "customer" | "agent"
      senderId: string
      senderName: string
      type?: "text" | "attachment"
      attachments?: Attachment[]
    },
  ): Message | undefined {
    const ticket = this.tickets.get(ticketId)
    if (!ticket) return undefined

    const now = new Date()
    const message: Message = {
      id: `msg-${generateId()}`,
      ticketId,
      content: data.content,
      sender: data.sender,
      senderId: data.senderId,
      senderName: data.senderName,
      timestamp: now,
      type: data.type || "text",
      attachments: data.attachments,
    }

    ticket.messages.push(message)
    ticket.lastMessage = data.content
    ticket.updatedAt = now

    // Update unread count based on sender
    if (data.sender === "customer") {
      ticket.unreadCount += 1
    }

    this.tickets.set(ticketId, ticket)

    // Add activity log
    this.addActivityLog(ticketId, {
      action: "message",
      actorId: data.senderId,
      actorName: data.senderName,
      actorType: data.sender === "customer" ? "customer" : "agent",
      metadata: { messageId: message.id },
    })

    return message
  }

  getMessages(ticketId: string): Message[] {
    const ticket = this.tickets.get(ticketId)
    return ticket?.messages || []
  }

  markTicketAsRead(ticketId: string): void {
    const ticket = this.tickets.get(ticketId)
    if (ticket) {
      ticket.unreadCount = 0
      this.tickets.set(ticketId, ticket)
    }
  }

  // ============ AGENTS ============

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values())
  }

  getAgentById(id: string): Agent | undefined {
    return this.agents.get(id)
  }

  // ============ ACTIVITY LOGS ============

  addActivityLog(
    ticketId: string,
    data: {
      action: ActivityLogEntry["action"]
      actorId?: string
      actorName: string
      actorType: "customer" | "agent" | "system"
      metadata: Record<string, unknown>
    },
  ): void {
    const log: ActivityLogEntry = {
      id: `activity-${generateId()}`,
      ticketId,
      action: data.action,
      actorId: data.actorId,
      actorName: data.actorName,
      actorType: data.actorType,
      metadata: data.metadata,
      createdAt: new Date(),
    }

    const existing = this.activityLogs.get(ticketId) || []
    existing.push(log)
    this.activityLogs.set(ticketId, existing)
  }

  getActivityLogs(ticketId: string): ActivityLogEntry[] {
    return (this.activityLogs.get(ticketId) || []).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // ============ COUNTS ============

  getTicketCounts(customerId?: string): {
    all: number
    open: number
    pending: number
    closed: number
    high: number
    unassigned: number
  } {
    let tickets = Array.from(this.tickets.values())

    if (customerId) {
      tickets = tickets.filter((t) => t.customerId === customerId)
    }

    return {
      all: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      pending: tickets.filter((t) => t.status === "pending").length,
      closed: tickets.filter((t) => t.status === "closed").length,
      high: tickets.filter((t) => t.priority === "high").length,
      unassigned: tickets.filter((t) => !t.assigneeId).length,
    }
  }
}

// Export singleton instance
export const ticketStore = new TicketStore()
