import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface IWalletRecharge extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  paymentMethod: string
  fromPhoneNumber: string
  amount: number
  screenshot: string
  status: "pending" | "approved" | "rejected"
  adminNote?: string
  createdAt?: Date
  updatedAt?: Date
}

const WalletRechargeSchema = new Schema<IWalletRecharge>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "vodafone_cash",
      enum: ["vodafone_cash"],
    },
    fromPhoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    screenshot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminNote: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

WalletRechargeSchema.index({ userId: 1, createdAt: -1 })

// Prevent model overwrite upon hot-reload in development
const WalletRecharge: Model<IWalletRecharge> =
  (mongoose.models.WalletRecharge as Model<IWalletRecharge>) ||
  mongoose.model<IWalletRecharge>("WalletRecharge", WalletRechargeSchema)

export default WalletRecharge
