import mongoose, { Schema, type Document } from "mongoose"

export interface ICategory extends Document {
  name: string
  slug: string
  color: string
  icon: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "اسم القسم مطلوب"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    color: {
      type: String,
      default: "#10b981",
    },
    icon: {
      type: String,
      default: "Pill",
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema)
