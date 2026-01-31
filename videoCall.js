
// // videoCall.js
// const express = require("express");
// const router = express.Router();
// const { Pool } = require("pg");
// const { generateToken } = require("./agoraToken");
// require("dotenv").config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });

// /**
//  * Generate video call link and token
//  * @POST /api/video-call/start
//  * body: { request_id }
//  */
// router.post("/start", async (req, res) => {
//   try {
//     const { request_id } = req.body;

//     if (!request_id) {
//       return res.status(400).json({ success: false, error: "request_id required" });
//     }

//     // 🔹 Get swap request + availability
//     const swapRes = await pool.query(
//       `SELECT sr.*, 
//               sa.start_time AS sender_start, sa.end_time AS sender_end,
//               ra.start_time AS receiver_start, ra.end_time AS receiver_end
//        FROM swap_requests sr
//        JOIN user_availability sa ON sa.availability_id = sr.sender_availability_id
//        JOIN user_availability ra ON ra.availability_id = sr.receiver_availability_id
//        WHERE sr.request_id=$1 AND sr.status='accepted' AND sr.deleted_at IS NULL`,
//       [request_id]
//     );

//     if (swapRes.rowCount === 0) {
//       return res.status(404).json({ success: false, error: "Accepted swap request not found" });
//     }

//     const swap = swapRes.rows[0];

//     // 🔹 Calculate call duration based on availability
//     const startTime = new Date(Math.max(new Date(swap.sender_start), new Date(swap.receiver_start)));
//     const endTime = new Date(Math.min(new Date(swap.sender_end), new Date(swap.receiver_end)));
//     const durationSec = Math.max(Math.floor((endTime - startTime) / 1000), 300); // minimum 5 min

//     // 🔹 Unique channel name
//     const channelName = `swap_${swap.request_id}`;

//     // 🔹 Generate tokens
//     const senderToken = generateToken(channelName, swap.sender_user_id, "publisher", durationSec);
//     const receiverToken = generateToken(channelName, swap.receiver_user_id, "publisher", durationSec);

//     res.json({
//       success: true,
//       channelName,
//       expireInSeconds: durationSec,
//       tokens: {
//         sender: senderToken,
//         receiver: receiverToken
//       }
//     });

//   } catch (err) {
//     console.error("Video Call Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// module.exports = router;




// const express = require("express");
// const router = express.Router();
// const { Pool } = require("pg");
// const { generateToken } = require("./agoraToken");
// require("dotenv").config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });

// /**
//  * Generate video call link and token
//  * @POST /api/video-call/start
//  * body: { request_id }
//  */
// router.post("/start", async (req, res) => {
//   try {
//     const { request_id } = req.body;

//     if (!request_id) {
//       return res.status(400).json({ success: false, error: "request_id required" });
//     }

//     // 🔹 Get swap request + sender/receiver availability
//     const swapRes = await pool.query(
//       `SELECT sr.*, 
//               sa.start_time AS sender_start, sa.end_time AS sender_end,
//               ra.start_time AS receiver_start, ra.end_time AS receiver_end
//        FROM swap_requests sr
//        JOIN user_availability sa ON sa.availability_id = sr.sender_availability_id
//        JOIN user_availability ra ON ra.availability_id = sr.receiver_availability_id
//        WHERE sr.request_id=$1 AND sr.status='accepted' AND sr.deleted_at IS NULL`,
//       [request_id]
//     );

//     if (swapRes.rowCount === 0) {
//       return res.status(404).json({ success: false, error: "Accepted swap request not found" });
//     }

//     const swap = swapRes.rows[0];

//     // 🔹 Calculate overlapping start & end time
//     const senderStart = new Date(swap.sender_start);
//     const senderEnd   = new Date(swap.sender_end);
//     const receiverStart = new Date(swap.receiver_start);
//     const receiverEnd   = new Date(swap.receiver_end);

//     const startTime = new Date(Math.max(senderStart, receiverStart));
//     const endTime   = new Date(Math.min(senderEnd, receiverEnd));

//     const durationSec = Math.floor((endTime - startTime) / 1000);

//     if (durationSec <= 0) {
//       return res.status(400).json({ success: false, error: "No overlapping availability for video call" });
//     }

//     // 🔹 Unique channel name
//     const channelName = `swap_${swap.request_id}`;

//     // 🔹 Generate tokens
//     const senderToken = generateToken(channelName, swap.sender_user_id, "publisher", durationSec);
//     const receiverToken = generateToken(channelName, swap.receiver_user_id, "publisher", durationSec);

//     res.json({
//       success: true,
//       channelName,
//       expireInSeconds: durationSec,
//       tokens: {
//         sender: senderToken,
//         receiver: receiverToken
//       }
//     });

//   } catch (err) {
//     console.error("Video Call Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// module.exports = router;
