const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ Profile Search with Detailed Matching Percentages
router.get("/:profile_id", async (req, res) => {
  try {
    const { profile_id } = req.params;

    // 1️⃣ Current user profile
    const profileResult = await pool.query(
      `
      SELECT profile_id, full_name, address, profile_image_url
      FROM user_profile
      WHERE profile_id=$1 AND deleted_at IS NULL
      `,
      [profile_id]
    );

    if (profileResult.rowCount === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const userSubjectsResult = await pool.query(
      `SELECT subject_name, subject_type
       FROM user_subjects
       WHERE profile_id=$1 AND deleted_at IS NULL`,
      [profile_id]
    );

    const userAvailabilityResult = await pool.query(
      `SELECT day_of_week, start_time, end_time
       FROM user_availability
       WHERE profile_id=$1 AND deleted_at IS NULL`,
      [profile_id]
    );

    const userTeach = userSubjectsResult.rows
      .filter(s => s.subject_type === 0)
      .map(s => s.subject_name);

    const userLearn = userSubjectsResult.rows
      .filter(s => s.subject_type === 1)
      .map(s => s.subject_name);

    const userAvailability = userAvailabilityResult.rows;

    // 2️⃣ Other profiles (profile_image_url added)
    const otherProfilesResult = await pool.query(
      `
      SELECT profile_id, full_name, address, profile_image_url
      FROM user_profile
      WHERE profile_id != $1 AND deleted_at IS NULL
      `,
      [profile_id]
    );

    const matchingProfiles = [];

    for (const other of otherProfilesResult.rows) {
      const otherSubjectsResult = await pool.query(
        `SELECT subject_name, subject_type
         FROM user_subjects
         WHERE profile_id=$1 AND deleted_at IS NULL`,
        [other.profile_id]
      );

      const otherAvailabilityResult = await pool.query(
        `SELECT day_of_week, start_time, end_time
         FROM user_availability
         WHERE profile_id=$1 AND deleted_at IS NULL`,
        [other.profile_id]
      );

      const otherTeach = otherSubjectsResult.rows
        .filter(s => s.subject_type === 0)
        .map(s => s.subject_name);

      const otherLearn = otherSubjectsResult.rows
        .filter(s => s.subject_type === 1)
        .map(s => s.subject_name);

      const otherAvailability = otherAvailabilityResult.rows;

      // 3️⃣ Subject Matching
      const teachMatchCount = userTeach.filter(sub => otherLearn.includes(sub)).length;
      const learnMatchCount = userLearn.filter(sub => otherTeach.includes(sub)).length;

      // ❌ skip if no mutual subject match
      if (teachMatchCount === 0 || learnMatchCount === 0) continue;

      const teachPercentage = userTeach.length
        ? (teachMatchCount / userTeach.length) * 100
        : 0;

      const learnPercentage = userLearn.length
        ? (learnMatchCount / userLearn.length) * 100
        : 0;

      // 4️⃣ Availability Matching
      let availabilityPercentage = 0;
      for (const ua of userAvailability) {
        for (const oa of otherAvailability) {
          if (
            ua.day_of_week === oa.day_of_week &&
            ua.start_time < oa.end_time &&
            ua.end_time > oa.start_time
          ) {
            availabilityPercentage = 100;
            break;
          }
        }
        if (availabilityPercentage) break;
      }

      // 5️⃣ Final weighted score
      const finalPercentage = Math.round(
        (teachPercentage + learnPercentage + availabilityPercentage) / 3
      );

      matchingProfiles.push({
        profile_id: other.profile_id,
        full_name: other.full_name,
        address: other.address,
        profile_image_url: other.profile_image_url, // ✅ ADDED
        teach_match_percentage: Math.round(teachPercentage),
        learn_match_percentage: Math.round(learnPercentage),
        availability_percentage: availabilityPercentage,
        final_percentage: finalPercentage,
        matched_user_teach: otherTeach,
        matched_user_learn: otherLearn
      });
    }

    if (!matchingProfiles.length) {
      return res.json({ message: "No user matching found" });
    }

    res.json({ matches: matchingProfiles });

  } catch (err) {
    console.error("Profile Search Error:", err);
    res.status(500).json({ error: "Server par koi masla ho gaya" });
  }
});

module.exports = router;
