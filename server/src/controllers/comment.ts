import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth_middleware';
import CommentModel, { IComment } from '../models/comment_model';
import PostModel from '../models/post_model';
import { BaseController } from './base_controller';

class CommentController extends BaseController<IComment> {
    constructor() {
        super(CommentModel);
    }

    async create(req: AuthRequest, res: Response) {
        // Ensure that the postId is provided
        const { postId } = req.body;
        if (!postId) {
            res.status(400).send("Missing parameter: postId is required");
            return;
        }

        try {
            const postExists = await PostModel.findById(postId);
            if (!postExists) {
                res.status(404).send("Post not found");
                return;
            }
            // take userId from req.user set by authMiddleware
            const userId = req.user?._id;

            if (userId) {
            // attach userId to the comment being created
                req.body.sender = userId;
            }
            
            return super.create(req, res);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async getAll(req: Request, res: Response) {
        const filter = req.query;

        // without postId we cannot get comments
        if (!filter.postId) {
            res.status(400).send("Missing parameter: postId is required");
            return;
        }

        try {
            const comments = await this.model.find(filter);
            res.send(comments);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    async update(req: Request, res: Response) {
        const { user } = req as AuthRequest;
        const commentId = req.params.id;

        try {
            const comment = await this.model.findById(commentId);

            if (!comment) {
                res.status(404).send("Comment not found");
                return;
            }

            // if the authenticated user is not the sender of the comment
            if (comment.sender.toString() !== user?._id) {
                res.status(403).send("Unauthorized: You can only edit your own comments");
                return;
            }

            // proceed with the update
            const updatedComment = await this.model.findByIdAndUpdate(
                commentId,
                req.body,
                { new: true }
            );

            res.status(200).send(updatedComment);

        } catch (error) {
            res.status(400).send(error);
        }
    }

    async delete(req: Request, res: Response) {
        const { user } = req as AuthRequest;
        const commentId = req.params.id;

        try {
            const comment = await this.model.findById(commentId);

            if (!comment) {
                res.status(404).send("Comment not found");
                return;
            }

            // if the authenticated user is not the sender of the comment
            if (comment.sender.toString() !== user?._id) {
                res.status(403).send("Unauthorized: You can only delete your own comments");
                return;
            }

            // proceed with the deletion
            await this.model.findByIdAndDelete(commentId);
            
            res.status(200).send({ message: "Comment deleted successfully" });

        } catch (error) {
            res.status(400).send(error);
        }
    }
}

export default new CommentController();