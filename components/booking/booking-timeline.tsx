"use client"

import { cn } from "@/lib/utils"
import {
  ClipboardList,
  CreditCard,
  UserCheck,
  Calendar,
  Clock,
  Stethoscope,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Video,
  Home,
  Building2,
} from "lucide-react"

// Icon mapping for booking statuses
const iconMap: Record<string, any> = {
  ClipboardList,
  CreditCard,
  UserCheck,
  Calendar,
  Clock,
  Stethoscope,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Video,
  Home,
  Building2,
}

// Color mapping
const colorMap: Record<string, { bg: string; text: string; border: string; line: string }> = {
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    border: "border-blue-500",
    line: "bg-blue-500",
  },
  green: {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    border: "border-emerald-500",
    line: "bg-emerald-500",
  },
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    border: "border-orange-500",
    line: "bg-orange-500",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    border: "border-purple-500",
    line: "bg-purple-500",
  },
  teal: {
    bg: "bg-teal-100",
    text: "text-teal-600",
    border: "border-teal-500",
    line: "bg-teal-500",
  },
  red: {
    bg: "bg-red-100",
    text: "text-red-600",
    border: "border-red-500",
    line: "bg-red-500",
  },
  yellow: {
    bg: "bg-yellow-100",
    text: "text-yellow-600",
    border: "border-yellow-500",
    line: "bg-yellow-500",
  },
  gray: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-500",
    line: "bg-gray-500",
  },
}

interface StatusInfo {
  key: string
  label: string
  labelEn: string
  icon: string
  color: string
}

interface StatusHistoryItem {
  status: string
  note?: string
  changedBy?: string
  changedByName?: string
  createdAt: string
}

interface BookingTimelineProps {
  currentStatus: string
  statusHistory?: StatusHistoryItem[]
  bookingType?: "clinic" | "hospital" | "online" | "home"
  variant?: "vertical" | "horizontal" | "compact"
  showDetails?: boolean
  className?: string
}

// Booking status definitions
const BOOKING_STATUSES: Record<string, StatusInfo> = {
  pending: {
    key: "pending",
    label: "في انتظار التأكيد",
    labelEn: "Pending Confirmation",
    icon: "Clock",
    color: "yellow",
  },
  confirmed: {
    key: "confirmed",
    label: "تم التأكيد",
    labelEn: "Confirmed",
    icon: "CheckCircle2",
    color: "blue",
  },
  payment_pending: {
    key: "payment_pending",
    label: "في انتظار الدفع",
    labelEn: "Payment Pending",
    icon: "CreditCard",
    color: "orange",
  },
  payment_completed: {
    key: "payment_completed",
    label: "تم الدفع",
    labelEn: "Payment Completed",
    icon: "CreditCard",
    color: "green",
  },
  in_progress: {
    key: "in_progress",
    label: "جارية",
    labelEn: "In Progress",
    icon: "Stethoscope",
    color: "purple",
  },
  completed: {
    key: "completed",
    label: "مكتملة",
    labelEn: "Completed",
    icon: "CheckCircle2",
    color: "green",
  },
  cancelled: {
    key: "cancelled",
    label: "ملغاة",
    labelEn: "Cancelled",
    icon: "XCircle",
    color: "red",
  },
  rescheduled: {
    key: "rescheduled",
    label: "تم إعادة الجدولة",
    labelEn: "Rescheduled",
    icon: "RefreshCw",
    color: "teal",
  },
  no_show: {
    key: "no_show",
    label: "لم يحضر",
    labelEn: "No Show",
    icon: "XCircle",
    color: "gray",
  },
}

// Default ordered statuses for booking flow
const DEFAULT_ORDERED_STATUSES = ["pending", "confirmed", "payment_completed", "in_progress", "completed"]

const getStatusInfo = (status: string): StatusInfo => {
  return (
    BOOKING_STATUSES[status] || {
      key: status,
      label: status,
      labelEn: status,
      icon: "Clock",
      color: "gray",
    }
  )
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function BookingTimeline({
  currentStatus,
  statusHistory = [],
  bookingType = "clinic",
  variant = "vertical",
  showDetails = true,
  className,
}: BookingTimelineProps) {
  const orderedStatuses = DEFAULT_ORDERED_STATUSES

  // Get completed statuses from history
  const completedStatuses = new Set(statusHistory.map((item) => item.status))

  // Find the index of current status in ordered list
  const currentIndex = orderedStatuses.indexOf(currentStatus)

  // Check if booking is cancelled or has special status
  const isCancelled = currentStatus === "cancelled"
  const isNoShow = currentStatus === "no_show"
  const isCompleted = currentStatus === "completed"

  // Compact variant - just shows current status with icon
  if (variant === "compact") {
    const statusInfo = getStatusInfo(currentStatus)
    const Icon = iconMap[statusInfo.icon] || Clock
    const colors = colorMap[statusInfo.color] || colorMap.gray

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", colors.bg)}>
          <Icon className={cn("w-4 h-4", colors.text)} />
        </div>
        <span className={cn("text-sm font-medium", colors.text)}>{statusInfo.label}</span>
      </div>
    )
  }

  // Horizontal variant
  if (variant === "horizontal") {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-between relative">
          {/* Background line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />

          {/* Progress line */}
          <div
            className={cn(
              "absolute top-5 left-0 h-1 rounded-full transition-all duration-500",
              isCancelled || isNoShow ? "bg-red-500" : "bg-emerald-500",
            )}
            style={{
              width: `${Math.min(((currentIndex + 1) / orderedStatuses.length) * 100, 100)}%`,
            }}
          />

          {orderedStatuses.map((status, index) => {
            const statusInfo = getStatusInfo(status)
            const isActive = status === currentStatus
            const isCompletedStep = index < currentIndex || (index === currentIndex && isCompleted)
            const isPending = index > currentIndex

            const Icon = iconMap[statusInfo.icon] || Clock
            const colors = colorMap[statusInfo.color] || colorMap.gray

            return (
              <div key={status} className="flex flex-col items-center relative z-10">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isCompletedStep && !isCancelled && !isNoShow && "bg-emerald-500 border-emerald-500 text-white",
                    isActive && !isCancelled && !isNoShow && `${colors.bg} ${colors.border} ${colors.text}`,
                    (isActive && isCancelled) || (isActive && isNoShow && "bg-red-500 border-red-500 text-white"),
                    isPending && "bg-gray-100 border-gray-300 text-gray-400",
                  )}
                >
                  {isCompletedStep && !isCancelled && !isNoShow ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-2 text-center max-w-[80px]",
                    isActive ? "font-semibold text-gray-900" : "text-gray-500",
                  )}
                >
                  {statusInfo.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Vertical variant (default)
  return (
    <div className={cn("relative", className)}>
      {orderedStatuses.map((status, index) => {
        const statusInfo = getStatusInfo(status)
        const historyItem = statusHistory.find((item) => item.status === status)
        const isActive = status === currentStatus
        const isCompletedStep = index < currentIndex || (index === currentIndex && isCompleted)
        const isPending = index > currentIndex

        const Icon = iconMap[statusInfo.icon] || Clock
        const colors = colorMap[statusInfo.color] || colorMap.gray

        return (
          <div key={status} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Vertical line */}
            {index < orderedStatuses.length - 1 && (
              <div
                className={cn(
                  "absolute top-10 right-[19px] w-0.5 h-[calc(100%-24px)]",
                  isCompletedStep && !isCancelled && !isNoShow ? "bg-emerald-500" : "bg-gray-200",
                )}
              />
            )}

            {/* Icon circle */}
            <div
              className={cn(
                "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300",
                isCompletedStep &&
                  !isCancelled &&
                  !isNoShow &&
                  "bg-emerald-500 border-emerald-500 text-white shadow-md",
                isActive &&
                  !isCancelled &&
                  !isNoShow &&
                  `${colors.bg} ${colors.border} ${colors.text} shadow-md ring-4 ring-opacity-20`,
                ((isActive && isCancelled) || (isActive && isNoShow)) &&
                  "bg-red-500 border-red-500 text-white shadow-md",
                isPending && "bg-gray-50 border-gray-200 text-gray-400",
              )}
              style={isActive && !isCancelled && !isNoShow ? ({ "--tw-ring-color": colors.line } as any) : {}}
            >
              {isCompletedStep && !isCancelled && !isNoShow ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={cn(
                    "font-medium",
                    isActive ? "text-gray-900" : isCompletedStep ? "text-gray-700" : "text-gray-400",
                  )}
                >
                  {statusInfo.label}
                </h4>
                {historyItem && <span className="text-xs text-gray-500">{formatDate(historyItem.createdAt)}</span>}
              </div>

              {showDetails && historyItem && (
                <div className="mt-1 space-y-1">
                  {historyItem.note && <p className="text-sm text-gray-600">{historyItem.note}</p>}
                  {historyItem.changedByName && (
                    <p className="text-xs text-gray-500">بواسطة: {historyItem.changedByName}</p>
                  )}
                </div>
              )}

              {isPending && !historyItem && <p className="text-sm text-gray-400 mt-1">في انتظار...</p>}
            </div>
          </div>
        )
      })}

      {/* Show cancelled/no-show status if applicable */}
      {(isCancelled || isNoShow) && (
        <div className="relative flex gap-4 pb-0 mt-4 pt-4 border-t border-red-100">
          <div
            className={cn(
              "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0",
              "bg-red-500 border-red-500 text-white shadow-md",
            )}
          >
            <XCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-red-600">{isCancelled ? "تم الإلغاء" : "لم يحضر"}</h4>
            {statusHistory.find((h) => h.status === currentStatus)?.note && (
              <p className="text-sm text-gray-600 mt-1">
                {statusHistory.find((h) => h.status === currentStatus)?.note}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingTimeline
