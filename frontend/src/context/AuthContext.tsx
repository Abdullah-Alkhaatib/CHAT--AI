import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import { User } from "../types/auth.types";

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;

    login: (
        user: User,
        accessToken: string,
        refreshToken: string
    ) => void;

    logout: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<
    AuthContextType | undefined
>(undefined);

export const AuthProvider = ({
    children,
}: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);

    const [accessToken, setAccessToken] =
        useState<string | null>(null);

    const [loading, setLoading] = useState(true);

    // ==========================================
    // Restore authentication from localStorage
    // ==========================================

    useEffect(() => {
        try {
            const storedUser =
                localStorage.getItem("user");

            const storedAccessToken =
                localStorage.getItem("accessToken");

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            if (storedAccessToken) {
                setAccessToken(storedAccessToken);
            }
        } catch (error) {
            console.error(
                "Failed to restore authentication:",
                error
            );

            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        } finally {
            setLoading(false);
        }
    }, []);

    // ==========================================
    // Login
    // ==========================================

    const login = (
        user: User,
        accessToken: string,
        refreshToken: string
    ) => {
        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        localStorage.setItem(
            "accessToken",
            accessToken
        );

        localStorage.setItem(
            "refreshToken",
            refreshToken
        );

        setUser(user);
        setAccessToken(accessToken);
    };

    // ==========================================
    // Logout (تم التعديل هنا لتنظيف كلشي)
    // ==========================================

    const logout = () => {
        // 1. حذف التوكنز واليوزر الأساسيين
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // 2. حذف بيانات الشات المخزنة محلياً عشان ما تضل ظاهرة للمستخدم التالي
        // بنمر على كل مفاتيح الـ localStorage وبنحذف اللي بيتعلق بالشات
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("chat-active-id") || key.startsWith("chat-sessions")) {
                localStorage.removeItem(key);
            }
        });

        // 3. تصفير الـ States
        setUser(null);
        setAccessToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                isAuthenticated:
                    !!user && !!accessToken,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// ==========================================
// useAuth
// ==========================================

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};