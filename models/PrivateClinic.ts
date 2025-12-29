import mongoose, { type Document, type Model, Schema } from "mongoose"

// ================= Private Clinic Interface =================

export interface IPrivateClinic extends Document {
  doctorId: mongoose.Types.ObjectId
  clinicName: string
  clinicNameAr: string
  location: {
    city: string
    cityAr: string
    address: string
    addressAr: string
    lat?: number
    lng?: number
  }
  price: number
  appointmentDuration: number // minutes
  paymentMethods: ("cash" | "online")[]
  facilities: string[]
  images: string[]
  phone?: string
  email?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

// ================= Schema =================

const PrivateClinicSchema = new Schema<IPrivateClinic>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      unique: true,
    },

    clinicName: { type: String, required: true, trim: true },
    clinicNameAr: { type: String, required: true, trim: true },

    location: {
      city: { type: String, required: true },
      cityAr: { type: String, required: true },
      address: { type: String, required: true },
      addressAr: { type: String, required: true },
      lat: { type: Number },
      lng: { type: Number },
    },

    price: { type: Number, required: true, min: 0 },
    appointmentDuration: { type: Number, required: true, default: 30 }, // 30 minutes

    paymentMethods: {
      type: [{ type: String, enum: ["cash", "online"] }],
      default: ["cash"],
    },

    facilities: [{ type: String }],
    images: [{ type: String }],

    phone: { type: String },
    email: { type: String, lowercase: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

// ================= Indexes =================

PrivateClinicSchema.index({ doctorId: 1 })
PrivateClinicSchema.index({ "location.city": 1 })
PrivateClinicSchema.index({ isActive: 1 })

// ================= Model =================

const PrivateClinic: Model<IPrivateClinic> =
  mongoose.models.PrivateClinic || mongoose.model<IPrivateClinic>("PrivateClinic", PrivateClinicSchema)

export default PrivateClinic
