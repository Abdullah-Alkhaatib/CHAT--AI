import { useEffect, useRef, useState } from "react";

import { ChatMessage } from "../../types/chat.types";

import Message from "./Message";

import "./MessageList.css";

interface MessageListProps {
    messages: ChatMessage[];
    loading: boolean;
}

const MessageList = ({
    messages,
    loading,
}: MessageListProps) => {
    const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
    const [highlightedMessageIndex, setHighlightedMessageIndex] =
        useState<number | null>(null);
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const previousMessageCountRef = useRef(0);

    useEffect(() => {
        const scroller = scrollerRef.current;

        if (!scroller) {
            return;
        }

        scroller.scrollTo({
            top: scroller.scrollHeight,
            behavior: "smooth",
        });
    }, [messages, loading]);

    useEffect(() => {
        if (loading) {
            previousMessageCountRef.current = messages.length;
            return;
        }

        const previousCount = previousMessageCountRef.current;

        if (messages.length > previousCount && messages.length > 0) {
            const newestIndex = messages.length - 1;
            setHighlightedMessageIndex(newestIndex);

            const timer = window.setTimeout(() => {
                setHighlightedMessageIndex((current) =>
                    current === newestIndex ? null : current
                );
            }, 1800);

            previousMessageCountRef.current = messages.length;

            return () => {
                window.clearTimeout(timer);
            };
        }

        previousMessageCountRef.current = messages.length;
    }, [messages, loading]);

    if (loading) {
        return (
            <div className="message-list" ref={scrollerRef}>
                <div className="message-list-container">
                    <p className="message-list-loading">
                        Loading chat...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="message-list" ref={scrollerRef}>
            <div className="message-list-container">
                {messages.map((message, index) => (
                    <Message
                        key={`${message.role}-${index}`}
                        message={message}
                        isNew={index === highlightedMessageIndex}
                        onImageClick={setZoomedImageUrl}
                    />
                ))}
            </div>

            {zoomedImageUrl && (
                <button
                    type="button"
                    className="message-image-modal"
                    aria-label="Close image preview"
                    onClick={() => setZoomedImageUrl(null)}
                >
                    <img
                        className="message-image-modal-content"
                        src={zoomedImageUrl}
                        alt="Zoomed chat attachment"
                    />
                </button>
            )}
        </div>
    );
};

export default MessageList;