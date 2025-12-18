/**
 * Message Model for MongoDB
 * Stores individual messages within tickets
 * Supports text content, attachments, and read status
 */
import { type Document, type Model } from "mongoose";
import { type IMessage } from "../types";
export interface IMessageDocument extends Omit<IMessage, "_id">, Document {
}
declare const Message: Model<IMessageDocument>;
export default Message;
//# sourceMappingURL=Message.d.ts.map