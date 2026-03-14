import mongoose, { Schema, Document } from "mongoose";

// Define interface for Chunk document
export interface IChunk extends Document {
    text: string;
    embedding: number[];
    postId: mongoose.Types.ObjectId;
}

const chunkSchema = new Schema<IChunk>({
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true }
}, { timestamps: true });

export default mongoose.model<IChunk>('Chunk', chunkSchema);