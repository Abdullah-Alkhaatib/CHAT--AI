import api from "./api";
import { ChatHistoryResponse, ChatResponse } from "../types/chat.types";

export const sendMessage = async (
    prompt: string,
    images: File[] = [],
    chatId?: string,
    signal?: AbortSignal
): Promise<any> => {
    const formData = new FormData();
    formData.append("prompt", prompt);

    if (chatId && chatId.length === 24) {
        formData.append("chatId", chatId);
    }

    images.forEach((image) => {
        formData.append("image", image);
    });

    const response = await api.post("/chat", formData, { signal });
    return response.data;
};

export const getChat = async (chatId?: string): Promise<any> => {
    const url = chatId && chatId.length === 24 ? `/chat?chatId=${chatId}` : "/chat";
    const response = await api.get(url);
    return response.data;
};