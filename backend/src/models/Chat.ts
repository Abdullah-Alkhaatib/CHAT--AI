import mongoose, { Document, Schema } from "mongoose";

export interface IChatMessage {
    role: "user" | "assistant";
    content: string;
    imgUrls?: string[];
}

export interface IChat extends Document {
    userId: mongoose.Types.ObjectId;
    messages: IChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const chatMessageSchema: Schema<IChatMessage> = new Schema({
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    imgUrls: {
        type: [String],
        default: undefined,
    },
},
{
    _id: false,
});

const chatSchema: Schema<IChat> = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    messages: {
        type: [chatMessageSchema],
        default: [],
    },
}, {
    timestamps: true,
});

const Chat = mongoose.model<IChat>("Chat", chatSchema);

export default Chat;