import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import PostModel from "../models/post_model";
import UserModel from "../models/user_model";
import { Express } from "express";

let app: Express;
let accessToken: string;
let userId: string;
let postId: string;

const testUser = {
    email: "test@post.com",
    password: "password123",
    username: "testuser"
};

beforeAll(async () => {
    app = await initApp();
    await PostModel.deleteMany();
    await UserModel.deleteMany();

    // Register and Login
    await request(app).post("/auth/register").send(testUser);
    const loginRes = await request(app).post("/auth/login").send(testUser);
    accessToken = loginRes.body.accessToken;
    userId = loginRes.body._id;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Posts API Tests", () => {
    
    test("GET /posts - Should return empty list initially", async () => {
        const response = await request(app).get("/posts");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    });

    test("POST /posts - Should create a new post", async () => {
        const newPost = {
            title: "Test Post",
            content: "Test Content"
        };
        const response = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${accessToken}`)
            .send(newPost);

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(newPost.title);
        expect(response.body.sender).toBe(userId);
        postId = response.body._id; 
    });

    test("GET /posts/:id - Should get a post by ID", async () => {
        const response = await request(app).get(`/posts/${postId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe("Test Post");
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

    test("GET /posts - Should handle pagination (limit and page)", async () => {
        // Create 2 additional posts to have enough data
        await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ title: "Post 2", content: "Content 2" });
        await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ title: "Post 3", content: "Content 3" });

        const response = await request(app).get("/posts?page=1&limit=2");

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBe(2); 
    });

    test("PUT /posts/:id - Should update a post", async () => {
        const response = await request(app)
            .put(`/posts/${postId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ title: "Updated Title" });

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe("Updated Title");
    });

    test("DELETE /posts/:id - Should delete a post", async () => {
        const response = await request(app)
            .delete(`/posts/${postId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
    });

    test("GET /posts/:id - Should return 404 for non-existent post", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app).get(`/posts/${fakeId}`);
        expect(response.statusCode).toBe(404);
    });

    test("POST /posts - Should fail validation with empty body", async () => {
        const response = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({}); 

        expect(response.statusCode).toBe(400); 
    });
});