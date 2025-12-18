import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface IHomeAnalysisRequest extends Document {
  _id: mongoose.Types.ObjectId
  userId?: string
  patientName: string
  phone: string
  whatsapp?: string
  address: string
  selectedTests: string[] // Array of test IDs/names selected by user
  totalPrice: number
  preferredDate: string
  preferredTime: string
  notes?: string
  status: "pending" | "approved" | "completed" | "cancelled"
  assignedTeam?: string
  analysisReportUrl?: string // URL to uploaded analysis report
  createdAt?: Date
  updatedAt?: Date
}

const HomeAnalysisRequestSchema = new Schema<IHomeAnalysisRequest>(
  {
    userId: { type: String },
    patientName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    whatsapp: { type: String },
    address: { type: String, required: true },
    selectedTests: [{ type: String }],
    totalPrice: { type: Number, required: true, min: 0 },
    preferredDate: { type: String, required: true },
    preferredTime: { type: String, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "completed", "cancelled"],
      default: "pending",
    },
    assignedTeam: { type: String },
    analysisReportUrl: { type: String },
  },
  { timestamps: true },
)

HomeAnalysisRequestSchema.index({ status: 1 })
HomeAnalysisRequestSchema.index({ createdAt: -1 })
HomeAnalysisRequestSchema.index({ phone: 1 })
HomeAnalysisRequestSchema.index({ patientName: "text", address: "text" })

export const HomeAnalysisRequest: Model<IHomeAnalysisRequest> =
  (mongoose.models.HomeAnalysisRequest as Model<IHomeAnalysisRequest>) ||
  mongoose.model<IHomeAnalysisRequest>("HomeAnalysisRequest", HomeAnalysisRequestSchema)
