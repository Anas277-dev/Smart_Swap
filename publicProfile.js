const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ Get public profile by profile_id
router.get("/:profile_id", async (req, res) => {
  try {
    const { profile_id } = req.params;

    // 🔹 Get user profile (profile_image_url added)
    const profileResult = await pool.query(
      `
      SELECT 
        profile_id,
        full_name,
        class_level,
        stream,
        bio,
        address,
        profile_image_url
      FROM user_profile
      WHERE profile_id=$1 AND deleted_at IS NULL
      `,
      [profile_id]
    );

    if (profileResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Profile nahi mili"
      });
    }

    const profile = profileResult.rows[0];

    // 🔹 Get teach and learn subjects
    const subjectsResult = await pool.query(
      `
      SELECT subject_name, subject_type
      FROM user_subjects
      WHERE profile_id=$1 AND deleted_at IS NULL
      `,
      [profile_id]
    );

    const teachSubjects = subjectsResult.rows
      .filter(s => s.subject_type === 0)
      .map(s => s.subject_name);

    const learnSubjects = subjectsResult.rows
      .filter(s => s.subject_type === 1)
      .map(s => s.subject_name);

    // 🔹 Get availability
    const availabilityResult = await pool.query(
      `
      SELECT day_of_week, start_time, end_time
      FROM user_availability
      WHERE profile_id=$1 AND deleted_at IS NULL
      `,
      [profile_id]
    );

    res.json({
      success: true,
      profile,                 // ✅ profile_image_url included here
      teach_subjects: teachSubjects,
      learn_subjects: learnSubjects,
      availability: availabilityResult.rows
    });

  } catch (err) {
    console.error("Public Profile Error:", err);
    res.status(500).json({
      success: false,
      error: "Server par koi masla ho gaya"
    });
  }
});

module.exports = router;
