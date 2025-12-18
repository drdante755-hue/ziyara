"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { TopHeader } from "@/components/top-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowRight,
  Plus,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Paperclip,
  X,
  Headphones,
  HelpCircle,
  CreditCard,
  Package,
  Stethoscope,
  ShieldAlert,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { userTicketsApi, type UserTicket, type UserTicketDetail, type UserTicketMessage } from "@/lib/api/user-tickets"
import { useTicketSocket, SenderType, type TicketUpdatedPayload, type TicketDeletedPayload } from "@/hooks/use-ticket-socket"
import { useSession } from "next-auth/react"

const categories = [
  { id: "payment", label: "الدفع والمحفظة", icon: CreditCard },
  { id: "booking", label: "الحجوزات والمواعيد", icon: Stethoscope },
  { id: "order", label: "الطلبات والتوصيل", icon: Package },
  { id: "account", label: "الحساب والملف الشخصي", icon: HelpCircle },
  { id: "technical", label: "مشكلة تقنية", icon: ShieldAlert },
  { id: "other", label: "أخرى", icon: MessageCircle },
]

const getStatusInfo = (status: string) => {
  switch (status) {
    case "open":
      return {
        label: "مفتوحة",
        color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        icon: MessageCircle,
      }
    case "pending":
      return {
        label: "قيد الانتظار",
        color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: Clock,
      }
    case "resolved":
      return {
        label: "تم الحل",
        color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        icon: CheckCircle2,
      }
    case "closed":
      return {
        label: "مغلقة",
        color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
        icon: AlertCircle,
      }
    default:
      return { label: status, color: "bg-gray-100 text-gray-700", icon: MessageCircle }
  }
}

const getPriorityInfo = (priority: string) => {
  switch (priority) {
    case "urgent":
      return { label: "عاجلة", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }
    case "high":
      return { label: "عالية", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" }
    case "medium":
      return { label: "متوسطة", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" }
    case "low":
      return { label: "منخفضة", color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400" }
    default:
      return { label: priority, color: "bg-gray-100 text-gray-700" }
  }
}

const getCategoryLabel = (categoryId: string) => {
  const category = categories.find((c) => c.id === categoryId)
  return category?.label || categoryId
}

export default function UserSupportPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeSection, setActiveSection] = useState("support")
  
  // Get user data from session
  const currentUser = session?.user ? {
    id: session.user.id,
    name: session.user.name || "مستخدم",
    email: session.user.email || "",
    avatar: session.user.image || "/default-avatar.png",
  } : null

  const [tickets, setTickets] = useState<UserTicket[]>([])
  const [counts, setCounts] = useState<{ all: number; open: number; resolved: number }>({
    all: 0,
    open: 0,
    resolved: 0,
  })
  const [selectedTicketDetail, setSelectedTicketDetail] = useState<UserTicketDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTicket, setIsLoadingTicket] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all")
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchTicketsRef = useRef<() => void>(() => {})
  const selectedTicketIdRef = useRef<string | null>(null)

  // Keep ref in sync with state
  useEffect(() => {
    selectedTicketIdRef.current = selectedTicketDetail?.id || null
  }, [selectedTicketDetail?.id])

  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  })

  const handleMessageReceived = useCallback(
    (socketMessage: any, ticketId: string) => {
      // Socket server sends message with _id field (Mongoose format)
      const messageId = socketMessage._id?.toString() || socketMessage.id
      
      if (!messageId) {
        console.error("[User Support] Invalid message ID:", socketMessage)
        return
      }

      // Don't show own messages twice - if we just sent it via Socket, skip it
      // (Socket will broadcast it back to us, but we already cleared the input)
      const isOwnMessage = currentUser && (
        socketMessage.senderId?.toString() === currentUser.id || 
        socketMessage.senderType === "user" || 
        socketMessage.senderType === "customer"
      )

      console.log("[User Support] Message received:", { 
        messageId, 
        ticketId, 
        content: socketMessage.content,
        isOwnMessage,
        senderId: socketMessage.senderId,
        senderType: socketMessage.senderType
      })

      const newMsg: UserTicketMessage = {
        id: messageId,
        content: socketMessage.content,
        sender: socketMessage.senderType as "customer" | "agent" | "system",
        senderName: socketMessage.senderName,
        type: "text",
        createdAt: new Date(socketMessage.createdAt),
        attachments: socketMessage.attachments?.map((a: any) => ({
          fileName: a.filename || a.fileName,
          fileUrl: a.url || a.fileUrl,
          fileType: a.mimeType || a.fileType,
          fileSize: a.size || a.fileSize,
        })),
      }

      // Use ref to check current ticket ID
      if (selectedTicketIdRef.current === ticketId) {
        setSelectedTicketDetail((prev) => {
          if (!prev) return null
          // Check if message already exists to prevent duplicates
          const messageExists = prev.messages.some((m) => {
            const msgId = m.id.toString()
            const socketId = messageId.toString()
            return msgId === socketId || msgId === socketMessage._id?.toString()
          })
          if (messageExists) {
            console.log("[User Support] Message already exists, skipping:", messageId)
            return prev
          }
          return {
            ...prev,
            messages: [...prev.messages, newMsg],
            lastMessage: newMsg.content,
            updatedAt: newMsg.createdAt,
          }
        })

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
      }

      // Update tickets list
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === ticketId) {
            return {
              ...t,
              unreadByCustomer: selectedTicketIdRef.current === ticketId ? 0 : t.unreadByCustomer + 1,
              lastMessage: socketMessage.content,
              updatedAt: newMsg.createdAt,
            }
          }
          return t
        }),
      )
    },
    [], // No dependencies - uses refs instead
  )

  const handleTypingIndicator = useCallback(
    (ticketId: string, senderId: string, senderName: string, isTyping: boolean) => {
      if (currentUser && senderId === currentUser.id) return

      setTypingUsers((prev) => {
        const next = new Map(prev)
        if (isTyping) {
          next.set(`${ticketId}-${senderId}`, senderName)
        } else {
          next.delete(`${ticketId}-${senderId}`)
        }
        return next
      })
    },
    [],
  )

  const handleTicketUpdated = useCallback((payload: TicketUpdatedPayload) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === payload.ticketId ? { ...t, status: payload.status as UserTicket["status"] } : t)),
    )

    // Use ref to check current ticket
    if (selectedTicketIdRef.current === payload.ticketId) {
      setSelectedTicketDetail((prev) =>
        prev ? { ...prev, status: payload.status as UserTicketDetail["status"] } : null,
      )
    }

    // Refresh counts
    fetchTicketsRef.current()
  }, []) // No dependencies - uses refs instead

  const handleTicketDeleted = useCallback((payload: TicketDeletedPayload) => {
    console.log("[User] Ticket deleted:", payload)
    // Remove ticket from list
    setTickets((prev) => prev.filter((t) => t.id !== payload.ticketId))
    
    // Close chat modal if deleted ticket was open
    if (selectedTicketIdRef.current === payload.ticketId) {
      setShowChatModal(false)
      setSelectedTicketDetail(null)
    }
    
    // Refresh counts
    fetchTicketsRef.current()
  }, []) // No dependencies - uses refs instead

  const {
    isConnected,
    joinTicket,
    leaveTicket,
    sendMessage: socketSendMessage,
    sendTyping,
    markAsRead,
  } = useTicketSocket({
    userId: currentUser?.id || "",
    userName: currentUser?.name || "مستخدم",
    userType: SenderType.USER,
    onMessageReceived: handleMessageReceived,
    onTypingIndicator: handleTypingIndicator,
    onTicketUpdated: handleTicketUpdated,
    onTicketDeleted: handleTicketDeleted,
    onError: useCallback((error: { message: string; code: string }) => {
      console.error("[User Support] Socket error:", error)
      if (error.code === "TICKET_CLOSED") {
        alert(error.message)
        setShowChatModal(false)
        setSelectedTicketDetail(null)
        fetchTickets()
      }
    }, []),
  })

  // Log connection status changes
  useEffect(() => {
    console.log("[User Support] 🔌 Connection status:", isConnected ? "✅ Connected" : "❌ Disconnected")
  }, [isConnected])

  const fetchTickets = useCallback(async () => {
    setIsLoading(true)
    try {
      if (!currentUser?.id) return
      const result = await userTicketsApi.getUserTickets(currentUser.id, filter)
      if (result) {
        setTickets(result.tickets)
        setCounts(result.counts)
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setIsLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchTicketsRef.current = fetchTickets
  }, [fetchTickets])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

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
    const ticketId = selectedTicketDetail?.id
    if (showChatModal && ticketId && isConnected) {
      console.log("[User Support] Joining ticket room:", ticketId)
      joinTicketRef.current(ticketId)
      markAsReadRef.current(ticketId)
    }

    return () => {
      if (ticketId) {
        console.log("[User Support] Leaving ticket room:", ticketId)
        leaveTicketRef.current(ticketId)
      }
    }
  }, [showChatModal, selectedTicketDetail?.id, isConnected])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (showChatModal) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedTicketDetail?.messages, showChatModal])

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.category || !newTicket.description) return

    setIsCreating(true)
    try {
      const result = await userTicketsApi.createUserTicket({
        userId: currentUser!.id,
        title: newTicket.subject,
        category: newTicket.category,
        description: newTicket.description,
        priority: newTicket.priority,
        customerName: currentUser!.name,
        customerEmail: currentUser!.email,
        customerAvatar: currentUser!.avatar,
      })

      if (result) {
        setShowCreateModal(false)
        setNewTicket({ subject: "", category: "", description: "", priority: "medium" })
        await fetchTickets()
        setSelectedTicketDetail(result)
        setShowChatModal(true)
      }
    } catch (error) {
      console.error("Error creating ticket:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicketDetail) return

    setIsSending(true)
    try {
      // Check if ticket is closed
      if (selectedTicketDetail.status === "closed" || selectedTicketDetail.status === "resolved") {
        alert("لا يمكن إرسال رسالة إلى تذكرة مغلقة. التذكرة تم حذفها نهائياً.")
        setShowChatModal(false)
        setSelectedTicketDetail(null)
        fetchTickets() // Refresh to remove deleted ticket
        setIsSending(false)
        return
      }

      // Send via socket for real-time delivery
      // Socket server will save the message and broadcast it to all users
      // handleMessageReceived callback will add it to the UI automatically
      const sent = socketSendMessage({
        ticketId: selectedTicketDetail.id,
        content: newMessage,
      })

      if (sent) {
        // Clear message input immediately for better UX
        // Don't add message manually - Socket event will handle it
        setNewMessage("")
        
        // Note: We don't send via API anymore because Socket Server handles persistence
        // If Socket fails, the message won't be sent (user can retry)
      } else {
        // If Socket failed, fallback to API
        console.warn("[User Support] Socket not connected, using API fallback")
        const result = await userTicketsApi.sendUserTicketMessage(selectedTicketDetail.id, {
          content: newMessage,
          userId: currentUser!.id,
          senderName: currentUser!.name,
        })

        if (result) {
          // Only add manually if Socket is not available
          setSelectedTicketDetail((prev) => {
            if (!prev) return null
            const messageExists = prev.messages.some((m) => m.id === result.id)
            if (messageExists) return prev

            return {
              ...prev,
              messages: [...prev.messages, result],
              lastMessage: result.content,
              updatedAt: result.createdAt,
            }
          })
          setNewMessage("")
          fetchTickets()
        }
      }
    } catch (error: any) {
      console.error("Error sending message:", error)
      // If ticket was deleted (403 error), remove it from list
      if (error?.status === 403 || error?.message?.includes("مغلقة")) {
        alert("لا يمكن إرسال رسالة إلى تذكرة مغلقة. التذكرة تم حذفها نهائياً.")
        setShowChatModal(false)
        setSelectedTicketDetail(null)
        setTickets((prev) => prev.filter((t) => t.id !== selectedTicketDetail?.id))
        fetchTickets()
      }
    } finally {
      setIsSending(false)
    }
  }

  const handleMessageChange = (value: string) => {
    setNewMessage(value)

    if (selectedTicketDetail) {
      sendTyping(selectedTicketDetail.id, true)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (selectedTicketDetail) {
          sendTyping(selectedTicketDetail.id, false)
        }
      }, 2000)
    }
  }

  const openTicketChat = async (ticket: UserTicket) => {
    setIsLoadingTicket(true)
    setShowChatModal(true)

    try {
      const detail = await userTicketsApi.getUserTicketById(ticket.id)
      if (detail) {
        setSelectedTicketDetail(detail)
        fetchTickets()
      }
    } catch (error) {
      console.error("Error fetching ticket detail:", error)
    } finally {
      setIsLoadingTicket(false)
    }
  }

  // Get typing users for current ticket
  const currentTicketTypingUsers = selectedTicketDetail
    ? Array.from(typingUsers.entries())
        .filter(([key]) => key.startsWith(`${selectedTicketDetail.id}-`))
        .map(([, name]) => name)
    : []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopHeader activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/user/home")} className="rounded-full">
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الدعم الفني</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                نحن هنا لمساعدتك
                <span
                  className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
                  title={isConnected ? "متصل" : "غير متصل"}
                />
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchTickets()}
            disabled={isLoading}
            className="rounded-full"
            title="تحديث"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            تذكرة جديدة
          </Button>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {categories.slice(0, 3).map((cat) => (
            <Card
              key={cat.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-0 bg-white dark:bg-gray-800"
              onClick={() => {
                setNewTicket({ ...newTicket, category: cat.id })
                setShowCreateModal(true)
              }}
            >
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <cat.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { id: "all", label: `الكل (${counts.all})` },
            { id: "open", label: `المفتوحة (${counts.open})` },
            { id: "resolved", label: `المحلولة (${counts.resolved})` },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={filter === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(tab.id as typeof filter)}
              className="whitespace-nowrap"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-0 bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : tickets.length === 0 ? (
            <Card className="border-0 bg-white dark:bg-gray-800">
              <CardContent className="p-8 text-center">
                <Headphones className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">لا توجد تذاكر</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">لم تقم بفتح أي تذاكر دعم بعد</p>
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  فتح تذكرة جديدة
                </Button>
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket) => {
              const statusInfo = getStatusInfo(ticket.status)
              const priorityInfo = getPriorityInfo(ticket.priority)

              return (
                <Card
                  key={ticket.id}
                  className="cursor-pointer hover:shadow-md transition-all border-0 bg-white dark:bg-gray-800"
                  onClick={() => openTicketChat(ticket)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-400 dark:text-gray-500">{ticket.ticketNumber}</span>
                          <Badge className={`${statusInfo.color} text-xs`}>{statusInfo.label}</Badge>
                          {(ticket.priority === "high" || ticket.priority === "urgent") && (
                            <Badge className={`${priorityInfo.color} text-xs`}>{priorityInfo.label}</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{ticket.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {getCategoryLabel(ticket.category)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          آخر تحديث: {format(ticket.updatedAt, "d MMM yyyy - h:mm a", { locale: ar })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {ticket.unreadByCustomer > 0 && (
                          <Badge
                            variant="destructive"
                            className="rounded-full h-6 w-6 p-0 flex items-center justify-center"
                          >
                            {ticket.unreadByCustomer}
                          </Badge>
                        )}
                        <MessageCircle className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>

      {/* Create Ticket Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right text-xl">فتح تذكرة جديدة</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-right block">الفئة *</Label>
              <Select
                value={newTicket.category}
                onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر فئة المشكلة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-right block">عنوان المشكلة *</Label>
              <Input
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                placeholder="مثال: مشكلة في الدفع"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-right block">وصف المشكلة *</Label>
              <Textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                placeholder="اشرح مشكلتك بالتفصيل..."
                className="text-right min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-right block">الأولوية</Label>
              <Select
                value={newTicket.priority}
                onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
                  setNewTicket({ ...newTicket, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="urgent">عاجلة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={isCreating}>
              إلغاء
            </Button>
            <Button
              onClick={handleCreateTicket}
              disabled={!newTicket.subject || !newTicket.category || !newTicket.description || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                "إرسال التذكرة"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <Dialog open={showChatModal} onOpenChange={setShowChatModal}>
        <DialogContent className="max-w-lg h-[80vh] flex flex-col p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedTicketDetail ? selectedTicketDetail.title : "محادثة الدعم"}</DialogTitle>
          </DialogHeader>
          {isLoadingTicket ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : selectedTicketDetail ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="icon" onClick={() => setShowChatModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                  <div className="text-right flex-1 mx-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {selectedTicketDetail.title}
                    </h3>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span className="text-xs text-gray-500">{selectedTicketDetail.ticketNumber}</span>
                      <Badge className={getStatusInfo(selectedTicketDetail.status).color}>
                        {getStatusInfo(selectedTicketDetail.status).label}
                      </Badge>
                      <span
                        className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
                        title={isConnected ? "متصل - تحديث لحظي" : "غير متصل"}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedTicketDetail.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "customer" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] ${message.sender === "customer" ? "order-1" : "order-2"}`}>
                        {message.sender !== "customer" && message.sender !== "system" && (
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src="/support-avatar.png" />
                              <AvatarFallback className="bg-primary text-white text-xs">
                                {message.senderName?.charAt(0) || "د"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{message.senderName}</span>
                          </div>
                        )}

                        {message.sender === "system" ? (
                          <div className="text-center">
                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                              {message.content}
                            </span>
                          </div>
                        ) : (
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              message.sender === "customer"
                                ? "bg-primary text-white rounded-tr-none"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.sender === "customer" ? "text-white/70" : "text-gray-400"
                              }`}
                            >
                              {format(message.createdAt, "h:mm a", { locale: ar })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {currentTicketTypingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm mt-4">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <span>{currentTicketTypingUsers.join(", ")} يكتب...</span>
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-white dark:bg-gray-800 rounded-b-lg">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-gray-400">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => handleMessageChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="اكتب رسالتك..."
                    className="flex-1"
                    disabled={isSending}
                  />
                  <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim() || isSending}>
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
