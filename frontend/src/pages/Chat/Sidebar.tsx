import {
    useEffect,
    useRef,
    useState,
} from "react";

import { User } from "../../types/auth.types";

import "./Sidebar.css";

interface ChatSessionSummary {
    id: string;

    title: string;

    messages: Array<{
        role: string;
        content: string;
    }>;
}

interface SidebarProps {
    user: User | null;

    chatSessions: ChatSessionSummary[];

    activeChatId: string;

    isOpen: boolean;

    onToggle: () => void;

    onSelectChat: (chatId: string) => void;

    onNewChat: () => void;

    onDeleteChat: (chatId: string) => void;

    onEditChat: (
        chatId: string,
        title: string
    ) => Promise<void>;

    onLogout: () => void;
}

const Sidebar = ({
    user,
    chatSessions,
    activeChatId,
    isOpen,
    onToggle,
    onSelectChat,
    onNewChat,
    onDeleteChat,
    onEditChat,
    onLogout,
}: SidebarProps) => {

    const userInitial =
        user?.name?.charAt(0)?.toUpperCase() || "A";

    const [editingChatId, setEditingChatId] =
        useState<string | null>(null);

    const [editingTitle, setEditingTitle] =
        useState("");

    const editInputRef =
        useRef<HTMLInputElement | null>(null);


    // =========================================================
    // FOCUS EDIT INPUT
    // =========================================================

    useEffect(() => {
        if (editingChatId) {
            editInputRef.current?.focus();

            editInputRef.current?.select();
        }
    }, [editingChatId]);


    // =========================================================
    // START EDIT
    // =========================================================

    const handleStartEdit = (
        event: React.MouseEvent,
        session: ChatSessionSummary
    ) => {
        event.stopPropagation();

        setEditingChatId(session.id);

        setEditingTitle(session.title);
    };


    // =========================================================
    // CANCEL EDIT
    // =========================================================

    const handleCancelEdit = () => {
        setEditingChatId(null);

        setEditingTitle("");
    };


    // =========================================================
    // SAVE EDIT
    // =========================================================

    const handleSaveEdit = async (
        event?: React.FormEvent
    ) => {
        event?.preventDefault();

        if (!editingChatId) {
            return;
        }

        const trimmedTitle =
            editingTitle.trim();

        if (!trimmedTitle) {
            return;
        }

        try {
            await onEditChat(
                editingChatId,
                trimmedTitle
            );

            setEditingChatId(null);

            setEditingTitle("");
        } catch (error) {
            console.error(
                "Failed to edit chat:",
                error
            );
        }
    };


    // =========================================================
    // KEYBOARD
    // =========================================================

    const handleEditKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Enter") {
            event.preventDefault();

            handleSaveEdit();
        }

        if (event.key === "Escape") {
            event.preventDefault();

            handleCancelEdit();
        }
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <aside
            className={`sidebar ${
                !isOpen
                    ? "sidebar-closed"
                    : ""
            }`}
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="sidebar-header">

                <button
                    type="button"
                    className="sidebar-new-chat-button"
                    onClick={onNewChat}
                >
                    <span className="sidebar-new-chat-icon">
                        +
                    </span>

                    <span className="sidebar-new-chat-text">
                        New Chat
                    </span>
                </button>


                <button
                    type="button"
                    className="sidebar-toggle-button"
                    onClick={onToggle}
                    title="Close sidebar"
                    aria-label="Close sidebar"
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

            </div>


            {/* =================================================
                CHAT HISTORY
            ================================================= */}

            <div className="sidebar-chat-history">

                <p className="sidebar-history-title">
                    Recent Chats
                </p>


                <div className="sidebar-chat-list">

                    {chatSessions.map(
                        (session) => (

                            <div
                                key={session.id}
                                className={`sidebar-chat-row ${
                                    session.id ===
                                    activeChatId
                                        ? "sidebar-chat-row-active"
                                        : ""
                                }`}
                            >

                                {/* =================================================
                                    CHAT / EDIT
                                ================================================= */}

                                {editingChatId ===
                                session.id ? (

                                    <form
                                        className="sidebar-edit-form"
                                        onSubmit={
                                            handleSaveEdit
                                        }
                                        onClick={(
                                            event
                                        ) =>
                                            event.stopPropagation()
                                        }
                                    >

                                        <input
                                            ref={
                                                editInputRef
                                            }
                                            type="text"
                                            className="sidebar-edit-input"
                                            value={
                                                editingTitle
                                            }
                                            maxLength={100}
                                            onChange={(
                                                event
                                            ) =>
                                                setEditingTitle(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            onKeyDown={
                                                handleEditKeyDown
                                            }
                                            aria-label="Edit chat title"
                                        />

                                        <button
                                            type="submit"
                                            className="sidebar-save-edit-button"
                                            title="Save"
                                            aria-label="Save chat title"
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </button>


                                        <button
                                            type="button"
                                            className="sidebar-cancel-edit-button"
                                            onClick={(
                                                event
                                            ) => {
                                                event.stopPropagation();

                                                handleCancelEdit();
                                            }}
                                            title="Cancel"
                                            aria-label="Cancel editing"
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <line
                                                    x1="18"
                                                    y1="6"
                                                    x2="6"
                                                    y2="18"
                                                />

                                                <line
                                                    x1="6"
                                                    y1="6"
                                                    x2="18"
                                                    y2="18"
                                                />
                                            </svg>
                                        </button>

                                    </form>

                                ) : (

                                    <>
                                        <button
                                            type="button"
                                            className={`sidebar-chat-item ${
                                                session.id ===
                                                activeChatId
                                                    ? "sidebar-chat-item-active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                onSelectChat(
                                                    session.id
                                                )
                                            }
                                        >

                                            <span className="sidebar-chat-item-title">
                                                {
                                                    session.title
                                                }
                                            </span>

                                        </button>


                                        {/* =================================================
                                            EDIT BUTTON
                                        ================================================= */}

                                        <button
                                            type="button"
                                            className="sidebar-edit-chat-button"
                                            onClick={(
                                                event
                                            ) =>
                                                handleStartEdit(
                                                    event,
                                                    session
                                                )
                                            }
                                            title="Edit chat"
                                            aria-label={`Edit ${session.title}`}
                                        >

                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M12 20h9" />

                                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                            </svg>

                                        </button>


                                        {/* =================================================
                                            DELETE BUTTON
                                        ================================================= */}

                                        <button
                                            type="button"
                                            className="sidebar-delete-chat-button"
                                            onClick={(
                                                event
                                            ) => {
                                                event.stopPropagation();

                                                onDeleteChat(
                                                    session.id
                                                );
                                            }}
                                            title="Delete chat"
                                            aria-label={`Delete ${session.title}`}
                                        >

                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="3 6 5 6 21 6" />

                                                <path d="M19 6l-1 14H6L5 6" />

                                                <path d="M10 11v5" />

                                                <path d="M14 11v5" />

                                                <path d="M9 6V4h6v2" />
                                            </svg>

                                        </button>

                                    </>

                                )}

                            </div>

                        )
                    )}

                </div>

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="sidebar-footer">

                <div className="sidebar-user-profile">

                    <div className="sidebar-user-avatar">
                        {userInitial}
                    </div>


                    <div className="sidebar-user-info">

                        <span className="sidebar-user-name">
                            {user?.name ||
                                "Guest User"}
                        </span>

                        <span className="sidebar-user-email">
                            {user?.email ||
                                "guest@example.com"}
                        </span>

                    </div>

                </div>


                <button
                    type="button"
                    className="sidebar-logout-button"
                    onClick={onLogout}
                >
                    Logout
                </button>

            </div>

        </aside>
    );
};

export default Sidebar;