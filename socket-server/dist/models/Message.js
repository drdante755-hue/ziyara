"use strict";
/**
 * Message Model for MongoDB
 * Stores individual messages within tickets
 * Supports text content, attachments, and read status
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const types_1 = require("../types");
// Attachment sub-schema
const AttachmentSchema = new mongoose_1.Schema({
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
}, { _id: false });
// Message schema definition
const MessageSchema = new mongoose_1.Schema({
    ticketId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Ticket",
        required: true,
        index: true,
    },
    senderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    senderType: {
        type: String,
        enum: Object.values(types_1.SenderType),
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
}, {
    timestamps: { createdAt: true, updatedAt: false }, // Only createdAt
    versionKey: false,
});
// Compound indexes for optimized queries
MessageSchema.index({ ticketId: 1, createdAt: 1 });
MessageSchema.index({ ticketId: 1, isRead: 1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });
// Static method to find messages by ticket
MessageSchema.statics.findByTicketId = function (ticketId, limit = 50, skip = 0) {
    return this.find({ ticketId }).sort({ createdAt: 1 }).skip(skip).limit(limit);
};
// Static method to get unread count for a ticket
MessageSchema.statics.getUnreadCount = function (ticketId, userId) {
    return this.countDocuments({
        ticketId,
        senderId: { $ne: userId },
        isRead: false,
    });
};
// Static method to mark messages as read
MessageSchema.statics.markAsRead = function (ticketId, userId) {
    return this.updateMany({
        ticketId,
        senderId: { $ne: userId },
        isRead: false,
    }, { isRead: true });
};
// Post-save hook to update ticket's lastMessage
MessageSchema.post("save", async (doc) => {
    try {
        const Ticket = mongoose_1.default.model("Ticket");
        await Ticket.findByIdAndUpdate(doc.ticketId, {
            lastMessage: doc.content.substring(0, 100),
            updatedAt: new Date(),
        });
    }
    catch (error) {
        console.error("[Message] Error updating ticket lastMessage:", error);
    }
});
const Message = mongoose_1.default.model("Message", MessageSchema);
exports.default = Message;
//# sourceMappingURL=Message.js.map