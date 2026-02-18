import express, { Express } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import postRouter from './routes/post_routes';
import commentRouter from './routes/comment_routes';
import authRouter from './routes/auth_routes';
import userRouter from './routes/user_routes';
import { setupSwagger } from './swagger';

dotenv.config();

const initApp = (): Promise<Express> => {
    const promise = new Promise<Express>((resolve) => {
        const db = mongoose.connection;
        db.on('error', (error) => console.error(error));
        db.once('open', () => console.log('Connected to Mongo! Database name: web_app_assignment1'));

        const url = process.env.DATABASE_URL;
        mongoose.connect(url as string).then(() => {
            const app = express();
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({ extended: true }));

            // Setup Swagger
            setupSwagger(app);

            // Routes
            app.use('/auth', authRouter);
            app.use('/posts', postRouter);
            app.use('/comments', commentRouter);
            app.use('/users', userRouter);

            resolve(app);
        });
    });
    return promise;
};

export default initApp;