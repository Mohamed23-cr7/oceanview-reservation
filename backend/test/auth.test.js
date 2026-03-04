import request from "supertest";
import app from "../app.js";

describe("API Test", () => {
  test("Server should respond", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });
});