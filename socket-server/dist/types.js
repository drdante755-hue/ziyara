"use strict";
/**
 * Type definitions for the Socket.IO ticket server
 * These types ensure type safety across the entire application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketPriority = exports.SenderType = exports.TicketStatus = void 0;
// =====================
// Enums
// =====================
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["OPEN"] = "open";
    TicketStatus["PENDING"] = "pending";
    TicketStatus["CLOSED"] = "closed";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
var SenderType;
(function (SenderType) {
    SenderType["USER"] = "user";
    SenderType["AGENT"] = "agent";
    SenderType["SYSTEM"] = "system";
})(SenderType || (exports.SenderType = SenderType = {}));
var TicketPriority;
(function (TicketPriority) {
    TicketPriority["LOW"] = "low";
    TicketPriority["MEDIUM"] = "medium";
    TicketPriority["HIGH"] = "high";
})(TicketPriority || (exports.TicketPriority = TicketPriority = {}));
//# sourceMappingURL=types.js.map