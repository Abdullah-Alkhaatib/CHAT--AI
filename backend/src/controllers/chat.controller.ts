import { Response } from "express";
import { AuthRequest } from "../types/auth.types";
import { generateAllResponse } from "../services/gemini.service";
import Chat from "../models/Chat";
import { uploadImageBuffer, deleteImage } from "../utils/uploadImage";

export const chat = async (req: AuthRequest, res: Response) => {
    try {
        const { prompt, chatId } = req.body; // استقبلنا الـ chatId عشان نعرف أي شات عم نحكي فيه
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

        let chatDoc;

        // لو تم إرسال chatId حقيقي، بنبحث عنه بالداتابيس
        if (chatId && chatId.length === 24) { // للتأكد أنه MongoDB ObjectId صالح
            chatDoc = await Chat.findOne({
                _id: chatId,
                userId: req.user.userId,
            });
        }

        // لو ما في chatId أو ما لقينا الشات، بننشئ شات جديد كلياً
        if (!chatDoc) {
            chatDoc = new Chat({
                userId: req.user.userId,
                messages: [],
            });
        }

        // استخراج الـ history الخاص بهذا الشات فقط للـ AI
        const history = chatDoc.messages.map((message) => ({
            role: message.role,
            content: message.content,
        }));

        // رفع الصور لـ Cloudinary
        const uploadedImages: {
    url: string;
    publicId: string;
}[] = [];

for (const image of images) {
    const uploadResult = await uploadImageBuffer(
        image.buffer,
        "chat-ai"
    );

    uploadedImages.push({
        url: uploadResult.url,
        publicId: uploadResult.publicId,
    });
}

        // توليد الرد من Gemini
        const response = await generateAllResponse(
            prompt,
            images,
            history
        );

        // حفظ رسالة المستخدم
        chatDoc.messages.push({
    role: "user",
    content: prompt,
    ...(uploadedImages.length > 0 && {
        images: uploadedImages,
    }),
});

        // حفظ رد الـ AI
        chatDoc.messages.push({
            role: "assistant",
            content: response,
        });

        await chatDoc.save();

        return res.status(200).json({
            success: true,
            message: "Response generated successfully",
             data: {
        response,
        chatId: chatDoc._id,
        messages: chatDoc.messages,
        ...(uploadedImages.length > 0 && {
            images: uploadedImages,
        }),
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

        const chatId = req.query.chatId ? String(req.query.chatId) : undefined;

        // لو طالبين شات محدد بالـ ID
        if (chatId && chatId.length === 24) {
            const singleChat = await Chat.findOne({
                _id: chatId,
                userId: req.user.userId,
            });

            return res.status(200).json({
                success: true,
                data: singleChat ? singleChat.messages : [],
            });
        }

        // لو ما حددنا شات، بنجيب كل الشاتات الخاصة باليوزر (عشان Sidebar)
        const allChats = await Chat.find({ userId: req.user.userId }).sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            data: allChats, // بنرجع مصفوفة الشاتات كلها
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: (error as Error).message,
        });
    }
};


export const deleteChat = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const { chatId } = req.params;

        if (!chatId || chatId.length !== 24) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat ID",
            });
        }

        // مهم جدًا:
        // نتأكد أن الشات ملك لهذا المستخدم
        const chatDoc = await Chat.findOne({
            _id: chatId,
            userId: req.user.userId,
        });

        if (!chatDoc) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        // نجمع كل صور الشات
        const images = chatDoc.messages.flatMap(
            (message) => message.images || []
        );

        // حذف الصور من Cloudinary
        await Promise.all(
            images.map((image) =>
                deleteImage(image.publicId)
            )
        );

        // حذف الشات من MongoDB
        await Chat.deleteOne({
            _id: chatDoc._id,
        });

        return res.status(200).json({
            success: true,
            message: "Chat and images deleted successfully",
        });

    } catch (error) {
        console.error("Delete chat error:", error);

        return res.status(500).json({
            success: false,
            message: (error as Error).message,
        });
    }
};