/**
 * Main Application Entry Point
 * Initializes Express server with Socket.IO and MongoDB
 * Production-ready configuration with error handling
 */
import { type Application } from "express";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "./types";
declare const app: Application;
declare const httpServer: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
declare const io: Server<ClientToServerEvents, ServerToClientEvents, import("socket.io").DefaultEventsMap, any>;
export { app, io, httpServer };
//# sourceMappingURL=app.d.ts.map