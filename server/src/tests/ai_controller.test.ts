import { Request, Response } from 'express';
import aiController from '../controllers/ai_controller';
import aiService from '../services/ai_service';
import mongoose from 'mongoose';

describe("AI Controller Unit Tests", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        jest.restoreAllMocks();
        
        // Fake Request and Response objects to test the controller functions without needing an actual Express server
        mockRequest = {
            body: {}
        };
        
        // Fake Response object with jest.fn() to track calls to status and json methods
        mockResponse = {
            status: jest.fn().mockReturnThis(), // Return the response object to allow chaining (e.g., res.status(200).json(...))
            json: jest.fn()
        };
    });

    // ==========================================
    // testEmbedding FUNCTION TESTS
    // ==========================================
    describe("testEmbedding", () => {
        test("Should generate embedding and return 200 with first 5 numbers", async () => {
            // Fake embedding array to be returned by the AI service when generateEmbedding is called
            const fakeEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
            jest.spyOn(aiService, 'generateEmbedding').mockResolvedValue(fakeEmbedding);

            // Call the testEmbedding controller function with the mocked request and response objects
            await aiController.testEmbedding(mockRequest as Request, mockResponse as Response);

            // Make sure the controller called res.status(200) to indicate success
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            
            // Make sure the controller called res.json with the expected response structure, including the vector length and the first five numbers of the embedding
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Embedding generated successfully",
                vectorLength: 6,
                firstFiveNumbers: [0.1, 0.2, 0.3, 0.4, 0.5]
            });
        });

        test("Should handle errors and return 500 (catch block)", async () => {
            // Mock the generateEmbedding function to throw an error to test the error handling in the controller
            jest.spyOn(aiService, 'generateEmbedding').mockRejectedValue(new Error("AI Crash") as never);

            await aiController.testEmbedding(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: "Failed to generate embedding" });
        });
    });

    // ==========================================
    // search FUNCTION TESTS
    // ==========================================
    describe("search", () => {
        test("Should return 400 if query is missing in body", async () => {
            // The body is empty, so the controller should respond with a 400 error indicating that the search query is missing
            mockRequest.body = {};

            await aiController.search(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: "Missing search query" });
        });

        test("Should return 200 and search results if query is valid", async () => {
            // Set up the request body with a valid search query
            mockRequest.body = { query: "How to learn Node.js?" };

            // Fake search results to be returned by the AI service when searchSimilarPosts is called
            const fakeResults = [
                { postId: new mongoose.Types.ObjectId(), text: "Node is great", score: 0.95 }
            ];
            
            // Mock the searchSimilarPosts function to return the fake results when called with the specific query and topK value
            jest.spyOn(aiService, 'searchSimilarPosts').mockResolvedValue(fakeResults as never);

            await aiController.search(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: "Search completed successfully",
                results: fakeResults
            });
            expect(aiService.searchSimilarPosts).toHaveBeenCalledWith("How to learn Node.js?", 3);
        });

        test("Should handle semantic search errors and return 500 (catch block)", async () => {
            mockRequest.body = { query: "Break the server" };
            jest.spyOn(aiService, 'searchSimilarPosts').mockRejectedValue(new Error("Search Crash") as never);

            await aiController.search(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: "Failed to perform semantic search" });
        });
    });
});