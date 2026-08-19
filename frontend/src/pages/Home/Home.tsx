import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [showAuthModal, setShowAuthModal] = useState(false);

    // محاكاة لإرسال رسالة من قبل زائر غير مسجل
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        
        // إظهار نافذة تسجيل الدخول إذا حاول الكتابة
        setShowAuthModal(true);
    };

    return (
        <div className="home-chat-container">
            {/* محاكاة للشات الحقيقي */}
            <aside className="home-sidebar">
                <div className="home-sidebar-top">
                    <h2>AI Chat</h2>
                    <button className="home-new-chat" onClick={() => setShowAuthModal(true)}>
                        + New chat
                    </button>
                </div>
                <div className="home-sidebar-footer">
                    <button className="home-auth-link" onClick={() => navigate("/login")}>
                        Login
                    </button>
                    <button className="home-auth-btn" onClick={() => navigate("/register")}>
                        Sign up
                    </button>
                </div>
            </aside>

            <main className="home-main">
                <header className="home-header">
                    <span>AI Assistant Preview</span>
                    <div className="home-header-actions">
                        <button onClick={() => navigate("/login")} className="home-login-top">
                            Login
                        </button>
                    </div>
                </header>

                <div className="home-chat-content">
                    <div className="home-welcome-box">
                        <h1>What can I help with?</h1>
                        <p>Chat with an intelligent assistant, upload images, and explore features.</p>
                    </div>

                    {/* شريط الإدخال الوهمي */}
                    <form onSubmit={handleSend} className="home-input-form">
                        <input
                            type="text"
                            placeholder="Message AI Chat..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button type="submit" className="home-send-btn">
                            ➔
                        </button>
                    </form>
                    <span className="home-disclaimer">
                        AI can make mistakes. Please verify important info.
                    </span>
                </div>
            </main>

            {/* نافذة تنبيه لتسجيل الدخول إذا حاول التفاعل */}
            {showAuthModal && (
                <div className="home-modal-overlay">
                    <div className="home-modal">
                        <h2>Authentication Required</h2>
                        <p>You need to log in or register to start chatting with the AI assistant and save your history.</p>
                        <div className="home-modal-actions">
                            <button 
                                className="home-primary-button" 
                                onClick={() => navigate("/login")}
                            >
                                Login
                            </button>
                            <button 
                                className="home-secondary-button" 
                                onClick={() => navigate("/register")}
                            >
                                Register
                            </button>
                        </div>
                        <button 
                            className="home-close-modal" 
                            onClick={() => setShowAuthModal(false)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}