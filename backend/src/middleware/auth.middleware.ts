import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/auth.types";

interface JwtPayload {
    userId: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const token = authHeader.split(" ")[1];

        const secret = process.env.JWT_ACCESS_SECRET;

        if (!secret) {
            throw new Error('JWT_ACCESS_SECRET is not defined');
        }

        const decoded = jwt.verify(token, secret) as JwtPayload;

        req.user = { userId: decoded.userId };

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}