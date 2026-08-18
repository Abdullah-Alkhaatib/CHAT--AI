import { useNavigate } from "react-router-dom";

import "./Home.css";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            <div className="home-card">
                <p className="home-badge">AI assistant</p>
                <h1>AI Chat</h1>
                <p className="home-text">
                    Chat with an intelligent assistant, upload images, and
                    keep your conversation history in one place.
                </p>

                <div className="home-actions">
                    <button
                        type="button"
                        className="home-primary-button"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className="home-secondary-button"
                        onClick={() => navigate("/register")}
                    >
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
}