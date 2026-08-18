import { User } from "../../types/auth.types";
import "./Sidebar.css";

interface ChatSessionSummary {
    id: string;
    title: string;
    messages: Array<{ role: string; content: string }>;
}

interface SidebarProps {
    user: User | null;
    chatSessions: ChatSessionSummary[];
    activeChatId: string;
    isOpen: boolean; // أضفنا هذه
    onToggle: () => void; // وأضفنا هذه للتحكم بالفتح والإغلاق
    onSelectChat: (chatId: string) => void;
    onNewChat: () => void;
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
    onLogout,
}: SidebarProps) => {
    const userInitial = user?.name?.charAt(0)?.toUpperCase() || "A";

    return (
        <aside className={`sidebar ${!isOpen ? "sidebar-closed" : ""}`}>
            <div className="sidebar-header">
                <button
                    type="button"
                    className="sidebar-new-chat-button"
                    onClick={onNewChat}
                >
                    <span className="sidebar-new-chat-icon">+</span>
                    <span className="sidebar-new-chat-text">New Chat</span>
                </button>

                {/* زر إغلاق السايدبار */}
                <button
                    type="button"
                    className="sidebar-toggle-button"
                    onClick={onToggle}
                    title="Close sidebar"
                >
                    {/* أيقونة الإغلاق (يمكنك استبدالها بـ SVG) */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M9 3v18" />
                    </svg>
                </button>
            </div>

            <div className="sidebar-chat-history">
                <p className="sidebar-history-title">Recent Chats</p>

                <div className="sidebar-chat-list">
                    {chatSessions.map((session) => (
                        <button
                            key={session.id}
                            type="button"
                            className={`sidebar-chat-item ${
                                session.id === activeChatId
                                    ? "sidebar-chat-item-active"
                                    : ""
                            }`}
                            onClick={() => onSelectChat(session.id)}
                        >
                            <span className="sidebar-chat-item-title">
                                {session.title}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="sidebar-footer">
                <div className="sidebar-user-profile">
                    <div className="sidebar-user-avatar">{userInitial}</div>
                    <div className="sidebar-user-info">
                        <span className="sidebar-user-name">
                            {user?.name || "Guest User"}
                        </span>
                        <span className="sidebar-user-email">
                            {user?.email || "guest@example.com"}
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