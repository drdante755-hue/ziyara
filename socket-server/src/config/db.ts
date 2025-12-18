/**
 * MongoDB Database Configuration
 * Handles connection to MongoDB using Mongoose
 * Includes connection pooling and error handling
 */

import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://zeroblin06_db_user:QCgGMXaKBfQ7bEWC@ziyara-cluster.epovpur.mongodb.net/ziyara?retryWrites=true&w=majority&appName=ziyara-cluster"

// MongoDB connection options for production readiness
const mongooseOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 5, // Minimum number of connections
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000, // Socket timeout
  family: 4, // Use IPv4
}

/**
 * Connect to MongoDB database
 * Implements retry logic and graceful error handling
 */
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGO_URI, mongooseOptions)

    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`)
    console.log(`[MongoDB] Database name: ${conn.connection.name}`)

    // Connection event listeners
    mongoose.connection.on("error", (err) => {
      console.error("[MongoDB] Connection error:", err)
    })

    mongoose.connection.on("disconnected", () => {
      console.warn("[MongoDB] Disconnected from database")
    })

    mongoose.connection.on("reconnected", () => {
      console.log("[MongoDB] Reconnected to database")
    })

    // Graceful shutdown handling
    process.on("SIGINT", async () => {
      await mongoose.connection.close()
      console.log("[MongoDB] Connection closed due to app termination")
      process.exit(0)
    })
  } catch (error) {
    console.error("[MongoDB] Connection failed:", error)
    // Retry connection after 5 seconds
    console.log("[MongoDB] Retrying connection in 5 seconds...")
    setTimeout(connectDB, 5000)
  }
}

/**
 * Disconnect from MongoDB
 * Used for graceful shutdown
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close()
    console.log("[MongoDB] Disconnected successfully")
  } catch (error) {
    console.error("[MongoDB] Error during disconnect:", error)
  }
}

export default connectDB
