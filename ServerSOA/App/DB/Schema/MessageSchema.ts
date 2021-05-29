import mongoose, { Schema } from "mongoose";
import Message from "../../Models/Message";
const ObjectId = Schema.Types.ObjectId;

const MessageSchema = new Schema({
    sender: ObjectId,
    reciever: ObjectId,
    content: String,
    sendTime: Date
});

export default mongoose.model<Message>('Message', MessageSchema);