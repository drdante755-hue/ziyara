import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  price: number
  salePrice?: number
  discount?: number
  category: string
  categorySlug?: string
  images: string[]
  imageUrl?: string
  stock: number
  sku?: string
  isActive: boolean
  status?: string
  isFeatured?: boolean
  tags?: string[]
  paymentMethod?: string
  paymentNumber?: string
  discountBannerId?: mongoose.Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    nameAr: { type: String, trim: true },
    description: { type: String },
    descriptionAr: { type: String },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    category: { type: String, required: true },
    categorySlug: { type: String },
    images: [{ type: String }],
    imageUrl: { type: String },
    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ["نشط", "غير نشط"], default: "نشط" },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }],
    paymentMethod: { type: String },
    paymentNumber: { type: String },
    discountBannerId: { type: Schema.Types.ObjectId, ref: "Banner" },
  },
  {
    timestamps: true,
  },
)

ProductSchema.index({ name: "text", nameAr: "text", description: "text" })
ProductSchema.index({ category: 1 })
ProductSchema.index({ categorySlug: 1 })
ProductSchema.index({ isActive: 1 })
ProductSchema.index({ discountBannerId: 1 })

const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) || mongoose.model<IProduct>("Product", ProductSchema)

export default Product
