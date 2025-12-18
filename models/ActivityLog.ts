import mongoose, { Schema, type Document } from "mongoose"

export interface IActivityLog extends Document {
  admin: string
  adminId?: mongoose.Types.ObjectId
  action: string
  type: "إنشاء" | "تعديل" | "حذف" | "تسجيل دخول" | "أخرى"
  details: string
  target: "منتج" | "خصم" | "مستخدم" | "إعدادات" | "تقييم" | "طلب" | "قسم" | "أخرى"
  targetId?: string
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    admin: {
      type: String,
      required: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["إنشاء", "تعديل", "حذف", "تسجيل دخول", "أخرى"],
      default: "أخرى",
    },
    details: {
      type: String,
      default: "",
    },
    target: {
      type: String,
      enum: ["منتج", "خصم", "مستخدم", "إعدادات", "تقييم", "طلب", "قسم", "أخرى"],
      default: "أخرى",
    },
    targetId: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Index for faster queries
ActivityLogSchema.index({ createdAt: -1 })
ActivityLogSchema.index({ admin: 1 })
ActivityLogSchema.index({ type: 1 })
ActivityLogSchema.index({ target: 1 })

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema)
