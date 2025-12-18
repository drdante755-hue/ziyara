import mongoose, { type Document, type Model, Schema } from "mongoose"

// ========== Availability Slot Model ==========
export interface IAvailabilitySlot extends Document {
  _id: mongoose.Types.ObjectId
  providerId: mongoose.Types.ObjectId
  clinicId?: mongoose.Types.ObjectId
  hospitalId?: mongoose.Types.ObjectId
  date: Date
  startTime: string // "09:00"
  endTime: string // "09:30"
  duration: number // in minutes (e.g., 30)
  type: "clinic" | "hospital" | "online" | "home"
  status: "available" | "booked" | "blocked" | "completed"
  price: number
  bookingId?: mongoose.Types.ObjectId
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

const AvailabilitySlotSchema = new Schema<IAvailabilitySlot>(
  {
    providerId: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    hospitalId: { type: Schema.Types.ObjectId, ref: "Hospital" },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    duration: { type: Number, required: true, default: 30 },
    type: {
      type: String,
      enum: ["clinic", "hospital", "online", "home"],
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "booked", "blocked", "completed"],
      default: "available",
    },
    price: { type: Number, required: true, min: 0 },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    notes: { type: String },
  },
  { timestamps: true },
)

AvailabilitySlotSchema.index({ providerId: 1, date: 1 })
AvailabilitySlotSchema.index({ clinicId: 1, date: 1 })
AvailabilitySlotSchema.index({ hospitalId: 1, date: 1 })
AvailabilitySlotSchema.index({ status: 1 })
AvailabilitySlotSchema.index({ date: 1, startTime: 1 })

const AvailabilitySlot: Model<IAvailabilitySlot> =
  (mongoose.models.AvailabilitySlot as Model<IAvailabilitySlot>) ||
  mongoose.model<IAvailabilitySlot>("AvailabilitySlot", AvailabilitySlotSchema)

export default AvailabilitySlot
