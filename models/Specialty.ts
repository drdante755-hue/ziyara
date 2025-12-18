import mongoose, { type Document, type Model, Schema } from "mongoose"

// ========== Specialty Model ==========
export interface ISpecialty extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  nameAr: string
  slug: string
  description?: string
  descriptionAr?: string
  icon?: string
  image?: string
  isActive: boolean
  order: number
  createdAt?: Date
  updatedAt?: Date
}

const SpecialtySchema = new Schema<ISpecialty>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    nameAr: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    descriptionAr: { type: String },
    icon: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

SpecialtySchema.index({ slug: 1 })
SpecialtySchema.index({ isActive: 1 })
SpecialtySchema.index({ order: 1 })

const Specialty: Model<ISpecialty> =
  (mongoose.models.Specialty as Model<ISpecialty>) || mongoose.model<ISpecialty>("Specialty", SpecialtySchema)

export default Specialty
