import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import PostModel from "../models/post_model";
import UserModel from "../models/user_model";
import { Express } from "express";
import aiService from "../services/ai_service";

let app: Express;
let accessToken: string;
let secondaryAccessToken: string; // Used to test 403 Forbidden scenarios
let userId: string;
let postId: string;

const testUser = {
    email: "test@post.com",
    password: "password123",
    username: "testuser"
};

const secondaryUser = {
    email: "hacker@post.com",
    password: "password123",
    username: "hacker"
};

beforeAll(async () => {
    app = await initApp();
    await PostModel.deleteMany();
    await UserModel.deleteMany();

    // Register and Login main user
    await request(app).post("/auth/register").send(testUser);
    const loginRes = await request(app).post("/auth/login").send(testUser);
    accessToken = loginRes.body.accessToken;
    userId = loginRes.body._id;

    // Register and Login secondary user
    await request(app).post("/auth/register").send(secondaryUser);
    const loginRes2 = await request(app).post("/auth/login").send(secondaryUser);
    secondaryAccessToken = loginRes2.body.accessToken;
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(() => {
    jest.clearAllMocks(); // Reset spies and mocks before each test
    // Add spies to monitor calls to AI service functions without affecting their actual behavior
    jest.spyOn(aiService, 'processAndSaveChunk').mockResolvedValue(undefined as never);
    jest.spyOn(aiService, 'deleteChunksByPostId').mockResolvedValue(undefined as never);
});

describe("Posts API Tests", () => {
    
    // --- CREATE POSTS ---
    test("POST /posts - Should return 401 if unauthorized", async () => {
        const response = await request(app).post("/posts").send({ title: "No Auth" });
        expect(response.statusCode).toBe(401);
    });

    test("POST /posts - Should create a new post", async () => {
        const newPost = { title: "Test Post", content: "Test Content" };
        const response = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${accessToken}`)
            .send(newPost);

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(newPost.title);
        // Verify that the AI service was triggered
        expect(aiService.processAndSaveChunk).toHaveBeenCalledTimes(1);
        postId = response.body._id; 
    });

    test("POST /posts - Should return 400 on DB error (catch block)", async () => {
        jest.spyOn(PostModel, 'create').mockRejectedValueOnce(new Error("DB Error") as never);
        
        const response = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ title: "Test" }); 

        expect(response.statusCode).toBe(400); 
    });

    // --- GET POSTS ---
    test("GET /posts - Should return list of posts", async () => {
        const response = await request(app).get("/posts");
        expect(response.statusCode).toBe(200);
        expect(response.body.posts.length).toBeGreaterThan(0);
    });

    test("GET /posts - Should filter posts by senderId", async () => {
        const response = await request(app).get(`/posts?senderId=${userId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.posts[0].sender._id).toBe(userId);
    });

    test("GET /posts - Should return 500 for invalid senderId format (catch block)", async () => {
        // Passing an invalid string forces Mongoose to throw a CastError, hitting the catch block
        const response = await request(app).get(`/posts?senderId=invalid_id_format`);
        expect(response.statusCode).toBe(500);
    });

    test("GET /posts/:id - Should get a post by ID", async () => {
        const response = await request(app).get(`/posts/${postId}`);
        expect(response.statusCode).toBe(200);
    });

    test("GET /posts/:id - Should return 404 for non-existent post", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app).get(`/posts/${fakeId}`);
        expect(response.statusCode).toBe(404);
    });

    // --- LIKES ---
    test("PATCH /posts/:id/like - Should return 401 without auth", async () => {
        const response = await request(app).patch(`/posts/${postId}/like`);
        expect(response.statusCode).toBe(401);
    });

    test("PATCH /posts/:id/like - Should return 404 for non-existent post", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .patch(`/posts/${fakeId}/like`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(response.statusCode).toBe(404);
    });

    test("PATCH /posts/:id/like - Should toggle like on a post", async () => {
        // First click: Add like
        const likeRes = await request(app)
            .patch(`/posts/${postId}/like`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(likeRes.statusCode).toBe(200);
        expect(likeRes.body.likes).toContain(userId);

        // Second click: Remove like
        const unlikeRes = await request(app)
            .patch(`/posts/${postId}/like`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(unlikeRes.statusCode).toBe(200);
        expect(unlikeRes.body.likes).not.toContain(userId);
    });

    test("PATCH /posts/:id/like - Should return 400 for invalid ID format (catch block)", async () => {
        const response = await request(app)
            .patch(`/posts/invalid_id/like`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(response.statusCode).toBe(400);
    });

    // --- UPDATE POSTS ---
    test("PUT /posts/:id - Should update a post if owner", async () => {
        const response = await request(app)
            .put(`/posts/${postId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ title: "Updated Title" });

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe("Updated Title");
    });

    test("PUT /posts/:id - Should handle deletePhoto flag", async () => {
        const response = await request(app)
            .put(`/posts/${postId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ deletePhoto: "true" });

        expect(response.statusCode).toBe(200);
        expect(response.body.photo).toBe("");
    });

    test("PUT /posts/:id - Should return 403 if trying to update someone else's post", async () => {
        const response = await request(app)
            .put(`/posts/${postId}`)
            .set("Authorization", `Bearer ${secondaryAccessToken}`)
            .send({ title: "Hacked Title" });

        expect(response.statusCode).toBe(403);
    });

    test("PUT /posts/:id - Should return 404 for non-existent post", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .put(`/posts/${fakeId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ title: "Doesn't matter" });
        expect(response.statusCode).toBe(404);
    });

    test("PUT /posts/:id - Should return 400 for invalid ID format (catch block)", async () => {
        const response = await request(app)
            .put(`/posts/invalid_id`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(response.statusCode).toBe(400);
    });

    // --- DELETE POSTS ---
    test("DELETE /posts/:id - Should return 403 if trying to delete someone else's post", async () => {
        const response = await request(app)
            .delete(`/posts/${postId}`)
            .set("Authorization", `Bearer ${secondaryAccessToken}`);

        expect(response.statusCode).toBe(403);
    });

    test("DELETE /posts/:id - Should return 404 for non-existent post", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .delete(`/posts/${fakeId}`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(response.statusCode).toBe(404);
    });

    test("DELETE /posts/:id - Should return 400 for invalid ID format (catch block)", async () => {
        const response = await request(app)
            .delete(`/posts/invalid_id`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(response.statusCode).toBe(400);
    });

    test("DELETE /posts/:id - Should delete a post and clear AI memory", async () => {
        const response = await request(app)
            .delete(`/posts/${postId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
        // Verify that the server actually requested the AI to delete its chunks
        expect(aiService.deleteChunksByPostId).toHaveBeenCalledWith(postId);
        expect(aiService.deleteChunksByPostId).toHaveBeenCalledTimes(1);
    });
});