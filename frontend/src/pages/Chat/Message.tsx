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

interface CodeBlockProps {
    className?: string;
    children?: React.ReactNode;
}

/* =========================================================
   CODE BLOCK
========================================================= */

const CodeBlock = ({
    className,
    children,
}: CodeBlockProps) => {
    const [copied, setCopied] = useState(false);

    const code = String(children).replace(/\n$/, "");
    const code = Array.isArray(children)
        ? children.join("")
        : String(children ?? "").replace(/\n$/, "");

    const languageMatch =
        /language-([\w-]+)/.exec(className || "");

    const language =
        languageMatch?.[1] || "text";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);

            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 1400);
        } catch (error) {
            console.error(
                "Failed to copy code:",
                error
            );
        }
    };

    return (
        <div className="code-block">
            {/* =================================================
                CODE HEADER
            ================================================= */}

            <div className="code-header">
                <span className="code-language">
                    {language.toUpperCase()}
                </span>

                <button
                    type="button"
                    className="code-copy-button"
                    onClick={handleCopy}
                >
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>

            {/* =================================================
                CODE
            ================================================= */}

            <pre className="code-pre">
                <code className={className}>
                    {code}
                </code>
            </pre>
        </div>
    );
};

/* =========================================================
   MESSAGE
========================================================= */

const Message = ({
    message,
    isNew,
    onImageClick,
}: MessageProps) => {
    const [copied, setCopied] = useState(false);

    /* =======================================================
       COPY ENTIRE MESSAGE
    ======================================================= */

    const handleCopyMessage = async () => {
        if (!message.content?.trim()) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
                message.content
            );

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
            {/* =================================================
                USER MESSAGE
            ================================================= */}

            {message.role === "user" && (
                <>
                    {/* =========================================
                        USER IMAGES
                    ========================================= */}

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

                    {/* =========================================
                        USER CONTENT
                    ========================================= */}

                    {message.content && (
                        <div
                            className="message-content user-content"
                            dir="auto"
                        >
                            <ReactMarkdown
                                remarkPlugins={[
                                    remarkGfm,
                                ]}
                                components={{
                                    /* ---------------------------------
                                       PRE
                                    --------------------------------- */

                                    pre: ({
                                        children,
                                    }) => (
                                        <>{children}</>
                                    ),

                                    /* ---------------------------------
                                       INLINE / BLOCK CODE
                                    --------------------------------- */

                                    code: ({
                                        className,
                                        children,
                                        ...props
                                    }) => {
                                        const isCodeBlock =
                                            Boolean(
                                                className
                                            );
                                            ) ||
                                            (typeof children ===
                                                "string" &&
                                                children.includes(
                                                    "\n"
                                                ));

                                        /* -----------------------------
                                           INLINE CODE
                                        ----------------------------- */

                                        if (
                                            !isCodeBlock
                                        ) {
                                            return (
                                                <code
                                                    className="inline-code"
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            );
                                        }

                                        /* -----------------------------
                                           CODE BLOCK
                                        ----------------------------- */

                                        return (
                                            <CodeBlock
                                                className={
                                                    className
                                                }
                                            >
                                                {children}
                                            </CodeBlock>
                                        );
                                    },

                                    /* ---------------------------------
                                       PARAGRAPH
                                    --------------------------------- */

                                    p: ({
                                        children,
                                    }) => (
                                        <p className="markdown-paragraph">
                                            {children}
                                        </p>
                                    ),

                                    /* ---------------------------------
                                       LINKS
                                    --------------------------------- */

                                    a: ({
                                        href,
                                        children,
                                    }) => (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="markdown-link"
                                        >
                                            {children}
                                        </a>
                                    ),

                                    /* ---------------------------------
                                       HEADINGS
                                    --------------------------------- */

                                    h1: ({
                                        children,
                                    }) => (
                                        <h1 className="markdown-heading">
                                            {children}
                                        </h1>
                                    ),

                                    h2: ({
                                        children,
                                    }) => (
                                        <h2 className="markdown-heading">
                                            {children}
                                        </h2>
                                    ),

                                    h3: ({
                                        children,
                                    }) => (
                                        <h3 className="markdown-heading">
                                            {children}
                                        </h3>
                                    ),

                                    /* ---------------------------------
                                       LISTS
                                    --------------------------------- */

                                    ul: ({
                                        children,
                                    }) => (
                                        <ul className="markdown-list">
                                            {children}
                                        </ul>
                                    ),

                                    ol: ({
                                        children,
                                    }) => (
                                        <ol className="markdown-list">
                                            {children}
                                        </ol>
                                    ),

                                    li: ({
                                        children,
                                    }) => (
                                        <li className="markdown-list-item">
                                            {children}
                                        </li>
                                    ),
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </>
            )}

            {/* =================================================
                ASSISTANT MESSAGE
            ================================================= */}

            {message.role === "assistant" && (
                <>
                    {/* =========================================
                        ASSISTANT IMAGES
                    ========================================= */}

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

                    {/* =========================================
                        ASSISTANT CONTENT
                    ========================================= */}

                    {message.content && (
                        <div
                            className="assistant-content"
                            dir="auto"
                        >
                            <ReactMarkdown
                                remarkPlugins={[
                                    remarkGfm,
                                ]}
                                components={{
                                    /* ---------------------------------
                                       PRE
                                    --------------------------------- */

                                    pre: ({
                                        children,
                                    }) => (
                                        <>{children}</>
                                    ),

                                    /* ---------------------------------
                                       INLINE / BLOCK CODE
                                    --------------------------------- */

                                    code: ({
                                        className,
                                        children,
                                        ...props
                                    }) => {
                                        const isCodeBlock =
                                            Boolean(
                                                className
                                            );
                                            ) ||
                                            (typeof children ===
                                                "string" &&
                                                children.includes(
                                                    "\n"
                                                ));

                                        /* -----------------------------
                                           INLINE CODE
                                        ----------------------------- */

                                        if (
                                            !isCodeBlock
                                        ) {
                                            return (
                                                <code
                                                    className="inline-code"
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            );
                                        }

                                        /* -----------------------------
                                           CODE BLOCK
                                        ----------------------------- */

                                        return (
                                            <CodeBlock
                                                className={
                                                    className
                                                }
                                            >
                                                {children}
                                            </CodeBlock>
                                        );
                                    },

                                    /* ---------------------------------
                                       PARAGRAPH
                                    --------------------------------- */

                                    p: ({
                                        children,
                                    }) => (
                                        <p className="markdown-paragraph">
                                            {children}
                                        </p>
                                    ),

                                    /* ---------------------------------
                                       LINKS
                                    --------------------------------- */

                                    a: ({
                                        href,
                                        children,
                                    }) => (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="markdown-link"
                                        >
                                            {children}
                                        </a>
                                    ),

                                    /* ---------------------------------
                                       HEADINGS
                                    --------------------------------- */

                                    h1: ({
                                        children,
                                    }) => (
                                        <h1 className="markdown-heading">
                                            {children}
                                        </h1>
                                    ),

                                    h2: ({
                                        children,
                                    }) => (
                                        <h2 className="markdown-heading">
                                            {children}
                                        </h2>
                                    ),

                                    h3: ({
                                        children,
                                    }) => (
                                        <h3 className="markdown-heading">
                                            {children}
                                        </h3>
                                    ),

                                    /* ---------------------------------
                                       LISTS
                                    --------------------------------- */

                                    ul: ({
                                        children,
                                    }) => (
                                        <ul className="markdown-list">
                                            {children}
                                        </ul>
                                    ),

                                    ol: ({
                                        children,
                                    }) => (
                                        <ol className="markdown-list">
                                            {children}
                                        </ol>
                                    ),

                                    li: ({
                                        children,
                                    }) => (
                                        <li className="markdown-list-item">
                                            {children}
                                        </li>
                                    ),
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>

                            {/* =====================================
                                COPY ENTIRE AI RESPONSE
                            ===================================== */}

                            <div className="message-actions">
                                <button
                                    type="button"
                                    className="message-copy-button"
                                    onClick={
                                        handleCopyMessage
                                    }
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