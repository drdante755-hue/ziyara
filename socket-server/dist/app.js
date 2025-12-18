"use strict";
/**
 * Main Application Entry Point
 * Initializes Express server with Socket.IO and MongoDB
 * Production-ready configuration with error handling
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = __importDefault(require("./config/db"));
const socket_1 = __importStar(require("./socket"));
const Ticket_1 = __importDefault(require("./models/Ticket"));
const Message_1 = __importDefault(require("./models/Message"));
// Load environment variables
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
// Initialize Express app
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
// Initialize Socket.IO with CORS
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: CORS_ORIGIN.split(","), // support multiple origins
        methods: ["GET", "POST"],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
});
exports.io = io;
// =====================
// Middleware
// =====================
app.use((0, cors_1.default)({ origin: CORS_ORIGIN.split(","), credentials: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging
app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.path}`);
    next();
});
// =====================
// REST API Endpoints
// =====================
// Health check
app.get("/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
        mongodb: mongoose_1.default.connection.readyState === 1 ? "connected" : "disconnected",
    });
});
// Get ticket by ID
app.get("/tickets/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid ticket ID" });
        }
        const ticket = await Ticket_1.default.findById(id);
        if (!ticket)
            return res.status(404).json({ success: false, error: "Ticket not found" });
        const activeUsers = (0, socket_1.getTicketActiveUsers)(id);
        res.json({
            success: true,
            data: { ...ticket.toObject(), activeUsers },
        });
    }
    catch (error) {
        console.error("[API] Error fetching ticket:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});
// Get messages with pagination
app.get("/tickets/:id/messages", async (req, res) => {
    try {
        const { id } = req.params;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, error: "Invalid ticket ID" });
        const ticket = await Ticket_1.default.findById(id);
        if (!ticket)
            return res.status(404).json({ success: false, error: "Ticket not found" });
        const [messages, total] = await Promise.all([
            Message_1.default.find({ ticketId: id }).sort({ createdAt: 1 }).skip(skip).limit(limit),
            Message_1.default.countDocuments({ ticketId: id }),
        ]);
        res.json({
            success: true,
            data: messages,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        console.error("[API] Error fetching messages:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});
// Create new ticket
app.post("/tickets", async (req, res) => {
    try {
        const { userId, subject, category, priority, description, userName } = req.body;
        if (!userId || !subject) {
            return res.status(400).json({ success: false, error: "userId and subject are required" });
        }
        const ticket = new Ticket_1.default({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            subject,
            category: category || "general",
            priority: priority || "medium",
        });
        await ticket.save();
        // Create initial message if description provided
        if (description) {
            const message = new Message_1.default({
                ticketId: ticket._id,
                senderId: new mongoose_1.default.Types.ObjectId(userId),
                senderType: "user",
                senderName: userName || "User",
                content: description,
            });
            await message.save();
        }
        res.status(201).json({ success: true, data: ticket, message: "Ticket created successfully" });
    }
    catch (error) {
        console.error("[API] Error creating ticket:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: "Endpoint not found" });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error("[Error]", err);
    res.status(500).json({ success: false, error: "Internal server error" });
});
// =====================
// Start Server
// =====================
const startServer = async () => {
    try {
        await (0, db_1.default)();
        (0, socket_1.default)(io);
        httpServer.listen(PORT, () => {
            console.log("=".repeat(50));
            console.log(`[Server] Ticket Socket Server Started`);
            console.log(`[Server] HTTP: http://localhost:${PORT}`);
            console.log(`[Server] WebSocket: ws://localhost:${PORT}`);
            console.log(`[Server] CORS Origin: ${CORS_ORIGIN}`);
            console.log("=".repeat(50));
        });
    }
    catch (error) {
        console.error("[Server] Failed to start:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=app.js.map