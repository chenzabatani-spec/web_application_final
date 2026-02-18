import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import PostModel from "../models/post_model";
import UserModel from "../models/user_model";
import CommentModel from "../models/comment_model";
import { Express } from "express";

let app: Express;
let accessToken: string;
let postId: string;

const testUser = {
    email: "comment@test.com",
    password: "password123",
    username: "commentUser"
};

beforeAll(async () => {
    app = await initApp();
    await CommentModel.deleteMany();
    await PostModel.deleteMany();
    await UserModel.deleteMany();

    // Register & Login
    await request(app).post("/auth/register").send(testUser);
    const loginRes = await request(app).post("/auth/login").send(testUser);
    accessToken = loginRes.body.accessToken;

    // Create Post
    const postRes = await request(app).post("/posts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Post for comments", content: "Content" });
    postId = postRes.body._id;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Comments API Tests", () => {
    
    test("POST /comments - Should create comment", async () => {
        const response = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ postId, content: "My Comment" });
        expect(response.statusCode).toBe(201);
    });

    test("POST /comments - Should fail if postId is missing", async () => {
        const response = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ content: "Missing postId" });
        expect(response.statusCode).toBe(400);
    });

    test("POST /comments - Should fail if post does not exist", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .post("/comments")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ postId: fakeId, content: "Ghost Post" });
        expect(response.statusCode).toBe(404);
    });

    test("PUT /comments/:id - Should update comment", async () => {
        // Create temp comment
        const res = await request(app).post("/comments")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ postId, content: "Original" });
        const commentId = res.body._id;

        const updateRes = await request(app)
            .put(`/comments/${commentId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ content: "Updated" });
        
        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.body.content).toBe("Updated");
    });

    test("PUT /comments/:id - Should fail to update another user's comment", async () => {
        // Create hacker user
        const hacker = { 
            email: "hacker_update@test.com", 
            password: "123", 
            username: "hacker_update" 
        };
        await request(app).post("/auth/register").send(hacker);
        const hackerLogin = await request(app).post("/auth/login").send(hacker);
        const hackerToken = hackerLogin.body.accessToken;

        // Create comment with original user
        const res = await request(app).post("/comments")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ postId, content: "Original Content" });
        const commentId = res.body._id;

        // Try update with hacker
        const response = await request(app)
            .put(`/comments/${commentId}`)
            .set("Authorization", `Bearer ${hackerToken}`)
            .send({ content: "Hacked Content" });

        expect(response.statusCode).toBe(403);
    });

    test("DELETE /comments/:id - Should fail to delete others comment", async () => {
        // Create hacker
        const hacker = { email: "bad@guy.com", password: "123", username: "bad" };
        await request(app).post("/auth/register").send(hacker);
        const hackerLogin = await request(app).post("/auth/login").send(hacker);
        
        // Create comment with original user
        const res = await request(app).post("/comments")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ postId, content: "Don't touch" });
        
        // Try delete with hacker
        const delRes = await request(app)
            .delete(`/comments/${res.body._id}`)
            .set("Authorization", `Bearer ${hackerLogin.body.accessToken}`);

        expect(delRes.statusCode).toBe(403);
    });

    // Try to get comments without postId
    test("GET /comments - Should fail if postId is missing in query", async () => {
        const response = await request(app).get("/comments"); // שלחנו בלי ?postId=...
        expect(response.statusCode).toBe(400);
    });

    // Try to update a non-existing comment
    test("PUT /comments/:id - Should return 404 if comment does not exist", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .put(`/comments/${fakeId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ content: "Ghost update" });
            
        expect(response.statusCode).toBe(404);
    });

    // Try to delete a non-existing comment
    test("DELETE /comments/:id - Should return 404 if comment does not exist", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
            .delete(`/comments/${fakeId}`)
            .set("Authorization", `Bearer ${accessToken}`);
            
        expect(response.statusCode).toBe(404);
    });
});