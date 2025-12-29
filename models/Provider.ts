import mongoose, { type Document, type Model, Schema } from "mongoose"

// ========== Provider/Doctor Model ==========
export interface IProvider extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  nameAr: string
  slug: string
  title: string // Dr., Prof., etc.
  titleAr: string
  specialty: string
  specialtyAr: string
  subSpecialties?: string[]
  bio?: string
  bioAr?: string
  email?: string
  phone?: string
  image?: string
  gender: "male" | "female"
  languages: string[]
  education: {
    degree: string
    institution: string
    year: number
  }[]
  experience: number // years of experience
  consultationFee: number
  followUpFee?: number
  clinicId?: mongoose.Types.ObjectId
  medicalCenterId?: mongoose.Types.ObjectId
  workingAt: {
    type: "clinic" | "medicalCenter"
    id: mongoose.Types.ObjectId
    name: string
  }[]
  rating: number
  reviewsCount: number
  totalPatients: number
  isActive: boolean
  isFeatured: boolean
  isVerified: boolean
  availableForHomeVisit: boolean
  homeVisitFee?: number
  availableForOnline: boolean
  onlineConsultationFee?: number
  availability?: {
    startDate?: string
    endDate?: string
    startTime?: string
    endTime?: string
    days?: string[]
    perDay?: Record<string, { startTime?: string; endTime?: string; enabled?: boolean }>
    defaultScheduleEnabled?: boolean
    defaultStartTime?: string
    defaultEndTime?: string
    slotDuration?: number
    clinicCustomDays?: Record<string, { startTime?: string; endTime?: string; enabled?: boolean; isClosed?: boolean }>
    medicalCenterCustomDays?: Record<
      string,
      { startTime?: string; endTime?: string; enabled?: boolean; isClosed?: boolean }
    >
    clinicStartTime?: string
    clinicEndTime?: string
    medicalCenterStartTime?: string
    medicalCenterEndTime?: string
    workingDays?: string[]
  }
  // reception settings: whether this doctor accepts unlimited bookings or limited per day
  receptionType?: "open" | "limited"
  receptionCapacity?: number | null
  createdAt?: Date
  updatedAt?: Date
}

const ProviderSchema = new Schema<IProvider>(
  {
    name: { type: String, required: true, trim: true },
    nameAr: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    title: { type: String, required: true },
    titleAr: { type: String, required: true },
    specialty: { type: String, required: true },
    specialtyAr: { type: String, required: true },
    subSpecialties: [{ type: String }],
    bio: { type: String },
    bioAr: { type: String },
    email: { type: String, lowercase: true },
    phone: { type: String },
    image: { type: String },
    gender: { type: String, enum: ["male", "female"], required: true },
    languages: [{ type: String }],
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number, required: true },
      },
    ],
    experience: { type: Number, required: true, min: 0 },
    consultationFee: { type: Number, required: true, min: 0 },
    followUpFee: { type: Number, min: 0 },
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    medicalCenterId: { type: Schema.Types.ObjectId, ref: "MedicalCenter" },
    workingAt: [
      {
        type: { type: String, enum: ["clinic", "medicalCenter"], required: true },
        id: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
      },
    ],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    totalPatients: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    availableForHomeVisit: { type: Boolean, default: false },
    homeVisitFee: { type: Number, min: 0 },
    availableForOnline: { type: Boolean, default: false },
    onlineConsultationFee: { type: Number, min: 0 },
    availability: {
      type: Schema.Types.Mixed,
      default: {},
    },
    // reception config: open (unlimited) or limited with a capacity per day
    receptionType: { type: String, enum: ["open", "limited"], default: "open" },
    receptionCapacity: { type: Number, default: null },
  },
  { timestamps: true },
)

ProviderSchema.index({ name: "text", nameAr: "text", specialty: "text", specialtyAr: "text" })
ProviderSchema.index({ slug: 1 })
ProviderSchema.index({ specialty: 1 })
ProviderSchema.index({ clinicId: 1 })
ProviderSchema.index({ medicalCenterId: 1 })
ProviderSchema.index({ isActive: 1 })
ProviderSchema.index({ isFeatured: 1 })
ProviderSchema.index({ rating: -1 })

const Provider: Model<IProvider> =
  (mongoose.models.Provider as Model<IProvider>) || mongoose.model<IProvider>("Provider", ProviderSchema)

export default Provider
