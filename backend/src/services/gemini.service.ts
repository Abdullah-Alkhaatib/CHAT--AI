import gemini from "../config/gemini";

export const generateAllResponse = async (
    prompt: string,
    images?: {
        buffer: Buffer;
        mimetype: string;
    }[]
): Promise<string> => {
    try {
        const parts: any[] = [
            {
                text: prompt,
            },
        ];

        if (images && images.length > 0) {
            for (const image of images) {
                parts.push({
                    inlineData: {
                        mimeType: image.mimetype,
                        data: image.buffer.toString("base64"),
                    },
                });
            }
        }

        const response = await gemini.models.generateContent({
            model: "gemini-3.6-flash",
            contents: [
                {
                    role: "user",
                    parts,
                },
            ],
        });

        return response.text ?? "No response from Gemini API";

    } catch (error) {
        console.error("Error generating response:", error);
        throw new Error("Failed to generate response from Gemini API");
    }
};