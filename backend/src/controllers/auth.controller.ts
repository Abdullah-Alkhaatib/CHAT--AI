import { Request, Response } from "express";
import { registerUser, loginUser, refreshAccessToken, logoutUser } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
    try {
        const result = await registerUser(req.body);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result
        });

    } catch (error) {
        return res.status(400).json({
            success: false, message: (error as Error).message
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const result = await loginUser(req.body);

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: result
        });

    } catch (error) {
        return res.status(400).json({
            success: false, message: (error as Error).message
        });
    }
}

export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        const result = await refreshAccessToken(refreshToken);

        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            data: result
        });

    } catch (error) {
        return res.status(400).json({
            success: false, message: (error as Error).message
        });
    }
}

export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        await logoutUser(refreshToken);

        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });

    } catch (error) {
        return res.status(400).json({
            success: false, message: (error as Error).message
        });
    }
}