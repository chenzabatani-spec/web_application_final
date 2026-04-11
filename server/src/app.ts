import express, { Express } from 'express';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import postRouter from './routes/post_routes';
import commentRouter from './routes/comment_routes';
import authRouter from './routes/auth_routes';
import userRouter from './routes/user_routes';
import { setupSwagger } from './swagger';
import fileRouter from './routes/file_routes';
import aiRoutes from './routes/ai_routes';

/** Comma-separated FRONTEND_URL values are allowed (e.g. localhost + 127.0.0.1). */
const normalizeOrigin = (o: string): string => o.trim().replace(/\/$/, '');

const parseOrigins = (raw?: string): string[] =>
    raw ? raw.split(',').map((s) => normalizeOrigin(s)).filter(Boolean) : [];

const buildAllowedBrowserOrigins = (): Set<string> => {
    const fromEnv = parseOrigins(process.env.FRONTEND_URL);
    const devExtras =
        process.env.NODE_ENV === 'production'
            ? []
            : [
                  'http://localhost:5173',
                  'http://127.0.0.1:5173',
                  'http://[::1]:5173',
              ];
    return new Set([...fromEnv, ...devExtras].map(normalizeOrigin));
};

const initApp = (): Promise<Express> => {
    const promise = new Promise<Express>((resolve) => {
        const db = mongoose.connection;
        db.on('error', (error) => console.error(error));
        db.once('open', () => console.log('Connected to Mongo! Database name: web_application_final_db'));

        const url = process.env.DATABASE_URL;
        mongoose.connect(url as string).then(() => {
            const app = express();
            const allowedOrigins = buildAllowedBrowserOrigins();
            const corsMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
            const corsCredentials = true;

            // In development, reflect the request Origin so CORS always matches (avoids subtle .env mismatches).
            const corsOptions: CorsOptions =
                process.env.NODE_ENV === 'production'
                    ? {
                          origin: (origin, callback) => {
                              if (!origin) {
                                  return callback(null, true);
                              }
                              if (allowedOrigins.has(normalizeOrigin(origin))) {
                                  return callback(null, origin);
                              }
                              callback(null, false);
                          },
                          methods: corsMethods,
                          credentials: corsCredentials,
                      }
                    : {
                          origin: true,
                          methods: corsMethods,
                          credentials: corsCredentials,
                      };

            app.use(cors(corsOptions));
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
            
            // Serve React app in production
            if (process.env.NODE_ENV === 'production') {
                // The client build is located two levels up from the compiled server code (dist/server.js), hence ../../
                const clientBuildPath = path.join(__dirname, '../../client/dist');
                
                app.use(express.static(clientBuildPath));

                // For any route not handled by the above, serve index.html (for React Router)
                app.get('*', (req, res) => {
                    res.sendFile(path.join(clientBuildPath, 'index.html'));
                });
            }

            resolve(app);
        });
    });
    return promise;
};

export default initApp;