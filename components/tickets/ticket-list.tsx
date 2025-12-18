"use client"

import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"
import { AlertTriangle, Clock, CheckCircle2, type LucideIcon } from "lucide-react"
import type { Ticket } from "@/types/ticket"

interface TicketListProps {
  tickets: Ticket[]
  selectedTicketId: string | null
  onSelectTicket: (ticketId: string) => void
  isMobile?: boolean
}

const statusConfig = {
  open: { label: "مفتوحة", color: "bg-green-500", icon: null },
  pending: { label: "قيد الانتظار", color: "bg-yellow-500", icon: Clock },
  closed: { label: "مغلقة", color: "bg-gray-500", icon: CheckCircle2 },
}

const priorityConfig: Record<string, { label: string; color: string; icon: LucideIcon | null }> = {
  low: { label: "منخفضة", color: "text-gray-400", icon: null },
  medium: { label: "متوسطة", color: "text-yellow-400", icon: null },
  high: { label: "عالية", color: "text-red-400", icon: AlertTriangle },
}

export function TicketList({ tickets, selectedTicketId, onSelectTicket, isMobile }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div
        className={cn(
          "bg-[#2F3136] flex flex-col items-center justify-center text-gray-400",
          isMobile ? "flex-1" : "md:w-[320px] border-l border-[#202225]",
        )}
      >
        <div className="w-16 h-16 rounded-full bg-[#202225] flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p className="text-sm">لا توجد تذاكر</p>
      </div>
    )
  }

  return (
    <div className={cn("bg-[#2F3136] flex flex-col", isMobile ? "flex-1" : "w-[320px] border-l border-[#202225]")}>
      {/* Header */}
      {!isMobile && (
        <div className="p-3 border-b border-[#202225]">
          <h2 className="text-sm font-semibold text-gray-300">التذاكر ({tickets.length})</h2>
        </div>
      )}

      {/* Ticket List */}
      <div className="flex-1 overflow-y-auto">
        {tickets.map((ticket) => {
          const status = statusConfig[ticket.status]
          const priority = priorityConfig[ticket.priority]
          const isSelected = ticket.id === selectedTicketId

          return (
            <button
              key={ticket.id}
              onClick={() => onSelectTicket(ticket.id)}
              className={cn(
                "w-full p-3 text-right border-b border-[#202225] transition-colors",
                isSelected ? "bg-[#40444B]" : "hover:bg-[#36393F]",
                ticket.unreadCount > 0 && "bg-[#5865F2]/10",
              )}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <img
                  src={ticket.customer.avatar || "/placeholder.svg"}
                  alt={ticket.customer.name}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={cn("font-medium truncate", ticket.unreadCount > 0 ? "text-white" : "text-gray-300")}
                    >
                      #{ticket.id}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatDistanceToNow(ticket.updatedAt, { addSuffix: true, locale: ar })}
                    </span>
                  </div>

                  <p
                    className={cn(
                      "text-sm truncate mb-1",
                      ticket.unreadCount > 0 ? "text-white font-medium" : "text-gray-400",
                    )}
                  >
                    {ticket.title}
                  </p>

                  <p className="text-xs text-gray-500 truncate mb-2">{ticket.lastMessage}</p>

                  {/* Status & Priority */}
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs text-white", status.color)}>
                      {status.label}
                    </span>
                    {priority.icon && <priority.icon className={cn("w-3.5 h-3.5", priority.color)} />}
                    {ticket.unreadCount > 0 && (
                      <span className="bg-[#5865F2] text-white text-xs px-1.5 py-0.5 rounded-full mr-auto">
                        {ticket.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
