import mongoose, { type Document, type Model, Schema } from "mongoose"

// ========== Review Model ==========
export interface IReview extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  bookingId: mongoose.Types.ObjectId
  providerId?: mongoose.Types.ObjectId
  clinicId?: mongoose.Types.ObjectId
  hospitalId?: mongoose.Types.ObjectId
  type: "provider" | "clinic" | "hospital"
  rating: number
  title?: string
  comment?: string
  isVerified: boolean
  isVisible: boolean
  response?: string
  respondedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "Provider" },
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    hospitalId: { type: Schema.Types.ObjectId, ref: "Hospital" },
    type: {
      type: String,
      enum: ["provider", "clinic", "hospital"],
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String },
    isVerified: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true },
    response: { type: String },
    respondedAt: { type: Date },
  },
  { timestamps: true },
)

ReviewSchema.index({ providerId: 1 })
ReviewSchema.index({ clinicId: 1 })
ReviewSchema.index({ hospitalId: 1 })
ReviewSchema.index({ userId: 1 })
ReviewSchema.index({ bookingId: 1 })
ReviewSchema.index({ rating: -1 })
ReviewSchema.index({ isVisible: 1 })

const Review: Model<IReview> =
  (mongoose.models.Review as Model<IReview>) || mongoose.model<IReview>("Review", ReviewSchema)

export default Review
