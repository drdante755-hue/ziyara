/**
 * Ticket Model for MongoDB
 * Stores ticket information including status, assignment, and metadata
 * Optimized with indexes for fast querying
 */

import mongoose, { Schema, type Document, type Model } from "mongoose"
import { type ITicket, TicketStatus, TicketPriority } from "../types"

// Document interface extending ITicket with Mongoose Document
export interface ITicketDocument extends Omit<ITicket, "_id">, Document {}

// Schema definition with validation and defaults
const TicketSchema = new Schema<ITicketDocument>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["general", "technical", "billing", "account", "booking", "other"],
      default: "general",
    },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.OPEN,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TicketPriority),
      default: TicketPriority.MEDIUM,
      index: true,
    },
    lastMessage: {
      type: String,
      default: null,
    },
    unreadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    versionKey: false,
  },
)

// Compound indexes for optimized queries
TicketSchema.index({ userId: 1, status: 1 })
TicketSchema.index({ agentId: 1, status: 1 })
TicketSchema.index({ status: 1, priority: 1, createdAt: -1 })
TicketSchema.index({ createdAt: -1 })
TicketSchema.index({ updatedAt: -1 })

// Pre-save hook to generate ticket number
TicketSchema.pre("save", async function (next) {
  if (this.isNew && !this.ticketNumber) {
    const count = await mongoose.model("Ticket").countDocuments()
    this.ticketNumber = `TKT-${String(count + 1).padStart(6, "0")}`
  }
  next()
})

// Static method to find tickets by user
TicketSchema.statics.findByUserId = function (userId: string) {
  return this.find({ userId }).sort({ updatedAt: -1 })
}

// Static method to find tickets by agent
TicketSchema.statics.findByAgentId = function (agentId: string) {
  return this.find({ agentId }).sort({ updatedAt: -1 })
}

// Static method to find open tickets
TicketSchema.statics.findOpenTickets = function () {
  return this.find({ status: TicketStatus.OPEN }).sort({ priority: -1, createdAt: 1 })
}

// Instance method to update status
TicketSchema.methods.updateStatus = async function (status: TicketStatus) {
  this.status = status
  return this.save()
}

// Instance method to assign agent
TicketSchema.methods.assignAgent = async function (agentId: string) {
  this.agentId = agentId
  if (this.status === TicketStatus.OPEN) {
    this.status = TicketStatus.PENDING
  }
  return this.save()
}

const Ticket: Model<ITicketDocument> = mongoose.model<ITicketDocument>("Ticket", TicketSchema)

export default Ticket
