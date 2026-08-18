import { useEffect, useMemo, useRef, useState } from "react";

import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

import { getChat, sendMessage } from "../../services/chat.service";
import { logoutUser } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";
import { ChatMessage } from "../../types/chat.types";

import "./ChatLayout.css";

interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
}

const ACTIVE_CHAT_KEY_PREFIX = "chat-active-id";
const CHAT_SESSIONS_KEY_PREFIX = "chat-sessions";

const getStoredChatSessions = (
    sessionsStorageKey: string
): ChatSession[] => {
    try {
        const saved = localStorage.getItem(sessionsStorageKey);
        const parsedSessions: ChatSession[] = saved
            ? JSON.parse(saved)
            : [];

        return parsedSessions.map((session) => ({
            ...session,
            messages: session.messages.map((message) => {
                if (!message.imgUrls?.length) {
                    return message;
                }

                const safeImgUrls = message.imgUrls.filter(
                    (imageUrl) => !imageUrl.startsWith("blob:")
                );

                const { imgUrls, ...restMessage } = message;

                return {
                    ...restMessage,
                    ...(safeImgUrls.length > 0 && {
                        imgUrls: safeImgUrls,
                    }),
                };
            }),
        }));
    } catch (error) {
        console.error("Failed to read stored chat sessions:", error);
        return [];
    }
};

const getStoredActiveChatId = (activeChatStorageKey: string) => {
    const storedId = localStorage.getItem(activeChatStorageKey);

    return storedId || "saved-chat";
};

const getChatTitle = (chatMessages: ChatMessage[]) => {
    const firstUserPrompt = chatMessages.find(
        (message) => message.role === "user"
    )?.content;

    if (!firstUserPrompt) {
        return "New Chat";
    }

    const trimmed = firstUserPrompt.trim();

    return trimmed.length > 28
        ? `${trimmed.slice(0, 28)}...`
        : trimmed;
};

const ChatLayout = () => {
    const { user, logout } = useAuth();
    const storageScope = user?.id || user?.email || "guest";
    const activeChatStorageKey =
        `${ACTIVE_CHAT_KEY_PREFIX}:${storageScope}`;
    const chatSessionsStorageKey =
        `${CHAT_SESSIONS_KEY_PREFIX}:${storageScope}`;

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [activeChatId, setActiveChatId] = useState<string>("saved-chat");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // مرجع للتحكم بإلغاء الطلب (AbortController)
    const abortControllerRef = useRef<AbortController | null>(null);

    const activeChatTitle = useMemo(() => {
        const current = chatSessions.find(
            (session) => session.id === activeChatId
        );

        return current?.title || "New Chat";
    }, [activeChatId, chatSessions]);

    const syncCurrentSession = (
        nextMessages: ChatMessage[],
        targetId?: string
    ) => {
        const resolvedId = targetId || activeChatId;
        const normalizedId = resolvedId || `chat-${Date.now()}`;

        setChatSessions((previousSessions) => {
            const existing = previousSessions.find(
                (session) => session.id === normalizedId
            );

            const updatedSessions = existing
                ? previousSessions.map((session) =>
                      session.id === normalizedId
                          ? {
                                ...session,
                                title: getChatTitle(nextMessages),
                                messages: nextMessages,
                            }
                          : session
                  )
                : [
                      {
                          id: normalizedId,
                          title: getChatTitle(nextMessages),
                          messages: nextMessages,
                      },
                      ...previousSessions,
                  ];

            localStorage.setItem(
                chatSessionsStorageKey,
                JSON.stringify(updatedSessions)
            );

            return updatedSessions;
        });
    };

    const handleNewChat = () => {
        const newChatId = `chat-${Date.now()}`;
        setMessages([]);
        setActiveChatId(newChatId);
        localStorage.setItem(activeChatStorageKey, newChatId);
    };

    const handleSelectChat = (chatId: string) => {
        const selectedSession = chatSessions.find(
            (session) => session.id === chatId
        );

        if (!selectedSession) {
            return;
        }

        setActiveChatId(chatId);
        localStorage.setItem(activeChatStorageKey, chatId);
        setMessages(selectedSession.messages);
    };

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");

            if (refreshToken) {
                await logoutUser(refreshToken);
            }
        } catch (error) {
            console.error("Failed to logout:", error);
        } finally {
            logout();
        }
    };

    useEffect(() => {
        const loadChat = async () => {
            setLoading(true);

            const storedSessions = getStoredChatSessions(
                chatSessionsStorageKey
            );
            const storedActiveId = getStoredActiveChatId(
                activeChatStorageKey
            );

            setChatSessions(storedSessions);
            setActiveChatId(storedActiveId);

            try {
                const response = await getChat();
                const loadedMessages = response.data.messages || [];
                let updatedSessions = storedSessions;

                if (loadedMessages.length > 0) {
                    const loadedSession: ChatSession = {
                        id: "saved-chat",
                        title: getChatTitle(loadedMessages),
                        messages: loadedMessages,
                    };

                    const withoutSaved = updatedSessions.filter(
                        (session) => session.id !== "saved-chat"
                    );

                    updatedSessions = [loadedSession, ...withoutSaved];
                }

                setChatSessions(updatedSessions);

                localStorage.setItem(
                    chatSessionsStorageKey,
                    JSON.stringify(updatedSessions)
                );

                if (storedActiveId && storedActiveId !== "saved-chat") {
                    const currentStoredSession = updatedSessions.find(
                        (session) => session.id === storedActiveId
                    );

                    if (currentStoredSession) {
                        setMessages(currentStoredSession.messages);
                        const withoutCurrent = updatedSessions.filter(
                            (session) => session.id !== storedActiveId
                        );

                        const reorderedSessions = [
                            currentStoredSession,
                            ...withoutCurrent,
                        ];

                        setChatSessions(reorderedSessions);

                        localStorage.setItem(
                            chatSessionsStorageKey,
                            JSON.stringify(reorderedSessions)
                        );

                        setActiveChatId(storedActiveId);
                        setLoading(false);
                        return;
                    }

                    setMessages([]);
                    setActiveChatId(storedActiveId);
                    setLoading(false);
                    return;
                }

                setMessages(loadedMessages);

                if (loadedMessages.length > 0) {
                    setActiveChatId("saved-chat");
                    localStorage.setItem(
                        activeChatStorageKey,
                        "saved-chat"
                    );
                }
            } catch (error) {
                console.error("Failed to load chat:", error);
            } finally {
                setLoading(false);
            }
        };

        loadChat();
    }, [activeChatStorageKey, chatSessionsStorageKey]);

    const handleSendMessage = async (
        prompt: string,
        images: File[]
    ) => {
        if (!prompt.trim() && images.length === 0) {
            return;
        }

        // إنشاء AbortController جديد لكل طلب إرسال
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setSending(true);

        const previewImageUrls = images.map((image) =>
            URL.createObjectURL(image)
        );

        const userMessage: ChatMessage = {
            role: "user",
            content: prompt,
        };

        if (previewImageUrls.length > 0) {
            userMessage.imgUrls = previewImageUrls;
        }

        const nextMessages = [...messages, userMessage];
        setMessages(nextMessages);
        syncCurrentSession(nextMessages);

        try {
            // تمرير الـ signal لخدمة الإرسال لكي يتم إلغاؤها عند الطلب
            const response = await sendMessage(prompt, images, controller.signal);
            const cloudinaryImageUrls = response.data.imgUrls || [];

            if (cloudinaryImageUrls.length > 0) {
                previewImageUrls.forEach((imageUrl) => {
                    URL.revokeObjectURL(imageUrl);
                });
            }

            const persistedUserMessage: ChatMessage = {
                ...userMessage,
                ...(cloudinaryImageUrls.length > 0 && {
                    imgUrls: cloudinaryImageUrls,
                }),
            };

            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.data.response,
            };

            const finalMessages = [
                ...messages,
                persistedUserMessage,
                assistantMessage,
            ];
            setMessages(finalMessages);
            syncCurrentSession(finalMessages);
        } catch (error: any) {
            // التحقق مما إذا تم إلغاء الطلب بواسطة المستخدم
            if (error.name === "CanceledError" || error.name === "AbortError") {
                console.log("🛑 تم إيقاف البحث بنجاح.");
            } else {
                console.error("Failed to send message:", error);
            }
        } finally {
            setSending(false);
            abortControllerRef.current = null;
        }
    };

    // دالة إيقاف الطلب عند الضغط على زر الإيقاف (المربع الصغير)
    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort(); // قطع الاتصال فوراً
            setSending(false);
        }
    };

    return (
        <div className="chat-layout">
            <Sidebar
                user={user}
                chatSessions={chatSessions}
                activeChatId={activeChatId}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                onLogout={handleLogout}
            />

            <main className="chat-main">
                <ChatHeader title={activeChatTitle} />

                <MessageList
                    messages={messages}
                    loading={loading}
                />

                <ChatInput
                    onSend={handleSendMessage}
                    onStop={handleStop}
                    sending={sending}
                />
            </main>
        </div>
    );
};

export default ChatLayout;