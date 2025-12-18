import mongoose, { type Document, type Model, Schema } from "mongoose"

// ========== Tracking Status History ==========
export interface IStatusHistoryItem {
  status: string
  note?: string
  changedBy: "system" | "admin" | "technician" | "delivery"
  changedByName?: string
  createdAt: Date
}

// ========== Tracking Interface ==========
export interface ITracking extends Document {
  _id: mongoose.Types.ObjectId
  trackingNumber: string
  referenceType: "home_test" | "product_order"
  referenceId: mongoose.Types.ObjectId
  currentStatus: string
  statusHistory: IStatusHistoryItem[]
  estimatedDelivery?: Date
  actualDelivery?: Date
  assignedTo?: string
  assignedToPhone?: string
  resultsFileUrl?: string
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

// ========== Status History Schema ==========
const StatusHistorySchema = new Schema<IStatusHistoryItem>(
  {
    status: { type: String, required: true },
    note: { type: String },
    changedBy: {
      type: String,
      enum: ["system", "admin", "technician", "delivery"],
      default: "system",
    },
    changedByName: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

// ========== Tracking Schema ==========
const TrackingSchema = new Schema<ITracking>(
  {
    trackingNumber: { type: String, required: true, unique: true },
    referenceType: {
      type: String,
      enum: ["home_test", "product_order"],
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "referenceType",
    },
    currentStatus: { type: String, required: true },
    statusHistory: [StatusHistorySchema],
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },
    assignedTo: { type: String },
    assignedToPhone: { type: String },
    resultsFileUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
)

// ========== Indexes ==========
TrackingSchema.index({ trackingNumber: 1 })
TrackingSchema.index({ referenceType: 1, referenceId: 1 })
TrackingSchema.index({ currentStatus: 1 })
TrackingSchema.index({ createdAt: -1 })

// ========== Pre-save Hook for Tracking Number ==========
TrackingSchema.pre<ITracking>("save", function () {
  if (!this.trackingNumber) {
    const prefix = this.referenceType === "home_test" ? "HT" : "PO"
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const random = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0")
    this.trackingNumber = `${prefix}${year}${month}${random}`
  }
})

// ========== Status Definitions ==========
export const HOME_TEST_STATUSES = {
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
  rescheduled: {
    key: "rescheduled",
    label: "تم إعادة الجدولة",
    labelEn: "Rescheduled",
    icon: "CalendarClock",
    color: "yellow",
  },
} as const

export const PRODUCT_ORDER_STATUSES = {
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
  returned: {
    key: "returned",
    label: "مرتجع",
    labelEn: "Returned",
    icon: "RotateCcw",
    color: "orange",
  },
  refunded: {
    key: "refunded",
    label: "تم الاسترداد",
    labelEn: "Refunded",
    icon: "RefreshCw",
    color: "gray",
  },
} as const

// ========== Helper Functions ==========
export const getStatusInfo = (referenceType: "home_test" | "product_order", status: string) => {
  const statuses = referenceType === "home_test" ? HOME_TEST_STATUSES : PRODUCT_ORDER_STATUSES
  return statuses[status as keyof typeof statuses] || null
}

export const getOrderedStatuses = (referenceType: "home_test" | "product_order") => {
  if (referenceType === "home_test") {
    return [
      "order_created",
      "payment_confirmed",
      "technician_assigned",
      "technician_on_way",
      "sample_collected",
      "sample_in_analysis",
      "results_ready",
      "completed",
    ]
  }
  return ["order_created", "payment_confirmed", "preparing", "shipped", "out_for_delivery", "delivered", "completed"]
}

// ========== Export Model ==========
const Tracking: Model<ITracking> =
  (mongoose.models.Tracking as Model<ITracking>) || mongoose.model<ITracking>("Tracking", TrackingSchema)

export default Tracking
