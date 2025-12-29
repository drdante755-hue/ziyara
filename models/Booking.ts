import mongoose, { type Document, type Model, Schema } from "mongoose"

// ================= Booking Interface =================

export interface IBooking extends Document {
  bookingNumber: string
  userId: mongoose.Types.ObjectId
  providerId: mongoose.Types.ObjectId
  slotId: mongoose.Types.ObjectId
  clinicId?: mongoose.Types.ObjectId
  medicalCenterId?: mongoose.Types.ObjectId

  patientName: string
  patientPhone: string
  patientEmail?: string
  patientAge?: number
  patientGender?: "male" | "female"

  date: Date
  startTime: string
  endTime: string

  type: "clinic" | "medical-center" | "online" | "home"
  address?: string
  symptoms?: string
  notes?: string

  price: number
  discountCode?: string
  discountAmount: number
  totalPrice: number

  paymentMethod: "wallet" | "cash" | "card"
  paymentStatus: "pending" | "paid" | "refunded" | "failed"

  status: "pending" | "confirmed" | "completed" | "cancelled" | "no-show"

  cancelReason?: string
  cancelledBy?: "user" | "provider" | "admin"
  cancelledAt?: Date

  completedAt?: Date

  rating?: number
  review?: string
  reviewedAt?: Date

  reminderSent: boolean
  createdAt?: Date
  updatedAt?: Date
}

// ================= Schema =================

const BookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, unique: true },

    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
    slotId: { type: Schema.Types.ObjectId, ref: "AvailabilitySlot", required: true },

    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    medicalCenterId: { type: Schema.Types.ObjectId, ref: "MedicalCenter" },

    patientName: { type: String, required: true, trim: true },
    patientPhone: { type: String, required: true },
    patientEmail: { type: String, lowercase: true },

    patientAge: Number,
    patientGender: { type: String, enum: ["male", "female"] },

    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },

    type: {
      type: String,
      enum: ["clinic", "medical-center", "online", "home"],
      required: true,
    },

    address: String,
    symptoms: String,
    notes: String,

    price: { type: Number, required: true, min: 0 },
    discountCode: String,
    discountAmount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 },

    paymentMethod: {
      type: String,
      enum: ["wallet", "cash", "card"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "no-show"],
      default: "pending",
    },

    cancelReason: String,
    cancelledBy: { type: String, enum: ["user", "provider", "admin"] },
    cancelledAt: Date,

    completedAt: Date,

    rating: { type: Number, min: 1, max: 5 },
    review: String,
    reviewedAt: Date,

    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true },
)

// ================= Indexes =================

BookingSchema.index({ bookingNumber: 1 })
BookingSchema.index({ userId: 1 })
BookingSchema.index({ providerId: 1 })
BookingSchema.index({ slotId: 1 })
BookingSchema.index({ clinicId: 1 })
BookingSchema.index({ medicalCenterId: 1 })
BookingSchema.index({ status: 1 })
BookingSchema.index({ paymentStatus: 1 })
BookingSchema.index({ date: 1 })
BookingSchema.index({ createdAt: -1 })

// ================= Pre-save Hook =================

BookingSchema.pre<IBooking>("save", function () {
  if (!this.bookingNumber) {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")

    this.bookingNumber = `BK${year}${month}${random}`
  }
})

// ================= Model =================

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema)

export default Booking
