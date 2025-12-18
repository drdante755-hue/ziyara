"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Clock,
  Video,
  Home,
  Building2,
  User,
  Phone,
  CreditCard,
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

interface BookingProvider {
  id: string
  nameAr: string
  titleAr?: string
  specialtyAr?: string
  image?: string
}

interface BookingLocation {
  nameAr: string
  address?: string
}

interface Booking {
  id: string
  bookingNumber?: string
  provider?: BookingProvider
  clinic?: BookingLocation
  hospital?: BookingLocation
  date: string
  startTime: string
  endTime?: string
  type: "clinic" | "hospital" | "online" | "home"
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show"
  paymentStatus?: "pending" | "paid" | "refunded"
  totalPrice?: number
  patientName?: string
  patientPhone?: string
}

interface BookingWidgetProps {
  booking: Booking
  variant?: "card" | "compact" | "detailed"
  showActions?: boolean
  onCancel?: (bookingId: string) => void
  onReschedule?: (bookingId: string) => void
  className?: string
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: {
    label: "في الانتظار",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: AlertCircle,
  },
  confirmed: {
    label: "مؤكد",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: CheckCircle,
  },
  completed: {
    label: "مكتمل",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  cancelled: {
    label: "ملغى",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
  },
  no_show: {
    label: "لم يحضر",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: XCircle,
  },
}

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  clinic: {
    label: "في العيادة",
    icon: Building2,
    color: "text-emerald-600 bg-emerald-50",
  },
  hospital: {
    label: "في المستشفى",
    icon: Building2,
    color: "text-blue-600 bg-blue-50",
  },
  online: {
    label: "أونلاين",
    icon: Video,
    color: "text-purple-600 bg-purple-50",
  },
  home: {
    label: "زيارة منزلية",
    icon: Home,
    color: "text-orange-600 bg-orange-50",
  },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "في انتظار الدفع", color: "text-yellow-600" },
  paid: { label: "مدفوع", color: "text-emerald-600" },
  refunded: { label: "مسترد", color: "text-gray-600" },
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const formatShortDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
  })
}

export function BookingWidget({
  booking,
  variant = "card",
  showActions = true,
  onCancel,
  onReschedule,
  className,
}: BookingWidgetProps) {
  const [isLoading, setIsLoading] = useState(false)

  const status = statusConfig[booking.status] || statusConfig.pending
  const type = typeConfig[booking.type] || typeConfig.clinic
  const paymentStatus = paymentStatusConfig[booking.paymentStatus || "pending"]

  const StatusIcon = status.icon
  const TypeIcon = type.icon

  const canCancel = ["pending", "confirmed"].includes(booking.status)
  const canReschedule = ["pending", "confirmed"].includes(booking.status)

  const handleCancel = async () => {
    if (!onCancel) return
    setIsLoading(true)
    try {
      await onCancel(booking.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!onReschedule) return
    setIsLoading(true)
    try {
      await onReschedule(booking.id)
    } finally {
      setIsLoading(false)
    }
  }

  // Compact variant - minimal info in a row
  if (variant === "compact") {
    return (
      <Link href={`/user/bookings/${booking.id}`} className={cn("block", className)}>
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", type.color)}>
            <TypeIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{booking.provider?.nameAr || "طبيب"}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{formatShortDate(booking.date)}</span>
              <span>•</span>
              <span>{booking.startTime}</span>
            </div>
          </div>
          <Badge className={cn("shrink-0", status.color)}>{status.label}</Badge>
          <ChevronLeft className="w-4 h-4 text-gray-400 shrink-0" />
        </div>
      </Link>
    )
  }

  // Detailed variant - full information with all details
  if (variant === "detailed") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">تفاصيل الحجز</CardTitle>
            <Badge className={status.color}>
              <StatusIcon className="w-3 h-3 ml-1" />
              {status.label}
            </Badge>
          </div>
          {booking.bookingNumber && <p className="text-sm text-gray-500">رقم الحجز: {booking.bookingNumber}</p>}
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Provider Info */}
          {booking.provider && (
            <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                <img
                  src={booking.provider.image || `/placeholder.svg?height=56&width=56&query=doctor`}
                  alt={booking.provider.nameAr}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {booking.provider.titleAr} {booking.provider.nameAr}
                </h3>
                {booking.provider.specialtyAr && (
                  <p className="text-sm text-emerald-600">{booking.provider.specialtyAr}</p>
                )}
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs text-gray-500">التاريخ</p>
                <p className="font-medium text-sm">{formatDate(booking.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs text-gray-500">الوقت</p>
                <p className="font-medium text-sm">
                  {booking.startTime}
                  {booking.endTime && ` - ${booking.endTime}`}
                </p>
              </div>
            </div>
          </div>

          {/* Type & Location */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", type.color)}>
              <TypeIcon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{type.label}</p>
              {(booking.clinic || booking.hospital) && (
                <p className="text-xs text-gray-500">{booking.clinic?.nameAr || booking.hospital?.nameAr}</p>
              )}
            </div>
          </div>

          {/* Patient Info */}
          {(booking.patientName || booking.patientPhone) && (
            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
              <p className="text-xs font-medium text-gray-500">بيانات الم��يض</p>
              {booking.patientName && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{booking.patientName}</span>
                </div>
              )}
              {booking.patientPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm" dir="ltr">
                    {booking.patientPhone}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Payment */}
          {booking.totalPrice !== undefined && (
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-500">المبلغ</p>
                  <p className="font-bold text-emerald-600">{booking.totalPrice} ج.م</p>
                </div>
              </div>
              <span className={cn("text-sm font-medium", paymentStatus.color)}>{paymentStatus.label}</span>
            </div>
          )}

          {/* Actions */}
          {showActions && (canCancel || canReschedule) && (
            <div className="flex gap-2 pt-2">
              {canReschedule && onReschedule && (
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={handleReschedule}
                  disabled={isLoading}
                >
                  إعادة جدولة
                </Button>
              )}
              {canCancel && onCancel && (
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  إلغاء الحجز
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Card variant (default) - balanced info display
  return (
    <Link href={`/user/bookings/${booking.id}`} className={cn("block", className)}>
      <Card className="hover:shadow-md transition-shadow overflow-hidden">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Provider Image */}
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
              <img
                src={booking.provider?.image || `/placeholder.svg?height=56&width=56&query=doctor`}
                alt={booking.provider?.nameAr || "طبيب"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {booking.provider?.nameAr || "طبيب غير محدد"}
                  </h3>
                  {booking.provider?.specialtyAr && (
                    <p className="text-sm text-muted-foreground">{booking.provider.specialtyAr}</p>
                  )}
                </div>
                <Badge className={status.color}>{status.label}</Badge>
              </div>

              {/* Date & Time */}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatShortDate(booking.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{booking.startTime}</span>
                </div>
                <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs", type.color)}>
                  <TypeIcon className="w-3 h-3" />
                  <span>{type.label}</span>
                </div>
              </div>
            </div>

            <ChevronLeft className="w-5 h-5 text-muted-foreground self-center shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default BookingWidget
