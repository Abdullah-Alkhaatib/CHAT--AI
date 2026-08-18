import api from "./api";

import {
    AuthResponse,
    LoginData,
    RegisterData,
    RefreshResponse,
} from "../types/auth.types";

// ==============================
// Register
// ==============================

export const registerUser = async (
    data: RegisterData
): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
        "/auth/register",
        data
    );

    return response.data;
};

// ==============================
// Login
// ==============================

export const loginUser = async (
    data: LoginData
): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
        "/auth/login",
        data
    );

    return response.data;
};

// ==============================
// Refresh Access Token
// ==============================

export const refreshToken = async (
    refreshToken: string
): Promise<RefreshResponse> => {
    const response = await api.post<RefreshResponse>(
        "/auth/refresh",
        {
            refreshToken,
        }
    );

    return response.data;
};

// ==============================
// Logout (تمت إضافة Try-Catch لضمان الأمان)
// ==============================

export const logoutUser = async (
    refreshToken: string
): Promise<void> => {
    try {
        await api.post(
            "/auth/logout",
            {
                refreshToken,
            }
        );
    } catch (error) {
        console.error("Logout API failed, but continuing local cleanup:", error);
    }
};