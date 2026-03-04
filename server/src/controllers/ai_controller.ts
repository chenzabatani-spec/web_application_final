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

export default { testEmbedding };