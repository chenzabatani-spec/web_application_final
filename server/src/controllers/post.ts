import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth_middleware';
import PostModel, { IPost } from '../models/post_model';
import { BaseController } from './base_controller';
import aiService from '../services/ai_service';

class PostController extends BaseController<IPost> {
    constructor() {
        super(PostModel);
    }

    // Override getAll to support pagination and filtering
    async getAll(req: Request, res: Response) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const senderId = req.query.sender;

        try {
            const query = senderId ? { sender: senderId } : {};
            
            // Calculate how many documents to skip
            const skip = (page - 1) * limit;

            const posts = await this.model.find(query)
                .sort({ createdAt: -1 }) // Sort by newest first
                .skip(skip)
                .limit(limit)
                .populate('sender', 'username email'); // Optional: include sender details

            res.status(200).send(posts);
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Error fetching posts' });
        }
    }

    async create(req: AuthRequest, res: Response) {
        // Take userId from req.user set by authMiddleware
        const userId = req.user?._id;

        if (!userId) {
            // If userId is not available, return an error response
            res.status(401).send("Unauthorized");
            return;
        }

        // Attach the sender (userId) to the request body before creating the post
        req.body.sender = userId; 

        try {
            // Save the new post to the database
            const newPost = await this.model.create(req.body);

            // Trigger AI processing for the post content
            const postContent = req.body.content;

            if (postContent) {
                // Background task: We deliberately DO NOT use 'await' here.
                // This allows the server to respond to the user immediately,
                // while the Gemini API generates the embedding in the background.
                aiService.processAndSaveChunk(newPost._id, postContent)
                    .catch(err => console.error("Failed to generate AI chunk in background:", err));
            }

            // Respond to the client immediately after saving the post
            res.status(201).send(newPost);
        } catch (error) {
            res.status(400).json({ message: error instanceof Error ? error.message : 'Error creating post' });
        }
    }

    // method to handle like/unlike functionality
    async toggleLike(req: AuthRequest, res: Response) {
        const userId = req.user?._id;
        const postId = req.params.id;

        if (!userId) {
            res.status(401).send("Unauthorized");
            return;
        }

        try {
            const post = await this.model.findById(postId);
            if (!post) {
                res.status(404).send("Post not found");
                return;
            }

            // Check if user already liked the post
            const isLiked = post.likes.includes(userId);

            if (isLiked) {
                // If liked, remove the userId from likes array
                post.likes = post.likes.filter(id => id !== userId);
            } else {
                // If not liked, add the userId to likes array
                post.likes.push(userId);
            }

            await post.save();
            res.status(200).send(post);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async update(req: Request, res: Response) {
        const { user } = req as AuthRequest;
        const postId = req.params.id;

        try {
            const post = await this.model.findById(postId);
            if (!post) {
                res.status(404).send("Post not found");
                return;
            }

            // check if the authenticated user is the sender of the post
            if (post.sender.toString() !== user?._id) { 
                res.status(403).send("Unauthorized : You can only update your own posts");
                return;
            }

            const updatedPost = await this.model.findByIdAndUpdate(postId, req.body, { new: true });
            res.status(200).send(updatedPost);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async delete(req: Request, res: Response) {
        const { user } = req as AuthRequest;
        const postId = req.params.id;

        try {
            const post = await this.model.findById(postId);

            if (!post) {
                res.status(404).send("Post not found");
                return;
            }

            // check if the authenticated user is the sender of the post
            if (post.sender.toString() !== user?._id) {
                res.status(403).send("Unauthorized: You can only delete your own posts");
                return;
            }

            await this.model.findByIdAndDelete(postId);
            
            res.status(200).send({ message: "Post deleted successfully" });
            
        } catch (error) {
            res.status(400).send(error);
        }
    }
}

export default new PostController();