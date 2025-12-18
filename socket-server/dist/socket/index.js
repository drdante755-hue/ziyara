"use strict";
/**
 * Socket.IO Event Handlers
 * Manages real-time communication for the ticket system
 * Handles message delivery, typing indicators, and presence
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserInTicket = exports.getTicketActiveUsers = exports.initializeSocket = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Ticket_1 = __importDefault(require("../models/Ticket"));
const Message_1 = __importDefault(require("../models/Message"));
const types_1 = require("../types");
// Track active users in each ticket room
const ticketRooms = new Map();
// Track which tickets each socket is in
const socketTickets = new Map();
/**
 * Get room name for a ticket
 */
const getTicketRoom = (ticketId) => `ticket_${ticketId}`;
/**
 * Validate and convert string to ObjectId
 */
const toObjectId = (value, fieldName) => {
    if (!value || typeof value !== "string") {
        throw new Error(`Invalid ${fieldName}: must be a non-empty string`);
    }
    if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
        throw new Error(`Invalid ${fieldName}: must be a valid MongoDB ObjectId`);
    }
    return new mongoose_1.default.Types.ObjectId(value);
};
/**
 * Initialize Socket.IO event handlers
 */
const initializeSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);
        // Initialize socket's ticket set
        socketTickets.set(socket.id, new Set());
        /**
         * Handle joining a ticket room
         */
        socket.on("join_ticket", async (payload) => {
            try {
                const { ticketId, userId, userType, userName } = payload;
                // Validate required fields
                if (!ticketId || !userId) {
                    socket.emit("error", { message: "Missing required fields", code: "INVALID_PAYLOAD" });
                    return;
                }
                // Validate ObjectId format
                if (!mongoose_1.default.Types.ObjectId.isValid(ticketId)) {
                    socket.emit("error", { message: "Invalid ticket ID format", code: "INVALID_TICKET_ID" });
                    return;
                }
                const roomName = getTicketRoom(ticketId);
                // Validate ticket exists
                const ticket = await Ticket_1.default.findById(ticketId);
                if (!ticket) {
                    socket.emit("error", { message: "Ticket not found", code: "TICKET_NOT_FOUND" });
                    return;
                }
                // Join the room
                socket.join(roomName);
                // Track user in room
                if (!ticketRooms.has(ticketId)) {
                    ticketRooms.set(ticketId, new Map());
                }
                const roomUsers = ticketRooms.get(ticketId);
                const existingUser = roomUsers.get(userId);
                // Check if user is already in this room with same socket
                if (existingUser && existingUser.socketId === socket.id) {
                    console.log(`[Socket] User ${userName} already in ticket ${ticketId} with same socket`);
                    return;
                }
                // Update or add user
                roomUsers.set(userId, {
                    socketId: socket.id,
                    userId,
                    userName,
                    userType,
                    joinedAt: new Date(),
                });
                // Track ticket for this socket
                socketTickets.get(socket.id)?.add(ticketId);
                // Only notify if this is a new join (not reconnection with same socket)
                if (!existingUser || existingUser.socketId !== socket.id) {
                    socket.to(roomName).emit("user_joined", {
                        ticketId,
                        userId,
                        userName,
                        userType,
                        timestamp: new Date(),
                    });
                }
                console.log(`[Socket] User ${userName} joined ticket ${ticketId}`);
            }
            catch (error) {
                console.error("[Socket] Error joining ticket:", error);
                socket.emit("error", { message: "Failed to join ticket", code: "JOIN_ERROR" });
            }
        });
        /**
         * Handle leaving a ticket room
         */
        socket.on("leave_ticket", (payload) => {
            const { ticketId, userId } = payload;
            handleLeaveTicket(socket, ticketId, userId);
        });
        /**
         * Handle sending a message
         */
        socket.on("send_message", async (payload) => {
            try {
                const { ticketId, senderId, senderType, senderName, content, attachments } = payload;
                // Validate required fields
                if (!ticketId || !senderId || !content) {
                    socket.emit("error", { message: "Missing required fields", code: "INVALID_PAYLOAD" });
                    return;
                }
                // Validate and convert to ObjectId
                const ticketObjectId = toObjectId(ticketId, "ticketId");
                const senderObjectId = toObjectId(senderId, "senderId");
                const roomName = getTicketRoom(ticketId);
                // Validate ticket exists
                const ticket = await Ticket_1.default.findById(ticketObjectId);
                if (!ticket) {
                    socket.emit("error", { message: "Ticket not found", code: "TICKET_NOT_FOUND" });
                    return;
                }
                // Check if ticket is closed - if so, reject the message
                // Note: ticket.status from MongoDB can be "open" | "pending" | "closed" | "resolved"
                const ticketStatus = ticket.status;
                if (ticketStatus === types_1.TicketStatus.CLOSED || ticketStatus === "resolved") {
                    socket.emit("error", {
                        message: "لا يمكن إرسال رسالة إلى تذكرة مغلقة. التذكرة تم حذفها نهائياً.",
                        code: "TICKET_CLOSED"
                    });
                    return;
                }
                // Create and save message
                const message = new Message_1.default({
                    ticketId: ticketObjectId,
                    senderId: senderObjectId,
                    senderType,
                    senderName,
                    content,
                    attachments: attachments || [],
                    isRead: false,
                });
                await message.save();
                // Update ticket's last message and unread count
                await Ticket_1.default.findByIdAndUpdate(ticketObjectId, {
                    lastMessage: content.substring(0, 100),
                    $inc: { unreadCount: 1 },
                    updatedAt: new Date(),
                });
                // Emit message to all users in the room
                io.to(roomName).emit("message_received", {
                    message: message.toObject(),
                    ticketId,
                });
                console.log(`[Socket] Message sent in ticket ${ticketId} by ${senderName}`);
            }
            catch (error) {
                console.error("[Socket] Error sending message:", error);
                socket.emit("error", { message: "Failed to send message", code: "MESSAGE_ERROR" });
            }
        });
        /**
         * Handle typing indicator
         */
        socket.on("typing", (payload) => {
            const { ticketId, senderId, senderName, isTyping } = payload;
            const roomName = getTicketRoom(ticketId);
            // Broadcast typing status to other users in the room
            socket.to(roomName).emit("typing_indicator", {
                ticketId,
                senderId,
                senderName,
                isTyping,
            });
        });
        /**
         * Handle ticket status change
         */
        socket.on("ticket_status_change", async (payload) => {
            try {
                const { ticketId, status, changedBy, changedByName } = payload;
                // Validate required fields
                if (!ticketId || !status || !changedBy) {
                    socket.emit("error", { message: "Missing required fields", code: "INVALID_PAYLOAD" });
                    return;
                }
                // Validate and convert to ObjectId
                const ticketObjectId = toObjectId(ticketId, "ticketId");
                const changedByObjectId = toObjectId(changedBy, "changedBy");
                const roomName = getTicketRoom(ticketId);
                // If closing ticket, emit deleted event and clean up
                if (status === types_1.TicketStatus.CLOSED || status === "closed") {
                    // Emit ticket deleted event to all users in the room
                    io.to(roomName).emit("ticket_deleted", {
                        ticketId,
                        deletedBy: changedBy,
                        deletedByName: changedByName || "مستخدم",
                        timestamp: new Date(),
                    });
                    // Clean up room tracking
                    ticketRooms.delete(ticketId);
                    // Remove ticket from all socket tracking
                    socketTickets.forEach((tickets) => {
                        tickets.delete(ticketId);
                    });
                    console.log(`[Socket] Ticket ${ticketId} deleted by ${changedByName}`);
                    return;
                }
                // Update ticket status in database
                const ticket = await Ticket_1.default.findByIdAndUpdate(ticketObjectId, { status, updatedAt: new Date() }, { new: true });
                if (!ticket) {
                    socket.emit("error", { message: "Ticket not found", code: "TICKET_NOT_FOUND" });
                    return;
                }
                // Create system message for status change
                const systemMessage = new Message_1.default({
                    ticketId: ticketObjectId,
                    senderId: changedByObjectId,
                    senderType: types_1.SenderType.SYSTEM,
                    senderName: "System",
                    content: `تم تغيير حالة التذكرة إلى "${getStatusLabel(status)}" بواسطة ${changedByName || "مستخدم"}`,
                    isRead: false,
                });
                await systemMessage.save();
                // Emit status update to room
                io.to(roomName).emit("ticket_updated", {
                    ticketId,
                    status,
                    changedBy,
                    changedByName,
                    timestamp: new Date(),
                });
                // Also emit the system message
                io.to(roomName).emit("message_received", {
                    message: systemMessage.toObject(),
                    ticketId,
                });
                console.log(`[Socket] Ticket ${ticketId} status changed to ${status}`);
            }
            catch (error) {
                console.error("[Socket] Error changing ticket status:", error);
                socket.emit("error", { message: "Failed to update ticket status", code: "STATUS_ERROR" });
            }
        });
        /**
         * Handle agent assignment
         */
        socket.on("assign_agent", async (payload) => {
            try {
                const { ticketId, agentId, agentName, assignedBy } = payload;
                // Validate required fields
                if (!ticketId || !agentId || !assignedBy) {
                    socket.emit("error", { message: "Missing required fields", code: "INVALID_PAYLOAD" });
                    return;
                }
                // Validate and convert to ObjectId
                const ticketObjectId = toObjectId(ticketId, "ticketId");
                const agentObjectId = toObjectId(agentId, "agentId");
                const assignedByObjectId = toObjectId(assignedBy, "assignedBy");
                const roomName = getTicketRoom(ticketId);
                // Update ticket with agent assignment
                const ticket = await Ticket_1.default.findByIdAndUpdate(ticketObjectId, {
                    agentId: agentObjectId,
                    status: types_1.TicketStatus.PENDING,
                    updatedAt: new Date(),
                }, { new: true });
                if (!ticket) {
                    socket.emit("error", { message: "Ticket not found", code: "TICKET_NOT_FOUND" });
                    return;
                }
                // Create system message
                const systemMessage = new Message_1.default({
                    ticketId: ticketObjectId,
                    senderId: assignedByObjectId,
                    senderType: types_1.SenderType.SYSTEM,
                    senderName: "System",
                    content: `تم تعيين الوكيل ${agentName || "وكيل"} لهذه التذكرة`,
                    isRead: false,
                });
                await systemMessage.save();
                // Emit agent assigned event
                io.to(roomName).emit("agent_assigned", {
                    ticketId,
                    agentId,
                    agentName,
                    timestamp: new Date(),
                });
                // Emit system message
                io.to(roomName).emit("message_received", {
                    message: systemMessage.toObject(),
                    ticketId,
                });
                console.log(`[Socket] Agent ${agentName} assigned to ticket ${ticketId}`);
            }
            catch (error) {
                console.error("[Socket] Error assigning agent:", error);
                socket.emit("error", { message: "Failed to assign agent", code: "ASSIGN_ERROR" });
            }
        });
        /**
         * Handle marking messages as read
         */
        socket.on("mark_as_read", async (payload) => {
            try {
                const { ticketId, userId } = payload;
                // Validate required fields
                if (!ticketId || !userId) {
                    socket.emit("error", { message: "Missing required fields", code: "INVALID_PAYLOAD" });
                    return;
                }
                // Validate and convert to ObjectId
                const ticketObjectId = toObjectId(ticketId, "ticketId");
                const userObjectId = toObjectId(userId, "userId");
                const roomName = getTicketRoom(ticketId);
                // Mark all messages as read (except user's own messages)
                await Message_1.default.updateMany({
                    ticketId: ticketObjectId,
                    senderId: { $ne: userObjectId },
                    isRead: false,
                }, { isRead: true });
                // Reset unread count on ticket
                await Ticket_1.default.findByIdAndUpdate(ticketObjectId, { unreadCount: 0 });
                // Notify room that messages were read
                socket.to(roomName).emit("messages_read", { ticketId, userId });
            }
            catch (error) {
                console.error("[Socket] Error marking as read:", error);
            }
        });
        /**
         * Handle disconnection
         */
        socket.on("disconnect", () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
            // Leave all tickets this socket was in
            const tickets = socketTickets.get(socket.id);
            if (tickets) {
                tickets.forEach((ticketId) => {
                    const roomUsers = ticketRooms.get(ticketId);
                    if (roomUsers) {
                        for (const [userId, user] of roomUsers.entries()) {
                            if (user.socketId === socket.id) {
                                handleLeaveTicket(socket, ticketId, userId);
                                break;
                            }
                        }
                    }
                });
            }
            socketTickets.delete(socket.id);
        });
    });
};
exports.initializeSocket = initializeSocket;
/**
 * Handle user leaving a ticket room
 */
function handleLeaveTicket(socket, ticketId, userId) {
    const roomName = getTicketRoom(ticketId);
    const roomUsers = ticketRooms.get(ticketId);
    if (roomUsers) {
        const user = roomUsers.get(userId);
        if (user) {
            // Remove user from room tracking
            roomUsers.delete(userId);
            // Leave socket room
            socket.leave(roomName);
            // Remove ticket from socket tracking
            socketTickets.get(socket.id)?.delete(ticketId);
            // Notify room
            socket.to(roomName).emit("user_left", {
                ticketId,
                userId,
                userName: user.userName,
                timestamp: new Date(),
            });
            console.log(`[Socket] User ${user.userName} left ticket ${ticketId}`);
            // Clean up empty room
            if (roomUsers.size === 0) {
                ticketRooms.delete(ticketId);
            }
        }
    }
}
/**
 * Get Arabic label for ticket status
 */
function getStatusLabel(status) {
    const labels = {
        [types_1.TicketStatus.OPEN]: "مفتوحة",
        [types_1.TicketStatus.PENDING]: "قيد المعالجة",
        [types_1.TicketStatus.CLOSED]: "مغلقة",
    };
    return labels[status] || status;
}
/**
 * Get active users in a ticket room
 */
const getTicketActiveUsers = (ticketId) => {
    const roomUsers = ticketRooms.get(ticketId);
    return roomUsers ? Array.from(roomUsers.values()) : [];
};
exports.getTicketActiveUsers = getTicketActiveUsers;
/**
 * Check if user is in a ticket room
 */
const isUserInTicket = (ticketId, userId) => {
    const roomUsers = ticketRooms.get(ticketId);
    return roomUsers ? roomUsers.has(userId) : false;
};
exports.isUserInTicket = isUserInTicket;
exports.default = exports.initializeSocket;
//# sourceMappingURL=index.js.map