import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";
import Chunk from "../models/chunk_model";
import PostModel from "../models/post_model";

// Check if the API key is set, but don't crash if we are running Jest tests
if (!process.env.GEMINI_API_KEY && process.env.NODE_ENV !== 'test') {
    console.warn("GEMINI_API_KEY is not set in .env file");
}

// Initialize the Google Generative AI client (fallback to a dummy key for tests)
const apiKey = process.env.GEMINI_API_KEY || "dummy-key-for-tests-only";
const genAi = new GoogleGenerativeAI(apiKey);

const generateEmbedding = async (text: string): Promise<number[]> => {
    try {
        // Read the desired vector dimensions and model name from environment variables, with defaults
        const vectorDimensions = parseInt(process.env.AI_VECTOR_DIMENSIONS || '3072');
        const aiModelName = process.env.AI_MODEL_NAME || 'gemini-embedding-001';

        // If USE_MOCK_AI is set to true, return a made up embedding vector instead of calling the Gemini API
        if (process.env.USE_MOCK_AI === 'true') {
            console.log("⚠️ MOCK MODE: Skipping Gemini API call. Returning made up vector.");
            // Return a fixed-length array of numbers as a mock embedding (e.g., 3072 dimensions for Gemini embeddings)
            return new Array(vectorDimensions).fill(0.1); 
        }
        // Generate embeddings for the input text using the specified model
        const model = genAi.getGenerativeModel({ model: aiModelName });

        const response = await model.embedContent(text);
        const embedding = response.embedding;

        // Return the embedding values as an array of numbers
        return embedding.values; 
    } catch (error) {
        console.error("Error generating embeddings:", error);
        throw new Error("Failed to generate embeddings");
    }
};


const processAndSaveChunk = async (postId: mongoose.Types.ObjectId, text: string) => {
    try {
        console.log(`Generating embedding for post ${postId}...`);
        
        // Call generateEmbedding to get the embedding vector for the text
        const embedding = await generateEmbedding(text);

        // Create a new Chunk document
        const newChunk = new Chunk({
            text: text,
            embedding: embedding,
            postId: postId
        });

        // Save the new Chunk document
        await newChunk.save();
        console.log('Successfully saved chunk for post', postId);
        return newChunk;

    } catch (error) {
        console.error("Error processing and saving chunk:", error);
        throw new Error("Failed to process and save chunk");
    }
};

// Utility function to calculate cosine similarity between two vectors
const calculateCosineSimilarity = (vecA: number[], vecB: number[]): number => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Function to search for similar posts based on a query text - algorithmic Top-K search
const searchSimilarPosts = async (queryText: string, topK: number = 3) => {
    try {
        console.log(`Searching for semantic matches for: "${queryText}"`);
        
        // Turn the user's query into an embedding vector
        const queryEmbedding = await generateEmbedding(queryText);

        // Retrieve all chunks from the database
        const allChunks = await Chunk.find();

        // Calculate cosine similarity
        const chunksWithScores = allChunks.map(chunk => {
            const score = calculateCosineSimilarity(queryEmbedding, chunk.embedding);
            return { 
                postId: chunk.postId, 
                text: chunk.text, 
                score: score 
            };
        });

        // Sort the chunks by similarity score in descending order
        chunksWithScores.sort((a, b) => b.score - a.score);

        // Get the top K chunks
        const topChunks = chunksWithScores.slice(0, topK);
        
        // Extract the unique post IDs from the top chunks
        const postIds = topChunks.map(chunk => chunk.postId);
        
        // Fetch the full post details
        const fullPosts = await PostModel.find({ _id: { $in: postIds } }).populate('sender', 'username photo');

        // Enrich the top chunks with the full post details to send back to the frontend
        const enrichedResults = topChunks.map(chunk => {
            // Find the corresponding post details for this chunk
            const postDetails = fullPosts.find(p => p._id.toString() === chunk.postId.toString()); 

            type PopulatedSender = { username?: string; photo?: string };
            type PostWithTime = { createdAt?: Date };

            const sender = postDetails?.sender as unknown as PopulatedSender | undefined;
            const postTime = postDetails as unknown as PostWithTime | undefined;

            return {
                score: chunk.score,
                text: chunk.text, 
                postId: chunk.postId,
                photo: postDetails?.photo || "",
                title: postDetails?.title || "Untitled",
                content: postDetails?.content || "",
                username: sender?.username || "Unknown User",
                userPhoto: sender?.photo || "",
                createdAt: postTime?.createdAt || new Date()
            };
        });

        return enrichedResults;

    } catch (error) {
        console.error("Error during semantic search:", error);
        throw error;
    }
};

// Function to delete all chunks associated with a specific post ID (used when a post is deleted)
const deleteChunksByPostId = async (postId: string) => {
    try {
        await Chunk.deleteMany({ postId: postId });
        console.log(`Successfully deleted AI chunks for post ${postId}`);
    } catch (error) {
        console.error("Error deleting chunks for post:", error);
    }
};

const aiService = {
    generateEmbedding,
    processAndSaveChunk,
    searchSimilarPosts,
    deleteChunksByPostId
};

export default aiService;