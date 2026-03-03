import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthRequest = Request & { user?: { _id: string } };

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const secret: string = process.env.TOKEN_SECRET as string;

    try {
        const decoded = jwt.verify(token, secret) as { _id: string };
        (req as AuthRequest).user = { _id: decoded._id };
        next();
    } catch {
        return res.status(401).json({ error: "Unauthorized" });
    }
};

export default authMiddleware;