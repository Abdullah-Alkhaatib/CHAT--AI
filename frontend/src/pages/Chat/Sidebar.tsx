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
    onLogout,
}: SidebarProps) => {
    const userInitial =
        user?.name?.charAt(0)?.toUpperCase() || "A";

    return (
        <aside
            className={`sidebar ${
                !isOpen ? "sidebar-closed" : ""
            }`}
        >
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

            <div className="sidebar-chat-history">
                <p className="sidebar-history-title">
                    Recent Chats
                </p>

                <div className="sidebar-chat-list">
                    {chatSessions.map((session) => (
                        <div
                            key={session.id}
                            className={`sidebar-chat-row ${
                                session.id === activeChatId
                                    ? "sidebar-chat-row-active"
                                    : ""
                            }`}
                        >
                            <button
                                type="button"
                                className={`sidebar-chat-item ${
                                    session.id === activeChatId
                                        ? "sidebar-chat-item-active"
                                        : ""
                                }`}
                                onClick={() =>
                                    onSelectChat(session.id)
                                }
                            >
                                <span className="sidebar-chat-item-title">
                                    {session.title}
                                </span>
                            </button>

                            <button
                                type="button"
                                className="sidebar-delete-chat-button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onDeleteChat(session.id);
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
                        </div>
                    ))}
                </div>
            </div>

            <div className="sidebar-footer">
                <div className="sidebar-user-profile">
                    <div className="sidebar-user-avatar">
                        {userInitial}
                    </div>

                    <div className="sidebar-user-info">
                        <span className="sidebar-user-name">
                            {user?.name || "Guest User"}
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