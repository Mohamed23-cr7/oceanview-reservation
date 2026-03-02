import express from "express";
import { pool } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

export const roomsRouter = express.Router();

roomsRouter.get("/", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, room_type, description, rate_per_night, total_rooms FROM rooms ORDER BY room_type"
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "Server error", error: String(e) });
  }
});