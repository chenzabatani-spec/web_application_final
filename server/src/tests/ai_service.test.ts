import mongoose from "mongoose";
import aiService from "../services/ai_service";
import Chunk from "../models/chunk_model";

// Since ai_service uses the Chunk model, we need to mock it to avoid real database interactions during tests
jest.mock("../models/chunk_model");

describe("AI Service Tests", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        // Clear all mocks before each test to ensure a clean slate
        jest.clearAllMocks();
        
        // Activate mock mode for AI service by setting environment variables
        process.env = { 
            ...originalEnv, 
            USE_MOCK_AI: 'true', 
            AI_VECTOR_DIMENSIONS: '3' // Using 3 dimensions for simpler testing, can be set to 3072 for real Gemini embeddings
        };
    });

    afterAll(() => {
        // Restore original environment variables after all tests are done to avoid side effects
        process.env = originalEnv;
    });

    describe("generateEmbedding", () => {
        it("should return a mock embedding array when USE_MOCK_AI is true", async () => {
            const embedding = await aiService.generateEmbedding("test text");
            
            expect(embedding).toHaveLength(3);
            expect(embedding).toEqual([0.1, 0.1, 0.1]); // Expect the mock embedding to be returned
        });
    });

    describe("processAndSaveChunk", () => {
        it("should generate an embedding and save a new chunk", async () => {
            const mockPostId = new mongoose.Types.ObjectId();
            const mockSave = jest.fn().mockResolvedValue(true);
            
            // Set up the Chunk mock to return an object with a save method that we can track
            (Chunk as unknown as jest.Mock).mockImplementation(() => ({
                save: mockSave
            }));

            await aiService.processAndSaveChunk(mockPostId, "some post content");

            // Make sure the Chunk constructor was called with the correct text and postId
            expect(Chunk).toHaveBeenCalledWith(expect.objectContaining({
                text: "some post content",
                postId: mockPostId
            }));
            
            // Make sure the save method was called to save the chunk
            expect(mockSave).toHaveBeenCalledTimes(1);
        });
    });

    describe("searchSimilarPosts", () => {
        it("should return chunks sorted by highest cosine similarity score", async () => {
            // Create mock chunks with known embeddings to test the search functionality
            const mockChunks = [
                { postId: "post-1", text: "bad match", embedding: [-0.9, -0.9, -0.9] },
                { postId: "post-2", text: "perfect match", embedding: [0.1, 0.1, 0.1] }
            ];

            // Test the searchSimilarPosts function with a query that should match the "perfect match" chunk
            (Chunk.find as jest.Mock).mockResolvedValue(mockChunks);

            const results = await aiService.searchSimilarPosts("query doesn't matter in mock", 2);

            expect(results).toHaveLength(2);
            // The "perfect match" chunk should have a higher cosine similarity score and thus be returned first
            expect(results[0].postId).toBe("post-2"); 
            expect(results[0].text).toBe("perfect match");
            expect(results[1].postId).toBe("post-1");
        });
    });

    describe("deleteChunksByPostId", () => {
        it("should call Chunk.deleteMany with the correct postId", async () => {
            const postId = "12345";
            (Chunk.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 2 });

            await aiService.deleteChunksByPostId(postId);

            // Ensure that Chunk.deleteMany was called with the correct filter to delete chunks associated with the given postId
            expect(Chunk.deleteMany).toHaveBeenCalledWith({ postId: postId });
            expect(Chunk.deleteMany).toHaveBeenCalledTimes(1);
        });
    });
});