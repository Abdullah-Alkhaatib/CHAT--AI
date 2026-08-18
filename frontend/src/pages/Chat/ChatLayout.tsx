import { useEffect, useState, useRef, useMemo } from "react";
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
    return trimmed.length > 28 ? `${trimmed.slice(0, 28)}...` : trimmed;
};

const ChatLayout = () => {
    const { user, logout } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    
    // State للتحكم بفتح وإغلاق السايدبار
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const abortControllerRef = useRef<AbortController | null>(null);

    // جلب قائمة الشاتات عند فتح الصفحة أو تسجيل الدخول
    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);
            try {
                const response = await getChat();
                const sessions = response.data || [];
                
                const formattedSessions = sessions.map((session: any) => ({
                    id: session._id,
                    title: getChatTitle(session.messages || []),
                    messages: session.messages || [],
                }));
                setChatSessions(formattedSessions);

                if (formattedSessions.length > 0) {
                    setActiveChatId(formattedSessions[0].id);
                    setMessages(formattedSessions[0].messages);
                }
            } catch (error) {
                console.error("Failed to load chat sessions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const activeChatTitle = useMemo(() => {
        const current = chatSessions.find(
            (session: any) => session.id === activeChatId
        );
        return current?.title || "New Chat";
    }, [activeChatId, chatSessions]);

    // زر New Chat
    const handleNewChat = () => {
        setMessages([]);
        setActiveChatId(null);
    };

    // اختيار شات قديم من القائمة الجانبية
    const handleSelectChat = (chatId: string) => {
        const selectedSession = chatSessions.find(
            (session: any) => session.id === chatId
        );

        if (!selectedSession) return;

        setActiveChatId(chatId);
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

    // إرسال رسالة
    const handleSendMessage = async (prompt: string, images: File[]) => {
        if (!prompt.trim() && images.length === 0) return;

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setSending(true);

        const previewImageUrls = images.map((image) => URL.createObjectURL(image));
        const userMessage: ChatMessage = {
            role: "user",
            content: prompt,
            ...(previewImageUrls.length > 0 && { imgUrls: previewImageUrls }),
        };

        const nextMessages = [...messages, userMessage];
        setMessages(nextMessages);

        try {
            const response = await sendMessage(prompt, images, activeChatId || undefined, controller.signal);
            const responseData = response.data;
            const newChatId = responseData.chatId;
            const aiResponseText = responseData.response;
            const cloudinaryImageUrls = responseData.imgUrls || [];

            if (cloudinaryImageUrls.length > 0) {
                previewImageUrls.forEach((url) => URL.revokeObjectURL(url));
            }

            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: aiResponseText,
            };

            const finalMessages = [...messages, userMessage, assistantMessage];
            setMessages(finalMessages);
            setActiveChatId(newChatId);

            setChatSessions((prevSessions) => {
                const existingIndex = prevSessions.findIndex((s) => s.id === newChatId);
                const updatedSession: ChatSession = {
                    id: newChatId,
                    title: getChatTitle(finalMessages),
                    messages: finalMessages,
                };

                if (existingIndex >= 0) {
                    const updated = [...prevSessions];
                    updated[existingIndex] = updatedSession;
                    return updated;
                } else {
                    return [updatedSession, ...prevSessions];
                }
            });

        } catch (error: any) {
            if (error.name === "CanceledError" || error.name === "AbortError") {
                console.log("🛑 تم إيقاف البحث.");
            } else {
                console.error("Failed to send message:", error);
            }
        } finally {
            setSending(false);
            abortControllerRef.current = null;
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setSending(false);
        }
    };

    const formattedSidebarSessions = chatSessions.map((session: any) => ({
        id: session.id,
        title: session.title,
        messages: session.messages,
    }));

    return (
        <div className="chat-layout">
            <Sidebar
                user={user}
                chatSessions={formattedSidebarSessions}
                activeChatId={activeChatId || ""}
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                onLogout={handleLogout}
            />

            <main className="chat-main">
                {/* زر فتح السايدبار يظهر فقط عندما يكون السايدبار مغلقاً */}
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="sidebar-open-trigger-btn"
                        title="Open sidebar"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M9 3v18" />
                        </svg>
                    </button>
                )}

                <ChatHeader title={activeChatTitle} />
                <MessageList messages={messages} loading={loading} />
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