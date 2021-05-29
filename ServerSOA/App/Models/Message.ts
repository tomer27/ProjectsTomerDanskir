import { Document } from "mongoose";
import User from "./User";

export default interface Message extends Document{
    sender: User['_id'],
    reciever: User['_id'],
    content: string,
    sendTime: Date
}

export const CreateMessageInstance = (sender: User['_id'], reciever: User['_id'], content: string) => {
    const message = <Message>{};
    message.sender = sender;
    message.reciever = reciever;
    message.content = content;
    message.sendTime = new Date();
    return message; 
}