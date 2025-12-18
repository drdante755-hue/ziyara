"use client"

import { cn } from "@/lib/utils"
import {
  ClipboardList,
  CreditCard,
  UserCheck,
  Navigation,
  TestTube,
  FlaskConical,
  FileCheck,
  CheckCircle2,
  XCircle,
  CalendarClock,
  ShoppingCart,
  Package,
  Truck,
  PackageCheck,
  RotateCcw,
  RefreshCw,
} from "lucide-react"

/* ---------------- Icons Map ---------------- */
const iconMap: Record<string, any> = {
  ClipboardList,
  CreditCard,
  UserCheck,
  Navigation,
  TestTube,
  FlaskConical,
  FileCheck,
  CheckCircle2,
  XCircle,
  CalendarClock,
  ShoppingCart,
  Package,
  Truck,
  PackageCheck,
  RotateCcw,
  RefreshCw,
}

/* ---------------- Colors Map ---------------- */
const colorMap: Record<
  string,
  { bg: string; text: string; border: string; line: string }
> = {
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
  indigo: {
    bg: "bg-indigo-100",
    text: "text-indigo-600",
    border: "border-indigo-500",
    line: "bg-indigo-500",
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

/* ---------------- Types ---------------- */
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
  changedBy: string
  changedByName?: string
  createdAt: string
}

interface TrackingTimelineProps {
  currentStatus: string
  statusHistory: StatusHistoryItem[]
  orderedStatuses: string[]
  referenceType: "home_test" | "product_order"
  variant?: "vertical" | "horizontal"
  showDetails?: boolean
  className?: string
}

/* ---------------- Status Dictionaries ---------------- */
const HOME_TEST_STATUSES: Record<string, StatusInfo> = {
  order_created: {
    key: "order_created",
    label: "تم إنشاء الطلب",
    labelEn: "Order Created",
    icon: "ClipboardList",
    color: "blue",
  },
  payment_confirmed: {
    key: "payment_confirmed",
    label: "تم تأكيد الدفع",
    labelEn: "Payment Confirmed",
    icon: "CreditCard",
    color: "green",
  },
  technician_assigned: {
    key: "technician_assigned",
    label: "تم تعيين الفني",
    labelEn: "Technician Assigned",
    icon: "UserCheck",
    color: "blue",
  },
  technician_on_way: {
    key: "technician_on_way",
    label: "الفني في الطريق",
    labelEn: "Technician On the Way",
    icon: "Navigation",
    color: "orange",
  },
  sample_collected: {
    key: "sample_collected",
    label: "تم جمع العينة",
    labelEn: "Sample Collected",
    icon: "TestTube",
    color: "purple",
  },
  sample_in_analysis: {
    key: "sample_in_analysis",
    label: "العينة قيد التحليل",
    labelEn: "Sample In Analysis",
    icon: "FlaskConical",
    color: "indigo",
  },
  results_ready: {
    key: "results_ready",
    label: "النتائج جاهزة",
    labelEn: "Results Ready",
    icon: "FileCheck",
    color: "teal",
  },
  completed: {
    key: "completed",
    label: "مكتمل",
    labelEn: "Completed",
    icon: "CheckCircle2",
    color: "green",
  },
  cancelled: {
    key: "cancelled",
    label: "ملغى",
    labelEn: "Cancelled",
    icon: "XCircle",
    color: "red",
  },
}

const PRODUCT_ORDER_STATUSES: Record<string, StatusInfo> = {
  order_created: {
    key: "order_created",
    label: "تم إنشاء الطلب",
    labelEn: "Order Created",
    icon: "ShoppingCart",
    color: "blue",
  },
  payment_confirmed: {
    key: "payment_confirmed",
    label: "تم تأكيد الدفع",
    labelEn: "Payment Confirmed",
    icon: "CreditCard",
    color: "green",
  },
  preparing: {
    key: "preparing",
    label: "جاري التجهيز",
    labelEn: "Preparing Order",
    icon: "Package",
    color: "orange",
  },
  shipped: {
    key: "shipped",
    label: "تم الشحن",
    labelEn: "Shipped",
    icon: "Truck",
    color: "blue",
  },
  out_for_delivery: {
    key: "out_for_delivery",
    label: "في الطريق للتوصيل",
    labelEn: "Out for Delivery",
    icon: "Navigation",
    color: "purple",
  },
  delivered: {
    key: "delivered",
    label: "تم التوصيل",
    labelEn: "Delivered",
    icon: "PackageCheck",
    color: "green",
  },
  cancelled: {
    key: "cancelled",
    label: "ملغى",
    labelEn: "Cancelled",
    icon: "XCircle",
    color: "red",
  },
}

/* ---------------- Helpers ---------------- */
const getStatusInfo = (
  referenceType: "home_test" | "product_order",
  status: string,
): StatusInfo | null => {
  const map =
    referenceType === "home_test"
      ? HOME_TEST_STATUSES
      : PRODUCT_ORDER_STATUSES

  return map[status] ?? null
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

/* ---------------- Component ---------------- */
export function TrackingTimeline({
  currentStatus,
  statusHistory,
  orderedStatuses,
  referenceType,
  variant = "vertical",
  showDetails = true,
  className,
}: TrackingTimelineProps) {
  const rawIndex = orderedStatuses.indexOf(currentStatus)
  const currentIndex =
    rawIndex === -1 ? orderedStatuses.length - 1 : rawIndex

  const isCancelled = currentStatus === "cancelled"

  /* ---------- Vertical ---------- */
  return (
    <div className={cn("relative", className)}>
      {orderedStatuses.map((status, index) => {
        const statusInfo = getStatusInfo(referenceType, status)
        if (!statusInfo) return null

        const historyItem = statusHistory.find(h => h.status === status)

        const isCompleted = !isCancelled && index < currentIndex
        const isActive = !isCancelled && index === currentIndex
        const isPending = isCancelled || index > currentIndex

        const Icon = iconMap[statusInfo.icon] || ClipboardList
        const colors = colorMap[statusInfo.color] || colorMap.gray

        return (
          <div key={status} className="relative flex gap-4 pb-8 last:pb-0">
            {index < orderedStatuses.length - 1 && (
              <div
                className={cn(
                  "absolute top-10 right-[19px] w-0.5 h-[calc(100%-24px)]",
                  isCompleted ? "bg-emerald-500" : "bg-gray-200",
                )}
              />
            )}

            <div
              className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10",
                isCompleted && "bg-emerald-500 border-emerald-500 text-white",
                isActive &&
                  `${colors.bg} ${colors.border} ${colors.text} ring-4`,
                isPending && "bg-gray-50 border-gray-200 text-gray-400",
              )}
              style={
                isActive
                  ? ({ "--tw-ring-color": colors.line } as any)
                  : {}
              }
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4
                  className={cn(
                    isActive
                      ? "text-gray-900 font-bold"
                      : isCompleted
                      ? "text-gray-700"
                      : "text-gray-400",
                  )}
                >
                  {statusInfo.label}
                </h4>
                {historyItem && (
                  <span className="text-xs text-gray-500">
                    {formatDate(historyItem.createdAt)}
                  </span>
                )}
              </div>

              {showDetails && historyItem?.note && (
                <p className="text-sm text-gray-600 mt-1">
                  {historyItem.note}
                </p>
              )}

              {isPending && !historyItem && (
                <p className="text-sm text-gray-400 mt-1">
                  في انتظار...
                </p>
              )}
            </div>
          </div>
        )
      })}

      {isCancelled && (
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-red-600">تم إلغاء الطلب</h4>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrackingTimeline
