import "./ChatHeader.css";

interface ChatHeaderProps {
    title: string;
}

const ChatHeader = ({ title }: ChatHeaderProps) => {
    return (
        <header className="chat-header">
            <div className="chat-header-left">
                <h1 className="chat-header-title">{title}</h1>
            </div>

            <div className="chat-header-right">
                <button className="chat-header-action" type="button">
                    ⋮
                </button>
            </div>
        </header>
    );
};

export default ChatHeader;