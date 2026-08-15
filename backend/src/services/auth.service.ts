import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken"; 
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";

interface RegisterData {
    name: string;
    email: string;
    password: string;
}

interface LoginData {
    email: string;
    password: string;
}

const getAccessSecret = (): string => {
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
        throw new Error('JWT_ACCESS_SECRET is not defined');
    }

    return secret;
};

const getRefreshSecret = (): string => {
    const secret = process.env.JWT_REFRESH_SECRET;

    if (!secret) {
        throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    
    return secret;
};

const generateAccessToken = (userId: string): string => {
    const options: SignOptions = {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
    };
    return jwt.sign(
        { userId },
        getAccessSecret(),
        options
    );
};

const generateRefreshToken = (userId: string): string => {
    const options: SignOptions = {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
    };
    return jwt.sign(
        { userId },
        getRefreshSecret(),
        options
    );
}

// Save a refresh token to the database
const saveRefreshToken = async (userId: string, token: string) => {
    const expiresAt = new Date();

    expiresAt.setDate(
        expiresAt.getDate() + 30 // يعني 30 يوم من تاريخ الإنشاء
    );

    await RefreshToken.create({
        userId,
        token,
        expiresAt
    });
};

export const registerUser = async (data: RegisterData) => {
    const { name, email, password } = data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error('User is already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    await saveRefreshToken(user._id.toString(), refreshToken);
    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        },
        accessToken,
        refreshToken
    };
}

export const loginUser = async (data: LoginData) => {
    const { email, password } = data;

    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    await saveRefreshToken(user._id.toString(), refreshToken);

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        },
        accessToken,
        refreshToken
    };
};

export const refreshAccessToken = async (token: string) => {
    try {
        const secret = getRefreshSecret();

        const decoded = jwt.verify(token, secret) as { userId: string };

        const storedToken = await RefreshToken.findOne({ userId: decoded.userId, token: token });

        if (!storedToken) {
            throw new Error('Refresh token is invalid or revoked');
        }

        const accessToken = generateAccessToken(decoded.userId);

        return {
            accessToken
        };

    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
}

export const logoutUser = async (token: string) => {
    try {
        const deletedToken = await RefreshToken.findOneAndDelete({ token });

        if (!deletedToken) {
            throw new Error('Refresh token not found');
        }

        return true;

    } catch (error) {
        throw new Error('Failed to logout');
    }
}