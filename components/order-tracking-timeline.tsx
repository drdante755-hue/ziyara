"use client"

import { cn } from "@/lib/utils"
import {
  ShoppingCart,
  CreditCard,
  Package,
  Truck,
  Navigation,
  PackageCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
} from "lucide-react"

const ORDER_STEPS = [
  {
    key: "order_created",
    label: "تم استلام الطلب",
    icon: ShoppingCart,
    description: "تم استلام طلبك بنجاح",
  },
  {
    key: "payment_confirmed",
    label: "تأكيد الدفع",
    icon: CreditCard,
    description: "تم تأكيد الدفع من قبل الإدارة",
  },
  {
    key: "preparing",
    label: "جاري التجهيز",
    icon: Package,
    description: "طلبك قيد التجهيز والتغليف",
  },
  {
    key: "shipped",
    label: "تم الشحن",
    icon: Truck,
    description: "تم تسليم طلبك لشركة الشحن",
  },
  {
    key: "out_for_delivery",
    label: "جاري التوصيل",
    icon: Navigation,
    description: "مندوب التوصيل في الطريق إليك",
  },
  {
    key: "delivered",
    label: "تم التوصيل",
    icon: PackageCheck,
    description: "تم توصيل طلبك بنجاح",
  },
]

// When selecting a step, all previous steps are automatically completed
function getStepState(stepKey: string, orderStatus: string, paymentStatus: string): "completed" | "active" | "pending" {
  // Define the order of steps (excluding payment_confirmed which is controlled separately)
  const statusOrder = ["order_created", "preparing", "shipped", "out_for_delivery", "delivered"]

  // payment_confirmed is only controlled by paymentStatus
  if (stepKey === "payment_confirmed") {
    if (paymentStatus === "paid") {
      return "completed"
    }
    return "pending"
  }

  // Get the index of the current order status
  const currentStatusIndex = statusOrder.indexOf(orderStatus)
  // Get the index of the step we're checking
  const stepIndex = statusOrder.indexOf(stepKey)

  // If both are valid statuses
  if (currentStatusIndex !== -1 && stepIndex !== -1) {
    if (stepIndex < currentStatusIndex) {
      // Steps before current status are completed
      return "completed"
    } else if (stepIndex === currentStatusIndex) {
      // Current step is active
      return "active"
    }
  }

  // Handle order_created as the first step
  if (stepKey === "order_created" && (orderStatus === "order_created" || currentStatusIndex === -1)) {
    return "active"
  }

  // Handle legacy "pending" status - treat as order_created
  if (orderStatus === "pending") {
    if (stepKey === "order_created") {
      return "active"
    }
    return "pending"
  }

  return "pending"
}

interface PaymentStatusBadgeProps {
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentConfirmedBy?: string
  paymentConfirmedAt?: string
}

export function PaymentStatusBadge({ paymentStatus, paymentConfirmedBy, paymentConfirmedAt }: PaymentStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "في انتظار مراجعة الإدارة",
      sublabel: "سيتم تأكيد الدفع من قبل الإدارة",
      icon: Clock,
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-200",
      iconColor: "text-amber-500",
      iconBg: "bg-amber-100",
    },
    paid: {
      label: "تم التأكيد من الإدارة",
      sublabel: "تم تأكيد استلام المبلغ",
      icon: ShieldCheck,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      borderColor: "border-emerald-200",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
    },
    failed: {
      label: "فشل الدفع",
      sublabel: "يرجى التواصل مع الدعم",
      icon: XCircle,
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200",
      iconColor: "text-red-500",
      iconBg: "bg-red-100",
    },
    refunded: {
      label: "تم الاسترداد",
      sublabel: "تم إرجاع المبلغ",
      icon: AlertCircle,
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200",
      iconColor: "text-purple-500",
      iconBg: "bg-purple-100",
    },
  }

  const config = statusConfig[paymentStatus]
  const Icon = config.icon

  return (
    <div className={cn("rounded-xl border-2 p-4 mb-4", config.bgColor, config.borderColor)}>
      <div className="flex items-center gap-3">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", config.iconBg)}>
          <Icon className={cn("w-6 h-6", config.iconColor)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className={cn("font-bold text-base", config.textColor)}>{config.label}</p>
            {paymentStatus === "paid" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{config.sublabel}</p>
          {paymentStatus === "paid" && paymentConfirmedBy && (
            <p className="text-xs text-gray-400 mt-1">
              بواسطة: {paymentConfirmedBy}
              {paymentConfirmedAt &&
                ` - ${new Date(paymentConfirmedAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface OrderTrackingTimelineProps {
  status: string
  referenceType: "product_order" | "home_test"
  paymentStatus?: "pending" | "paid" | "failed" | "refunded"
  paymentConfirmedBy?: string
  paymentConfirmedAt?: string
  variant?: "horizontal" | "vertical"
  showPaymentBadge?: boolean
  className?: string
}

export function OrderTrackingTimeline({
  status,
  referenceType,
  paymentStatus = "pending",
  paymentConfirmedBy,
  paymentConfirmedAt,
  variant = "horizontal",
  showPaymentBadge = true,
  className,
}: OrderTrackingTimelineProps) {
  const isCancelled = status === "cancelled"

  if (isCancelled) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-700 mb-2">تم إلغاء الطلب</h3>
          <p className="text-red-600 text-sm">تم إلغاء هذا الطلب ولن يتم متابعة معالجته</p>
          <p className="text-gray-500 text-xs mt-2">إذا كان لديك أي استفسار، يرجى التواصل مع خدمة العملاء</p>
        </div>
      </div>
    )
  }

  if (variant === "horizontal") {
    const completedSteps = ORDER_STEPS.filter(
      (step) => getStepState(step.key, status, paymentStatus) === "completed",
    ).length
    const progressPercentage = completedSteps > 0 ? (completedSteps / (ORDER_STEPS.length - 1)) * 100 : 0

    return (
      <div className={cn("space-y-4", className)}>
        {showPaymentBadge && (
          <PaymentStatusBadge
            paymentStatus={paymentStatus}
            paymentConfirmedBy={paymentConfirmedBy}
            paymentConfirmedAt={paymentConfirmedAt}
          />
        )}

        <div className="relative py-4 px-2">
          <div className="absolute top-[38px] right-[40px] left-[40px] h-1.5 bg-gray-200 rounded-full" />

          <div
            className="absolute top-[38px] right-[40px] h-1.5 bg-gradient-to-l from-sky-400 to-sky-600 rounded-full transition-all duration-700 ease-out"
            style={{
              width: `calc(${Math.min(progressPercentage, 100)}% - ${progressPercentage >= 100 ? 0 : 20}px)`,
            }}
          />

          <div className="relative flex justify-between">
            {ORDER_STEPS.map((step) => {
              const stepState = getStepState(step.key, status, paymentStatus)
              const isCompleted = stepState === "completed"
              const isActive = stepState === "active"
              const isPending = stepState === "pending"
              const Icon = step.icon

              return (
                <div key={step.key} className="flex flex-col items-center w-14 md:w-16">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10",
                      isCompleted && "bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-200",
                      isActive && "bg-white border-sky-500 text-sky-600 ring-4 ring-sky-100 shadow-lg",
                      isPending && "bg-white border-gray-300 text-gray-400",
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] mt-2 text-center font-medium leading-tight",
                      isActive && "text-sky-600 font-bold",
                      isCompleted && "text-gray-700",
                      isPending && "text-gray-400",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {showPaymentBadge && (
        <PaymentStatusBadge
          paymentStatus={paymentStatus}
          paymentConfirmedBy={paymentConfirmedBy}
          paymentConfirmedAt={paymentConfirmedAt}
        />
      )}

      <div className="relative">
        {ORDER_STEPS.map((step, index) => {
          const stepState = getStepState(step.key, status, paymentStatus)
          const isCompleted = stepState === "completed"
          const isActive = stepState === "active"
          const isPending = stepState === "pending"
          const Icon = step.icon

          return (
            <div key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
              {index < ORDER_STEPS.length - 1 && (
                <div
                  className={cn(
                    "absolute top-11 right-[21px] w-0.5 h-[calc(100%-28px)] transition-colors duration-500",
                    isCompleted ? "bg-sky-500" : "bg-gray-200",
                  )}
                />
              )}

              <div
                className={cn(
                  "relative z-10 w-11 h-11 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-500",
                  isCompleted && "bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-200",
                  isActive && "bg-white border-sky-500 text-sky-600 ring-4 ring-sky-100 shadow-lg",
                  isPending && "bg-white border-gray-200 text-gray-400",
                )}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0 pt-2">
                <h4
                  className={cn(
                    "font-medium text-sm",
                    isActive && "text-sky-600 font-bold",
                    isCompleted && "text-gray-700",
                    isPending && "text-gray-400",
                  )}
                >
                  {step.label}
                </h4>
                <p
                  className={cn(
                    "text-xs mt-0.5",
                    isActive && "text-gray-600",
                    isCompleted && "text-gray-500",
                    isPending && "text-gray-400",
                  )}
                >
                  {isCompleted ? "تم" : isActive ? step.description : "في انتظار..."}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OrderTrackingTimeline
