import mongoose, { type Document, type Model, Schema } from "mongoose"

export type OrderStatus =
  | "pending"
  | "processing"
  | "order_created"
  | "payment_confirmed"
  | "preparing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled"

export interface IOrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  originalPrice?: number
  category?: string
  image?: string
  total: number
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId
  orderNumber: string
  userId?: string
  customerName: string
  customerPhone: string
  customerWhatsapp?: string
  shippingAddress: string
  items: IOrderItem[]
  subtotal: number
  shippingCost: number
  discountCode?: string
  discountAmount: number
  discountType?: "%" | "ج.م"
  discountValue?: number
  total: number
  status: OrderStatus
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentConfirmedAt?: Date
  paymentConfirmedBy?: string
  referenceNumber?: string
  paymentProofUrl?: string
  notes?: string
  trackingId?: mongoose.Types.ObjectId
  estimatedDeliveryDate?: Date
  createdAt?: Date
  updatedAt?: Date
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number },
    category: { type: String },
    image: { type: String },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: String, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerWhatsapp: { type: String },
    shippingAddress: { type: String, required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, default: 0, min: 0 },
    discountCode: { type: String },
    discountAmount: { type: Number, default: 0, min: 0 },
    discountType: { type: String, enum: ["%", "ج.م"] },
    discountValue: { type: Number },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "order_created",
        "payment_confirmed",
        "preparing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentConfirmedAt: { type: Date },
    paymentConfirmedBy: { type: String },
    referenceNumber: { type: String },
    paymentProofUrl: { type: String },
    notes: { type: String },
    trackingId: { type: Schema.Types.ObjectId, ref: "Tracking" },
    estimatedDeliveryDate: { type: Date },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
OrderSchema.index({ status: 1 })
OrderSchema.index({ createdAt: -1 })
OrderSchema.index({ customerPhone: 1 })
OrderSchema.index({ trackingId: 1 })

const Order: Model<IOrder> = (mongoose.models.Order as Model<IOrder>) || mongoose.model<IOrder>("Order", OrderSchema)

export default Order
