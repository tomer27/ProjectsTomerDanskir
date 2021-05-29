import { Document } from "mongoose";
import Message from "./Message";
import User from "./User";

export default interface Chat extends Document{
    messages: Array<Message['_id']>
    members: Array<User['_id']>
}

export const CreateChatInstance = (member1: User['_id'], member2: User['_id']) => {
    const chat = <Chat>{};
    chat.messages = [];
    chat.members = [member1, member2];
    return chat;
}