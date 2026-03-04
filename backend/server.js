import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import app from "./app.js";

import { pool } from "./config/db.js";

import { authRouter } from "./routes/auth.routes.js";
import { roomsRouter } from "./routes/rooms.routes.js";
import { reservationsRouter } from "./routes/reservations.routes.js";

export default app;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/test-db", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, message: "Database Connected Successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/reservations", reservationsRouter);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
