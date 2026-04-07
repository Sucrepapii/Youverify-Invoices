const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const { sign } = require("jsonwebtoken");

// Mock the data layer
jest.mock("../data/invoice", () => ({
  add: jest.fn(),
  updateStatus: jest.fn(),
  getAll: jest.fn(),
  get: jest.fn(),
  replace: jest.fn(),
  remove: jest.fn(),
}));

jest.mock("../util/auth", () => ({
    checkAuth: (req, res, next) => {
        req.token = { email: "test@example.com" };
        next();
    }
}));

jest.mock("../data/activity", () => {
    const activities = [];
    return {
        add: jest.fn((data) => {
            const activity = { id: 'test-id', timestamp: new Date().toISOString(), ...data };
            activities.push(activity);
            return Promise.resolve(activity);
        }),
        getAll: jest.fn(() => Promise.resolve(activities)),
    };
});

const { add: addActivity, getAll: getAllActivities } = require("../data/activity");
const { add: addInvoice, updateStatus } = require("../data/invoice");
const invoiceRoutes = require("./invoices");

const app = express();
app.use(bodyParser.json());

// Mock Socket.io
const server = http.createServer(app);
const io = { emit: jest.fn() };
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/invoices", invoiceRoutes);
app.get("/activities", async (req, res) => {
    const activities = await getAllActivities();
    res.json({ activities });
});

describe("Activities Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should log activity when creating an invoice", async () => {
    addInvoice.mockResolvedValue({ id: "inv-123", title: "Test Invoice", invoiceNumber: "INV-001" });

    const res = await request(app)
      .post("/invoices")
      .send({ title: "Test Invoice", clientName: "Client A", amount: "100", date: "2024-01-01" });

    expect(res.statusCode).toBe(201);
    expect(addActivity).toHaveBeenCalledWith(expect.objectContaining({
      type: 'create',
      invoiceId: 'INV-001'
    }));
    expect(io.emit).toHaveBeenCalledWith("invoice:activity", expect.any(Object));
  });

  test("should log activity when updating status", async () => {
    updateStatus.mockResolvedValue({ id: "inv-123", invoiceNumber: "INV-001", status: "paid" });

    const res = await request(app)
      .patch("/invoices/inv-123/status")
      .send({ status: "paid" });

    expect(res.statusCode).toBe(200);
    expect(addActivity).toHaveBeenCalledWith(expect.objectContaining({
      type: 'status_change',
      message: expect.stringContaining("paid")
    }));
  });

  test("should fetch logged activities", async () => {
    const res = await request(app).get("/activities");
    expect(res.statusCode).toBe(200);
    expect(res.body.activities).toBeInstanceOf(Array);
  });
});
