import express, { Express } from 'express';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import postRouter from './routes/post_routes';
import commentRouter from './routes/comment_routes';
import authRouter from './routes/auth_routes';
import userRouter from './routes/user_routes';
import { setupSwagger } from './swagger';
import fileRouter from './routes/file_routes';
import aiRoutes from './routes/ai_routes';

const initApp = (): Promise<Express> => {
    const promise = new Promise<Express>((resolve) => {
        const db = mongoose.connection;
        db.on('error', (error) => console.error(error));
        db.once('open', () => console.log('Connected to Mongo! Database name: web_application_final_db'));

        const url = process.env.DATABASE_URL;
        mongoose.connect(url as string).then(() => {
            const app = express();
            app.use(cors({
                origin: process.env.FRONTEND_URL || 'http://localhost:5173',
                methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
                credentials: true // Important for Cookies/Tokens later (Lecture 6)
            }));
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({ extended: true }));
            app.use('/public', express.static('public'));
            app.use(express.static('public'));
            
            // Setup Swagger
            setupSwagger(app);

            // Routes
            app.use('/auth', authRouter);
            app.use('/posts', postRouter);
            app.use('/comments', commentRouter);
            app.use('/users', userRouter);
            app.use('/file', fileRouter);
            app.use('/ai', aiRoutes);

            resolve(app);
        });
    });
    return promise;
};

export default initApp;