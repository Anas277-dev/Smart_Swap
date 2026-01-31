const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * POST /api/fcm/save-token
 * Body: { user_id, fcm_token }
 */
router.post("/save-token", async (req, res) => {
  try {
    const { user_id, fcm_token } = req.body;

    // ✅ validation
    if (!user_id || !fcm_token) {
      return res.status(400).json({
        success: false,
        message: "user_id aur fcm_token required",
      });
    }

    await pool.query(
      `
      INSERT INTO user_fcm_tokens (user_id, fcm_token, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id)
      DO UPDATE
      SET fcm_token = EXCLUDED.fcm_token,
          updated_at = NOW()
      `,
      [user_id, fcm_token]
    );

    res.json({
      success: true,
      message: "FCM token saved successfully",
    });

  } catch (err) {
    console.error("Save FCM Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
