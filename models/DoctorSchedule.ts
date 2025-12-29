import mongoose, { type Document, type Model, Schema } from "mongoose"

// ================= Doctor Schedule Interface =================

export interface IDoctorSchedule extends Document {
  doctorId: mongoose.Types.ObjectId
  workingDays: ("sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday")[]
  timeSlots: string[] // ["10:00", "10:30", "11:00", ...]
  vacationDates: string[] // ISO date strings ["2025-01-15", ...]
  maxPatientsPerSlot: number
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

// ================= Schema =================

const DoctorScheduleSchema = new Schema<IDoctorSchedule>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      unique: true,
    },

    workingDays: {
      type: [
        {
          type: String,
          enum: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        },
      ],
      default: ["sunday", "monday", "tuesday", "wednesday", "thursday"],
    },

    timeSlots: {
      type: [{ type: String }],
      required: true,
      default: [
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
      ],
    },

    vacationDates: {
      type: [{ type: String }],
      default: [],
    },

    maxPatientsPerSlot: {
      type: Number,
      default: 1,
      min: 1,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

// ================= Indexes =================

DoctorScheduleSchema.index({ doctorId: 1 })

// ================= Model =================

const DoctorSchedule: Model<IDoctorSchedule> =
  mongoose.models.DoctorSchedule || mongoose.model<IDoctorSchedule>("DoctorSchedule", DoctorScheduleSchema)

export default DoctorSchedule
