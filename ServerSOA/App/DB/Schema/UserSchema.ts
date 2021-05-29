import mongoose, { Schema } from "mongoose";
import User from "../../Models/User";
const ObjectId = Schema.Types.ObjectId;

const UserSchema = new Schema({
    username: {type: String, unique: true, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    friends: [ObjectId],
    victories: Number,
    losts: Number,
    joinedAt: Date,
    lastSeen: Date,
    chats: [ObjectId]
});

export default mongoose.model<User>('User', UserSchema);