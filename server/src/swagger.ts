import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Web Applications - Assignment2 REST API",
            version: "1.0.0",
            description: "REST server including authentication, posts, comments and users management.",
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                Post: {
                    type: "object",
                    required: ["title", "content", "sender"],
                    properties: {
                    _id: { type: "string", description: "The auto-generated id of the post" },
                    title: { type: "string", description: "The post title" },
                    content: { type: "string", description: "The post content" },
                    sender: { type: "string", description: "The sender user ID" },
                    },
                    example: {
                    _id: "609e129e1c4ae12f34567890",
                    title: "Sample Post",
                    content: "This is a sample post content.",
                    sender: "609e129e1c4ae12f34567891",
                    },
                },
                Comment: {
                    type: "object",
                    required: ["postId", "content", "sender"],
                    properties: {
                    _id: { type: "string", description: "The auto-generated id of the comment" },
                    postId: { type: "string", description: "The ID of the post" },
                    content: { type: "string", description: "The comment content" },
                    sender: { type: "string", description: "The sender user ID" },
                    },
                    example: {
                    _id: "709e129e1c4ae12f34567890",
                    postId: "609e129e1c4ae12f34567890",
                    content: "This is a sample comment content.",
                    sender: "609e129e1c4ae12f34567891",
                    },
                },
                User: {
                    type: "object",
                    required: ["username", "email"],
                    properties: {
                    _id: { type: "string", description: "The auto-generated id of the user" },
                    username: { type: "string", description: "The user's username" },
                    email: { type: "string", description: "The user's email" },
                    password: { type: "string", description: "The user's password" },
                    },
                    example: {
                    _id: "809e129e1c4ae12f34567890",
                    username: "sampleuser",
                    email: "kuku@example.com",
                    password: "hashedpassword123",
                    },
                }
            },
        },
    },
    apis: ["./src/routes/*.ts"],
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};