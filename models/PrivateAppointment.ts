import mongoose, { type Document, type Model, Schema } from "mongoose"

// ================= Private Appointment Interface =================

export interface IPrivateAppointment extends Document {
  appointmentNumber: string
  doctorId: mongoose.Types.ObjectId
  clinicId: mongoose.Types.ObjectId
  userId?: mongoose.Types.ObjectId
  date: string // ISO date string "2025-01-15"
  time: string // "10:00"
  patient: {
    name: string
    nameAr: string
    phone: string
    email?: string
    age?: number
    gender?: "male" | "female"
  }
  symptoms?: string
  notes?: string
  paymentMethod: "cash" | "online"
  paymentStatus: "pending" | "paid" | "refunded"
  amount: number
  status: "confirmed" | "cancelled" | "completed" | "no_show"
  cancelReason?: string
  cancelledBy?: "patient" | "doctor" | "admin"
  cancelledAt?: Date
  completedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

// ================= Schema =================

const PrivateAppointmentSchema = new Schema<IPrivateAppointment>(
  {
    appointmentNumber: { type: String, unique: true },

    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    clinicId: {
      type: Schema.Types.ObjectId,
      ref: "PrivateClinic",
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    date: { type: String, required: true }, // "2025-01-15"
    time: { type: String, required: true }, // "10:00"

    patient: {
      name: { type: String, required: true },
      nameAr: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, lowercase: true },
      age: { type: Number },
      gender: { type: String, enum: ["male", "female"] },
    },

    symptoms: { type: String },
    notes: { type: String },

    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      required: true,
      default: "cash",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },

    amount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed", "no_show"],
      default: "confirmed",
    },

    cancelReason: { type: String },
    cancelledBy: { type: String, enum: ["patient", "doctor", "admin"] },
    cancelledAt: { type: Date },

    completedAt: { type: Date },
  },
  { timestamps: true },
)

// ================= Indexes =================

PrivateAppointmentSchema.index({ appointmentNumber: 1 })
PrivateAppointmentSchema.index({ doctorId: 1, date: 1, time: 1 })
PrivateAppointmentSchema.index({ userId: 1 })
PrivateAppointmentSchema.index({ status: 1 })
PrivateAppointmentSchema.index({ date: 1 })

// ================= Pre-save Hook =================

PrivateAppointmentSchema.pre<IPrivateAppointment>("save", function (next) {
  if (!this.appointmentNumber) {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")

    this.appointmentNumber = `PA${year}${month}${random}`
  }
  next()
})

// ================= Model =================

const PrivateAppointment: Model<IPrivateAppointment> =
  mongoose.models.PrivateAppointment ||
  mongoose.model<IPrivateAppointment>("PrivateAppointment", PrivateAppointmentSchema)

export default PrivateAppointment
