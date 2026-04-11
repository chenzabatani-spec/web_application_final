import dotenv from 'dotenv';

dotenv.config();

export const NODE_ENV = process.env.NODE_ENV;
export const BACKEND_PORT = process.env.BACKEND_PORT;
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
export const SERVER_URL = process.env.SERVER_URL || `http://localhost:${BACKEND_PORT}`;