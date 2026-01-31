// without accepted status show

// const express = require("express");
// const router = express.Router();
// const { Pool } = require("pg");
// require("dotenv").config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });

// /**
//  * GET accepted swap full details
//  * /api/accepted-swap/:request_id
//  */
// router.get("/:request_id", async (req, res) => {
//   try {
//     const { request_id } = req.params;

//     // 1️⃣ Swap request check
//     const swapRes = await pool.query(
//       `
//       SELECT *
//       FROM swap_requests
//       WHERE request_id = $1
//         AND status = 'accepted'
//         AND deleted_at IS NULL
//       `,
//       [request_id]
//     );

//     if (!swapRes.rowCount) {
//       return res.status(404).json({
//         success: false,
//         message: "Accepted swap request nahi mili",
//       });
//     }

//     const swap = swapRes.rows[0];

//     // 2️⃣ Sender + Receiver profile info
//     const profilesRes = await pool.query(
//       `
//       SELECT
//         u.user_id,
//         u.username,
//         p.profile_id,
//         p.full_name,
//         p.profile_image_url
//       FROM users u
//       JOIN user_profile p ON p.user_id = u.user_id
//       WHERE u.user_id IN ($1, $2)
//       `,
//       [swap.sender_user_id, swap.receiver_user_id]
//     );

//     // 3️⃣ Subjects (teach / learn)
//     const subjectsRes = await pool.query(
//       `
//       SELECT
//         profile_id,
//         subject_name,
//         subject_type
//       FROM user_subjects
//       WHERE profile_id IN ($1, $2)
//         AND deleted_at IS NULL
//       `,
//       [swap.sender_profile_id, swap.receiver_profile_id]
//     );

//     const senderProfile = profilesRes.rows.find(
//       p => p.profile_id === swap.sender_profile_id
//     );

//     const receiverProfile = profilesRes.rows.find(
//       p => p.profile_id === swap.receiver_profile_id
//     );

//     const senderSubjects = subjectsRes.rows.filter(
//       s => s.profile_id === swap.sender_profile_id
//     );

//     const receiverSubjects = subjectsRes.rows.filter(
//       s => s.profile_id === swap.receiver_profile_id
//     );

//     res.json({
//       success: true,
//       swap: {
//         request_id: swap.request_id,
//         message: swap.message,
//         created_at: swap.created_at,
//       },
//       sender: {
//         user_id: swap.sender_user_id,
//         profile_id: swap.sender_profile_id,
//         full_name: senderProfile?.full_name,
//         username: senderProfile?.username,
//         profile_image_url: senderProfile?.profile_image_url,
//         subjects: senderSubjects,
//       },
//       receiver: {
//         user_id: swap.receiver_user_id,
//         profile_id: swap.receiver_profile_id,
//         full_name: receiverProfile?.full_name,
//         username: receiverProfile?.username,
//         profile_image_url: receiverProfile?.profile_image_url,
//         subjects: receiverSubjects,
//       },
//     });

//   } catch (err) {
//     console.error("Accepted Swap Detail Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// });

// module.exports = router;



// with acepted status
// const express = require("express");
// const router = express.Router();
// const { Pool } = require("pg");
// require("dotenv").config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });

// /**
//  * GET accepted swap full details
//  * /api/accepted-swap/:request_id
//  */
// router.get("/:request_id", async (req, res) => {
//   try {
//     const { request_id } = req.params;

//     // 1️⃣ ONLY accepted swap request
//     const swapRes = await pool.query(
//       `
//       SELECT request_id, sender_user_id, receiver_user_id,
//              sender_profile_id, receiver_profile_id,
//              status, message, created_at
//       FROM swap_requests
//       WHERE request_id = $1
//         AND status = 'accepted'
//         AND deleted_at IS NULL
//       `,
//       [request_id]
//     );

//     if (!swapRes.rowCount) {
//       return res.status(404).json({
//         success: false,
//         message: "Accepted swap request nahi mili",
//       });
//     }

//     const swap = swapRes.rows[0];

//     // 2️⃣ Sender + Receiver profiles
//     const profilesRes = await pool.query(
//       `
//       SELECT
//         u.user_id,
//         u.username,
//         p.profile_id,
//         p.full_name,
//         p.profile_image_url
//       FROM users u
//       JOIN user_profile p ON p.user_id = u.user_id
//       WHERE p.profile_id IN ($1, $2)
//       `,
//       [swap.sender_profile_id, swap.receiver_profile_id]
//     );

//     // 3️⃣ Subjects
//     const subjectsRes = await pool.query(
//       `
//       SELECT profile_id, subject_name, subject_type
//       FROM user_subjects
//       WHERE profile_id IN ($1, $2)
//         AND deleted_at IS NULL
//       `,
//       [swap.sender_profile_id, swap.receiver_profile_id]
//     );

//     const senderProfile = profilesRes.rows.find(
//       p => p.profile_id === swap.sender_profile_id
//     );
//     const receiverProfile = profilesRes.rows.find(
//       p => p.profile_id === swap.receiver_profile_id
//     );

//     const senderSubjects = subjectsRes.rows.filter(
//       s => s.profile_id === swap.sender_profile_id
//     );
//     const receiverSubjects = subjectsRes.rows.filter(
//       s => s.profile_id === swap.receiver_profile_id
//     );

//     res.json({
//       success: true,
//       swap: {
//         request_id: swap.request_id,
//         status: swap.status,          // ✅ ACCEPTED STATUS
//         message: swap.message,
//         created_at: swap.created_at,
//       },
//       sender: {
//         user_id: swap.sender_user_id,
//         profile_id: swap.sender_profile_id,
//         full_name: senderProfile?.full_name,
//         username: senderProfile?.username,
//         profile_image_url: senderProfile?.profile_image_url,
//         subjects: senderSubjects,
//       },
//       receiver: {
//         user_id: swap.receiver_user_id,
//         profile_id: swap.receiver_profile_id,
//         full_name: receiverProfile?.full_name,
//         username: receiverProfile?.username,
//         profile_image_url: receiverProfile?.profile_image_url,
//         subjects: receiverSubjects,
//       },
//     });

//   } catch (err) {
//     console.error("Accepted Swap Detail Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// });

// module.exports = router;




// // with profile id get
// const express = require("express");
// const router = express.Router();
// const { Pool } = require("pg");
// require("dotenv").config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });

// /**
//  * GET accepted swaps by profile_id
//  * /api/accepted-swap/profile/:profile_id
//  */
// router.get("/profile/:profile_id", async (req, res) => {
//   try {
//     const { profile_id } = req.params;

//     // 1️⃣ Get ACCEPTED swaps where profile involved
//     const swapRes = await pool.query(
//       `
//       SELECT request_id,
//              sender_user_id, receiver_user_id,
//              sender_profile_id, receiver_profile_id,
//              status, message, created_at
//       FROM swap_requests
//       WHERE status = 'accepted'
//         AND deleted_at IS NULL
//         AND (sender_profile_id = $1 OR receiver_profile_id = $1)
//       ORDER BY created_at DESC
//       `,
//       [profile_id]
//     );

//     if (!swapRes.rowCount) {
//       return res.json({
//         success: true,
//         swaps: [],
//         message: "Is profile ke liye koi accepted swap nahi",
//       });
//     }

//     const swaps = swapRes.rows;

//     // 2️⃣ Collect all involved profile_ids
//     const profileIds = [
//       ...new Set(
//         swaps.flatMap(s => [s.sender_profile_id, s.receiver_profile_id])
//       ),
//     ];

//     // 3️⃣ Profiles
//     const profilesRes = await pool.query(
//       `
//       SELECT
//         u.user_id,
//         u.username,
//         p.profile_id,
//         p.full_name,
//         p.profile_image_url
//       FROM users u
//       JOIN user_profile p ON p.user_id = u.user_id
//       WHERE p.profile_id = ANY($1)
//       `,
//       [profileIds]
//     );

//     // 4️⃣ Subjects
//     const subjectsRes = await pool.query(
//       `
//       SELECT profile_id, subject_name, subject_type
//       FROM user_subjects
//       WHERE profile_id = ANY($1)
//         AND deleted_at IS NULL
//       `,
//       [profileIds]
//     );

//     // 5️⃣ Format response
//     const formatted = swaps.map(swap => {
//       const senderProfile = profilesRes.rows.find(
//         p => p.profile_id === swap.sender_profile_id
//       );
//       const receiverProfile = profilesRes.rows.find(
//         p => p.profile_id === swap.receiver_profile_id
//       );

//       return {
//         request_id: swap.request_id,
//         status: swap.status,
//         message: swap.message,
//         created_at: swap.created_at,

//         sender: {
//           user_id: swap.sender_user_id,
//           profile_id: swap.sender_profile_id,
//           full_name: senderProfile?.full_name,
//           username: senderProfile?.username,
//           profile_image_url: senderProfile?.profile_image_url,
//           subjects: subjectsRes.rows.filter(
//             s => s.profile_id === swap.sender_profile_id
//           ),
//         },

//         receiver: {
//           user_id: swap.receiver_user_id,
//           profile_id: swap.receiver_profile_id,
//           full_name: receiverProfile?.full_name,
//           username: receiverProfile?.username,
//           profile_image_url: receiverProfile?.profile_image_url,
//           subjects: subjectsRes.rows.filter(
//             s => s.profile_id === swap.receiver_profile_id
//           ),
//         },
//       };
//     });

//     res.json({
//       success: true,
//       swaps: formatted,
//     });

//   } catch (err) {
//     console.error("Accepted Swap Profile Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// });

// module.exports = router;



// acceptedSwapByProfile.js
const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * GET accepted swaps by profile_id
 * /api/accepted-swap/profile/:profile_id
 */
router.get("/profile/:profile_id", async (req, res) => {
  try {
    const { profile_id } = req.params;

    // 1️⃣ sirf ACCEPTED swaps jahan profile involved ho
    const swapRes = await pool.query(
      `
      SELECT request_id,
             sender_user_id, receiver_user_id,
             sender_profile_id, receiver_profile_id,
             status, message, created_at
      FROM swap_requests
      WHERE status = 'accepted'
        AND deleted_at IS NULL
        AND (sender_profile_id = $1 OR receiver_profile_id = $1)
      ORDER BY created_at DESC
      `,
      [profile_id]
    );

    if (!swapRes.rowCount) {
      return res.json({
        success: true,
        swaps: [],
        message: "Is profile ke liye koi accepted swap nahi",
      });
    }

    const swaps = swapRes.rows;

    // 2️⃣ saare involved profile_ids collect karo
    const profileIds = [
      ...new Set(
        swaps.flatMap(s => [s.sender_profile_id, s.receiver_profile_id])
      ),
    ];

    // 3️⃣ profiles
    const profilesRes = await pool.query(
      `
      SELECT
        u.user_id,
        u.username,
        p.profile_id,
        p.full_name,
        p.profile_image_url
      FROM users u
      JOIN user_profile p ON p.user_id = u.user_id
      WHERE p.profile_id = ANY($1)
      `,
      [profileIds]
    );

    // 4️⃣ subjects
    const subjectsRes = await pool.query(
      `
      SELECT profile_id, subject_name, subject_type
      FROM user_subjects
      WHERE profile_id = ANY($1)
        AND deleted_at IS NULL
      `,
      [profileIds]
    );

    // 5️⃣ availability 🔥 (NEW)
    const availabilityRes = await pool.query(
      `
      SELECT profile_id, day_of_week, start_time, end_time
      FROM user_availability
      WHERE profile_id = ANY($1)
        AND deleted_at IS NULL
      `,
      [profileIds]
    );

    // 6️⃣ final response format
    const formatted = swaps.map(swap => {
      const senderProfile = profilesRes.rows.find(
        p => p.profile_id === swap.sender_profile_id
      );
      const receiverProfile = profilesRes.rows.find(
        p => p.profile_id === swap.receiver_profile_id
      );

      return {
        request_id: swap.request_id,
        status: swap.status,
        message: swap.message,
        created_at: swap.created_at,

        sender: {
          user_id: swap.sender_user_id,
          profile_id: swap.sender_profile_id,
          full_name: senderProfile?.full_name,
          username: senderProfile?.username,
          profile_image_url: senderProfile?.profile_image_url,
          subjects: subjectsRes.rows.filter(
            s => s.profile_id === swap.sender_profile_id
          ),
          availability: availabilityRes.rows.filter(
            a => a.profile_id === swap.sender_profile_id
          ),
        },

        receiver: {
          user_id: swap.receiver_user_id,
          profile_id: swap.receiver_profile_id,
          full_name: receiverProfile?.full_name,
          username: receiverProfile?.username,
          profile_image_url: receiverProfile?.profile_image_url,
          subjects: subjectsRes.rows.filter(
            s => s.profile_id === swap.receiver_profile_id
          ),
          availability: availabilityRes.rows.filter(
            a => a.profile_id === swap.receiver_profile_id
          ),
        },
      };
    });

    res.json({
      success: true,
      swaps: formatted,
    });

  } catch (err) {
    console.error("Accepted Swap Profile Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
