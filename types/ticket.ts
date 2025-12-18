// Ticket System Types - Extended for Backend

// Enums and Base Types
export type TicketStatus = "open" | "pending" | "resolved" | "closed" | "auto_created"
export type TicketPriority = "low" | "medium" | "high"
export type MessageSender = "customer" | "agent" | "system"
export type MessageType = "text" | "system" | "attachment"
export type AgentRole = "admin" | "agent"
export type ActivityAction =
  | "created"
  | "status_change"
  | "priority_change"
  | "assigned"
  | "unassigned"
  | "message"
  | "note_added"

// Customer / User
export interface Customer {
  id?: string
  name: string
  email: string
  avatar: string
}

// Assignee (simplified for display)
export interface Assignee {
  id: string
  name: string
  avatar: string
}

// Agent (support team member)
export interface Agent {
  id: string
  name: string
  email: string
  avatar: string
  role: AgentRole
  createdAt: Date
}

// Message in ticket conversation
export interface Message {
  id: string
  ticketId: string
  content: string
  sender: MessageSender
  senderId?: string
  senderName: string
  timestamp: Date
  type: MessageType
  attachments?: Attachment[]
}

// Attachment
export interface Attachment {
  id: string
  ticketId: string
  messageId: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  createdAt: Date
}

// Activity Log Entry
export interface ActivityLogEntry {
  id: string
  ticketId: string
  action: ActivityAction
  actorId?: string
  actorName: string
  actorType: "customer" | "agent" | "system"
  metadata: Record<string, unknown>
  createdAt: Date
}

// Main Ticket Interface
export interface Ticket {
  id: string
  title: string
  category: string
  customer: Customer
  customerId?: string
  status: TicketStatus
  priority: TicketPriority
  assignee: Assignee | null
  assigneeId: string | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
  lastMessage: string
  unreadCount: number
  slaDeadline: Date | null
  messages: Message[]
}

// API Request/Response Types
export interface CreateTicketRequest {
  title: string
  category: string
  priority: TicketPriority
  description: string
  customerId?: string
  customerName: string
  customerEmail: string
  customerAvatar?: string
}

export interface UpdateTicketRequest {
  status?: TicketStatus
  priority?: TicketPriority
  assigneeId?: string | null
  tags?: string[]
}

export interface CreateMessageRequest {
  content: string
  sender: MessageSender
  senderId?: string
  senderName: string
  type?: MessageType
  attachments?: {
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
  }[]
}

export interface TicketFilters {
  status?: TicketStatus
  priority?: TicketPriority
  assigneeId?: string
  customerId?: string
  unassigned?: boolean
}

export interface TicketCounts {
  all: number
  open: number
  pending: number
  closed: number
  high: number
  unassigned: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Legacy support - keep for compatibility
export interface CreateTicketData {
  title: string
  category: string
  priority: string
  description: string
}
