import express, { Express } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import postRouter from './routes/post_routes';
import commentRouter from './routes/comment_routes';
import authRouter from './routes/auth_routes';
import userRouter from './routes/user_routes';
import { setupSwagger } from './swagger';
import fileRouter from './routes/file_routes';
import path from 'path';
import cors from 'cors';

dotenv.config({ path: path.join(__dirname, '../.env') });

const initApp = (): Promise<Express> => {
    const promise = new Promise<Express>((resolve) => {
        const db = mongoose.connection;
        db.on('error', (error) => console.error(error));
        db.once('open', () => console.log('Connected to Mongo! Database name: web_app_assignment1'));

        const url = process.env.DATABASE_URL;
        mongoose.connect(url as string).then(() => {
            const app = express();
            app.use(cors({
                origin: "http://localhost:5173", // The URL of your React app
                methods: ["GET", "POST", "PUT", "DELETE"],
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

            resolve(app);
        });
    });
    return promise;
};

export default initApp;