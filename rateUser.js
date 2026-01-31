// const express = require("express");
// const router = express.Router();
// const { Pool } = require("pg");
// require("dotenv").config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });

// /**
//  * POST /api/ratings
//  * body: { request_id, rated_by, rated_to, rating_value, feedback }
//  */
// router.post("/", async (req, res) => {
//   try {
//     const {
//       request_id,
//       rated_by,
//       rated_to,
//       rating_value,
//       feedback = ""
//     } = req.body;

//     // 🔴 basic validation
//     if (!request_id || !rated_by || !rated_to || !rating_value) {
//       return res.status(400).json({
//         success:false,
//         message:"All fields required"
//       });
//     }

//     if (rating_value < 1 || rating_value > 5) {
//       return res.status(400).json({
//         success:false,
//         message:"Rating 1 se 5 ke darmiyan honi chahiye"
//       });
//     }

//     // 🔹 call ended check
//     const callRes = await pool.query(
//       `SELECT * FROM call_sessions
//        WHERE booking_id=$1 AND status='ended'`,
//       [request_id]
//     );

//     if (!callRes.rowCount) {
//       return res.json({
//         success:false,
//         message:"Call abhi complete nahi hui"
//       });
//     }

//     // 🔹 verify dono call ka hissa thay
//     const participants = await pool.query(
//       `SELECT user_id FROM call_participants
//        WHERE call_id=$1`,
//       [callRes.rows[0].call_id]
//     );

//     const users = participants.rows.map(p=>p.user_id);

//     if (!users.includes(rated_by) || !users.includes(rated_to)) {
//       return res.status(403).json({
//         success:false,
//         message:"Aap is call ka hissa nahi thay"
//       });
//     }

//     // 🔹 duplicate rating check
//     const already = await pool.query(
//       `SELECT rating_id FROM user_ratings
//        WHERE request_id=$1 AND rated_by=$2`,
//       [request_id, rated_by]
//     );

//     if (already.rowCount) {
//       return res.json({
//         success:false,
//         message:"Aap pehle hi rating de chuke ho"
//       });
//     }

//     // 🔹 insert rating
//     await pool.query(
//       `INSERT INTO user_ratings
//        (rated_by, rated_to, request_id, rating_value, feedback)
//        VALUES ($1,$2,$3,$4,$5)`,
//       [rated_by, rated_to, request_id, rating_value, feedback]
//     );

//     res.json({
//       success:true,
//       message:"Rating submit ho gayi"
//     });

//   } catch (err) {
//     console.error("Rating Error:", err);
//     res.status(500).json({
//       success:false,
//       message:"Server error"
//     });
//   }
// });

// module.exports = router;
