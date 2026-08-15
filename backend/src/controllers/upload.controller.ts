import { Request, Response } from "express";
import { uploadImageBuffer } from "../utils/uploadImage";

export const uploadImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image provided"
            });
        }

        const result = await uploadImageBuffer(req.file.buffer);

        return res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            data: result
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }
};