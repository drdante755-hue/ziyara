"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import {
  Search,
  Clock,
  CheckCircle2,
  MessageCircle,
  ArrowLeft,
  Loader2,
  Plus,
  Inbox,
  Users,
  AlertTriangle,
  Send,
  Paperclip,
  X,
  ImageIcon,
  File,
  Smile,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, format } from "date-fns"
import { ar } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMediaQuery } from "@/hooks/use-media-query"
import { CreateTicketModal } from "@/components/tickets/create-ticket-modal"
import { TicketDetails } from "@/components/tickets/ticket-details"
import { ticketApi, type Ticket, type Agent, type TicketCounts, type Message } from "@/lib/api/tickets"
import {
  useTicketSocket,
  SenderType,
  type SocketMessage,
  type TicketUpdatedPayload,
  type TicketDeletedPayload,
} from "@/hooks/use-ticket-socket"
import { useSession } from "next-auth/react"

// This will be set from session
const CURRENT_AGENT = {
  id: "",
  name: "مدير النظام",
  avatar: "/agent-avatar.png",
}

const quickReplies = [
  "شكراً لتواصلك معنا، سنقوم بمراجعة طلبك",
  "تم استلام طلبك وجاري العمل عليه",
  "هل يمكنك تزويدنا بمزيد من التفاصيل؟",
  "تم حل المشكلة، هل تحتاج مساعدة إضافية؟",
]

const filterTabs = [
  { id: "all", label: "الكل", icon: Inbox },
  { id: "open", label: "مفتوحة", icon: MessageCircle },
  { id: "pending", label: "قيد الانتظار", icon: Clock },
  { id: "closed", label: "مغلقة", icon: CheckCircle2 },
  { id: "high", label: "أولوية عالية", icon: AlertTriangle },
  { id: "unassigned", label: "غير معينة", icon: Users },
]

export default function AdminTicketsPage() {
  const { data: session } = useSession()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [ticketCounts, setTicketCounts] = useState<TicketCounts>({
    all: 0,
    open: 0,
    pending: 0,
    closed: 0,
    high: 0,
    unassigned: 0,
  })
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [mobileView, setMobileView] = useState<"list" | "chat">("list")
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMobile = useMediaQuery("(max-width: 1024px)")

  // Get agent info from session - must be valid MongoDB ObjectId
  const agentId = session?.user?.id || ""
  const agentName = session?.user?.name || "مدير النظام"

  const {
    isConnected,
    joinTicket,
    leaveTicket,
    sendMessage: socketSendMessage,
    sendTyping,
    changeTicketStatus,
    markAsRead,
  } = useTicketSocket({
    userId: agentId,
    userName: agentName,
    userType: SenderType.AGENT,
    onMessageReceived: useCallback(
      (socketMessage: SocketMessage, ticketId: string) => {
        const newMessage: Message = {
          id: socketMessage._id,
          ticketId: ticketId,
          content: socketMessage.content,
          sender: socketMessage.senderType === SenderType.AGENT ? "agent" : "customer",
          senderId: socketMessage.senderId,
          senderName: socketMessage.senderName,
          timestamp: new Date(socketMessage.createdAt),
          type: "text",
          attachments: socketMessage.attachments?.map((att) => ({
            id: att.url || crypto.randomUUID(),
            ticketId: ticketId,
            messageId: socketMessage._id,
            fileName: att.filename,
            fileUrl: att.url,
            fileType: att.mimeType,
            fileSize: att.size,
            createdAt: new Date(),
          })),
        }

        setTickets((prev) =>
          prev.map((t) => {
            if (t.id === ticketId) {
              const messageExists = t.messages.some((m) => m.id === newMessage.id)
              if (messageExists) return t
              return {
                ...t,
                messages: [...t.messages, newMessage],
                lastMessage: newMessage.content,
                updatedAt: newMessage.timestamp,
                unreadCount: t.id === selectedTicketId ? 0 : t.unreadCount + 1,
              }
            }
            return t
          }),
        )

        if (ticketId === selectedTicketId) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
          }, 100)
        }
      },
      [selectedTicketId],
    ),
    onTypingIndicator: useCallback((ticketId: string, senderId: string, senderName: string, isTyping: boolean) => {
      if (senderId === agentId) return

      setTypingUsers((prev) => {
        const next = new Map(prev)
        if (isTyping) {
          next.set(`${ticketId}-${senderId}`, senderName)
        } else {
          next.delete(`${ticketId}-${senderId}`)
        }
        return next
      })
    }, []),
    onTicketUpdated: useCallback((payload: TicketUpdatedPayload) => {
      setTickets((prev) =>
        prev.map((t) => (t.id === payload.ticketId ? { ...t, status: payload.status as Ticket["status"] } : t)),
      )
      fetchTicketCounts()
    }, []),
    onTicketDeleted: useCallback(
      (payload: TicketDeletedPayload) => {
        console.log("[Admin] Ticket deleted:", payload)
        // Remove ticket from list
        setTickets((prev) => prev.filter((t) => t.id !== payload.ticketId))

        // Clear selected ticket if it was the deleted one
        if (selectedTicketId === payload.ticketId) {
          setSelectedTicketId(null)
        }

        // Refresh counts
        fetchTicketCounts()
      },
      [selectedTicketId],
    ),
  })

  const fetchTickets = useCallback(async () => {
    setIsLoading(true)
    const result = await ticketApi.getTickets()
    if (result) {
      setTickets(result.tickets)
      setTicketCounts(result.counts)
      if (!selectedTicketId && result.tickets.length > 0) {
        setSelectedTicketId(result.tickets[0].id)
      }
    }
    setIsLoading(false)
  }, [selectedTicketId])

  const fetchTicketCounts = async () => {
    const result = await ticketApi.getTickets()
    if (result) {
      setTicketCounts(result.counts)
    }
  }

  const fetchAgents = useCallback(async () => {
    const result = await ticketApi.getAgents()
    if (result) {
      setAgents(result)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
    fetchAgents()
  }, [fetchTickets, fetchAgents])

  // Use refs for socket functions to avoid re-running useEffect
  const joinTicketRef = useRef(joinTicket)
  const leaveTicketRef = useRef(leaveTicket)
  const markAsReadRef = useRef(markAsRead)

  useEffect(() => {
    joinTicketRef.current = joinTicket
    leaveTicketRef.current = leaveTicket
    markAsReadRef.current = markAsRead
  }, [joinTicket, leaveTicket, markAsRead])

  useEffect(() => {
    if (selectedTicketId && isConnected) {
      console.log("[Admin Tickets] Joining ticket room:", selectedTicketId)
      joinTicketRef.current(selectedTicketId)
      markAsReadRef.current(selectedTicketId)
    }

    return () => {
      if (selectedTicketId) {
        console.log("[Admin Tickets] Leaving ticket room:", selectedTicketId)
        leaveTicketRef.current(selectedTicketId)
      }
    }
  }, [selectedTicketId, isConnected])

  // Memoize selectedTicket to ensure it updates when tickets change
  const selectedTicket = useMemo(() => {
    return tickets.find((t) => t.id === selectedTicketId) || null
  }, [tickets, selectedTicketId])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (selectedTicket?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedTicket?.messages])

  const filteredTickets = tickets.filter((ticket) => {
    let matchesFilter = true
    switch (activeFilter) {
      case "open":
        matchesFilter = ticket.status === "open"
        break
      case "pending":
        matchesFilter = ticket.status === "pending"
        break
      case "closed":
        matchesFilter = ticket.status === "closed"
        break
      case "high":
        matchesFilter = ticket.priority === "high"
        break
      case "unassigned":
        matchesFilter = !ticket.assignee
        break
    }

    const matchesSearch =
      !searchTerm ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const handleSelectTicket = async (ticketId: string) => {
    if (selectedTicketId && selectedTicketId !== ticketId) {
      leaveTicket(selectedTicketId)
    }

    setSelectedTicketId(ticketId)
    const ticket = await ticketApi.getTicketById(ticketId)
    if (ticket) {
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, ...ticket, unreadCount: 0 } : t)))
    }
    if (isMobile) {
      setMobileView("chat")
    }
  }

  const handleSendMessage = async () => {
    if (!selectedTicketId || !message.trim()) return

    // Check if ticket is closed
    const currentTicket = tickets.find((t) => t.id === selectedTicketId)
    if (currentTicket && (currentTicket.status === "closed" || currentTicket.status === "resolved")) {
      alert("لا يمكن إرسال رسالة إلى تذكرة مغلقة. التذكرة تم حذفها نهائياً.")
      setSelectedTicketId(null)
      fetchTickets() // Refresh to remove deleted ticket
      return
    }

    // Send via socket for real-time delivery
    // Socket server will save the message and broadcast it to all users
    // We don't need to add it manually - onMessageReceived callback will handle it
    const sent = socketSendMessage({
      ticketId: selectedTicketId,
      content: message,
      attachments: [],
    })

    if (sent) {
      // Clear message input immediately for better UX
      setMessage("")
      setAttachments([])

      // Also send via API as backup for persistence (in case Socket fails)
      // But don't add it to state - Socket event will handle that
      ticketApi
        .sendMessage(selectedTicketId, {
          content: message,
          sender: "agent",
          senderId: agentId,
          senderName: agentName,
        })
        .catch((error: any) => {
          console.error("[Admin] Failed to send message via API (Socket may have succeeded):", error)
          // If ticket was deleted (403 error), remove it from list
          if (error?.status === 403 || error?.message?.includes("مغلقة")) {
            alert("لا يمكن إرسال رسالة إلى تذكرة مغلقة. التذكرة تم حذفها نهائياً.")
            setTickets((prev) => prev.filter((t) => t.id !== selectedTicketId))
            setSelectedTicketId(null)
            fetchTickets()
          }
        })
    } else {
      // If Socket failed, fallback to API
      console.warn("[Admin] Socket not connected, using API fallback")
      try {
        const msg = await ticketApi.sendMessage(selectedTicketId, {
          content: message,
          sender: "agent",
          senderId: agentId,
          senderName: agentName,
        })

        if (msg) {
          // Only add manually if Socket is not available
          setTickets((prev) =>
            prev.map((t) => {
              if (t.id === selectedTicketId) {
                const messageExists = t.messages.some((m) => m.id === msg.id)
                if (messageExists) return t
                return {
                  ...t,
                  messages: [...t.messages, msg],
                  lastMessage: msg.content,
                  updatedAt: msg.timestamp,
                }
              }
              return t
            }),
          )
        }
        setMessage("")
        setAttachments([])
      } catch (error: any) {
        // If ticket was deleted (403 error), remove it from list
        if (error?.status === 403 || error?.message?.includes("مغلقة")) {
          alert("لا يمكن إرسال رسالة إلى تذكرة مغلقة. التذكرة تم حذفها نهائياً.")
          setTickets((prev) => prev.filter((t) => t.id !== selectedTicketId))
          setSelectedTicketId(null)
          fetchTickets()
        }
      }
    }
  }

  const handleMessageChange = (value: string) => {
    setMessage(value)

    if (selectedTicketId) {
      sendTyping(selectedTicketId, true)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (selectedTicketId) {
          sendTyping(selectedTicketId, false)
        }
      }, 2000)
    }
  }

  const handleUpdateTicket = async (ticketId: string, updates: Partial<Ticket>) => {
    // If closing ticket, it will be deleted permanently
    if (updates.status === "closed") {
      changeTicketStatus(ticketId, "closed")

      // Update via API (will delete ticket)
      const updated = await ticketApi.updateTicket(ticketId, updates, {
        id: agentId,
        name: agentName,
        type: "agent",
      })

      // Socket event will handle UI update via onTicketDeleted callback
      return
    }

    const updated = await ticketApi.updateTicket(ticketId, updates)
    if (updated) {
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, ...updates } : t)))

      if (updates.status) {
        changeTicketStatus(ticketId, updates.status)
      }

      fetchTickets()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const currentTicketTypingUsers = Array.from(typingUsers.entries())
    .filter(([key]) => key.startsWith(`${selectedTicketId}-`))
    .map(([, name]) => name)

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "open":
        return { label: "مفتوحة", color: "bg-primary/10 text-primary border-primary/20" }
      case "pending":
        return { label: "معلقة", color: "bg-secondary/10 text-secondary border-secondary/20" }
      case "closed":
        return { label: "مغلقة", color: "bg-muted text-muted-foreground border-border" }
      default:
        return { label: status, color: "bg-muted text-muted-foreground border-border" }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-destructive"
      case "medium":
        return "text-secondary"
      case "low":
        return "text-primary"
      default:
        return "text-muted-foreground"
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">جاري تحميل التذاكر...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden" dir="rtl">
      {/* Sidebar - Filters */}
      {(!isMobile || mobileView === "list") && (
        <div className="w-64 bg-card border-l border-border flex flex-col">
          {/* Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-border">
            <h1 className="text-lg font-bold text-foreground">نظام التذاكر</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fetchTickets()}
                disabled={isLoading}
                className="h-8 w-8"
                title="تحديث"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                  isConnected ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
                )}
              >
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isConnected ? "متصل" : "غير متصل"}
              </div>
            </div>
          </div>

          {/* Create Button */}
          <div className="p-4">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus className="w-4 h-4" />
              تذكرة جديدة
            </Button>
          </div>

          {/* Filters */}
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1 pb-4">
              {filterTabs.map((filter) => {
                const count = ticketCounts[filter.id as keyof TicketCounts] || 0
                const isActive = activeFilter === filter.id
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <filter.icon className="w-4 h-4" />
                    <span className="flex-1 text-right font-medium">{filter.label}</span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-semibold min-w-[24px] text-center",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted-foreground/10 text-muted-foreground",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Ticket List */}
      {(!isMobile || mobileView === "list") && (
        <div className="w-80 bg-card/50 border-l border-border flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="البحث في التذاكر..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 bg-background border-border"
              />
            </div>
          </div>

          {/* List */}
          <ScrollArea className="flex-1">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <Inbox className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium mb-1">لا توجد تذاكر</p>
                <p className="text-sm text-muted-foreground">ستظهر التذاكر هنا عند إنشائها</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredTickets.map((ticket) => {
                  const statusConfig = getStatusConfig(ticket.status)
                  const isSelected = selectedTicketId === ticket.id
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket.id)}
                      className={cn(
                        "w-full p-4 text-right transition-all duration-200",
                        isSelected ? "bg-primary/5 border-r-2 border-r-primary" : "hover:bg-muted/50",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10 border-2 border-border">
                          <AvatarImage src={ticket.customer.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {ticket.customer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-foreground truncate">{ticket.customer.name}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {formatDistanceToNow(ticket.updatedAt || ticket.createdAt, {
                                addSuffix: false,
                                locale: ar,
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground truncate font-medium">
                            #{ticket.id.slice(-4)} - {ticket.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {ticket.lastMessage || "لا توجد رسائل بعد"}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                              {statusConfig.label}
                            </Badge>
                            {ticket.priority === "high" && (
                              <AlertTriangle className={cn("w-3.5 h-3.5", getPriorityColor(ticket.priority))} />
                            )}
                            {ticket.unreadCount > 0 && (
                              <Badge className="bg-destructive text-destructive-foreground h-5 px-1.5 text-xs">
                                {ticket.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {/* Chat Area */}
      {(!isMobile || mobileView === "chat") && (
        <div className="flex-1 flex flex-col bg-background min-h-0">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-4 flex items-center justify-between border-b border-border bg-card/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileView("list")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  )}
                  <Avatar className="w-10 h-10 border-2 border-border">
                    <AvatarImage src={selectedTicket.customer.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedTicket.customer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                      #{selectedTicket.id.slice(-4)} - {selectedTicket.title}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedTicket.customer.name} •{" "}
                      {formatDistanceToNow(selectedTicket.createdAt, { addSuffix: true, locale: ar })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) =>
                      handleUpdateTicket(selectedTicket.id, { status: value as Ticket["status"] })
                    }
                  >
                    <SelectTrigger className="w-32 h-9 bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">مفتوحة</SelectItem>
                      <SelectItem value="pending">معلقة</SelectItem>
                      <SelectItem value="closed">مغلقة</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
                    التفاصيل
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-2 max-w-4xl mx-auto">
                  {selectedTicket.messages.map((msg, index) => {
                    const isAgent = msg.sender === "agent"
                    const isSystem = msg.type === "system"
                    const isFirst = index === 0 || selectedTicket.messages[index - 1].sender !== msg.sender

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center">
                          <span className="text-xs text-muted-foreground bg-muted px-4 py-1.5 rounded-full">
                            {msg.content}
                          </span>
                        </div>
                      )
                    }

                    return (
                      <div key={msg.id} className={cn("flex gap-3", isAgent && "flex-row-reverse")}>
                        {isFirst && (
                          <Avatar className="w-9 h-9 border-2 border-border">
                            <AvatarFallback
                              className={cn(
                                "font-semibold",
                                isAgent
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-secondary-foreground",
                              )}
                            >
                              {msg.senderName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!isFirst && <div className="w-9" />}
                        <div className={cn("max-w-[70%]", isAgent && "text-left")}>
                          {isFirst && (
                            <div className={cn("flex items-center gap-2 mb-1", isAgent && "flex-row-reverse")}>
                              <span className="font-semibold text-sm text-foreground">{msg.senderName}</span>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs",
                                  isAgent ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary",
                                )}
                              >
                                {isAgent ? "وكيل" : "عميل"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(msg.timestamp, "hh:mm a", { locale: ar })}
                              </span>
                            </div>
                          )}
                          <div
                            className={cn(
                              "rounded-lg px-3 py-2 shadow-sm",
                              isAgent
                                ? "bg-primary text-primary-foreground rounded-tl-sm"
                                : "bg-card border border-border text-card-foreground rounded-tr-sm",
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap leading-snug">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Typing Indicator */}
                {currentTicketTypingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-4 max-w-4xl mx-auto">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <span>{currentTicketTypingUsers.join(", ")} يكتب...</span>
                  </div>
                )}
              </ScrollArea>

              {/* Quick Replies */}
              {showQuickReplies && (
                <div className="px-4 pb-2">
                  <div className="bg-card border border-border rounded-xl p-3 max-w-4xl mx-auto">
                    <p className="text-xs text-muted-foreground px-2 mb-2 font-medium">ردود سريعة</p>
                    <div className="space-y-1">
                      {quickReplies.map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setMessage(reply)
                            setShowQuickReplies(false)
                          }}
                          className="w-full text-right px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2 max-w-4xl mx-auto">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-card border border-border px-3 py-2 rounded-lg"
                      >
                        {file.type.startsWith("image/") ? (
                          <ImageIcon className="w-4 h-4 text-primary" />
                        ) : (
                          <File className="w-4 h-4 text-primary" />
                        )}
                        <span className="text-sm text-foreground max-w-[150px] truncate">{file.name}</span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Composer */}
              <div className="p-4 border-t border-border bg-card/30">
                <div className="bg-card border border-border rounded-xl max-w-4xl mx-auto">
                  <div className="flex items-end gap-2 p-3">
                    <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-muted-foreground hover:text-foreground flex-shrink-0"
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Textarea
                      value={message}
                      onChange={(e) => handleMessageChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="اكتب رسالتك هنا..."
                      className="flex-1 min-h-[44px] max-h-[120px] bg-transparent border-none resize-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                      rows={1}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowQuickReplies(!showQuickReplies)}
                      className="text-muted-foreground hover:text-foreground flex-shrink-0"
                    >
                      <Smile className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() && attachments.length === 0}
                      size="icon"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">اختر تذكرة</h3>
                <p className="text-muted-foreground">اختر تذكرة من القائمة لعرض المحادثة</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Panel */}
      {!isMobile && showDetails && selectedTicket && (
        <TicketDetails
          ticket={selectedTicket}
          agents={agents}
          onUpdateTicket={(ticketId: string, updates: Partial<Ticket>) => handleUpdateTicket(ticketId, updates)}
          onClose={() => setShowDetails(false)}
        />
      )}

      {/* Mobile Details Sheet */}
      {isMobile && selectedTicket && (
        <Sheet open={showDetails} onOpenChange={setShowDetails}>
          <SheetContent side="left" className="w-full sm:w-96 p-0">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle className="text-right">تفاصيل التذكرة</SheetTitle>
            </SheetHeader>
            <TicketDetails
              ticket={selectedTicket}
              agents={agents}
              onUpdateTicket={(ticketId: string, updates: Partial<Ticket>) => handleUpdateTicket(ticketId, updates)}
              onClose={() => setShowDetails(false)}
              isMobile
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Create Modal */}
      <CreateTicketModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={async (data) => {
          try {
            await ticketApi.createTicket({
              ...data,
              customerName: "Admin",
              customerEmail: "admin@example.com",
            })
            setShowCreateModal(false)
            fetchTickets()
          } catch (error) {
            console.error("Failed to create ticket:", error)
          }
        }}
      />

      {/* Close Confirmation */}
      <Dialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-right">إغلاق التذكرة</DialogTitle>
            <DialogDescription className="text-right">هل أنت متأكد من إغلاق هذه التذكرة؟</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCloseConfirm(false)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedTicketId) {
                  handleUpdateTicket(selectedTicketId, { status: "closed" })
                }
                setShowCloseConfirm(false)
              }}
            >
              إغلاق التذكرة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
