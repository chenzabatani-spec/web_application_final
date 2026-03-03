import mongoose from 'mongoose';

export interface IComment {
    postId: mongoose.Types.ObjectId;
    content: string;
    sender: string | mongoose.Types.ObjectId;
}

const commentSchema = new mongoose.Schema<IComment>({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});


const CommentModel = mongoose.model<IComment>('Comment', commentSchema);

export default CommentModel;