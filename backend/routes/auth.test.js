const request = require("supertest");

// Mock the data layer
jest.mock("../data/user", () => ({
  add: jest.fn(),
  get: jest.fn(),
}));

jest.mock("../data/util", () => ({
  readData: jest.fn(),
  writeData: jest.fn(),
}));

const { add, get } = require("../data/user");

const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./auth");

const app = express();
app.use(bodyParser.json());
app.use(authRoutes);

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /signup", () => {
    test("should create a user with valid data", async () => {
      add.mockResolvedValue({ email: "test@example.com", id: "123" });
      get.mockRejectedValue(new Error("User not found")); // User doesn't exist yet

      const res = await request(app)
        .post("/signup")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.message).toBe("User created.");
      expect(add).toHaveBeenCalled();
    });

    test("should return 422 for invalid email", async () => {
      const res = await request(app)
        .post("/signup")
        .send({ email: "invalid", password: "password123" });

      expect(res.statusCode).toBe(422);
    });

    test("should return 422 if email already exists", async () => {
      get.mockResolvedValue({ email: "test@example.com" }); // User exists

      const res = await request(app)
        .post("/signup")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.statusCode).toBe(422);
      expect(res.body.errors).toHaveProperty("email");
    });
  });
});
