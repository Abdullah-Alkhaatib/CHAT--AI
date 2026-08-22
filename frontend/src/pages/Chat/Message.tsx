import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ChatMessage } from "../../types/chat.types";

import "./Message.css";

interface MessageProps {
    message: ChatMessage;
    isNew: boolean;
    onImageClick: (imageUrl: string) => void;
}

interface CodeProps {
    className?: string;
    children?: React.ReactNode;
}

const Message = ({
    message,
    isNew,
    onImageClick,
}: MessageProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopyMessage = async () => {
        if (!message.content?.trim()) {
            return;
        }

        try {
            await navigator.clipboard.writeText(message.content);

            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 1400);
        } catch (error) {
            console.error("Failed to copy message:", error);
        }
    };

    const handleCopyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            return true;
        } catch (error) {
            console.error("Failed to copy code:", error);
            return false;
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
            {/* =========================
                USER MESSAGE
            ========================== */}

            {message.role === "user" && (
                <>
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

                    {message.content && (
                        <div className="message-content user-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </>
            )}

            {/* =========================
                ASSISTANT MESSAGE
            ========================== */}

            {message.role === "assistant" && (
                <>
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

                    {message.content && (
                        <div className="assistant-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    /* =========================
                                       CODE
                                    ========================== */

                                    code({
                                        className,
                                        children,
                                    }: CodeProps) {
                                        const code =
                                            String(children).replace(
                                                /\n$/,
                                                ""
                                            );

                                        const languageMatch =
                                            /language-([\w-]+)/.exec(
                                                className || ""
                                            );

                                        const language =
                                            languageMatch?.[1] ||
                                            "text";

                                        const [codeCopied, setCodeCopied] =
                                            useState(false);

                                        const copyCode = async () => {
                                            const success =
                                                await handleCopyCode(
                                                    code
                                                );

                                            if (success) {
                                                setCodeCopied(true);

                                                window.setTimeout(() => {
                                                    setCodeCopied(false);
                                                }, 1400);
                                            }
                                        };

                                        return (
                                            <div className="code-block">
                                                <div className="code-header">
                                                    <span className="code-language">
                                                        {language.toUpperCase()}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        className="code-copy-button"
                                                        onClick={
                                                            copyCode
                                                        }
                                                    >
                                                        {codeCopied
                                                            ? "Copied"
                                                            : "Copy"}
                                                    </button>
                                                </div>

                                                <pre className="code-pre">
                                                    <code
                                                        className={
                                                            className
                                                        }
                                                    >
                                                        {code}
                                                    </code>
                                                </pre>
                                            </div>
                                        );
                                    },

                                    /* =========================
                                       PARAGRAPH
                                    ========================== */

                                    p({ children }) {
                                        return (
                                            <p className="markdown-paragraph">
                                                {children}
                                            </p>
                                        );
                                    },

                                    /* =========================
                                       HEADINGS
                                    ========================== */

                                    h1({ children }) {
                                        return (
                                            <h1 className="markdown-heading">
                                                {children}
                                            </h1>
                                        );
                                    },

                                    h2({ children }) {
                                        return (
                                            <h2 className="markdown-heading">
                                                {children}
                                            </h2>
                                        );
                                    },

                                    h3({ children }) {
                                        return (
                                            <h3 className="markdown-heading">
                                                {children}
                                            </h3>
                                        );
                                    },

                                    /* =========================
                                       LISTS
                                    ========================== */

                                    ul({ children }) {
                                        return (
                                            <ul className="markdown-list">
                                                {children}
                                            </ul>
                                        );
                                    },

                                    ol({ children }) {
                                        return (
                                            <ol className="markdown-list">
                                                {children}
                                            </ol>
                                        );
                                    },

                                    li({ children }) {
                                        return (
                                            <li className="markdown-list-item">
                                                {children}
                                            </li>
                                        );
                                    },

                                    /* =========================
                                       INLINE CODE
                                    ========================== */

                                    // inline code is handled naturally
                                    // by react-markdown
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>

                            {/* Copy whole response */}
                            <div className="message-actions">
                                <button
                                    type="button"
                                    className="message-copy-button"
                                    onClick={handleCopyMessage}
                                >
                                    {copied
                                        ? "Copied"
                                        : "Copy"}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Message;