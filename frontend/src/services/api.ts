import axios, {
    AxiosError,
    InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const accessToken = localStorage.getItem("accessToken");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest =
            error.config as InternalAxiosRequestConfig & {
                _retry?: boolean;
            };

        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        if (originalRequest.url === "/auth/refresh") {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const refreshToken =
                localStorage.getItem("refreshToken");

            if (!refreshToken) {
                throw new Error("Refresh token not found");
            }

            const response = await axios.post(
                "http://localhost:5000/api/auth/refresh",
                {
                    refreshToken,
                }
            );

            const newAccessToken =
                response.data.data.accessToken;

            localStorage.setItem(
                "accessToken",
                newAccessToken
            );

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return api(originalRequest);

        } catch (refreshError) {
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            window.location.href = "/login";

            return Promise.reject(refreshError);
        }
    }
);

export default api;