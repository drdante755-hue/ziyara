"use strict";
/**
 * MongoDB Database Configuration
 * Handles connection to MongoDB using Mongoose
 * Includes connection pooling and error handling
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://zeroblin06_db_user:QCgGMXaKBfQ7bEWC@ziyara-cluster.epovpur.mongodb.net/ziyara?retryWrites=true&w=majority&appName=ziyara-cluster";
// MongoDB connection options for production readiness
const mongooseOptions = {
    maxPoolSize: 10, // Maximum number of connections in the pool
    minPoolSize: 5, // Minimum number of connections
    serverSelectionTimeoutMS: 5000, // Timeout for server selection
    socketTimeoutMS: 45000, // Socket timeout
    family: 4, // Use IPv4
};
/**
 * Connect to MongoDB database
 * Implements retry logic and graceful error handling
 */
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(MONGO_URI, mongooseOptions);
        console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
        console.log(`[MongoDB] Database name: ${conn.connection.name}`);
        // Connection event listeners
        mongoose_1.default.connection.on("error", (err) => {
            console.error("[MongoDB] Connection error:", err);
        });
        mongoose_1.default.connection.on("disconnected", () => {
            console.warn("[MongoDB] Disconnected from database");
        });
        mongoose_1.default.connection.on("reconnected", () => {
            console.log("[MongoDB] Reconnected to database");
        });
        // Graceful shutdown handling
        process.on("SIGINT", async () => {
            await mongoose_1.default.connection.close();
            console.log("[MongoDB] Connection closed due to app termination");
            process.exit(0);
        });
    }
    catch (error) {
        console.error("[MongoDB] Connection failed:", error);
        // Retry connection after 5 seconds
        console.log("[MongoDB] Retrying connection in 5 seconds...");
        setTimeout(exports.connectDB, 5000);
    }
};
exports.connectDB = connectDB;
/**
 * Disconnect from MongoDB
 * Used for graceful shutdown
 */
const disconnectDB = async () => {
    try {
        await mongoose_1.default.connection.close();
        console.log("[MongoDB] Disconnected successfully");
    }
    catch (error) {
        console.error("[MongoDB] Error during disconnect:", error);
    }
};
exports.disconnectDB = disconnectDB;
exports.default = exports.connectDB;
//# sourceMappingURL=db.js.map