import api from "./api";

import {
    ChatHistoryResponse,
    ChatResponse,
} from "../types/chat.types";

export const sendMessage = async (
    prompt: string,
    images: File[] = []
): Promise<ChatResponse> => {
    const formData = new FormData();

    formData.append("prompt", prompt);

    images.forEach((image) => {
        formData.append("image", image);
    });

    const response = await api.post<ChatResponse>(
        "/chat",
        formData
    );

    return response.data;
};

export const getChat =
    async (): Promise<ChatHistoryResponse> => {
        const response =
            await api.get<ChatHistoryResponse>("/chat");

        return response.data;
    };