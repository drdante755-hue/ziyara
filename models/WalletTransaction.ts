import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface IWalletTransaction extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  type: "credit" | "debit"
  amount: number
  description: string
  referenceId: mongoose.Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for faster queries
WalletTransactionSchema.index({ userId: 1, createdAt: -1 })
WalletTransactionSchema.index({ type: 1 })

// Prevent model overwrite upon hot-reload in development
const WalletTransaction: Model<IWalletTransaction> =
  (mongoose.models.WalletTransaction as Model<IWalletTransaction>) ||
  mongoose.model<IWalletTransaction>("WalletTransaction", WalletTransactionSchema)

export default WalletTransaction
