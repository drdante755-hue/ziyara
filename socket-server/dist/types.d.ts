/**
 * Type definitions for the Socket.IO ticket server
 * These types ensure type safety across the entire application
 */
import type { Types } from "mongoose";
export declare enum TicketStatus {
    OPEN = "open",
    PENDING = "pending",
    CLOSED = "closed"
}
export declare enum SenderType {
    USER = "user",
    AGENT = "agent",
    SYSTEM = "system"
}
export declare enum TicketPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}
export interface ITicket {
    _id: Types.ObjectId;
    ticketNumber: string;
    userId: Types.ObjectId;
    agentId?: Types.ObjectId;
    subject: string;
    category: string;
    status: TicketStatus;
    priority: TicketPriority;
    lastMessage?: string;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface IMessage {
    _id: Types.ObjectId;
    ticketId: Types.ObjectId;
    senderId: Types.ObjectId;
    senderType: SenderType;
    senderName: string;
    content: string;
    attachments?: IAttachment[];
    isRead: boolean;
    createdAt: Date;
}
export interface IAttachment {
    filename: string;
    url: string;
    mimeType: string;
    size: number;
}
export interface JoinTicketPayload {
    ticketId: string;
    userId: string;
    userType: SenderType;
    userName: string;
}
export interface LeaveTicketPayload {
    ticketId: string;
    userId: string;
}
export interface SendMessagePayload {
    ticketId: string;
    senderId: string;
    senderType: SenderType;
    senderName: string;
    content: string;
    attachments?: IAttachment[];
}
export interface TypingPayload {
    ticketId: string;
    senderId: string;
    senderName: string;
    isTyping: boolean;
}
export interface TicketStatusChangePayload {
    ticketId: string;
    status: TicketStatus;
    changedBy: string;
    changedByName: string;
}
export interface AssignAgentPayload {
    ticketId: string;
    agentId: string;
    agentName: string;
    assignedBy: string;
}
export interface MarkAsReadPayload {
    ticketId: string;
    userId: string;
}
export interface MessageReceivedPayload {
    message: IMessage;
    ticketId: string;
}
export interface TypingIndicatorPayload {
    ticketId: string;
    senderId: string;
    senderName: string;
    isTyping: boolean;
}
export interface TicketUpdatedPayload {
    ticketId: string;
    status: TicketStatus;
    changedBy: string;
    changedByName: string;
    timestamp: Date;
}
export interface UserJoinedPayload {
    ticketId: string;
    userId: string;
    userName: string;
    userType: SenderType;
    timestamp: Date;
}
export interface UserLeftPayload {
    ticketId: string;
    userId: string;
    userName: string;
    timestamp: Date;
}
export interface AgentAssignedPayload {
    ticketId: string;
    agentId: string;
    agentName: string;
    timestamp: Date;
}
export interface ErrorPayload {
    message: string;
    code: string;
}
export interface TicketDeletedPayload {
    ticketId: string;
    deletedBy: string;
    deletedByName: string;
    timestamp: Date;
}
export interface ClientToServerEvents {
    join_ticket: (payload: JoinTicketPayload) => void;
    leave_ticket: (payload: LeaveTicketPayload) => void;
    send_message: (payload: SendMessagePayload) => void;
    typing: (payload: TypingPayload) => void;
    ticket_status_change: (payload: TicketStatusChangePayload) => void;
    assign_agent: (payload: AssignAgentPayload) => void;
    mark_as_read: (payload: MarkAsReadPayload) => void;
}
export interface ServerToClientEvents {
    message_received: (payload: MessageReceivedPayload) => void;
    typing_indicator: (payload: TypingIndicatorPayload) => void;
    ticket_updated: (payload: TicketUpdatedPayload) => void;
    ticket_deleted: (payload: TicketDeletedPayload) => void;
    user_joined: (payload: UserJoinedPayload) => void;
    user_left: (payload: UserLeftPayload) => void;
    agent_assigned: (payload: AgentAssignedPayload) => void;
    messages_read: (payload: {
        ticketId: string;
        userId: string;
    }) => void;
    error: (payload: ErrorPayload) => void;
}
export interface ActiveUser {
    socketId: string;
    userId: string;
    userName: string;
    userType: SenderType;
    joinedAt: Date;
}
export interface TicketRoom {
    ticketId: string;
    users: Map<string, ActiveUser>;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
//# sourceMappingURL=types.d.ts.map