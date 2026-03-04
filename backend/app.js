import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { pool } from "./config/db.js";
import { authRouter } from "./routes/auth.routes.js";
import { roomsRouter } from "./routes/rooms.routes.js";
import { reservationsRouter } from "./routes/reservations.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Health check route (good for testing)
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

// ✅ Database test route (yours)
app.get("/api/test-db", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, message: "Database Connected Successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ✅ Routers
app.use("/api/auth", authRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/reservations", reservationsRouter);

export default app;