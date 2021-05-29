import mongoose, { Schema } from "mongoose";
import Chat from "../../Models/Chat";
const ObjectId = Schema.Types.ObjectId;

const ChatSchema = new Schema({
    messages: [ObjectId],
    members: [ObjectId]
});

export default mongoose.model<Chat>('Chat', ChatSchema);