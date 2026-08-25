import api from "./api";

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

    const response = await api.post("/chat", formData, {
        signal,
    });

    return response.data;
};

export const getChat = async (
    chatId?: string
): Promise<any> => {
    const url =
        chatId && chatId.length === 24
            ? `/chat?chatId=${chatId}`
            : "/chat";

    const response = await api.get(url);

    return response.data;
};

export const deleteChat = async (
    chatId: string
): Promise<any> => {
    const response = await api.delete(
        `/chat/${chatId}`
    );

    return response.data;
};

export const editChat = async (
    chatId: string,
    title: string
): Promise<any> => {
    const response = await api.patch(
        `/chat/${chatId}`,
        { title }
    );

    return response.data;
};