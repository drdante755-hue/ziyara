import mongoose, { type Document, type Model, Schema } from "mongoose"

// ========== Hospital Model ==========
export interface IHospital extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  nameAr: string
  slug: string
  description?: string
  descriptionAr?: string
  address: string
  city: string
  area: string
  phone: string
  emergencyPhone?: string
  email?: string
  website?: string
  images: string[]
  logo?: string
  departments: string[]
  specialties: string[]
  workingHours: {
    day: string
    from: string
    to: string
    isOpen: boolean
  }[]
  hasEmergency: boolean
  hasICU: boolean
  hasPharmacy: boolean
  hasLab: boolean
  bedCount?: number
  rating: number
  reviewsCount: number
  isActive: boolean
  isFeatured: boolean
  location?: {
    type: "Point"
    coordinates: [number, number]
  }
  amenities?: string[]
  insuranceAccepted?: string[]
  accreditations?: string[]
  createdAt?: Date
  updatedAt?: Date
}

const HospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true, trim: true },
    nameAr: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    descriptionAr: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    phone: { type: String, required: true },
    emergencyPhone: { type: String },
    email: { type: String, lowercase: true },
    website: { type: String },
    images: [{ type: String }],
    logo: { type: String },
    departments: [{ type: String }],
    specialties: [{ type: String }],
    workingHours: [
      {
        day: { type: String, required: true },
        from: { type: String, required: true },
        to: { type: String, required: true },
        isOpen: { type: Boolean, default: true },
      },
    ],
    hasEmergency: { type: Boolean, default: false },
    hasICU: { type: Boolean, default: false },
    hasPharmacy: { type: Boolean, default: false },
    hasLab: { type: Boolean, default: false },
    bedCount: { type: Number },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    amenities: [{ type: String }],
    insuranceAccepted: [{ type: String }],
    accreditations: [{ type: String }],
  },
  { timestamps: true },
)

HospitalSchema.index({ name: "text", nameAr: "text", specialties: "text", departments: "text" })
HospitalSchema.index({ slug: 1 })
HospitalSchema.index({ city: 1, area: 1 })
HospitalSchema.index({ isActive: 1 })
HospitalSchema.index({ isFeatured: 1 })
HospitalSchema.index({ location: "2dsphere" })

const Hospital: Model<IHospital> =
  (mongoose.models.Hospital as Model<IHospital>) || mongoose.model<IHospital>("Hospital", HospitalSchema)

export default Hospital
