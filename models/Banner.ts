import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface IBanner extends Document {
  _id: mongoose.Types.ObjectId
  imageUrl: string
  imagePublicId: string
  imageMimeType?: string
  imageWidth?: number
  imageHeight?: number

  // Content fields
  title: string
  description?: string

  // Action type
  actionType: "discount" | "category" | "product" | "url"

  // Optional fields based on actionType
  discountType?: "percentage" | "fixed"
  discountValue?: number
  productSelectionMode?: "manual" | "auto"
  autoDiscountThreshold?: number // الحد الأدنى لنسبة الخصم للجلب التلقائي
  // </CHANGE>
  targetCategoryId?: mongoose.Types.ObjectId
  targetProductId?: mongoose.Types.ObjectId
  targetUrl?: string

  // Control fields
  position: "user-home-main"
  isActive: boolean
  startDate: Date
  endDate: Date

  // Timestamps
  createdAt?: Date
  updatedAt?: Date
}

const BannerSchema = new Schema<IBanner>(
  {
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    imageMimeType: { type: String },
    imageWidth: { type: Number },
    imageHeight: { type: Number },

    // Content fields
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // Action type
    actionType: {
      type: String,
      enum: ["discount", "category", "product", "url"],
      required: true,
    },

    // Optional fields based on actionType
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
    },
    discountValue: { type: Number, min: 0 },
    productSelectionMode: {
      type: String,
      enum: ["manual", "auto"],
      default: "manual",
    },
    autoDiscountThreshold: { type: Number, min: 0, max: 100 },
    // </CHANGE>
    targetCategoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    targetProductId: { type: Schema.Types.ObjectId, ref: "Product" },
    targetUrl: { type: String },

    // Control fields
    position: {
      type: String,
      enum: ["user-home-main"],
      default: "user-home-main",
      required: true,
    },
    isActive: { type: Boolean, default: false },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  },
)

// Index for querying active banners by position and date range
BannerSchema.index({ position: 1, isActive: 1, startDate: 1, endDate: 1 })
BannerSchema.index({ isActive: 1 })

const Banner: Model<IBanner> =
  (mongoose.models.Banner as Model<IBanner>) || mongoose.model<IBanner>("Banner", BannerSchema)

export default Banner
