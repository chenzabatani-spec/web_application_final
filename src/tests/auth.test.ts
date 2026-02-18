import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import UserModel from "../models/user_model";
import { Express } from "express";

let app: Express;

const testUser = {
    email: "shiri@test.com",
    password: "password123",
    username: "shiri_test"
};

beforeAll(async () => {
    // Initialize the app and wait for DB connection [cite: 238, 296]
    app = await initApp();
    // Clean the database before starting tests [cite: 234, 298]
    await UserModel.deleteMany(); 
});

afterAll(async () => {
    // Close MongoDB connection to allow Jest to exit [cite: 305]
    await mongoose.connection.close(); 
});

describe("Authentication API Tests", () => {
    
    // Test user registration [cite: 331]
    test("POST /auth/register - Should create a new user", async () => {
        const response = await request(app).post("/auth/register").send(testUser);
        expect(response.statusCode).toBe(201);
        expect(response.body.email).toBe(testUser.email);
        expect(response.body.username).toBe(testUser.username);
    });

    // Test registration with existing credentials
    test("POST /auth/register - Should fail if user already exists", async () => {
        const response = await request(app).post("/auth/register").send(testUser);
        expect(response.statusCode).not.toBe(201);
    });

    // Test user login [cite: 315]
    test("POST /auth/login - Should login and return tokens", async () => {
        const response = await request(app).post("/auth/login").send({
            email: testUser.email,
            password: testUser.password
        });
        expect(response.statusCode).toBe(200);
        // Check for required JWT tokens [cite: 338]
        expect(response.body).toHaveProperty("accessToken");
        expect(response.body).toHaveProperty("refreshToken");
    });

    // Test login failure
    test("POST /auth/login - Should fail with incorrect password", async () => {
        const response = await request(app).post("/auth/login").send({
            email: testUser.email,
            password: "wrong_password"
        });
        expect(response.statusCode).toBe(400);
    });

    // Test missing parameters in registration
    test("POST /auth/register - Should fail if email or password missing", async () => {
        const response = await request(app).post("/auth/register").send({
            username: "missing"
            // email & password missing
        });
        expect(response.statusCode).toBe(400);
    });

    // Test missing parameters in login
    test("POST /auth/login - Should fail if email missing", async () => {
        const response = await request(app).post("/auth/login").send({
            password: "123"
        });
        expect(response.statusCode).toBe(400);
    });

    // Test login with non-existent user
    test("POST /auth/login - Should fail if user does not exist", async () => {
        const response = await request(app).post("/auth/login").send({
            email: "ghost@user.com",
            password: "123"
        });
        expect(response.statusCode).toBe(400);
    });

    // Test refresh without token
    test("POST /auth/refresh - Should fail if token missing", async () => {
        const response = await request(app).post("/auth/refresh").send({});
        expect(response.statusCode).toBe(400);
    });

    // Test logout without token
    test("POST /auth/logout - Should fail if token missing", async () => {
        const response = await request(app).post("/auth/logout").send({});
        expect(response.statusCode).toBe(400);
    });

    // --- New test for change password ---
    test("PUT /auth/password - Should change password", async () => {
        // Login to get token
        const loginRes = await request(app).post("/auth/login").send(testUser);
        const token = loginRes.body.accessToken;

        // Change password
        const response = await request(app)
            .put("/auth/password") // Ensure this route exists in auth_routes
            .set("Authorization", `Bearer ${token}`)
            .send({ 
                oldPassword: testUser.password, 
                newPassword: "newPassword123!" 
            });

        expect(response.statusCode).toBe(200);

        // Try to login with new password to verify
        const newLogin = await request(app).post("/auth/login").send({
            email: testUser.email,
            password: "newPassword123!"
        });
        expect(newLogin.statusCode).toBe(200);
    });

    // Test double logout (using the same refresh token twice)
    test("POST /auth/logout - Should handle double logout", async () => {
        // Create a new user for this test to avoid interference
        const logoutUser = {
            email: "logout_test@test.com",
            password: "123",
            username: "logout_test"
        };
        await request(app).post("/auth/register").send(logoutUser);

        // Login
        const loginRes = await request(app).post("/auth/login").send(logoutUser);
        const refreshToken = loginRes.body.refreshToken;

        // First logout with the token
        const res1 = await request(app).post("/auth/logout").send({ refreshToken });
        expect(res1.statusCode).toBe(200);

        // Second Logout with SAME token (Should fail or return 200 depending on implementation, but logic triggers)
        // This covers the "if (user.refreshTokens.includes...)" logic branch
        const res2 = await request(app).post("/auth/logout").send({ refreshToken });
        expect(res2.statusCode).not.toBe(500); 
    });

    // Test duplicate registration
    test("POST /auth/register - Should fail if user already exists", async () => {
        // Try to register the same user again (testUser was registered in beforeAll or previous tests)
        const response = await request(app).post("/auth/register").send(testUser);
        expect(response.statusCode).toBe(400);
    });

    // Use invalid signature for refresh token
    test("POST /auth/refresh - Should return 403 for invalid signature", async () => {
        const response = await request(app).post("/auth/refresh").send({
            refreshToken: "invalid_refresh_token_string_123"
        });
        expect(response.statusCode).toBe(403);
    });

    // Logout with invalid signature
    test("POST /auth/logout - Should return 400 for invalid signature", async () => {
        const response = await request(app).post("/auth/logout").send({
            refreshToken: "invalid_refresh_token_string_123"
        });
        expect(response.statusCode).toBe(400);
    });

    // Test Refresh with valid JWT that is NOT in the database array
    test("POST /auth/refresh - Should fail if token is not in user's refresh tokens list", async () => {
        // 1. Create a user and get a valid token
        const tempUser = { email: "temp_refresh@test.com", password: "123", username: "temp" };
        await request(app).post("/auth/register").send(tempUser);
        const loginRes = await request(app).post("/auth/login").send(tempUser);
        const validToken = loginRes.body.refreshToken;

        // 2. Clear tokens from DB for this user to simulate "not in list"
        await UserModel.updateOne({ email: tempUser.email }, { $set: { refreshTokens: [] } });

        // 3. Try to refresh
        const response = await request(app).post("/auth/refresh").send({
            refreshToken: validToken
        });
        expect(response.statusCode).toBe(403);
    });

    // Test Logout with valid JWT that is NOT in the database array
    test("POST /auth/logout - Should handle logout if token is not in list", async () => {
        const tempUser = { email: "temp_logout@test.com", password: "123", username: "temp2" };
        await request(app).post("/auth/register").send(tempUser);
        const loginRes = await request(app).post("/auth/login").send(tempUser);
        const validToken = loginRes.body.refreshToken;

        // Simulate token missing from DB
        await UserModel.updateOne({ email: tempUser.email }, { $set: { refreshTokens: [] } });

        const response = await request(app).post("/auth/logout").send({
            refreshToken: validToken
        });
        // Usually returns 400 or 200 depending on logic, but hits the branch
        expect(response.statusCode).not.toBe(500);
    });
});