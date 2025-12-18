import mongoose, { type Document, type Model, Schema } from "mongoose"

// ========== Payment Transaction Model ==========
export interface IPaymentTransaction extends Document {
  _id: mongoose.Types.ObjectId
  transactionId: string
  bookingId?: mongoose.Types.ObjectId
  orderId?: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId

  amount: number
  currency: string

  method: "wallet" | "cash" | "card" | "bank_transfer"
  provider?: "stripe" | "paymob" | "fawry" | "vodafone_cash"
  providerTransactionId?: string

  type: "payment" | "refund" | "partial_refund"
  status: "pending" | "processing" | "completed" | "failed" | "refunded" | "cancelled"

  providerFee?: number
  platformFee?: number
  netAmount?: number

  metadata?: {
    cardLast4?: string
    cardBrand?: string
    receiptUrl?: string
    failureReason?: string
    refundReason?: string
  }

  completedAt?: Date
  failedAt?: Date
  refundedAt?: Date

  createdAt?: Date
  updatedAt?: Date
}

const PaymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    transactionId: { type: String, required: true, unique: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "EGP" },

    method: {
      type: String,
      enum: ["wallet", "cash", "card", "bank_transfer"],
      required: true,
    },
    provider: {
      type: String,
      enum: ["stripe", "paymob", "fawry", "vodafone_cash"],
    },
    providerTransactionId: { type: String },

    type: {
      type: String,
      enum: ["payment", "refund", "partial_refund"],
      default: "payment",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded", "cancelled"],
      default: "pending",
    },

    providerFee: { type: Number, min: 0 },
    platformFee: { type: Number, min: 0 },
    netAmount: { type: Number, min: 0 },

    metadata: {
      cardLast4: { type: String },
      cardBrand: { type: String },
      receiptUrl: { type: String },
      failureReason: { type: String },
      refundReason: { type: String },
    },

    completedAt: { type: Date },
    failedAt: { type: Date },
    refundedAt: { type: Date },
  },
  { timestamps: true },
)

// ================= Indexes =================
PaymentTransactionSchema.index({ transactionId: 1 })
PaymentTransactionSchema.index({ bookingId: 1 })
PaymentTransactionSchema.index({ orderId: 1 })
PaymentTransactionSchema.index({ userId: 1 })
PaymentTransactionSchema.index({ status: 1 })
PaymentTransactionSchema.index({ createdAt: -1 })

// ================= Pre-save Hook =================
PaymentTransactionSchema.pre<IPaymentTransaction>("save", function () {
  if (!this.transactionId) {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const random = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0")

    this.transactionId = `TXN${year}${month}${random}`
  }

  // Calculate net amount if not set
  if (this.amount && !this.netAmount) {
    const fees = (this.providerFee || 0) + (this.platformFee || 0)
    this.netAmount = this.amount - fees
  }
})

const PaymentTransaction: Model<IPaymentTransaction> =
  (mongoose.models.PaymentTransaction as Model<IPaymentTransaction>) ||
  mongoose.model<IPaymentTransaction>("PaymentTransaction", PaymentTransactionSchema)

export default PaymentTransaction
