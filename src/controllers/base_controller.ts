import { Request, Response} from 'express';
import  { Model } from 'mongoose';

export class BaseController<T> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async getAll(req: Request, res: Response) {
        const filter = req.query;
        try {
            if (filter) {
                const item = await this.model.find(filter);
                res.send(item);
            } else {
                const item = await this.model.find();
                res.send(item);
            }
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const item = await this.model.findById(req.params.id);
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }
            res.send(item);
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const item = await this.model.create(req.body);
            res.status(201).json(item);
        } catch (error) {
            res.status(400).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const item = await this.model.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.status(200).json(item);
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await this.model.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'Item deleted' });
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    }
}

const createController = <T>(model: Model<T>) => {
    return new BaseController<T>(model);
}

export default createController;

