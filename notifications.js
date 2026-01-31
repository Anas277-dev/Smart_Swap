// only Get Api
const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  GET USER NOTIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const result = await pool.query(
      `SELECT 
         notification_id,
         title,
         message,
         type,
         is_read,
         created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      total_notifications: result.rowCount,
      notifications: result.rows,
    });

  } catch (err) {
    console.error("Get Notifications Error:", err);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

module.exports = router;
