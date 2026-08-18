export type MessageRole = "user" | "assistant";

export interface ChatMessage {
    role: MessageRole;
    content: string;
    imgUrls?: string[];
}

export interface ChatResponse {
    success: boolean;
    message: string;

    data: {
        response: string;
        chatId: string;
        imgUrls?: string[];
    };
}

export interface ChatHistoryResponse {
    success: boolean;
    message: string;

    data: {
        _id?: string;
        userId?: string;
        messages: ChatMessage[];
    };
}