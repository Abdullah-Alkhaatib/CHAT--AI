import mongoose, { Document, Schema } from "mongoose";

export interface IChatImage {
    url: string;
    publicId: string;
}

export interface IChatMessage {
    role: "user" | "assistant";
    content: string;
    images?: IChatImage[];
}

export interface IChat extends Document {
    userId: mongoose.Types.ObjectId;
    title?: string;
    messages: IChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const chatImageSchema: Schema<IChatImage> = new Schema(
    {
        url: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        },
    },
    {
        _id: false,
    }
);

const chatMessageSchema: Schema<IChatMessage> = new Schema(
    {
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
        images: {
            type: [chatImageSchema],
            default: undefined,
        },
    },
    {
        _id: false,
    }
);

const chatSchema: Schema<IChat> = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        trim: true,
        maxlength: 100,
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