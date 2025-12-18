import mongoose, { type Document, type Model, Schema } from "mongoose"

// ================= Ticket Message Interface =================
export interface ITicketMessage {
  _id: mongoose.Types.ObjectId
  content: string
  sender: "customer" | "agent" | "system"
  senderId?: mongoose.Types.ObjectId
  senderName: string
  type: "text" | "system" | "attachment"
  attachments?: {
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
  }[]
  createdAt: Date
}

// ================= Ticket Activity Log Interface =================
export interface ITicketActivity {
  _id: mongoose.Types.ObjectId
  action: "created" | "status_change" | "priority_change" | "assigned" | "unassigned" | "message" | "note_added"
  actorId?: mongoose.Types.ObjectId
  actorName: string
  actorType: "customer" | "agent" | "system"
  metadata: Record<string, unknown>
  createdAt: Date
}

// ================= Ticket Interface =================
export interface ITicket extends Document {
  _id: mongoose.Types.ObjectId
  ticketNumber: string
  title: string
  category: string

  // Customer info
  userId: mongoose.Types.ObjectId
  customerName: string
  customerEmail: string
  customerAvatar?: string

  // Status and priority
  status: "open" | "pending" | "resolved" | "closed" | "auto_created"
  priority: "low" | "medium" | "high" | "urgent"

  // Assignment
  assigneeId?: mongoose.Types.ObjectId
  assigneeName?: string
  assigneeAvatar?: string

  // Tags
  tags: string[]

  // Messages
  messages: ITicketMessage[]
  lastMessage: string
  unreadCount: number
  unreadByCustomer: number

  // Activity logs
  activityLogs: ITicketActivity[]

  // SLA
  slaDeadline?: Date

  openedAt?: Date

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

// ================= Message Schema =================
const TicketMessageSchema = new Schema<ITicketMessage>(
  {
    content: { type: String, required: true },
    sender: {
      type: String,
      enum: ["customer", "agent", "system"],
      required: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: "User" },
    senderName: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "system", "attachment"],
      default: "text",
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        fileSize: Number,
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

// ================= Activity Schema =================
const TicketActivitySchema = new Schema<ITicketActivity>(
  {
    action: {
      type: String,
      enum: ["created", "status_change", "priority_change", "assigned", "unassigned", "message", "note_added"],
      required: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    actorName: { type: String, required: true },
    actorType: {
      type: String,
      enum: ["customer", "agent", "system"],
      required: true,
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

// ================= Ticket Schema =================
const TicketSchema = new Schema<ITicket>(
  {
    ticketNumber: { type: String, unique: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },

    // Customer info
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true },
    customerAvatar: { type: String },

    // Status and priority
    status: {
      type: String,
      enum: ["open", "pending", "resolved", "closed", "auto_created"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Assignment
    assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
    assigneeName: { type: String },
    assigneeAvatar: { type: String },

    // Tags
    tags: [{ type: String }],

    // Messages
    messages: [TicketMessageSchema],
    lastMessage: { type: String, default: "" },
    unreadCount: { type: Number, default: 0 }, // Unread by agents
    unreadByCustomer: { type: Number, default: 0 }, // Unread by customer

    // Activity logs
    activityLogs: [TicketActivitySchema],

    // SLA
    slaDeadline: { type: Date },

    openedAt: { type: Date },
  },
  { timestamps: true },
)

// ================= Indexes =================
TicketSchema.index({ ticketNumber: 1 })
TicketSchema.index({ userId: 1 })
TicketSchema.index({ status: 1 })
TicketSchema.index({ priority: 1 })
TicketSchema.index({ assigneeId: 1 })
TicketSchema.index({ category: 1 })
TicketSchema.index({ createdAt: -1 })
TicketSchema.index({ updatedAt: -1 })

// ================= Pre-save Hook =================
TicketSchema.pre<ITicket>("save", function () {
  if (!this.ticketNumber) {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    this.ticketNumber = `TKT${year}${month}${random}`
  }
})

// ================= Model =================
const Ticket: Model<ITicket> =
  (mongoose.models.Ticket as Model<ITicket>) || mongoose.model<ITicket>("Ticket", TicketSchema)

export default Ticket
