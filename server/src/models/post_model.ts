import mongoose from 'mongoose';

export interface IPost {
    title: string;
    content?: string;
    sender: string | mongoose.Types.ObjectId;
    photo?: string;
    likes: string[];
}   

const postSchema = new mongoose.Schema<IPost>({
    title: {
        type: String,
        required: true
    },
    content: String,
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
photo: String, 
    likes: {
        type: [String],
        default: [] 
    }
}, { timestamps: true }); 
const PostModel = mongoose.model<IPost>('Post', postSchema);

export default PostModel;