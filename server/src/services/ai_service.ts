import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";
import Chunk from "../models/chunk_model";

// Check if the API key is set in the environment variables
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in .env file");
}

// Initialize the Google Generative AI client with the API key
const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateEmbedding = async (text: string): Promise<number[]> => {
    try {
        // Generate embeddings for the input text using the specified model
        const model = genAi.getGenerativeModel({ model: "gemini-embedding-001" });

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
        
        //Turn the user's query into an embedding vector
        const queryEmbedding = await generateEmbedding(queryText);

        //Retrieve all chunks from the database (in a real application, consider more efficient retrieval strategies)
        const allChunks = await Chunk.find();

        //Calculate cosine similarity between the query embedding and each chunk's embedding
        const chunksWithScores = allChunks.map(chunk => {
            const score = calculateCosineSimilarity(queryEmbedding, chunk.embedding);
            return { 
                postId: chunk.postId, 
                text: chunk.text, 
                score: score 
            };
        });

        //Sort the chunks by similarity score in descending order (most similar first, Top-K search)
        chunksWithScores.sort((a, b) => b.score - a.score);

        //Return the top K most similar chunks
        return chunksWithScores.slice(0, topK);

    } catch (error) {
        console.error("Error during semantic search:", error);
        throw error;
    }
};

const aiService = {
    generateEmbedding,
    processAndSaveChunk,
    searchSimilarPosts
};

export default aiService;