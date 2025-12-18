// Ticket API Client
// Provides typed functions to interact with the ticket API

import type {
  Ticket,
  Message,
  Agent,
  ActivityLogEntry,
  TicketCounts,
  ApiResponse,
  TicketStatus,
  TicketPriority,
  CreateTicketRequest,
  UpdateTicketRequest,
  CreateMessageRequest,
} from "@/types/ticket"

const API_BASE = "/api/tickets"

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

// ============ TICKETS ============

export interface GetTicketsParams {
  status?: TicketStatus
  priority?: TicketPriority
  assigneeId?: string
  customerId?: string
  unassigned?: boolean
}

export async function getTickets(params?: GetTicketsParams): Promise<{
  tickets: Ticket[]
  counts: TicketCounts
} | null> {
  const searchParams = new URLSearchParams()

  if (params?.status) searchParams.set("status", params.status)
  if (params?.priority) searchParams.set("priority", params.priority)
  if (params?.assigneeId) searchParams.set("assigneeId", params.assigneeId)
  if (params?.customerId) searchParams.set("customerId", params.customerId)
  if (params?.unassigned) searchParams.set("unassigned", "true")

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
  const response = await fetchApi<{ tickets: Ticket[]; counts: TicketCounts }>(url)

  if (response.success && response.data) {
    // Convert date strings to Date objects
    response.data.tickets = response.data.tickets.map((ticket) => ({
      ...ticket,
      createdAt: new Date(ticket.createdAt),
      updatedAt: new Date(ticket.updatedAt),
      slaDeadline: ticket.slaDeadline ? new Date(ticket.slaDeadline) : null,
      messages: ticket.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }))
    return response.data
  }

  return null
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const response = await fetchApi<Ticket>(`${API_BASE}/${id}`)

  if (response.success && response.data) {
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
      slaDeadline: response.data.slaDeadline ? new Date(response.data.slaDeadline) : null,
      messages: response.data.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }
  }

  return null
}

export async function createTicket(data: CreateTicketRequest): Promise<Ticket | null> {
  const response = await fetchApi<Ticket>(API_BASE, {
    method: "POST",
    body: JSON.stringify(data),
  })

  if (response.success && response.data) {
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
      slaDeadline: response.data.slaDeadline ? new Date(response.data.slaDeadline) : null,
      messages: response.data.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }
  }

  return null
}

export async function updateTicket(
  id: string,
  updates: UpdateTicketRequest,
  actor?: { id: string; name: string; type: "agent" | "system" },
): Promise<Ticket | null> {
  const response = await fetchApi<Ticket>(`${API_BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...updates,
      actorId: actor?.id,
      actorName: actor?.name,
      actorType: actor?.type,
    }),
  })

  if (response.success && response.data) {
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
      slaDeadline: response.data.slaDeadline ? new Date(response.data.slaDeadline) : null,
      messages: response.data.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }
  }

  return null
}

// ============ MESSAGES ============

export async function getMessages(ticketId: string): Promise<Message[] | null> {
  const response = await fetchApi<Message[]>(`${API_BASE}/${ticketId}/messages`)

  if (response.success && response.data) {
    return response.data.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }))
  }

  return null
}

export async function sendMessage(ticketId: string, data: CreateMessageRequest): Promise<Message | null> {
  const response = await fetchApi<Message>(`${API_BASE}/${ticketId}/messages`, {
    method: "POST",
    body: JSON.stringify(data),
  })

  if (response.success && response.data) {
    return {
      ...response.data,
      timestamp: new Date(response.data.timestamp),
    }
  }

  return null
}

// ============ AGENTS ============

export async function getAgents(): Promise<Agent[] | null> {
  const response = await fetchApi<Agent[]>(`${API_BASE}/agents`)

  if (response.success && response.data) {
    return response.data.map((agent) => ({
      ...agent,
      createdAt: new Date(agent.createdAt),
    }))
  }

  return null
}

// ============ ACTIVITY LOGS ============

export async function getActivityLogs(ticketId: string): Promise<ActivityLogEntry[] | null> {
  const response = await fetchApi<ActivityLogEntry[]>(`${API_BASE}/${ticketId}/activity`)

  if (response.success && response.data) {
    return response.data.map((log) => ({
      ...log,
      createdAt: new Date(log.createdAt),
    }))
  }

  return null
}

// ============ COUNTS ============

export async function getTicketCounts(customerId?: string): Promise<TicketCounts | null> {
  const url = customerId ? `${API_BASE}/counts?customerId=${customerId}` : `${API_BASE}/counts`
  const response = await fetchApi<TicketCounts>(url)

  return response.success ? response.data || null : null
}

export const ticketApi = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  getMessages,
  sendMessage,
  getAgents,
  getActivityLogs,
  getTicketCounts,
}

// Re-export types for convenience
export type { Ticket, Message, Agent, TicketCounts }
