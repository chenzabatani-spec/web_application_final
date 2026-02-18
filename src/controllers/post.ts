import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth_middleware';
import PostModel, { IPost } from '../models/post_model';
import { BaseController } from './base_controller';


class PostController extends BaseController<IPost> {
    constructor() {
        super(PostModel);
    }

    async create(req: AuthRequest, res: Response) {

        //take userId from req.user set by authMiddleware
        const userId = req.user?._id;

        if (userId) {
            //attach userId to the post being created
            req.body.sender = userId;
        }

        return super.create(req, res);
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