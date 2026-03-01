import express from "express";
import { pool } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { safeText, isPhone, daysBetween } from "../utils/validators.js";

export const reservationsRouter = express.Router();

function makeReservationNumber() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(10000 + Math.random() * 89999);
  return `OVR-${y}${m}${d}-${rand}`;
}

// ✅ Create reservation
reservationsRouter.post("/", requireAuth, async (req, res) => {
  const guest_name = safeText(req.body.guest_name, 120);
  const address = safeText(req.body.address, 255);
  const contact_number = String(req.body.contact_number || "").trim();
  const room_id = Number(req.body.room_id);
  const check_in = String(req.body.check_in || "").trim();
  const check_out = String(req.body.check_out || "").trim();

  if (!guest_name) return res.status(400).json({ message: "Guest name required" });
  if (!address) return res.status(400).json({ message: "Address required" });
  if (!isPhone(contact_number)) return res.status(400).json({ message: "Valid contact number required" });
  if (!Number.isInteger(room_id) || room_id <= 0) return res.status(400).json({ message: "Valid room required" });
  if (!check_in || !check_out) return res.status(400).json({ message: "Check-in and check-out required" });

  const nights = daysBetween(check_in, check_out);
  if (!Number.isFinite(nights) || nights <= 0) {
    return res.status(400).json({ message: "Check-out must be after check-in" });
  }

  try {
    // room rate + capacity
    const [roomRows] = await pool.query(
      "SELECT rate_per_night, total_rooms FROM rooms WHERE id=?",
      [room_id]
    );
    if (!roomRows.length) return res.status(404).json({ message: "Room type not found" });

    const rate = Number(roomRows[0].rate_per_night);
    const total_rooms = Number(roomRows[0].total_rooms);

    // availability check (overlap)
    const [overlaps] = await pool.query(
      `SELECT COUNT(*) AS c
       FROM reservations
       WHERE room_id=?
       AND NOT (check_out <= ? OR check_in >= ?)`,
      [room_id, check_in, check_out]
    );

    if (Number(overlaps[0].c) >= total_rooms) {
      return res.status(409).json({ message: "No availability for selected dates" });
    }

    const total_amount = Number((rate * nights).toFixed(2));
    let reservation_number = makeReservationNumber();

    // Insert
    const [result] = await pool.query(
      `INSERT INTO reservations
      (reservation_number, guest_name, address, contact_number, room_id, check_in, check_out, nights, total_amount, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [reservation_number, guest_name, address, contact_number, room_id, check_in, check_out, nights, total_amount, req.user.id]
    );

    res.json({
      id: result.insertId,
      reservation_number,
      guest_name,
      address,
      contact_number,
      room_id,
      check_in,
      check_out,
      nights,
      total_amount
    });
  } catch (e) {
    res.status(500).json({ message: "Server error", error: String(e) });
  }
});

// ✅ List reservations (search)
reservationsRouter.get("/", requireAuth, async (req, res) => {
  const q = String(req.query.q || "").trim();
  try {
    let rows;
    if (q) {
      const like = `%${q}%`;
      [rows] = await pool.query(
        `SELECT r.id, r.reservation_number, r.guest_name, r.contact_number, r.check_in, r.check_out,
                rm.room_type, r.nights, r.total_amount
         FROM reservations r
         JOIN rooms rm ON rm.id = r.room_id
         WHERE r.reservation_number LIKE ? OR r.guest_name LIKE ? OR rm.room_type LIKE ?
         ORDER BY r.created_at DESC`,
        [like, like, like]
      );
    } else {
      [rows] = await pool.query(
        `SELECT r.id, r.reservation_number, r.guest_name, r.contact_number, r.check_in, r.check_out,
                rm.room_type, r.nights, r.total_amount
         FROM reservations r
         JOIN rooms rm ON rm.id = r.room_id
         ORDER BY r.created_at DESC
         LIMIT 200`
      );
    }
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "Server error", error: String(e) });
  }
});

// ✅ Full detail by reservation number
reservationsRouter.get("/:reservation_number", requireAuth, async (req, res) => {
  const reservation_number = String(req.params.reservation_number || "").trim();

  try {
    const [rows] = await pool.query(
      `SELECT r.*, rm.room_type, rm.description, rm.rate_per_night, u.full_name AS created_by_name
       FROM reservations r
       JOIN rooms rm ON rm.id = r.room_id
       JOIN users u ON u.id = r.created_by
       WHERE r.reservation_number = ?`,
      [reservation_number]
    );

    if (!rows.length) return res.status(404).json({ message: "Reservation not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: "Server error", error: String(e) });
  }
});