import mongoose, { Schema, type Document } from "mongoose"

export interface IDiscount extends Document {
  code: string
  discount: number
  type: "%" | "ر.س"
  expiryDate: Date
  usageCount: number
  maxUsage: number
  status: "نشط" | "غير نشط" | "منتهي"
  description: string
  minOrder: number
  createdAt: Date
  updatedAt: Date
}

const DiscountSchema = new Schema<IDiscount>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["%", "ر.س"],
      default: "%",
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    maxUsage: {
      type: Number,
      default: 100,
    },
    status: {
      type: String,
      enum: ["نشط", "غير نشط", "منتهي"],
      default: "نشط",
    },
    description: {
      type: String,
      default: "",
    },
    minOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Auto-update status based on expiry date
DiscountSchema.pre("save", function (next) {
  if (this.expiryDate < new Date()) {
    this.status = "منتهي"
  }
  if (this.usageCount >= this.maxUsage) {
    this.status = "منتهي"
  }
  next()
})

export default mongoose.models.Discount || mongoose.model<IDiscount>("Discount", DiscountSchema)
