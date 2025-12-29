import mongoose, { type Document, type Model, Schema } from "mongoose"

// ================= Doctor Interface =================

export interface IDoctor extends Document {
  name: string
  nameAr: string
  email: string
  phone: string
  specialty: string
  specialtyAr: string
  experienceYears: number
  qualifications: string[]
  languages: string[]
  about?: string
  aboutAr?: string
  profileImage?: string
  rating: number
  reviewCount: number
  type: "medical_center" | "private"
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

// ================= Schema =================

const DoctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true, trim: true },
    nameAr: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },

    specialty: { type: String, required: true },
    specialtyAr: { type: String, required: true },

    experienceYears: { type: Number, required: true, min: 0 },
    qualifications: [{ type: String }],
    languages: [{ type: String }],

    about: { type: String },
    aboutAr: { type: String },
    profileImage: { type: String },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    type: {
      type: String,
      enum: ["medical_center", "private"],
      required: true,
      default: "private",
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

// ================= Indexes =================

DoctorSchema.index({ email: 1 })
DoctorSchema.index({ specialty: 1 })
DoctorSchema.index({ type: 1 })
DoctorSchema.index({ isActive: 1 })
DoctorSchema.index({ rating: -1 })

// ================= Model =================

const Doctor: Model<IDoctor> = mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", DoctorSchema)

export default Doctor
