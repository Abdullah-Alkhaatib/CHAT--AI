import { Response } from "express";
import { AuthRequest } from "../types/auth.types";
import { generateAllResponse } from "../services/gemini.service";
import Chat from "../models/Chat";
import { uploadImageBuffer } from "../utils/uploadImage";

export const chat = async (req: AuthRequest, res: Response) => {
    try {
        const { prompt } = req.body;
        const images = (req.files as Express.Multer.File[]) || [];

        if (!prompt || typeof prompt !== "string") {
            return res.status(400).json({
                success: false,
                message: "Prompt is required",
            });
        }

        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        // Find existing chat
        let chat = await Chat.findOne({
            userId: req.user.userId,
        });

        if (!chat) {
            chat = new Chat({
                userId: req.user.userId,
                messages: [],
            });
        }

        // Get previous messages BEFORE adding the new message
        const history = chat.messages.map((message) => ({
            role: message.role,
            content: message.content,
        }));

        // Upload images to Cloudinary
        const imgUrls: string[] = [];

        for (const image of images) {
            const uploadResult = await uploadImageBuffer(
                image.buffer,
                "chat-ai"
            );

            imgUrls.push(uploadResult.url);
        }

        // Send previous conversation + current message to Gemini
        const response = await generateAllResponse(
            prompt,
            images,
            history
        );

        // Save user message
        chat.messages.push({
            role: "user",
            content: prompt,
            ...(imgUrls.length > 0 && { imgUrls }),
        });

        // Save AI response
        chat.messages.push({
            role: "assistant",
            content: response,
        });

        await chat.save();

        return res.status(200).json({
            success: true,
            message: "Response generated successfully",
            data: {
                response,
                chatId: chat._id,
                ...(imgUrls.length > 0 && { imgUrls }),
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: (error as Error).message,
        });
    }
};

export const getChat = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const chat = await Chat.findOne({
            userId: req.user.userId,
        });

        if (!chat) {
            return res.status(200).json({
                success: true,
                message: "No chat history found",
                data: {
                    messages: [],
                },
            });
        }

        return res.status(200).json({
            success: true,
            message: "Chat history fetched successfully",
            data: chat,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: (error as Error).message,
        });
    }
};