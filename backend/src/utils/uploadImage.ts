import cloudinary from "./cloudinary";

interface UploadResult {
    url: string;
    publicId: string;
}

export const uploadImageBuffer = (
    buffer: Buffer,
    folder: string = "chat-ai"
): Promise<UploadResult> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                if (!result) {
                    return reject(new Error("Image upload failed"));
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        stream.end(buffer);
    });
};