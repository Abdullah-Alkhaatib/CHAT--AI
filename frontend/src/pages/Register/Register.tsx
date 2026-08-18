import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

import "./Register.css";

const Register = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    const [name, setName] = useState("");
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
            const response = await registerUser({
                name,
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
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            <div className="register-container">

                <div className="register-header">

                    <h1 className="register-title">
                        Create Account
                    </h1>

                    <p className="register-subtitle">
                        Create your AI Chat account
                    </p>

                </div>

                <form
                    className="register-form"
                    onSubmit={handleSubmit}
                >

                    <div className="register-field">

                        <label className="register-label">
                            Name
                        </label>

                        <input
                            className="register-input"
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="Enter your name"
                            required
                        />

                    </div>

                    <div className="register-field">

                        <label className="register-label">
                            Email
                        </label>

                        <input
                            className="register-input"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="Enter your email"
                            required
                        />

                    </div>

                    <div className="register-field">

                        <label className="register-label">
                            Password
                        </label>

                        <input
                            className="register-input"
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
                        <p className="register-error">
                            {error}
                        </p>
                    )}

                    <button
                        className="register-submit-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Register"}
                    </button>

                </form>

                <div className="register-footer">

                    <span className="register-footer-text">
                        Already have an account?
                    </span>

                    <button
                        className="register-login-button"
                        type="button"
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        Login
                    </button>

                </div>

            </div>

        </div>
    );
};

export default Register;