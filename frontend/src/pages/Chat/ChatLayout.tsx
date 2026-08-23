import { useEffect, useState, useRef, useMemo } from "react";

import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

import {
    getChat,
    sendMessage,
    deleteChat,
} from "../../services/chat.service";

import { logoutUser } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

import { ChatMessage } from "../../types/chat.types";

import "./ChatLayout.css";

interface ChatSession {
    id: string;
    title?: string;
    messages: ChatMessage[];
    updatedAt?: string;
}

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

    // =========================================================
    // STATE
    // =========================================================

    const [messages, setMessages] = useState<ChatMessage[]>(
        []
    );

    const [chatSessions, setChatSessions] = useState<
        ChatSession[]
    >([]);

    const [activeChatId, setActiveChatId] = useState<
        string | null
    >(() => {
        return localStorage.getItem("activeChatId");
    });

    const [loading, setLoading] = useState(true);

    const [sending, setSending] = useState(false);

    // Sidebar open / close
    const [isSidebarOpen, setIsSidebarOpen] =
        useState(true);

    const abortControllerRef =
        useRef<AbortController | null>(null);

    // =========================================================
    // GET ALL CHATS
    // =========================================================

    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);

            try {
                const response = await getChat();

                const sessions = response.data || [];

                const formattedSessions =
                    sessions.map((session: any) => ({
                        id: session._id,

                        title: getChatTitle(
                            session.messages || []
                        ),

                        messages:
                            session.messages || [],

                        updatedAt:
                            session.updatedAt,
                    }));

                setChatSessions(formattedSessions);

                // =================================================
                // OPEN SAVED CHAT
                // =================================================

                if (formattedSessions.length > 0) {
                    const savedChatId =
                        localStorage.getItem(
                            "activeChatId"
                        );

                    const savedChat =
                        formattedSessions.find(
                            (
                                session: ChatSession
                            ) =>
                                session.id ===
                                savedChatId
                        );

                    if (savedChat) {
                        setActiveChatId(
                            savedChat.id
                        );

                        setMessages(
                            savedChat.messages
                        );
                    } else {
                        const firstChat =
                            formattedSessions[0];

                        setActiveChatId(
                            firstChat.id
                        );

                        setMessages(
                            firstChat.messages
                        );

                        localStorage.setItem(
                            "activeChatId",
                            firstChat.id
                        );
                    }
                } else {
                    setActiveChatId(null);

                    setMessages([]);

                    localStorage.removeItem(
                        "activeChatId"
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to load chat sessions:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    // =========================================================
    // ACTIVE CHAT TITLE
    // =========================================================

    const activeChatTitle = useMemo(() => {
        const current = chatSessions.find(
            (session) =>
                session.id === activeChatId
        );

        return current?.title || "New Chat";
    }, [activeChatId, chatSessions]);

    // =========================================================
    // NEW CHAT
    // =========================================================

    const handleNewChat = () => {
        setMessages([]);

        setActiveChatId(null);

        localStorage.removeItem(
            "activeChatId"
        );

        // على الموبايل نسكر الـ Sidebar
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
    };

    // =========================================================
    // SELECT EXISTING CHAT
    // =========================================================

    const handleSelectChat = (
        chatId: string
    ) => {
        const selectedSession =
            chatSessions.find(
                (session: ChatSession) =>
                    session.id === chatId
            );

        if (!selectedSession) {
            return;
        }

        setActiveChatId(chatId);

        setMessages(
            selectedSession.messages
        );

        localStorage.setItem(
            "activeChatId",
            chatId
        );

        // على الموبايل نسكر الـ Sidebar
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
    };

    // =========================================================
    // DELETE CHAT
    // =========================================================

    const handleDeleteChat = async (
        chatId: string
    ) => {
        const chatToDelete =
            chatSessions.find(
                (session) =>
                    session.id === chatId
            );

        if (!chatToDelete) {
            return;
        }

        try {
            await deleteChat(chatId);

            const remainingSessions =
                chatSessions.filter(
                    (session) =>
                        session.id !== chatId
                );

            setChatSessions(
                remainingSessions
            );

            // =================================================
            // IF CURRENT CHAT WAS DELETED
            // =================================================

            if (activeChatId === chatId) {
                if (
                    remainingSessions.length >
                    0
                ) {
                    const nextSession =
                        remainingSessions[0];

                    setActiveChatId(
                        nextSession.id
                    );

                    setMessages(
                        nextSession.messages
                    );

                    localStorage.setItem(
                        "activeChatId",
                        nextSession.id
                    );
                } else {
                    setActiveChatId(null);

                    setMessages([]);

                    localStorage.removeItem(
                        "activeChatId"
                    );
                }
            }
        } catch (error) {
            console.error(
                "Failed to delete chat:",
                error
            );

            window.alert(
                "Failed to delete chat. Please try again."
            );
        }
    };

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = async () => {
        try {
            const refreshToken =
                localStorage.getItem(
                    "refreshToken"
                );

            if (refreshToken) {
                await logoutUser(
                    refreshToken
                );
            }
        } catch (error) {
            console.error(
                "Failed to logout:",
                error
            );
        } finally {
            logout();
        }
    };

    // =========================================================
    // SEND MESSAGE
    // =========================================================

    const handleSendMessage = async (
        prompt: string,
        images: File[]
    ) => {
        if (
            !prompt.trim() &&
            images.length === 0
        ) {
            return;
        }

        // =====================================================
        // ABORT CONTROLLER
        // =====================================================

        const controller =
            new AbortController();

        abortControllerRef.current =
            controller;

        setSending(true);

        // =====================================================
        // LOCAL IMAGE PREVIEW
        // =====================================================

        const previewImageUrls =
            images.map((image) =>
                URL.createObjectURL(image)
            );

        const userMessage: ChatMessage = {
            role: "user",

            content: prompt,

            ...(previewImageUrls.length >
                0 && {
                images:
                    previewImageUrls.map(
                        (url) => ({
                            url,
                        })
                    ),
            }),
        };

        // =====================================================
        // SHOW USER MESSAGE
        // =====================================================

        const nextMessages = [
            ...messages,
            userMessage,
        ];

        setMessages(nextMessages);

        // =====================================================
        // SEND TO BACKEND
        // =====================================================

        try {
            const response =
                await sendMessage(
                    prompt,
                    images,
                    activeChatId ||
                        undefined,
                    controller.signal
                );

            const responseData =
                response.data;

            // =================================================
            // CHAT ID
            // =================================================

            const newChatId =
                responseData.chatId;

            // =================================================
            // AI RESPONSE
            // =================================================

            const aiResponseText =
                responseData.response;

            // =================================================
            // CLOUDINARY IMAGES
            // =================================================

            const cloudinaryImages =
                responseData.images || [];

            // =================================================
            // REVOKE LOCAL PREVIEW URLS
            // =================================================

            previewImageUrls.forEach(
                (url) => {
                    URL.revokeObjectURL(
                        url
                    );
                }
            );

            // =================================================
            // SAVED USER MESSAGE
            // =================================================

            const savedUserMessage: ChatMessage =
                {
                    role: "user",

                    content: prompt,

                    ...(cloudinaryImages.length >
                        0 && {
                        images:
                            cloudinaryImages,
                    }),
                };

            // =================================================
            // AI MESSAGE
            // =================================================

            const assistantMessage: ChatMessage =
                {
                    role: "assistant",

                    content:
                        aiResponseText,
                };

            // =================================================
            // FINAL MESSAGES
            // =================================================

            const finalMessages = [
                ...messages,
                savedUserMessage,
                assistantMessage,
            ];

            setMessages(
                finalMessages
            );

            // =================================================
            // SET ACTIVE CHAT
            // =================================================

            setActiveChatId(
                newChatId
            );

            localStorage.setItem(
                "activeChatId",
                newChatId
            );

            // =================================================
            // UPDATE SIDEBAR
            // =================================================

            setChatSessions(
                (prevSessions) => {
                    const existingIndex =
                        prevSessions.findIndex(
                            (session) =>
                                session.id ===
                                newChatId
                        );

                    const updatedSession: ChatSession =
                        {
                            id: newChatId,

                            title: getChatTitle(
                                finalMessages
                            ),

                            messages:
                                finalMessages,
                        };

                    // Chat موجود
                    if (
                        existingIndex >= 0
                    ) {
                        const updated = [
                            ...prevSessions,
                        ];

                        updated[
                            existingIndex
                        ] =
                            updatedSession;

                        return updated;
                    }

                    // Chat جديد
                    return [
                        updatedSession,
                        ...prevSessions,
                    ];
                }
            );
        } catch (error: any) {
            if (
                error.name ===
                    "CanceledError" ||
                error.name ===
                    "AbortError"
            ) {
                console.log(
                    "🛑 تم إيقاف البحث."
                );
            } else {
                console.error(
                    "Failed to send message:",
                    error
                );
            }
        } finally {
            setSending(false);

            abortControllerRef.current =
                null;
        }
    };

    // =========================================================
    // STOP GENERATION
    // =========================================================

    const handleStop = () => {
        if (
            abortControllerRef.current
        ) {
            abortControllerRef.current.abort();

            setSending(false);
        }
    };

    // =========================================================
    // SIDEBAR DATA
    // =========================================================

    const formattedSidebarSessions =
        chatSessions.map(
            (session) => ({
                id: session.id,

                title:
                    session.title ||
                    "New Chat",

                messages:
                    session.messages,
            })
        );

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="chat-layout">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <Sidebar
                user={user}
                chatSessions={
                    formattedSidebarSessions
                }
                activeChatId={
                    activeChatId || ""
                }
                isOpen={
                    isSidebarOpen
                }
                onToggle={() =>
                    setIsSidebarOpen(
                        !isSidebarOpen
                    )
                }
                onSelectChat={
                    handleSelectChat
                }
                onNewChat={
                    handleNewChat
                }
                onDeleteChat={
                    handleDeleteChat
                }
                onLogout={
                    handleLogout
                }
            />

            {/* =================================================
                MOBILE OVERLAY
            ================================================= */}

            {isSidebarOpen && (
                <div
                    className="mobile-sidebar-overlay"
                    onClick={() =>
                        setIsSidebarOpen(
                            false
                        )
                    }
                    aria-hidden="true"
                />
            )}

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="chat-main">

                {/* =============================================
                    OPEN SIDEBAR BUTTON
                ============================================= */}

                {!isSidebarOpen && (
                    <button
                        type="button"
                        onClick={() =>
                            setIsSidebarOpen(
                                true
                            )
                        }
                        className="sidebar-open-trigger-btn"
                        title="Open sidebar"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                            />

                            <path d="M9 3v18" />
                        </svg>
                    </button>
                )}

                {/* =============================================
                    HEADER
                ============================================= */}

                <ChatHeader
                    title={
                        activeChatTitle
                    }
                />

                {/* =============================================
                    MESSAGES
                ============================================= */}

                <MessageList
                    messages={
                        messages
                    }
                    loading={
                        loading
                    }
                    sending={
                        sending
                    }
                />

                {/* =============================================
                    INPUT
                ============================================= */}

                <ChatInput
                    onSend={
                        handleSendMessage
                    }
                    onStop={
                        handleStop
                    }
                    sending={
                        sending
                    }
                />

            </main>
        </div>
    );
};

export default ChatLayout;