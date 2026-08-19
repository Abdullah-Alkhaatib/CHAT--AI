export type MessageRole = "user" | "assistant";

export interface ChatImage {
    url: string;
    publicId?: string;
}

export interface ChatMessage {
    role: MessageRole;
    content: string;
    images?: ChatImage[];
}

export interface ChatResponse {
    success: boolean;
    message: string;

    data: {
        response: string;
        chatId: string;
        images?: ChatImage[];
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