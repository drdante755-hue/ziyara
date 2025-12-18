/**
 * Main Application Entry Point
 * Initializes Express server with Socket.IO and MongoDB
 * Production-ready configuration with error handling
 */

import express, { type Application, type Request, type Response, type NextFunction } from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"

import connectDB from "./config/db"
import initializeSocket, { getTicketActiveUsers } from "./socket"
import Ticket from "./models/Ticket"
import Message from "./models/Message"
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  ApiResponse,
  PaginatedResponse,
  IMessage,
  ITicket,
} from "./types"

// Load environment variables
dotenv.config()

const PORT = process.env.PORT || 5000
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000"

// Initialize Express app
const app: Application = express()
const httpServer = createServer(app)

// Initialize Socket.IO with CORS
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: CORS_ORIGIN.split(","), // support multiple origins
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
})

// =====================
// Middleware
// =====================
app.use(cors({ origin: CORS_ORIGIN.split(","), credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[HTTP] ${req.method} ${req.path}`)
  next()
})

// =====================
// REST API Endpoints
// =====================

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  })
})

// Get ticket by ID
app.get("/tickets/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid ticket ID" } as ApiResponse<null>)
    }

    const ticket = await Ticket.findById(id)
    if (!ticket) return res.status(404).json({ success: false, error: "Ticket not found" } as ApiResponse<null>)

    const activeUsers = getTicketActiveUsers(id)

    res.json({
      success: true,
      data: { ...ticket.toObject(), activeUsers },
    } as ApiResponse<ITicket & { activeUsers: unknown[] }>)
  } catch (error) {
    console.error("[API] Error fetching ticket:", error)
    res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse<null>)
  }
})

// Get messages with pagination
app.get("/tickets/:id/messages", async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 50
    const skip = (page - 1) * limit

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, error: "Invalid ticket ID" } as ApiResponse<null>)

    const ticket = await Ticket.findById(id)
    if (!ticket) return res.status(404).json({ success: false, error: "Ticket not found" } as ApiResponse<null>)

    const [messages, total] = await Promise.all([
      Message.find({ ticketId: id }).sort({ createdAt: 1 }).skip(skip).limit(limit),
      Message.countDocuments({ ticketId: id }),
    ])

    res.json({
      success: true,
      data: messages,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    } as PaginatedResponse<IMessage>)
  } catch (error) {
    console.error("[API] Error fetching messages:", error)
    res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse<null>)
  }
})

// Create new ticket
app.post("/tickets", async (req: Request, res: Response) => {
  try {
    const { userId, subject, category, priority, description, userName } = req.body

    if (!userId || !subject) {
      return res.status(400).json({ success: false, error: "userId and subject are required" } as ApiResponse<null>)
    }

    const ticket = new Ticket({
      userId: new mongoose.Types.ObjectId(userId),
      subject,
      category: category || "general",
      priority: priority || "medium",
    })

    await ticket.save()

    // Create initial message if description provided
    if (description) {
      const message = new Message({
        ticketId: ticket._id,
        senderId: new mongoose.Types.ObjectId(userId),
        senderType: "user",
        senderName: userName || "User",
        content: description,
      })
      await message.save()
    }

    res.status(201).json({ success: true, data: ticket, message: "Ticket created successfully" } as ApiResponse<ITicket>)
  } catch (error) {
    console.error("[API] Error creating ticket:", error)
    res.status(500).json({ success: false, error: "Internal server error" } as ApiResponse<null>)
  }
})

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Endpoint not found" })
})

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("[Error]", err)
  res.status(500).json({ success: false, error: "Internal server error" })
})

// =====================
// Start Server
// =====================
const startServer = async (): Promise<void> => {
  try {
    await connectDB()
    initializeSocket(io)

    httpServer.listen(PORT, () => {
      console.log("=".repeat(50))
      console.log(`[Server] Ticket Socket Server Started`)
      console.log(`[Server] HTTP: http://localhost:${PORT}`)
      console.log(`[Server] WebSocket: ws://localhost:${PORT}`)
      console.log(`[Server] CORS Origin: ${CORS_ORIGIN}`)
      console.log("=".repeat(50))
    })
  } catch (error) {
    console.error("[Server] Failed to start:", error)
    process.exit(1)
  }
}

startServer()

export { app, io, httpServer }
