const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// ---------------- DB ----------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ---------------- MULTER CONFIG ----------------

const uploadDir = "uploads/profiles";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// Better File Filter (added jfif support)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/jfif"];
  if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|gif|jfif)$/i)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, png, jfif) are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ---------------- ROUTES ----------------

router.post("/", upload.single("profile_image"), async (req, res) => {
  try {
    // Debugging logs (Check your terminal)
    console.log("File received:", req.file); 
    console.log("Body received:", req.body);

    const {
      user_id,
      full_name,
      class_level,
      stream,
      bio,
      phone_no,
      address,
      status,
    } = req.body;

    // Validation
    if (!user_id || !full_name || !class_level || stream === undefined) {
      return res.status(400).json({
        success: false,
        message: "user_id, full_name, class_level, and stream are required",
      });
    }

    // Fixed Image URL logic
    const imageUrl = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    const safeStream = [0, 1].includes(Number(stream)) ? Number(stream) : 0;
    const safeStatus = status !== undefined ? Number(status) : 0;

    const query = `
      INSERT INTO user_profile 
      (user_id, full_name, class_level, stream, bio, phone_no, address, profile_image_url, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *;
    `;

    const values = [
      user_id,
      full_name,
      class_level,
      safeStream,
      bio || null,
      phone_no || null,
      address || null,
      imageUrl, // This will now correctly save the path
      safeStatus
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "✅ Profile created successfully",
      profile: result.rows[0],
    });

  } catch (err) {
    console.error("Create Profile Error:", err);
    if (err.code === "23505") {
      return res.status(400).json({ success: false, message: "Profile already exists" });
    }
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      "SELECT * FROM user_profile WHERE user_id=$1",
      [user_id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;