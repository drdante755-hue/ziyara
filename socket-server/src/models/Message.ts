/**
 * Message Model for MongoDB
 * Stores individual messages within tickets
 * Supports text content, attachments, and read status
 */

import mongoose, { Schema, type Document, type Model } from "mongoose"
import { type IMessage, SenderType, type IAttachment } from "../types"

// Document interface extending IMessage with Mongoose Document
export interface IMessageDocument extends Omit<IMessage, "_id">, Document {}

// Attachment sub-schema
const AttachmentSchema = new Schema<IAttachment>(
  {
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
)

// Message schema definition
const MessageSchema = new Schema<IMessageDocument>(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderType: {
      type: String,
      enum: Object.values(SenderType),
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only createdAt
    versionKey: false,
  },
)

// Compound indexes for optimized queries
MessageSchema.index({ ticketId: 1, createdAt: 1 })
MessageSchema.index({ ticketId: 1, isRead: 1 })
MessageSchema.index({ senderId: 1, createdAt: -1 })

// Static method to find messages by ticket
MessageSchema.statics.findByTicketId = function (ticketId: string, limit = 50, skip = 0) {
  return this.find({ ticketId }).sort({ createdAt: 1 }).skip(skip).limit(limit)
}

// Static method to get unread count for a ticket
MessageSchema.statics.getUnreadCount = function (ticketId: string, userId: string) {
  return this.countDocuments({
    ticketId,
    senderId: { $ne: userId },
    isRead: false,
  })
}

// Static method to mark messages as read
MessageSchema.statics.markAsRead = function (ticketId: string, userId: string) {
  return this.updateMany(
    {
      ticketId,
      senderId: { $ne: userId },
      isRead: false,
    },
    { isRead: true },
  )
}

// Post-save hook to update ticket's lastMessage
MessageSchema.post("save", async (doc) => {
  try {
    const Ticket = mongoose.model("Ticket")
    await Ticket.findByIdAndUpdate(doc.ticketId, {
      lastMessage: doc.content.substring(0, 100),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("[Message] Error updating ticket lastMessage:", error)
  }
})

const Message: Model<IMessageDocument> = mongoose.model<IMessageDocument>("Message", MessageSchema)

export default Message
