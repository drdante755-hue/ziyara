/**
 * MongoDB Database Configuration
 * Handles connection to MongoDB using Mongoose
 * Includes connection pooling and error handling
 */
/**
 * Connect to MongoDB database
 * Implements retry logic and graceful error handling
 */
export declare const connectDB: () => Promise<void>;
/**
 * Disconnect from MongoDB
 * Used for graceful shutdown
 */
export declare const disconnectDB: () => Promise<void>;
export default connectDB;
//# sourceMappingURL=db.d.ts.map