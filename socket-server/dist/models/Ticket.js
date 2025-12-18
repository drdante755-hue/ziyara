"use strict";
/**
 * Ticket Model for MongoDB
 * Stores ticket information including status, assignment, and metadata
 * Optimized with indexes for fast querying
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
// Schema definition with validation and defaults
const TicketSchema = new mongoose_1.Schema({
    ticketNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    agentId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        enum: Object.values(types_1.TicketStatus),
        default: types_1.TicketStatus.OPEN,
        index: true,
    },
    priority: {
        type: String,
        enum: Object.values(types_1.TicketPriority),
        default: types_1.TicketPriority.MEDIUM,
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
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    versionKey: false,
});
// Compound indexes for optimized queries
TicketSchema.index({ userId: 1, status: 1 });
TicketSchema.index({ agentId: 1, status: 1 });
TicketSchema.index({ status: 1, priority: 1, createdAt: -1 });
TicketSchema.index({ createdAt: -1 });
TicketSchema.index({ updatedAt: -1 });
// Pre-save hook to generate ticket number
TicketSchema.pre("save", async function (next) {
    if (this.isNew && !this.ticketNumber) {
        const count = await mongoose_1.default.model("Ticket").countDocuments();
        this.ticketNumber = `TKT-${String(count + 1).padStart(6, "0")}`;
    }
    next();
});
// Static method to find tickets by user
TicketSchema.statics.findByUserId = function (userId) {
    return this.find({ userId }).sort({ updatedAt: -1 });
};
// Static method to find tickets by agent
TicketSchema.statics.findByAgentId = function (agentId) {
    return this.find({ agentId }).sort({ updatedAt: -1 });
};
// Static method to find open tickets
TicketSchema.statics.findOpenTickets = function () {
    return this.find({ status: types_1.TicketStatus.OPEN }).sort({ priority: -1, createdAt: 1 });
};
// Instance method to update status
TicketSchema.methods.updateStatus = async function (status) {
    this.status = status;
    return this.save();
};
// Instance method to assign agent
TicketSchema.methods.assignAgent = async function (agentId) {
    this.agentId = agentId;
    if (this.status === types_1.TicketStatus.OPEN) {
        this.status = types_1.TicketStatus.PENDING;
    }
    return this.save();
};
const Ticket = mongoose_1.default.model("Ticket", TicketSchema);
exports.default = Ticket;
//# sourceMappingURL=Ticket.js.map