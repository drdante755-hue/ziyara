import mongoose, { type Document, type Model, Schema } from "mongoose"

// ========== Nurse Model ==========
export interface INurse extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  specialty: string
  experience: string
  phone: string
  available: boolean
  imageUrl?: string
  price?: number
  location?: string
  rating?: number
  reviews?: number
  createdAt?: Date
  updatedAt?: Date
}

const NurseSchema = new Schema<INurse>(
  {
    name: { type: String, required: true, trim: true },
    specialty: { type: String, required: true },
    experience: { type: String, default: "غير محدد" },
    phone: { type: String, required: true },
    available: { type: Boolean, default: true },
    imageUrl: { type: String },
    price: { type: Number, default: 150 },
    location: { type: String },
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
  },
  { timestamps: true },
)

NurseSchema.index({ name: "text", specialty: "text" })
NurseSchema.index({ available: 1 })

// ========== Test Model ==========
export interface ITest extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  price: number
  category: string
  duration: string
  description?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

const TestSchema = new Schema<ITest>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    duration: { type: String, default: "غير محدد" },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

TestSchema.index({ name: "text", category: "text" })
TestSchema.index({ isActive: 1 })

// ========== Nurse Request Model ==========
export interface INurseRequest extends Document {
  _id: mongoose.Types.ObjectId
  patientName: string
  phone: string
  whatsapp: string
  address: string
  service: string
  date: string
  time: string
  notes?: string
  nurse?: string
  status: "جاري" | "مكتمل" | "ملغى"
  trackingId?: mongoose.Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
}

const NurseRequestSchema = new Schema<INurseRequest>(
  {
    patientName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    whatsapp: { type: String },
    address: { type: String, required: true },
    service: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    notes: { type: String },
    nurse: { type: String },
    status: {
      type: String,
      enum: ["جاري", "مكتمل", "ملغى"],
      default: "جاري",
    },
    trackingId: { type: Schema.Types.ObjectId, ref: "Tracking" },
  },
  { timestamps: true },
)

NurseRequestSchema.index({ status: 1 })
NurseRequestSchema.index({ createdAt: -1 })
NurseRequestSchema.index({ trackingId: 1 })

// ========== Test Request Model ==========
export interface ITestRequest extends Document {
  _id: mongoose.Types.ObjectId
  patientName: string
  phone: string
  whatsapp: string
  address: string
  tests: string[]
  totalPrice: number
  date: string
  time: string
  notes?: string
  team?: string
  status: "جاري" | "مكتمل" | "ملغى"
  trackingId?: mongoose.Types.ObjectId
  resultsFileUrl?: string
  createdAt?: Date
  updatedAt?: Date
}

const TestRequestSchema = new Schema<ITestRequest>(
  {
    patientName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    whatsapp: { type: String },
    address: { type: String, required: true },
    tests: [{ type: String }],
    totalPrice: { type: Number, required: true, min: 0 },
    date: { type: String, required: true },
    time: { type: String, required: true },
    notes: { type: String },
    team: { type: String },
    status: {
      type: String,
      enum: ["جاري", "مكتمل", "ملغى"],
      default: "جاري",
    },
    trackingId: { type: Schema.Types.ObjectId, ref: "Tracking" },
    resultsFileUrl: { type: String },
  },
  { timestamps: true },
)

TestRequestSchema.index({ status: 1 })
TestRequestSchema.index({ createdAt: -1 })
TestRequestSchema.index({ trackingId: 1 })

// Export Models
export const Nurse: Model<INurse> =
  (mongoose.models.Nurse as Model<INurse>) || mongoose.model<INurse>("Nurse", NurseSchema)

export const Test: Model<ITest> = (mongoose.models.Test as Model<ITest>) || mongoose.model<ITest>("Test", TestSchema)

export const NurseRequest: Model<INurseRequest> =
  (mongoose.models.NurseRequest as Model<INurseRequest>) ||
  mongoose.model<INurseRequest>("NurseRequest", NurseRequestSchema)

export const TestRequest: Model<ITestRequest> =
  (mongoose.models.TestRequest as Model<ITestRequest>) || mongoose.model<ITestRequest>("TestRequest", TestRequestSchema)
