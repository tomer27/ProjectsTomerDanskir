import { Document } from "mongoose";
import Chat from "./Chat";

export default interface User extends Document{
    username: string;
    email: string;
    password: string;
    friends: User['_id'][];
    victories: number;
    losts: number;
    joinedAt: Date,
    lastSeen: Date,
    chats: Chat['_id'][]
}

const CreateUserInstance = (username: string, email: string, hashedPassword: string) => {
    const user = <User>{};
    user.username = username;
    user.email = email;
    user.password = hashedPassword;
    user.joinedAt = new Date();
    return user;
}

export { CreateUserInstance };