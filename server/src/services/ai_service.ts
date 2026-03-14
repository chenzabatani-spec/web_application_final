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

const aiService = {
    generateEmbedding,
    processAndSaveChunk
};

export default aiService;