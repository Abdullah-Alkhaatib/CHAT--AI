import { useState } from "react";

import { ChatMessage } from "../../types/chat.types";

import "./Message.css";

interface MessageProps {
    message: ChatMessage;
    isNew: boolean;
    onImageClick: (imageUrl: string) => void;
}

const Message = ({
    message,
    isNew,
    onImageClick,
}: MessageProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!message.content?.trim()) {
            return;
        }

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(
                    message.content
                );
            } else {
                const helperInput =
                    document.createElement("textarea");

                helperInput.value = message.content;
                helperInput.style.position = "fixed";
                helperInput.style.opacity = "0";

                document.body.appendChild(helperInput);

                helperInput.focus();
                helperInput.select();

                document.execCommand("copy");

                document.body.removeChild(helperInput);
            }

            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 1400);
        } catch (error) {
            console.error(
                "Failed to copy message:",
                error
            );
        }
    };

    return (
        <div
            className={`message ${
                message.role === "user"
                    ? "message-user"
                    : "message-assistant"
            } ${isNew ? "message-new" : ""}`}
        >
            {/* Copy button for AI messages */}
            {message.role === "assistant" &&
                message.content && (
                    <div className="message-toolbar">
                        <button
                            type="button"
                            className="message-copy-button"
                            onClick={handleCopy}
                        >
                            {copied ? "Copied" : "Copy"}
                        </button>
                    </div>
                )}

            {/* Images */}
            {message.images &&
                message.images.length > 0 && (
                    <div className="message-images">
                        {message.images.map(
                            (image, index) => (
                                <img
                                    key={`${image.url}-${index}`}
                                    className="message-image"
                                    src={image.url}
                                    alt={`Uploaded ${
                                        index + 1
                                    }`}
                                    onClick={() =>
                                        onImageClick(
                                            image.url
                                        )
                                    }
                                />
                            )
                        )}
                    </div>
                )}

            {/* Message text */}
            {message.content && (
                <p className="message-content">
                    {message.content}
                </p>
            )}
        </div>
    );
};

export default Message;