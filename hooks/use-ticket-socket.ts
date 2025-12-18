"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { io, type Socket } from "socket.io-client"

// Types matching socket-server/src/types.ts
export enum SenderType {
  USER = "user",
  AGENT = "agent",
  SYSTEM = "system",
}

export interface SocketMessage {
  _id: string
  ticketId: string
  senderId: string
  senderType: SenderType
  senderName: string
  content: string
  attachments?: Array<{
    filename: string
    url: string
    mimeType: string
    size: number
  }>
  isRead: boolean
  createdAt: string
}

export interface JoinTicketPayload {
  ticketId: string
  userId: string
  userType: SenderType
  userName: string
}

export interface SendMessagePayload {
  ticketId: string
  senderId: string
  senderType: SenderType
  senderName: string
  content: string
  attachments?: Array<{
    filename: string
    url: string
    mimeType: string
    size: number
  }>
}

export interface TypingPayload {
  ticketId: string
  senderId: string
  senderName: string
  isTyping: boolean
}

export interface TicketStatusChangePayload {
  ticketId: string
  status: string
  changedBy: string
  changedByName: string
}

export interface TicketUpdatedPayload {
  ticketId: string
  status: string
  changedBy: string
  changedByName: string
  timestamp: Date
}

export interface TicketDeletedPayload {
  ticketId: string
  deletedBy: string
  deletedByName: string
  timestamp: Date
}

export interface UserJoinedPayload {
  ticketId: string
  userId: string
  userName: string
  userType: SenderType
  timestamp: Date
}

export interface UserLeftPayload {
  ticketId: string
  userId: string
  userName: string
  timestamp: Date
}

interface UseTicketSocketOptions {
  userId: string
  userName: string
  userType: SenderType
  onMessageReceived?: (message: SocketMessage, ticketId: string) => void
  onTypingIndicator?: (ticketId: string, senderId: string, senderName: string, isTyping: boolean) => void
  onTicketUpdated?: (payload: TicketUpdatedPayload) => void
  onTicketDeleted?: (payload: TicketDeletedPayload) => void
  onUserJoined?: (payload: UserJoinedPayload) => void
  onUserLeft?: (payload: UserLeftPayload) => void
  onError?: (error: { message: string; code: string }) => void
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"

export function useTicketSocket(options: UseTicketSocketOptions) {
  const {
    userId,
    userName,
    userType,
    onMessageReceived,
    onTypingIndicator,
    onTicketUpdated,
    onTicketDeleted,
    onUserJoined,
    onUserLeft,
    onError,
  } = options

  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [joinedTickets, setJoinedTickets] = useState<Set<string>>(new Set())
  
  // Store callbacks in refs to avoid re-creating listeners
  const callbacksRef = useRef({
    onMessageReceived,
    onTypingIndicator,
    onTicketUpdated,
    onTicketDeleted,
    onUserJoined,
    onUserLeft,
    onError,
  })

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onMessageReceived,
      onTypingIndicator,
      onTicketUpdated,
      onTicketDeleted,
      onUserJoined,
      onUserLeft,
      onError,
    }
  }, [onMessageReceived, onTypingIndicator, onTicketUpdated, onTicketDeleted, onUserJoined, onUserLeft, onError])

  // Initialize socket connection
  useEffect(() => {
    console.log("[Socket] 🔌 Initializing connection to:", SOCKET_URL)
    
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false,
      autoConnect: true,
    })

    const socket = socketRef.current
    
    // Log initial connection state
    console.log("[Socket] Initial state - connected:", socket.connected)

    socket.on("connect", () => {
      console.log("[Socket] ✅ Connected to server:", socket.id)
      setIsConnected(true)
    })

    socket.on("disconnect", (reason) => {
      console.log("[Socket] ❌ Disconnected from server. Reason:", reason)
      setIsConnected(false)
    })

    socket.on("connect_error", (error) => {
      console.error("[Socket] ❌ Connection error:", error.message)
      console.error("[Socket] Socket URL:", SOCKET_URL)
      setIsConnected(false)
    })

    socket.on("reconnect", (attemptNumber) => {
      console.log("[Socket] 🔄 Reconnected to server after", attemptNumber, "attempts")
      setIsConnected(true)
    })

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("[Socket] 🔄 Reconnection attempt", attemptNumber)
    })

    socket.on("reconnect_error", (error) => {
      console.error("[Socket] ❌ Reconnection error:", error.message)
    })

    socket.on("reconnect_failed", () => {
      console.error("[Socket] ❌ Reconnection failed after all attempts")
      setIsConnected(false)
    })

    // Listen for incoming messages - use ref to access latest callback
    socket.on("message_received", (payload: { message: SocketMessage; ticketId: string }) => {
      console.log("[Socket] Message received:", payload)
      callbacksRef.current.onMessageReceived?.(payload.message, payload.ticketId)
    })

    // Listen for typing indicators
    socket.on(
      "typing_indicator",
      (payload: {
        ticketId: string
        senderId: string
        senderName: string
        isTyping: boolean
      }) => {
        callbacksRef.current.onTypingIndicator?.(payload.ticketId, payload.senderId, payload.senderName, payload.isTyping)
      },
    )

    // Listen for ticket updates
    socket.on("ticket_updated", (payload: TicketUpdatedPayload) => {
      console.log("[Socket] Ticket updated:", payload)
      callbacksRef.current.onTicketUpdated?.(payload)
    })

    // Listen for ticket deletion
    socket.on("ticket_deleted", (payload: TicketDeletedPayload) => {
      console.log("[Socket] Ticket deleted:", payload)
      callbacksRef.current.onTicketDeleted?.(payload)
    })

    // Listen for user joined
    socket.on("user_joined", (payload: UserJoinedPayload) => {
      console.log("[Socket] User joined:", payload)
      callbacksRef.current.onUserJoined?.(payload)
    })

    // Listen for user left
    socket.on("user_left", (payload: UserLeftPayload) => {
      console.log("[Socket] User left:", payload)
      callbacksRef.current.onUserLeft?.(payload)
    })

    // Listen for errors
    socket.on("error", (payload: { message: string; code: string }) => {
      console.error("[Socket] Error:", payload)
      callbacksRef.current.onError?.(payload)
    })

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log("[Socket] 🧹 Cleaning up connection")
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
      }
    }
  }, []) // Only run once on mount

  // Join a ticket room
  const joinTicket = useCallback(
    (ticketId: string) => {
      if (!socketRef.current || !isConnected) {
        console.warn("[Socket] Cannot join ticket - not connected")
        return
      }

      // Use functional update to avoid dependency on joinedTickets
      setJoinedTickets((prev) => {
        if (prev.has(ticketId)) {
          console.log("[Socket] Already joined ticket:", ticketId, "- skipping")
          return prev
        }

        const payload: JoinTicketPayload = {
          ticketId,
          userId,
          userType,
          userName,
        }

        console.log("[Socket] Joining ticket:", payload)
        socketRef.current?.emit("join_ticket", payload)
        return new Set(prev).add(ticketId)
      })
    },
    [isConnected, userId, userType, userName],
  )

  // Leave a ticket room
  const leaveTicket = useCallback(
    (ticketId: string) => {
      if (!socketRef.current) return

      socketRef.current.emit("leave_ticket", { ticketId, userId })
      setJoinedTickets((prev) => {
        const next = new Set(prev)
        next.delete(ticketId)
        return next
      })
    },
    [userId],
  )

  // Send a message
  const sendMessage = useCallback(
    (payload: Omit<SendMessagePayload, "senderId" | "senderType" | "senderName">) => {
      if (!socketRef.current || !isConnected) {
        console.warn("[Socket] Cannot send message - not connected")
        return false
      }

      const fullPayload: SendMessagePayload = {
        ...payload,
        senderId: userId,
        senderType: userType,
        senderName: userName,
      }

      console.log("[Socket] Sending message:", fullPayload)
      socketRef.current.emit("send_message", fullPayload)
      return true
    },
    [isConnected, userId, userType, userName],
  )

  // Send typing indicator
  const sendTyping = useCallback(
    (ticketId: string, isTyping: boolean) => {
      if (!socketRef.current || !isConnected) return

      const payload: TypingPayload = {
        ticketId,
        senderId: userId,
        senderName: userName,
        isTyping,
      }

      socketRef.current.emit("typing", payload)
    },
    [isConnected, userId, userName],
  )

  // Change ticket status
  const changeTicketStatus = useCallback(
    (ticketId: string, status: string) => {
      if (!socketRef.current || !isConnected) return

      const payload: TicketStatusChangePayload = {
        ticketId,
        status,
        changedBy: userId,
        changedByName: userName,
      }

      console.log("[Socket] Changing ticket status:", payload)
      socketRef.current.emit("ticket_status_change", payload)
    },
    [isConnected, userId, userName],
  )

  // Mark messages as read
  const markAsRead = useCallback(
    (ticketId: string) => {
      if (!socketRef.current || !isConnected) return

      socketRef.current.emit("mark_as_read", { ticketId, userId })
    },
    [isConnected, userId],
  )

  return {
    isConnected,
    joinedTickets,
    joinTicket,
    leaveTicket,
    sendMessage,
    sendTyping,
    changeTicketStatus,
    markAsRead,
  }
}
