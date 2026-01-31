// const express = require("express");
// const router = express.Router();
// const { Pool } = require("pg");
// const { generateToken } = require("./agoraToken");
// require("dotenv").config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });

// /* 🔹 Helper: next date of given weekday */
// function getNextDateOfDay(dayName) {
//   const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
//   const today = new Date();
//   const todayIndex = today.getDay();
//   const targetIndex = days.indexOf(dayName);

//   let diff = targetIndex - todayIndex;
//   if (diff < 0) diff += 7;

//   const result = new Date(today);
//   result.setDate(today.getDate() + diff);
//   return result;
// }

// /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//    AUTO VIDEO CALL START
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
// router.post("/start", async (req, res) => {
//   try {
//     const { request_id, user_id } = req.body;

//     if (!request_id || !user_id) {
//       return res.status(400).json({ success:false, error:"request_id & user_id required" });
//     }

//     const swapRes = await pool.query(
//       `SELECT sr.*, 
//               sa.day_of_week, sa.start_time, sa.end_time
//        FROM swap_requests sr
//        JOIN user_availability sa ON sa.availability_id = sr.sender_availability_id
//        WHERE sr.request_id=$1
//          AND sr.status='accepted'
//          AND sr.deleted_at IS NULL`,
//       [request_id]
//     );

//     if (swapRes.rowCount === 0) {
//       return res.status(404).json({ success:false, error:"Accepted request not found" });
//     }

//     const swap = swapRes.rows[0];

//     // 🔹 Build proper datetime
//     const baseDate = getNextDateOfDay(swap.day_of_week);
//     const startDateTime = new Date(`${baseDate.toDateString()} ${swap.start_time}`);
//     const endDateTime   = new Date(`${baseDate.toDateString()} ${swap.end_time}`);

//     const now = new Date();

//     if (now < startDateTime) {
//       return res.status(403).json({
//         success:false,
//         message:`Call ${startDateTime.toLocaleTimeString()} par start hogi`
//       });
//     }

//     if (now > endDateTime) {
//       return res.status(403).json({
//         success:false,
//         message:"Call ka time khatam ho chuka hai"
//       });
//     }

//     const expireInSeconds = Math.floor((endDateTime - now) / 1000);

//     const channelName = `swap_${request_id}`;
//     const token = generateToken(channelName, user_id, "publisher", expireInSeconds);

//     res.json({
//       success: true,
//       channelName,
//       token,
//       expires_in_seconds: expireInSeconds,
//       call_end_time: endDateTime,
//       message: "Video call active hai. End time par auto disconnect ho jayegi"
//     });

//   } catch (err) {
//     console.error("AUTO VIDEO CALL ERROR:", err);
//     res.status(500).json({ success:false, error:"Internal Server Error" });
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

// router.post("/start", async (req, res) => {
//   try {
//     const { request_id, user_id } = req.body;

//     if (!request_id || !user_id) {
//       return res.status(400).json({ success:false, error:"request_id & user_id required" });
//     }

//     const result = await pool.query(
//       `SELECT sr.*,
//               ua.day_of_week,
//               ua.start_time,
//               ua.end_time
//        FROM swap_requests sr
//        JOIN user_availability ua
//          ON ua.availability_id = sr.sender_availability_id
//        WHERE sr.request_id=$1
//          AND sr.status='accepted'
//          AND sr.deleted_at IS NULL`,
//       [request_id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ success:false, error:"Accepted request not found" });
//     }

//     const data = result.rows[0];

//     // 🔹 Today check
//     const todayName = new Date().toLocaleString("en-US", { weekday:"long" });

//     if (data.day_of_week !== todayName) {
//       return res.json({
//         success:false,
//         message:`Call sirf ${data.day_of_week} ko allowed hai`
//       });
//     }

//     // 🔹 Build today's datetime
//     const today = new Date().toISOString().split("T")[0];
//     const start = new Date(`${today} ${data.start_time}`);
//     const end   = new Date(`${today} ${data.end_time}`);
//     const now   = new Date();

//     if (end <= start) {
//       return res.status(400).json({
//         success:false,
//         error:"Invalid availability (start_time must be less than end_time)"
//       });
//     }

//     if (now < start) {
//       return res.json({
//         success:false,
//         message:`Call ${start.toLocaleTimeString()} par start hogi`
//       });
//     }

//     if (now > end) {
//       return res.json({
//         success:false,
//         message:"Call ka time khatam ho chuka hai"
//       });
//     }

//     const expireInSeconds = Math.floor((end - now) / 1000);

//     const channelName = `swap_${request_id}`;
//     const token = generateToken(channelName, user_id, "publisher", expireInSeconds);

//     res.json({
//       success:true,
//       channelName,
//       token,
//       expires_in_seconds: expireInSeconds,
//       call_end_time: end,
//       message:"Video call active hai"
//     });

//   } catch (err) {
//     console.error("VIDEO CALL ERROR:", err);
//     res.status(500).json({ success:false, error:"Internal Server Error" });
//   }
// });

// module.exports = router;




// autoVideoCall.js
// const express = require("express");
// const router = express.Router();
// const { Pool } = require("pg");
// const { generateToken } = require("./agoraToken");
// require("dotenv").config();

// // PostgreSQL Connection
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });

// // Helper: day number → name
// const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// /*
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  AUTO VIDEO CALL START (TIME BASED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/video-call/start
// body: { request_id, user_id }
// */
// router.post("/start", async (req, res) => {
//   try {
//     const { request_id, user_id } = req.body;

//     if (!request_id || !user_id) {
//       return res.status(400).json({ success: false, message: "request_id aur user_id required hai" });
//     }

//     // 1️⃣ Accepted swap request + availability
//     const result = await pool.query(
//       `SELECT sr.request_id,
//               sr.sender_user_id,
//               sr.receiver_user_id,
//               sa.day_of_week   AS sender_day,
//               sa.start_time    AS sender_start,
//               sa.end_time      AS sender_end,
//               ra.day_of_week   AS receiver_day,
//               ra.start_time    AS receiver_start,
//               ra.end_time      AS receiver_end
//        FROM swap_requests sr
//        JOIN user_availability sa ON sa.availability_id = sr.sender_availability_id
//        JOIN user_availability ra ON ra.availability_id = sr.receiver_availability_id
//        WHERE sr.request_id=$1
//          AND sr.status='accepted'
//          AND sr.deleted_at IS NULL`,
//       [request_id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ success: false, message: "Accepted request nahi mili" });
//     }

//     const data = result.rows[0];

//     // 2️⃣ Only sender or receiver allowed
//     if (![data.sender_user_id, data.receiver_user_id].includes(user_id)) {
//       return res.status(403).json({ success: false, message: "Call sirf 2no users ke liye allowed hai" });
//     }

//     // 3️⃣ Day check (NUMBER BASED)
//     const todayDay = new Date().getDay(); // 0-6

//     if (data.sender_day !== todayDay || data.receiver_day !== todayDay) {
//       return res.json({
//         success: false,
//         message: `Call sirf ${DAYS[data.sender_day]} ko allowed hai`,
//       });
//     }

//     // 4️⃣ Time calculation (today ke sath)
//     const now = new Date();

//     const makeDate = (time) => {
//       const d = new Date();
//       const [h, m, s] = time.split(":");
//       d.setHours(h, m, s || 0, 0);
//       return d;
//     };

//     const senderStart = makeDate(data.sender_start);
//     const senderEnd   = makeDate(data.sender_end);
//     const receiverStart = makeDate(data.receiver_start);
//     const receiverEnd   = makeDate(data.receiver_end);

//     const callStart = new Date(Math.max(senderStart, receiverStart));
//     const callEnd   = new Date(Math.min(senderEnd, receiverEnd));

//     if (now < callStart) {
//       return res.json({
//         success: false,
//         message: `Call ${callStart.toLocaleTimeString()} par start hogi`,
//       });
//     }

//     if (now > callEnd) {
//       return res.json({
//         success: false,
//         message: "Call ka time khatam ho chuka hai",
//       });
//     }

//     // 5️⃣ Token expiry = remaining time
//     const expireInSeconds = Math.floor((callEnd - now) / 1000);

//     if (expireInSeconds <= 0) {
//       return res.json({ success: false, message: "Invalid call duration" });
//     }

//     // 6️⃣ Agora channel & token
//     const channelName = `swap_${request_id}`;
//     const token = generateToken(channelName, user_id, "publisher", expireInSeconds);

//     return res.json({
//       success: true,
//       channelName,
//       token,
//       expires_in_seconds: expireInSeconds,
//       call_end_time: callEnd,
//       message: "Video call active hai. End time par auto disconnect ho jayegi",
//     });

//   } catch (err) {
//     console.error("AUTO VIDEO CALL ERROR:", err);
//     return res.status(500).json({ success: false, message: "Internal Server Error" });
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

// // helper: day number to name
// const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// /**
//  * POST /api/video-call/start
//  * body: { request_id, user_id }
//  */
// router.post("/start", async (req, res) => {
//   try {
//     const { request_id, user_id } = req.body;

//     if (!request_id || !user_id) {
//       return res.status(400).json({
//         success: false,
//         message: "request_id aur user_id required hai"
//       });
//     }

//     // 🔹 accepted swap request lao
//     const swapRes = await pool.query(
//       `SELECT *
//        FROM swap_requests
//        WHERE request_id=$1
//          AND status='accepted'
//          AND deleted_at IS NULL`,
//       [request_id]
//     );

//     if (swapRes.rowCount === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Accepted swap request nahi mili"
//       });
//     }

//     const swap = swapRes.rows[0];

//     // 🔹 dono profiles ki availability lao
//     const availabilityRes = await pool.query(
//       `
//       SELECT profile_id, day_of_week, start_time, end_time
//       FROM user_availability
//       WHERE profile_id IN ($1, $2)
//         AND deleted_at IS NULL
//       `,
//       [swap.sender_profile_id, swap.receiver_profile_id]
//     );

//     const senderAvail = availabilityRes.rows.filter(a => a.profile_id === swap.sender_profile_id);
//     const receiverAvail = availabilityRes.rows.filter(a => a.profile_id === swap.receiver_profile_id);

//     const now = new Date();
//     const todayName = dayNames[now.getDay()];

//     let matchedSlot = null;

//     // 🔍 har sender slot ko receiver slot se match karo
//     for (const s of senderAvail) {
//       for (const r of receiverAvail) {

//         // day match hona lazmi
//         if (s.day_of_week !== r.day_of_week) continue;

//         // sirf aaj ka din allow hai
//         if (s.day_of_week !== todayName) continue;

//         const start = new Date(
//           `${now.toDateString()} ${s.start_time > r.start_time ? s.start_time : r.start_time}`
//         );
//         const end = new Date(
//           `${now.toDateString()} ${s.end_time < r.end_time ? s.end_time : r.end_time}`
//         );

//         // overlap check
//         if (now >= start && now < end) {
//           matchedSlot = { start, end };
//           break;
//         }
//       }
//       if (matchedSlot) break;
//     }

//     if (!matchedSlot) {
//       return res.json({
//         success: false,
//         message: `Abhi koi overlapping availability active nahi hai (${todayName})`
//       });
//     }

//     const durationSec = Math.floor((matchedSlot.end - now) / 1000);

//     if (durationSec <= 0) {
//       return res.json({
//         success: false,
//         message: "Availability ka time khatam ho chuka hai"
//       });
//     }

//     // 🔹 agora channel
//     const channelName = `swap_${request_id}`;

//     const token = generateToken(channelName, user_id, "publisher", durationSec);

//     return res.json({
//       success: true,
//       channelName,
//       token,
//       expires_in_seconds: durationSec,
//       call_end_time: matchedSlot.end,
//       message: "Video call active hai. End time par auto disconnect ho jayegi"
//     });

//   } catch (err) {
//     console.error("Video Call Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error"
//     });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const { generateToken } = require("./agoraToken");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

router.post("/start", async (req, res) => {
  try {
    const { request_id, user_id } = req.body;

    if (!request_id || !user_id) {
      return res.status(400).json({ success:false, message:"request_id aur user_id required" });
    }

    // 1️⃣ accepted swap
    const swapRes = await pool.query(
      `SELECT * FROM swap_requests
       WHERE request_id=$1 AND status='accepted' AND deleted_at IS NULL`,
      [request_id]
    );

    if (!swapRes.rowCount)
      return res.json({ success:false, message:"Swap accepted nahi hai" });

    const swap = swapRes.rows[0];

    // 2️⃣ availability
    const availRes = await pool.query(
      `SELECT * FROM user_availability
       WHERE profile_id IN ($1,$2) AND deleted_at IS NULL`,
      [swap.sender_profile_id, swap.receiver_profile_id]
    );

    const sender = availRes.rows.filter(a=>a.profile_id===swap.sender_profile_id);
    const receiver = availRes.rows.filter(a=>a.profile_id===swap.receiver_profile_id);

    const now = new Date();
    const today = dayNames[now.getDay()];
    let slot = null;

    for (const s of sender) {
      for (const r of receiver) {

        if (s.day_of_week !== r.day_of_week) continue;

        const dayIndex = dayNames.indexOf(s.day_of_week);
        if (dayIndex !== now.getDay()) continue;

        const start = new Date(`${now.toDateString()} ${s.start_time > r.start_time ? s.start_time : r.start_time}`);
        const end   = new Date(`${now.toDateString()} ${s.end_time < r.end_time ? s.end_time : r.end_time}`);

        if (now >= start && now < end) {
          slot = { start, end };
          break;
        }
      }
      if (slot) break;
    }

    if (!slot)
      return res.json({ success:false, message:"Abhi koi matching availability active nahi" });

    const duration = Math.floor((slot.end - now)/1000);

    // 3️⃣ active call already?
    const activeCall = await pool.query(
      `SELECT * FROM call_sessions
       WHERE booking_id=$1 AND status='live'`,
      [request_id]
    );

    let call;
    if (activeCall.rowCount) {
      call = activeCall.rows[0];
    } else {
      call = (await pool.query(
        `INSERT INTO call_sessions
         (booking_id, room_id, call_type, status, start_time, end_time)
         VALUES ($1,$2,'1v1','live',$3,$4)
         RETURNING *`,
        [request_id, `swap_${request_id}`, slot.start, slot.end]
      )).rows[0];
    }

    // 4️⃣ token
    const token = generateToken(call.room_id, user_id, "publisher", duration);

    await pool.query(
      `INSERT INTO video_call_tokens (user_id, booking_id, agora_token, expires_at)
       VALUES ($1,$2,$3,$4)`,
      [user_id, request_id, token, slot.end]
    );

    await pool.query(
      `INSERT INTO call_participants (call_id, user_id, joined_at)
       VALUES ($1,$2,NOW())
       ON CONFLICT DO NOTHING`,
      [call.call_id, user_id]
    );

    res.json({
      success:true,
      channelName: call.room_id,
      token,
      expires_in_seconds: duration,
      call_end_time: slot.end
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message:"Server error" });
  }
});

module.exports = router;

