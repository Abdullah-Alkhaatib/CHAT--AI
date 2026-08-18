import api from "./api";

import {
    ChatHistoryResponse,
    ChatResponse,
} from "../types/chat.types";

export const sendMessage = async (
    prompt: string,
    images: File[] = [],
    signal?: AbortSignal // <--- أضفنا الـ signal هنا
): Promise<ChatResponse> => {
    const formData = new FormData();

    formData.append("prompt", prompt);

    images.forEach((image) => {
        formData.append("image", image);
    });

    const response = await api.post<ChatResponse>(
        "/chat",
        formData,
        {
            signal, // <--- تمرير الـ signal لـ Axios عشان يقدر يكنسل الطلب
        }
    );

    return response.data;
};

export const getChat = async (): Promise<ChatHistoryResponse> => {
    const response = await api.get<ChatHistoryResponse>("/chat");

    return response.data;
};