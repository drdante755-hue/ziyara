"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, format } from "date-fns"
import { ar } from "date-fns/locale"
import { ArrowRight, Paperclip, Send, Smile, MoreVertical, Info, ImageIcon, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Ticket, Message } from "@/types/ticket"

interface TicketChatProps {
  ticket: Ticket
  onSendMessage: (content: string, attachments?: File[]) => void
  onBack?: () => void
  onShowDetails?: () => void
  onToggleDetails?: () => void
  showDetailsButton?: boolean
  isMobile?: boolean
}

const quickReplies = [
  "شكراً لتواصلك معنا، سنقوم بمراجعة طلبك",
  "تم استلام طلبك وجاري العمل عليه",
  "هل يمكنك تزويدنا بمزيد من التفاصيل؟",
  "تم حل المشكلة، هل تحتاج مساعدة إضافية؟",
]

export function TicketChat({
  ticket,
  onSendMessage,
  onBack,
  onShowDetails,
  onToggleDetails,
  showDetailsButton,
  isMobile,
}: TicketChatProps) {
  const [message, setMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [ticket.messages])

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return
    onSendMessage(message, attachments)
    setMessage("")
    setAttachments([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
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

  return (
    <div className="flex-1 flex flex-col bg-[#36393F] min-h-0">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#202225] flex-shrink-0">
        <div className="flex items-center gap-3">
          {isMobile && onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-400 hover:text-white">
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h2 className="font-semibold text-white flex items-center gap-2">
              #{ticket.id} - {ticket.title}
            </h2>
            <p className="text-xs text-gray-400">
              {ticket.customer.name} • {formatDistanceToNow(ticket.createdAt, { addSuffix: true, locale: ar })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(showDetailsButton || isMobile) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={isMobile ? onShowDetails : onToggleDetails}
              className="text-gray-400 hover:text-white"
            >
              <Info className="w-5 h-5" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#2F3136] border-[#202225]">
              <DropdownMenuItem className="text-gray-300 focus:bg-[#5865F2] focus:text-white">
                تثبيت التذكرة
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 focus:bg-[#5865F2] focus:text-white">
                كتم الإشعارات
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-400 focus:bg-red-500 focus:text-white">
                حذف التذكرة
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {ticket.messages.map((msg, index) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isFirst={index === 0 || ticket.messages[index - 1].sender !== msg.sender}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {showQuickReplies && (
        <div className="px-4 pb-2">
          <div className="bg-[#2F3136] rounded-lg p-2 space-y-1">
            <p className="text-xs text-gray-400 px-2 mb-2">ردود سريعة</p>
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => {
                  setMessage(reply)
                  setShowQuickReplies(false)
                }}
                className="w-full text-right px-3 py-2 text-sm text-gray-300 hover:bg-[#40444B] rounded transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-[#2F3136] px-3 py-2 rounded-lg">
                {file.type.startsWith("image/") ? (
                  <ImageIcon className="w-4 h-4 text-[#5865F2]" />
                ) : (
                  <File className="w-4 h-4 text-[#5865F2]" />
                )}
                <span className="text-sm text-gray-300 max-w-[150px] truncate">{file.name}</span>
                <button onClick={() => removeAttachment(index)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="p-4 border-t border-[#202225]">
        <div className="bg-[#40444B] rounded-lg">
          <div className="flex items-end gap-2 p-2">
            <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-white flex-shrink-0"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1 min-h-[40px] max-h-[120px] bg-transparent border-none text-gray-200 placeholder:text-gray-500 resize-none focus-visible:ring-0"
              rows={1}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className="text-gray-400 hover:text-white flex-shrink-0"
            >
              <Smile className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleSend}
              disabled={!message.trim() && attachments.length === 0}
              size="icon"
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white flex-shrink-0 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">اضغط Enter للإرسال، Shift+Enter لسطر جديد</p>
      </div>
    </div>
  )
}

function MessageBubble({ message, isFirst }: { message: Message; isFirst: boolean }) {
  if (message.type === "system") {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-gray-500 bg-[#2F3136] px-3 py-1 rounded-full">{message.content}</span>
      </div>
    )
  }

  const isAgent = message.sender === "agent"
  const isCustomer = message.sender === "customer"

  return (
    <div className={cn("flex gap-3", isAgent && "flex-row-reverse")}>
      {isFirst && (
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-medium",
            isAgent ? "bg-[#5865F2]" : "bg-[#ED4245]",
          )}
        >
          {message.senderName.charAt(0)}
        </div>
      )}
      {!isFirst && <div className="w-10 flex-shrink-0" />}
      <div className={cn("max-w-[70%]", isAgent && "text-left")}>
        {isFirst && (
          <div className={cn("flex items-center gap-2 mb-1", isAgent && "flex-row-reverse")}>
            <span className="font-medium text-white">{message.senderName}</span>
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                isAgent ? "bg-[#5865F2] text-white" : "bg-[#ED4245] text-white",
              )}
            >
              {isAgent ? "وكيل" : "عميل"}
            </span>
            <span className="text-xs text-gray-500">{format(message.timestamp, "hh:mm a", { locale: ar })}</span>
          </div>
        )}
        <div className={cn("rounded-lg px-4 py-2", isAgent ? "bg-[#5865F2] text-white" : "bg-[#40444B] text-gray-200")}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  )
}
