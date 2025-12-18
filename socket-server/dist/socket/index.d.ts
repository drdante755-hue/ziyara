/**
 * Socket.IO Event Handlers
 * Manages real-time communication for the ticket system
 * Handles message delivery, typing indicators, and presence
 */
import type { Server } from "socket.io";
import { type ClientToServerEvents, type ServerToClientEvents, type ActiveUser } from "../types";
/**
 * Initialize Socket.IO event handlers
 */
export declare const initializeSocket: (io: Server<ClientToServerEvents, ServerToClientEvents>) => void;
/**
 * Get active users in a ticket room
 */
export declare const getTicketActiveUsers: (ticketId: string) => ActiveUser[];
/**
 * Check if user is in a ticket room
 */
export declare const isUserInTicket: (ticketId: string, userId: string) => boolean;
export default initializeSocket;
//# sourceMappingURL=index.d.ts.map