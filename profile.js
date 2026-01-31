const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// ---------------- DB CONNECTION ----------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ---------------- CLOUDINARY CONFIG ----------------
// Ye credentials Vercel dashboard ya .env se aayenge
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Multer ko Cloudinary ke saath link karna
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "smart_swap_profiles", // Cloudinary mein is naam ka folder banega
    allowed_formats: ["jpg", "png", "jpeg", "jfif", "webp"],
  },
});

const upload = multer({ storage: storage });

// ---------------- ROUTES ----------------

/**
 * ✅ CREATE PROFILE (Vercel & Cloudinary Ready)
 */
router.post("/", upload.single("profile_image"), async (req, res) => {
  try {
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

    // Cloudinary URL: req.file.path mein automatic cloud link aa jata hai
    const imageUrl = req.file ? req.file.path : null;

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
      imageUrl, // Yahan 'https://res.cloudinary.com/...' wala link save hoga
      safeStatus
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "✅ Profile created. Image saved on Cloudinary!",
      profile: result.rows[0],
    });

  } catch (err) {
    console.error("Vercel Error:", err.message);
    if (err.code === "23505") {
      return res.status(400).json({ success: false, message: "Profile already exists" });
    }
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

/**
 * ✅ GET PROFILE
 */
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
