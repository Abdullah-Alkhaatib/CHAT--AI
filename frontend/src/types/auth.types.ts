export interface User {
    id: string;
    name: string;
    email: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;

    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    };
}

export interface RefreshResponse {
    success: boolean;
    message: string;

    data: {
        accessToken: string;
    };
}