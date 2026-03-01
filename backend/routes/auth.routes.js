import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

export const authRouter = express.Router();

/* =========================
   REGISTER
========================= */
authRouter.post("/register", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Password validation
    const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRule.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase and a number."
      });
    }

    // Check if email already exists
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered." });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, role) VALUES (?,?,?,?)",
      [full_name, email, password_hash, "receptionist"]
    );

    const user = {
      id: result.insertId,
      full_name,
      email,
      role: "receptionist"
    };

    const token = jwt.sign(
      user,
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "1d" }
    );

    res.status(201).json({ token, user });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   LOGIN
========================= */
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const userRow = rows[0];

    const validPassword = await bcrypt.compare(
      password,
      userRow.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = {
      id: userRow.id,
      full_name: userRow.full_name,
      email: userRow.email,
      role: userRow.role
    };

    const token = jwt.sign(
      user,
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "1d" }
    );

    res.json({ token, user });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});