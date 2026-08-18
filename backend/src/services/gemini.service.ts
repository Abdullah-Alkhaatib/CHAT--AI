import gemini from "../config/gemini";

interface ChatHistoryMessage {
    role: "user" | "assistant";
    content: string;
}

interface GeminiMessage {
    role: "user" | "model";
    parts: {
        text: string;
    }[];
}

export const generateAllResponse = async (
    prompt: string,
    images?: {
        buffer: Buffer;
        mimetype: string;
    }[],
    history: ChatHistoryMessage[] = []
): Promise<string> => {
    try {
        const contents: GeminiMessage[] = history.map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [
                {
                    text: message.content,
                },
            ],
        }));

        const currentParts: any[] = [
            {
                text: prompt,
            },
        ];

        if (images && images.length > 0) {
            for (const image of images) {
                currentParts.push({
                    inlineData: {
                        mimeType: image.mimetype,
                        data: image.buffer.toString("base64"),
                    },
                });
            }
        }

        contents.push({
            role: "user",
            parts: currentParts,
        });

        const response = await gemini.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents,
        });

        return response.text ?? "No response from Gemini API";

    } catch (error) {
        console.error("Error generating response:", error);
        throw new Error("Failed to generate response from Gemini API");
    }
};