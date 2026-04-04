import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth_middleware';
import PostModel, { IPost } from '../models/post_model';
import { BaseController } from './base_controller';
import aiService from '../services/ai_service';

class PostController extends BaseController<IPost> {
    constructor() {
        super(PostModel);
    }

    async getAll(req: Request, res: Response) {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const senderId = req.query.senderId;

        try {
            const matchQuery: { sender?: mongoose.Types.ObjectId } = {};
            if (senderId) {
                matchQuery.sender = new mongoose.Types.ObjectId(senderId as string);
            }

            const skip = (page - 1) * limit;

            const posts = await this.model.aggregate([
                { $match: matchQuery }, 
                { $sort: { createdAt: -1 } }, 
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: "comments",
                        localField: "_id",
                        foreignField: "postId",
                        as: "comments"
                    }
                },
                {
                    $addFields: {
                        commentsCount: { $size: "$comments" }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "sender",
                        foreignField: "_id",
                        as: "senderInfo"
                    }
                },
                { $unwind: "$senderInfo" },
                {
                    $project: {
                        title: 1,
                        content: 1,
                        photo: 1,
                        likes: 1,
                        createdAt: 1,
                        commentsCount: 1,
                        sender: {
                            _id: "$senderInfo._id",
                            username: "$senderInfo.username",
                            photo: "$senderInfo.photo"
                        }
                    }
                }
            ]);

            const total = await this.model.countDocuments(matchQuery);

            res.status(200).json({
                posts,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            });
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Internal Server Error' });
        }
    }

    async create(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?._id;

    if (!userId) {
        res.status(401).send("Unauthorized");
        return;
    }

    try {
        const photoFilename = req.file ? req.file.filename : "";

        const postData = {
            title: req.body.title || "Untitled", 
            content: req.body.content || "",
            sender: userId,
            photo: photoFilename
        };

        const newPost = await this.model.create(postData);

        if (newPost.content) {
            aiService.processAndSaveChunk(newPost._id, newPost.content)
                .catch(err => console.error("AI processing failed:", err));
        }

        res.status(201).json(newPost);
        } catch (error) {
            console.error("Create Post Error:", error);
            res.status(400).json({ 
                message: error instanceof Error ? error.message : 'Error creating post' 
            });
        }
    }

    async toggleLike(req: Request, res: Response) {
        const authReq = req as AuthRequest;
        const userId = authReq.user?._id;
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

            const isLiked = post.likes.includes(userId);

            if (isLiked) {
                post.likes = post.likes.filter(id => id !== userId);
            } else {
                post.likes.push(userId);
            }

            await post.save();
            res.status(200).send(post);
        } catch (error) {
            res.status(400).send(error instanceof Error ? error.message : error);
        }
    }

    async update(req: Request, res: Response) {
        const authReq = req as AuthRequest;
        const userId = authReq.user?._id;
        const postId = req.params.id;

        try {
            const post = await this.model.findById(postId);
            if (!post) {
                res.status(404).send("Post not found");
                return;
            }

            if (post.sender.toString() !== userId) { 
                res.status(403).send("Unauthorized");
                return;
            }

            const updateData: { title?: string; content?: string; photo?: string } = {
                title: req.body.title,
                content: req.body.content
            };

            if (req.file) {
                updateData.photo = req.file.filename;
            } else if (req.body.deletePhoto === 'true') {
                updateData.photo = ""; 
            }

            const updatedPost = await this.model.findByIdAndUpdate(postId, updateData, { new: true });
            res.status(200).json(updatedPost); 

        } catch (error) {
            res.status(400).send(error instanceof Error ? error.message : error);
        }
    }

    async delete(req: Request, res: Response) {
        const authReq = req as AuthRequest;
        const userId = authReq.user?._id;
        const postId = req.params.id as string;

        try {
            const post = await this.model.findById(postId);
            if (!post) {
                res.status(404).send("Post not found");
                return;
            }

            if (post.sender.toString() !== userId) {
                res.status(403).send("Unauthorized");
                return;
            }

            await this.model.findByIdAndDelete(postId);

            await aiService.deleteChunksByPostId(postId);

            res.status(200).send({ message: "Post deleted successfully" });
        } catch (error) {
            res.status(400).send(error);
        }
    }
}

export default new PostController();