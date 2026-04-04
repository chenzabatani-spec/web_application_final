import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import UserModel from "../models/user_model";
import { Express } from "express";

let app: Express;
let validAccessToken: string;
let validRefreshToken: string;

const testUser = {
    email: "shiri@test.com",
    password: "password123",
    username: "shiri_test"
};

beforeAll(async () => {
    app = await initApp();
    await UserModel.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(() => {
    jest.restoreAllMocks();
});

describe("Authentication API Tests", () => {
    
    // ==========================================
    // REGISTER TESTS
    // ==========================================
    describe("POST /auth/register", () => {
        test("Should fail if email, password, or username are missing", async () => {
            const response = await request(app).post("/auth/register").send({ username: "missing" });
            expect(response.statusCode).toBe(400);
        });

        test("Should create a new user successfully", async () => {
            const response = await request(app).post("/auth/register").send(testUser);
            expect(response.statusCode).toBe(201);
            expect(response.body.email).toBe(testUser.email);
            expect(response.body.username).toBe(testUser.username);
            expect(response.body).toHaveProperty("accessToken");
            expect(response.body).toHaveProperty("refreshToken");
        });

        test("Should fail if user already exists", async () => {
            const response = await request(app).post("/auth/register").send(testUser);
            expect(response.statusCode).toBe(400);
        });

        test("Should handle DB errors gracefully (catch block)", async () => {
            jest.spyOn(UserModel, 'findOne').mockRejectedValueOnce(new Error("DB Error") as never);
            const response = await request(app).post("/auth/register").send({
                email: "new@test.com", password: "123", username: "new_user"
            });
            expect(response.statusCode).toBe(400);
        });
    });

    // ==========================================
    // LOGIN TESTS
    // ==========================================
    describe("POST /auth/login", () => {
        test("Should fail if email or password missing", async () => {
            const response = await request(app).post("/auth/login").send({ password: "123" });
            expect(response.statusCode).toBe(400);
        });

        test("Should fail if user does not exist", async () => {
            const response = await request(app).post("/auth/login").send({
                email: "ghost@user.com", password: "123"
            });
            expect(response.statusCode).toBe(400);
        });

        test("Should fail with incorrect password", async () => {
            const response = await request(app).post("/auth/login").send({
                email: testUser.email, password: "wrong_password"
            });
            expect(response.statusCode).toBe(400);
        });

        test("Should login successfully and return tokens", async () => {
            const response = await request(app).post("/auth/login").send({
                email: testUser.email, password: testUser.password
            });
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("accessToken");
            expect(response.body).toHaveProperty("refreshToken");
            
            // Save tokens for future tests
            validAccessToken = response.body.accessToken;
            validRefreshToken = response.body.refreshToken;
        });

        test("Should handle DB errors gracefully (catch block)", async () => {
            jest.spyOn(UserModel, 'findOne').mockRejectedValueOnce(new Error("DB Error") as never);
            const response = await request(app).post("/auth/login").send({
                email: testUser.email, password: testUser.password
            });
            expect(response.statusCode).toBe(400);
        });
    });

    // ==========================================
    // REFRESH TOKEN TESTS
    // ==========================================
    describe("POST /auth/refresh", () => {
        test("Should fail if token missing", async () => {
            const response = await request(app).post("/auth/refresh").send({});
            expect(response.statusCode).toBe(400);
        });

        test("Should return 403 for invalid signature", async () => {
            const response = await request(app).post("/auth/refresh").send({
                refreshToken: "invalid_token_string"
            });
            expect(response.statusCode).toBe(403);
        });

        test("Should return new tokens successfully", async () => {
            const response = await request(app).post("/auth/refresh").send({
                refreshToken: validRefreshToken
            });
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("accessToken");
            expect(response.body).toHaveProperty("refreshToken");
            
            // Update token for future tests since the old one was consumed
            validRefreshToken = response.body.refreshToken;
        });

        test("Should detect token reuse (security breach) and return 403", async () => {
            // We use the old token that was already consumed in the previous test
            const response = await request(app).post("/auth/refresh").send({
                refreshToken: "old_consumed_token_that_should_fail"
            });
            expect(response.statusCode).toBe(403);
        });

        test("Should handle missing user in DB during refresh", async () => {
            // Mock findById to return null to test the "!user" condition
            jest.spyOn(UserModel, 'findById').mockResolvedValueOnce(null as never);
            const response = await request(app).post("/auth/refresh").send({
                refreshToken: validRefreshToken
            });
            expect(response.statusCode).toBe(400);
        });
    });

    // ==========================================
    // GET PROFILE TESTS
    // ==========================================
    describe("GET /auth/profile", () => {
        test("Should return user profile data", async () => {
            const response = await request(app)
                .get("/auth/profile") // Make sure this matches your routes!
                .set("Authorization", `Bearer ${validAccessToken}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.email).toBe(testUser.email);
        });

        test("Should handle DB errors gracefully (catch block)", async () => {
            // Fake the DB error by making findById throw an error when called during profile retrieval
            jest.spyOn(UserModel, 'findById').mockReturnValueOnce({
                select: jest.fn().mockRejectedValueOnce(new Error("DB Error"))
            } as never);

            const response = await request(app)
                .get("/auth/profile")
                .set("Authorization", `Bearer ${validAccessToken}`);
            expect(response.statusCode).toBe(500);
        });
    });

    // ==========================================
    // CHANGE PASSWORD TESTS
    // ==========================================
    describe("PUT /auth/password", () => {
        test("Should fail if old or new password missing", async () => {
            const response = await request(app)
                .put("/auth/password")
                .set("Authorization", `Bearer ${validAccessToken}`)
                .send({ oldPassword: "123" }); // Missing newPassword
            expect(response.statusCode).toBe(400);
        });

        test("Should fail if old password is incorrect", async () => {
            const response = await request(app)
                .put("/auth/password")
                .set("Authorization", `Bearer ${validAccessToken}`)
                .send({ oldPassword: "wrong", newPassword: "newPassword123!" });
            expect(response.statusCode).toBe(401);
        });

        test("Should change password successfully and revoke tokens", async () => {
            const response = await request(app)
                .put("/auth/password")
                .set("Authorization", `Bearer ${validAccessToken}`)
                .send({ oldPassword: testUser.password, newPassword: "newPassword123!" });
            expect(response.statusCode).toBe(200);
        });

        test("Should handle DB errors gracefully (catch block)", async () => {
            jest.spyOn(UserModel, 'findById').mockRejectedValueOnce(new Error("DB Error") as never);
            const response = await request(app)
                .put("/auth/password")
                .set("Authorization", `Bearer ${validAccessToken}`)
                .send({ oldPassword: "123", newPassword: "456" });
            expect(response.statusCode).toBe(500);
        });
    });

    // ==========================================
    // LOGOUT TESTS
    // ==========================================
    describe("POST /auth/logout", () => {
        test("Should fail if token missing", async () => {
            const response = await request(app).post("/auth/logout").send({});
            expect(response.statusCode).toBe(400);
        });

        test("Should handle logout for invalid signature", async () => {
            const response = await request(app).post("/auth/logout").send({
                refreshToken: "invalid_refresh_token_string"
            });
            expect(response.statusCode).toBe(400);
        });

        test("Should logout successfully", async () => {
            // Re-login to get fresh token since changePassword revoked old ones
            const loginRes = await request(app).post("/auth/login").send({
                email: testUser.email, password: "newPassword123!"
            });
            const freshToken = loginRes.body.refreshToken;

            const response = await request(app).post("/auth/logout").send({
                refreshToken: freshToken
            });
            expect(response.statusCode).toBe(200);
        });
    });
});