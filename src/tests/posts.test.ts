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
        postId = response.body._id; // Save for later
    });

    test("GET /posts/:id - Should get a post by ID", async () => {
        const response = await request(app).get(`/posts/${postId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe("Test Post");
    });

    test("GET /posts/:id - Should return 404 for non-existent post", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app).get(`/posts/${fakeId}`);

        expect(response.statusCode).toBe(404);
    });

    test("PUT /posts/:id - Should update a post", async () => {
        const response = await request(app)
            .put(`/posts/${postId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ title: "Updated Title" });

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe("Updated Title");
    });

    test("PUT /posts/:id - Should fail to update post if not owner", async () => {
        // Create a hacker user
        const hacker = { email: "hacker@post.com", password: "123", username: "hacker" };
        await request(app).post("/auth/register").send(hacker);
        const hackerLogin = await request(app).post("/auth/login").send(hacker);
        const hackerToken = hackerLogin.body.accessToken;

        const response = await request(app)
            .put(`/posts/${postId}`)
            .set("Authorization", `Bearer ${hackerToken}`)
            .send({ title: "Hacked Title" });

        expect(response.statusCode).toBe(403); // Access Denied
    });

    test("DELETE /posts/:id - Should delete a post", async () => {
        const response = await request(app)
            .delete(`/posts/${postId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
    });

    test("DELETE /posts/:id - Should return 404 if post doesn't exist", async () => {
        const response = await request(app)
            .delete(`/posts/${postId}`) // It was just deleted
            .set("Authorization", `Bearer ${accessToken}`);
            
        expect(response.statusCode).toBe(404);
    });

    // Check that we can filter posts by sender in base controller
    test("GET /posts - Should filter posts by sender", async () => {
        const response = await request(app).get(`/posts?sender=${userId}`);
        
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        // Make sure all returned posts actually belong to this user
        response.body.forEach((post: { sender: string }) => {
        expect(post.sender).toBe(userId);
        });
    });

    // Check that invalid ID format is handled gracefully in BaseController.getById
    test("GET /posts/:id - Should return 500 or 400 for invalid ID format", async () => {
        // Sending an ID that is just gibberish (not in MongoDB format)
        // Trows CastError in Mongoose and is caught in BaseController
        const response = await request(app).get("/posts/invalid_id_123");
        
        // Expecting an error (usually 500 in our current Base implementation)
        expect(response.statusCode).not.toBe(200); 
    });

    test("POST /posts - Should fail validation with empty body", async () => {
        const response = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({}); // Empty body causes validation error

        expect(response.statusCode).toBe(400); 
    });

    test("PUT /posts/:id - Should return 400 for invalid ID format", async () => {
        // Trying to update with an invalid ID format
        // Will cause CastError in Mongoose, caught in BaseController
        const response = await request(app)
            .put("/posts/invalid_id_format_123") 
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ 
                title: "Updated Title"
            }); 
            
        expect(response.statusCode).toBe(400);
    });
    
});