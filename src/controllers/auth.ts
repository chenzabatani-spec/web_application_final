import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth_middleware';
import User from '../models/user_model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// --- Helper Functions ---
const sendError = (res: Response, message: string, code?: number) => {
    res.status(code || 400).json({ error: message });
}

const generateTokens = (userId: string): { accessToken: string, refreshToken: string } => {
    const accessToken = jwt.sign(
        { _id: userId },
        process.env.TOKEN_SECRET as string,
        { expiresIn: process.env.TOKEN_EXPIRES || "1h" } as jwt.SignOptions
    );
    const refreshToken = jwt.sign(
        { _id: userId },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" } as jwt.SignOptions // Expiration longer for refresh
    );
    return { accessToken, refreshToken };
}

// --- Main Controllers ---

const register = async (req: Request, res: Response) => {
    const { email, password, username } = req.body;
    if (!email || !password || !username) return sendError(res, "Username, Email and password are required");

    try {
        const existingUser = await User.findOne({
            $or: [
                { email: email }, 
                { username: username }
            ] 
        });

        if (existingUser) return sendError(res, "User with this email or username already exists");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const user = await User.create({ email, password: hashedPassword, username });
        
        // Auto-login after register
        const tokens = generateTokens(user._id.toString());
        if (!user.refreshTokens) user.refreshTokens = [];
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();
        
        res.status(201).json({ ...tokens, _id: user._id, username: user.username, email: user.email });
    } catch (err) {
        sendError(res, (err as Error).message || "Error registering user");
    }
};

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, "Email and password are required");

    try {
        const user = await User.findOne({ email });
        if (!user) return sendError(res, "Invalid email or password");

        const match = await bcrypt.compare(password, user.password!);
        if (!match) return sendError(res, "Invalid email or password");

        const tokens = generateTokens(user._id.toString());
        
        if (!user.refreshTokens) user.refreshTokens = [];
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();

        res.status(200).json({ ...tokens, _id: user._id, username: user.username });
    } catch (err) {
        sendError(res, (err as Error).message || "Error logging in");
    }
};

const refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, "Refresh token required");

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "refreshSecret") as { _id: string };
        const user = await User.findById(decoded._id);
        
        if (!user) return sendError(res, "User not found");

        // Token Reuse Detection (Security mechanism)
        if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
            user.refreshTokens = []; // Security breach: clear all tokens
            await user.save();
            return sendError(res, "Invalid refresh token - reuse detected", 403);
        }

        // Remove old token and add new one
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        
        const newTokens = generateTokens(user._id.toString());
        user.refreshTokens.push(newTokens.refreshToken);
        await user.save();

        res.status(200).json(newTokens);
    } catch (err) {
        sendError(res, (err as Error).message || "Invalid refresh token", 403);
    }
};

const logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, "Refresh token required");
    
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "refreshSecret") as { _id: string };
        const user = await User.findById(decoded._id);
        if (user && user.refreshTokens) {
            user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
            await user.save();
        }
        res.status(200).send();
    } catch (err) {
        res.status(400).send((err as Error).message || "Invalid token");
    }
}

const changePassword = async (req: AuthRequest, res: Response) => {
    // Extract the user ID from the verified token (set by authMiddleware)
    const userId = req.user?._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).send("Both old and new passwords are required");
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
             return res.status(404).send("User not found");
        }

        // Verify that the provided old password matches the stored hash
        // This prevents unauthorized changes if a session is left open
        const isMatch = await bcrypt.compare(oldPassword, user.password!);
        if (!isMatch) {
            return res.status(401).send("Old password is incorrect");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        // Revoke all refresh tokens
        // This forces the user to re-login on all other devices/sessions for safety
        if (user.refreshTokens) {
            user.refreshTokens = [];
        }

        await user.save();
        res.status(200).send("Password changed successfully");
    } catch (err) {
        res.status(500).send((err as Error).message);
    }
};

export default { register, login, refresh, logout, changePassword };