// User Ticket API Client
// Provides typed functions for user-side ticket operations

export interface UserTicket {
  id: string
  ticketNumber: string
  title: string
  category: string
  status: "open" | "pending" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  customerName: string
  customerEmail: string
  lastMessage: string
  unreadByCustomer: number
  createdAt: Date
  updatedAt: Date
  messagesCount: number
}

export interface UserTicketDetail extends UserTicket {
  assigneeName?: string
  assigneeAvatar?: string
  tags: string[]
  messages: UserTicketMessage[]
}

export interface UserTicketMessage {
  id: string
  content: string
  sender: "customer" | "agent" | "system"
  senderName: string
  type: "text" | "system" | "attachment"
  attachments?: {
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
  }[]
  createdAt: Date
}

export interface UserTicketCounts {
  all: number
  open: number
  resolved: number
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

const API_BASE = "/api/user/tickets"

// Helper function for API requests
async function fetchApi<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || "Request failed" }
    }

    return data
  } catch (error) {
    console.error("API Error:", error)
    return { success: false, error: "Network error" }
  }
}

// Get all tickets for a user
export async function getUserTickets(
  userId: string,
  status?: "all" | "open" | "resolved",
): Promise<{ tickets: UserTicket[]; counts: UserTicketCounts } | null> {
  const params = new URLSearchParams({ userId })
  if (status && status !== "all") {
    params.set("status", status)
  }

  const response = await fetchApi<{ tickets: UserTicket[]; counts: UserTicketCounts }>(
    `${API_BASE}?${params.toString()}`,
  )

  if (response.success && response.data) {
    return {
      tickets: response.data.tickets.map((t) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      })),
      counts: response.data.counts,
    }
  }

  return null
}

// Get single ticket with messages
export async function getUserTicketById(id: string): Promise<UserTicketDetail | null> {
  const response = await fetchApi<UserTicketDetail>(`${API_BASE}/${id}`)

  if (response.success && response.data) {
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
      messages: response.data.messages.map((m) => ({
        ...m,
        createdAt: new Date(m.createdAt),
      })),
    }
  }

  return null
}

// Create a new ticket
export async function createUserTicket(data: {
  userId: string
  title: string
  category: string
  description: string
  priority?: "low" | "medium" | "high" | "urgent"
  customerName: string
  customerEmail: string
  customerAvatar?: string
}): Promise<UserTicketDetail | null> {
  const response = await fetchApi<UserTicketDetail>(API_BASE, {
    method: "POST",
    body: JSON.stringify(data),
  })

  if (response.success && response.data) {
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
      messages: response.data.messages.map((m) => ({
        ...m,
        createdAt: new Date(m.createdAt),
      })),
    }
  }

  return null
}

// Send a message to a ticket
export async function sendUserTicketMessage(
  ticketId: string,
  data: {
    content: string
    userId: string
    senderName: string
    attachments?: {
      fileName: string
      fileUrl: string
      fileType: string
      fileSize: number
    }[]
  },
): Promise<UserTicketMessage | null> {
  const response = await fetchApi<UserTicketMessage>(`${API_BASE}/${ticketId}/messages`, {
    method: "POST",
    body: JSON.stringify(data),
  })

  if (response.success && response.data) {
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
    }
  }

  return null
}

export const userTicketsApi = {
  getUserTickets,
  getUserTicketById,
  createUserTicket,
  sendUserTicketMessage,
}
