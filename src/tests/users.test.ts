import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import UserModel from "../models/user_model";
import { Express } from "express";

let app: Express;
let accessToken: string;
let userId: string;

const testUser = {
    email: "user_base_test@test.com",
    password: "password123",
    username: "userBaseTest"
};

beforeAll(async () => {
    app = await initApp();
    await UserModel.deleteMany();

    // Register & Login to get token
    const res = await request(app).post("/auth/register").send(testUser);
    accessToken = res.body.accessToken;
    userId = res.body._id;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("User API & Base Controller Tests", () => {
    
    test("GET /users/:id - Should return user details", async () => {
        const response = await request(app)
            .get(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.email).toBe(testUser.email);
    });

    // Adding token + expecting 500 (as BaseController returns in catch)
    test("GET /users/:id - Should fail with invalid ID format", async () => {
        const response = await request(app)
            .get("/users/bad_id_format_123")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(500); 
    });

    test("POST /users - Should block direct user creation", async () => {
        const response = await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ username: "imposter" });

        expect(response.statusCode).toBe(405); // "Use /auth/register..."
    });

    test("PUT /users/:id - Should update user via BaseController", async () => {
        const response = await request(app)
            .put(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ username: "UpdatedName" });

        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe("UpdatedName");
    });

    test("DELETE /users/:id - Should delete user via BaseController", async () => {
        const response = await request(app)
            .delete(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`);
            
        expect(response.statusCode).toBe(200);
    });

    test("PUT /users/:id - Should ignore password update attempts via user route", async () => {
        // Attempt to update password via user route (should be blocked/ignored)
        const response = await request(app)
            .put(`/users/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ 
                password: "hackedPassword123",
                username: "StillTheSameUser" 
            });

        expect(response.statusCode).toBe(200);

        // Verify: Try to login with the "new" password - should fail
        // because the password should not have been changed by the previous request
        const loginTry = await request(app).post("/auth/login").send({
            email: testUser.email,
            password: "hackedPassword123"
        });
        
        expect(loginTry.statusCode).toBe(400); // Failed because password was not actually changed
    });
});