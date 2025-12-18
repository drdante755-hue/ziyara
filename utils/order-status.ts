// utils/order-status.ts

/* =====================================================
   1️⃣ Reference Types
===================================================== */

export type ReferenceType = "product_order" | "home_test"

/* =====================================================
   2️⃣ All Statuses (Single Source of Truth)
===================================================== */

export type ProductOrderStatus =
  | "pending"
  | "order_created"
  | "payment_confirmed"
  | "preparing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled"
  | "returned"
  | "refunded"

export type HomeTestStatus =
  | "order_created"
  | "payment_confirmed"
  | "technician_assigned"
  | "technician_on_way"
  | "sample_collected"
  | "sample_in_analysis"
  | "results_ready"
  | "completed"
  | "cancelled"
  | "rescheduled"

export type AllStatuses = ProductOrderStatus | HomeTestStatus

/* =====================================================
   3️⃣ Timeline Step Interface
===================================================== */

export interface TimelineStep {
  key: AllStatuses
  label: string
  labelEn: string
}

/* =====================================================
   4️⃣ Product Order Timeline Definition
===================================================== */

export const PRODUCT_ORDER_STEPS: TimelineStep[] = [
  { key: "order_created", label: "تم إنشاء الطلب", labelEn: "Order Created" },
  { key: "payment_confirmed", label: "تم تأكيد الدفع", labelEn: "Payment Confirmed" },
  { key: "preparing", label: "جاري التجهيز", labelEn: "Preparing" },
  { key: "shipped", label: "تم الشحن", labelEn: "Shipped" },
  { key: "out_for_delivery", label: "قيد التوصيل", labelEn: "Out For Delivery" },
  { key: "delivered", label: "تم التوصيل", labelEn: "Delivered" },
  { key: "completed", label: "مكتمل", labelEn: "Completed" },
]

/* =====================================================
   5️⃣ Home Test Timeline Definition
===================================================== */

export const HOME_TEST_STEPS: TimelineStep[] = [
  { key: "order_created", label: "تم إنشاء الطلب", labelEn: "Order Created" },
  { key: "payment_confirmed", label: "تم تأكيد الدفع", labelEn: "Payment Confirmed" },
  { key: "technician_assigned", label: "تعيين الفني", labelEn: "Technician Assigned" },
  { key: "technician_on_way", label: "الفني في الطريق", labelEn: "Technician On Way" },
  { key: "sample_collected", label: "تم سحب العينة", labelEn: "Sample Collected" },
  { key: "sample_in_analysis", label: "قيد التحليل", labelEn: "In Analysis" },
  { key: "results_ready", label: "النتائج جاهزة", labelEn: "Results Ready" },
  { key: "completed", label: "مكتمل", labelEn: "Completed" },
]

/* =====================================================
   6️⃣ Timeline Resolver (Steps by Type)
===================================================== */

export function getTimelineSteps(type: ReferenceType): TimelineStep[] {
  return type === "home_test" ? HOME_TEST_STEPS : PRODUCT_ORDER_STEPS
}

/* =====================================================
   7️⃣ Timeline Index Resolver
===================================================== */

export function getTimelineIndex(
  status: AllStatuses,
  type: ReferenceType,
): number {
  const steps = getTimelineSteps(type)
  const index = steps.findIndex(step => step.key === status)

  // cancelled / returned / refunded → خارج المسار الطبيعي
  if (index === -1) {
    if (status === "cancelled" || status === "returned" || status === "refunded") {
      return -1
    }
    return 0 // safe fallback
  }

  return index
}

/* =====================================================
   8️⃣ Step State Calculator
===================================================== */

export type TimelineStepState = "completed" | "active" | "pending"

export function getTimelineStepState(
  stepIndex: number,
  currentIndex: number,
): TimelineStepState {
  if (currentIndex === -1) return "pending"
  if (stepIndex < currentIndex) return "completed"
  if (stepIndex === currentIndex) return "active"
  return "pending"
}

/* =====================================================
   9️⃣ Guards & Helpers (Optional but Powerful)
===================================================== */

export function isTerminalStatus(status: AllStatuses): boolean {
  return ["completed", "cancelled", "returned", "refunded"].includes(status)
}

export function isActiveFlowStatus(status: AllStatuses): boolean {
  return !isTerminalStatus(status)
}
