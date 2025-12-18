/**
 * Ticket Model for MongoDB
 * Stores ticket information including status, assignment, and metadata
 * Optimized with indexes for fast querying
 */
import { type Document, type Model } from "mongoose";
import { type ITicket } from "../types";
export interface ITicketDocument extends Omit<ITicket, "_id">, Document {
}
declare const Ticket: Model<ITicketDocument>;
export default Ticket;
//# sourceMappingURL=Ticket.d.ts.map