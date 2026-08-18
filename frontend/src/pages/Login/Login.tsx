import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

import "./Login.css";

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/chat", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await loginUser({
                email,
                password,
            });

            const {
                user,
                accessToken,
                refreshToken,
            } = response.data;

            login(
                user,
                accessToken,
                refreshToken
            );

            navigate("/chat");
        } catch (error) {
            setError(
                "Invalid email or password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-container">

                <div className="login-header">

                    <h1 className="login-title">
                        Welcome Back
                    </h1>

                    <p className="login-subtitle">
                        Login to your AI Chat account
                    </p>

                </div>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >

                    <div className="login-field">

                        <label className="login-label">
                            Email
                        </label>

                        <input
                            className="login-input"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="Enter your email"
                            required
                        />

                    </div>

                    <div className="login-field">

                        <label className="login-label">
                            Password
                        </label>

                        <input
                            className="login-input"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Enter your password"
                            required
                        />

                    </div>

                    {error && (
                        <p className="login-error">
                            {error}
                        </p>
                    )}

                    <button
                        className="login-submit-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

                <div className="login-footer">

                    <span className="login-footer-text">
                        Don't have an account?
                    </span>

                    <button
                        className="login-register-button"
                        type="button"
                        onClick={() =>
                            navigate("/register")
                        }
                    >
                        Register
                    </button>

                </div>

            </div>

        </div>
    );
};

export default Login;