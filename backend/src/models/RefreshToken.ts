import mongoose, { Document, Schema } from "mongoose";

export interface IRefreshToken extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
}

const refreshTokenSchema: Schema<IRefreshToken> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        token: {
            type: String,
            required: true,
            unique: true
        },
        expiresAt: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }
);

const RefreshToken = mongoose.model<IRefreshToken>(
    "RefreshToken",
    refreshTokenSchema
);

export default RefreshToken;