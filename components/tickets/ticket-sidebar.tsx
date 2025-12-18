"use client"

import { cn } from "@/lib/utils"
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Plus,
  Search,
  ChevronDown,
  Ticket,
  FolderOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface TicketSidebarProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
  onCreateTicket: () => void
  ticketCounts: {
    all: number
    open: number
    pending: number
    closed: number
    high: number
    unassigned: number
  }
  isMobile?: boolean
}

const filters = [
  { id: "all", label: "جميع التذاكر", icon: Inbox },
  { id: "open", label: "مفتوحة", icon: FolderOpen },
  { id: "pending", label: "قيد الانتظار", icon: Clock },
  { id: "closed", label: "مغلقة", icon: CheckCircle2 },
  { id: "high", label: "أولوية عالية", icon: AlertTriangle },
  { id: "unassigned", label: "غير معينة", icon: User },
]

export function TicketSidebar({
  activeFilter,
  onFilterChange,
  onCreateTicket,
  ticketCounts,
  isMobile,
}: TicketSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (isMobile) {
    return (
      <div className="bg-[#2F3136] p-4 border-b border-[#202225]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white font-bold text-lg flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#5865F2]" />
            نظام التذاكر
          </h1>
          <Button onClick={onCreateTicket} size="sm" className="bg-[#5865F2] hover:bg-[#4752C4] text-white">
            <Plus className="w-4 h-4 ml-1" />
            تذكرة جديدة
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors",
                activeFilter === filter.id
                  ? "bg-[#5865F2] text-white"
                  : "bg-[#36393F] text-gray-300 hover:bg-[#40444B]",
              )}
            >
              <filter.icon className="w-3.5 h-3.5" />
              {filter.label}
              <span className="bg-black/20 px-1.5 rounded-full text-xs">
                {ticketCounts[filter.id as keyof typeof ticketCounts]}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full md:w-[260px] bg-[#2F3136] flex flex-col border-l border-[#202225]">
      {/* Header */}
      <div className="p-4 border-b border-[#202225]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white font-bold text-lg flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#5865F2]" />
            نظام التذاكر
          </h1>
        </div>
        <Button onClick={onCreateTicket} className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white">
          <Plus className="w-4 h-4 ml-2" />
          تذكرة جديدة
        </Button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="بحث في التذاكر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 bg-[#202225] border-none text-gray-200 placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-[#5865F2]"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-200 w-full"
          >
            <ChevronDown className={cn("w-3 h-3 transition-transform", isCollapsed && "-rotate-90")} />
            الفلاتر
          </button>
          {!isCollapsed && (
            <div className="mt-1 space-y-0.5">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => onFilterChange(filter.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors",
                    activeFilter === filter.id
                      ? "bg-[#5865F2]/20 text-white"
                      : "text-gray-400 hover:bg-[#36393F] hover:text-gray-200",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <filter.icon
                      className={cn("w-4 h-4", activeFilter === filter.id ? "text-[#5865F2]" : "text-gray-500")}
                    />
                    {filter.label}
                  </div>
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      activeFilter === filter.id ? "bg-[#5865F2] text-white" : "bg-[#202225] text-gray-400",
                    )}
                  >
                    {ticketCounts[filter.id as keyof typeof ticketCounts]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#202225]">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center">
            <span className="text-white text-sm font-medium">أ</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">أنت (وكيل)</p>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              متصل
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
