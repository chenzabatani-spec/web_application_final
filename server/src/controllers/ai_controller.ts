import { Request, Response } from 'express';
import aiService from '../services/ai_service';

export const testEmbedding = async (req: Request, res: Response) => {
    try {
        const textToTest = "This is a test post to check the embedding generation functionality.";

        console.log("Generating embedding for text:");
        const embedding = await aiService.generateEmbedding(textToTest);

        res.status(200).json({
            message: "Embedding generated successfully",
            vectorLength: embedding.length,
            firstFiveNumbers: embedding.slice(0, 5) // Return the first 5 numbers of the embedding for verification
        });
    } catch (error) {
        console.error("Error in testEmbedding controller:", error);
        res.status(500).json({ error: "Failed to generate embedding" });
    }
};

export const search = async (req: Request, res: Response) => {
    try {
        //Extract the search query from the request body
        const query = req.body.query;

        if (!query) {
            res.status(400).json({ error: "Missing search query" });
            return; 
        }

        console.log(`Received search request for: ${query}`);

        //Get the top 3 most similar posts based on the query text
        const results = await aiService.searchSimilarPosts(query, 3);
        
        res.status(200).json({
            message: "Search completed successfully",
            results: results
        });
    } catch (error) {
        console.error("Error in search controller:", error);
        res.status(500).json({ error: "Failed to perform semantic search" });
    }
};

export default { testEmbedding, search };