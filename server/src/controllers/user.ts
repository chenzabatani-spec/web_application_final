import { Request, Response } from 'express';
import User, { IUser } from '../models/user_model';
import { BaseController } from './base_controller';
import { AuthRequest } from '../middleware/auth_middleware';

class UserController extends BaseController<IUser> {
    constructor() {
        super(User);
    }

    // Disable create user through this route
    async create(req: Request, res: Response) {
        res.status(405).send("Use /auth/register to create a new user");
    }

    async update(req: Request, res: Response) {
        const authReq = req as AuthRequest;

        // Ensure that users can only update their own information
        if (authReq.user?._id.toString() !== req.params.id) {
             res.status(403).json({ message: 'Access denied: You can only update your own profile' });
             return;
        }

        // Prevent password updates through this route
        if (req.body.password) {
            delete req.body.password; 
        }

        return super.update(req, res);
    }

    // Disable delete user through this route
    async delete(req: Request, res: Response) {
        const { user } = req as AuthRequest;
        const idToDelete = req.params.id;

        // if the authenticated user is not the same as the user to delete, deny access
        if (user?._id.toString() !== idToDelete) {
             res.status(403).send("Unauthorized: You can only delete your own account");
             return;
        }

        return super.delete(req, res);
    }
}

export default new UserController();