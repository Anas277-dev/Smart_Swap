// const express = require("express");
// const router = express.Router();
// const { Pool } = require("pg");
// require("dotenv").config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });

// /*
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   1️⃣ CREATE OR GET THREAD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// */
// router.post("/thread", async (req, res) => {
//   try {
//     const { sender_id, receiver_id } = req.body;

//     if (!sender_id || !receiver_id) {
//       return res.status(400).json({ success: false, error: "sender_id and receiver_id required" });
//     }

//     if (sender_id === receiver_id) {
//       return res.status(400).json({ success: false, error: "Cannot create thread with self" });
//     }

//     // Check if thread already exists
//     const existing = await pool.query(
//       `SELECT * FROM chat_threads 
//        WHERE user_pair_min = $1 AND user_pair_max = $2 AND deleted_at IS NULL`,
//       [Math.min(sender_id, receiver_id), Math.max(sender_id, receiver_id)]
//     );

//     if (existing.rowCount > 0) {
//       return res.json({ success: true, thread: existing.rows[0], message: "Thread already exists" });
//     }

//     // Create new thread
//     const result = await pool.query(
//       `INSERT INTO chat_threads (sender_id, receiver_id)
//        VALUES ($1, $2)
//        RETURNING *`,
//       [sender_id, receiver_id]
//     );

//     res.status(201).json({ success: true, thread: result.rows[0], message: "Thread created" });

//   } catch (err) {
//     console.error("Create/Get Thread Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// /*
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   2️⃣ SEND MESSAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// */
// router.post("/message", async (req, res) => {
//   try {
//     const { thread_id, sender_id, receiver_id, message_text, message_type = "text" } = req.body;

//     if (!thread_id || !sender_id || !receiver_id || !message_text) {
//       return res.status(400).json({ success: false, error: "Missing required fields" });
//     }

//     // Insert message
//     const msgResult = await pool.query(
//       `INSERT INTO chat_messages (thread_id, sender_id, receiver_id, message_text, message_type)
//        VALUES ($1,$2,$3,$4,$5)
//        RETURNING *`,
//       [thread_id, sender_id, receiver_id, message_text, message_type]
//     );

//     // Update last_message in thread
//     await pool.query(
//       `UPDATE chat_threads 
//        SET last_message=$1, last_message_time=NOW(), updated_at=NOW()
//        WHERE thread_id=$2`,
//       [message_text, thread_id]
//     );

//     res.json({ success: true, message: "Message sent", chat_message: msgResult.rows[0] });

//   } catch (err) {
//     console.error("Send Message Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// /*
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   3️⃣ GET MESSAGES OF A THREAD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// */
// router.get("/messages/:thread_id", async (req, res) => {
//   try {
//     const { thread_id } = req.params;

//     const result = await pool.query(
//       `SELECT message_id, sender_id, receiver_id, message_text, message_type, is_read, created_at
//        FROM chat_messages
//        WHERE thread_id=$1 AND deleted_at IS NULL
//        ORDER BY created_at ASC`,
//       [thread_id]
//     );

//     res.json({ success: true, total_messages: result.rowCount, messages: result.rows });

//   } catch (err) {
//     console.error("Get Messages Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// /*
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   4️⃣ MARK MESSAGES AS READ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// */
// router.post("/read", async (req, res) => {
//   try {
//     const { thread_id, user_id } = req.body;

//     if (!thread_id || !user_id) {
//       return res.status(400).json({ success: false, error: "Missing required fields" });
//     }

//     const result = await pool.query(
//       `UPDATE chat_messages
//        SET is_read = TRUE, updated_at = NOW()
//        WHERE thread_id=$1 AND receiver_id=$2 AND is_read = FALSE
//        RETURNING *`,
//       [thread_id, user_id]
//     );

//     res.json({ success: true, message: `${result.rowCount} messages marked as read`, updated_messages: result.rows });

//   } catch (err) {
//     console.error("Mark Read Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// /*
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   5️⃣ SOFT DELETE THREAD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// */
// router.delete("/thread/:thread_id", async (req, res) => {
//   try {
//     const { thread_id } = req.params;

//     const result = await pool.query(
//       `UPDATE chat_threads
//        SET deleted_at = NOW(), is_active = FALSE
//        WHERE thread_id=$1 AND deleted_at IS NULL
//        RETURNING *`,
//       [thread_id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ success: false, error: "Thread not found or already deleted" });
//     }

//     res.json({ success: true, message: "Thread deleted successfully", thread: result.rows[0] });

//   } catch (err) {
//     console.error("Delete Thread Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// /*
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
//   6️⃣ SOFT DELETE MESSAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// */
// router.delete("/message/:message_id", async (req, res) => {
//   try {
//     const { message_id } = req.params;

//     const result = await pool.query(
//       `UPDATE chat_messages
//        SET deleted_at = NOW()
//        WHERE message_id=$1 AND deleted_at IS NULL
//        RETURNING *`,
//       [message_id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ success: false, error: "Message not found or already deleted" });
//     }

//     res.json({ success: true, message: "Message deleted successfully", chat_message: result.rows[0] });

//   } catch (err) {
//     console.error("Delete Message Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// module.exports = router;




// with only accept request
// const express = require("express");
// const router = express.Router();
// const { Pool } = require("pg");
// require("dotenv").config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });

// /*
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1️⃣ Create or Get Chat Thread between two users
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// */
// router.post("/thread", async (req, res) => {
//   try {
//     const { sender_id, receiver_id } = req.body;

//     if (!sender_id || !receiver_id) {
//       return res.status(400).json({ success: false, error: "sender_id and receiver_id required" });
//     }

//     if (sender_id === receiver_id) {
//       return res.status(400).json({ success: false, error: "sender_id and receiver_id cannot be same" });
//     }

//     // Check if thread already exists using generated columns for filtering
//     const user_pair_min = Math.min(sender_id, receiver_id);
//     const user_pair_max = Math.max(sender_id, receiver_id);

//     const existingThread = await pool.query(
//       `SELECT * FROM chat_threads WHERE user_pair_min = $1 AND user_pair_max = $2 AND deleted_at IS NULL`,
//       [user_pair_min, user_pair_max]
//     );

//     if (existingThread.rowCount > 0) {
//       return res.json({ success: true, message: "Thread exists", thread: existingThread.rows[0] });
//     }

//     // Create new thread — DO NOT insert user_pair_min/max (generated columns)
//     const newThread = await pool.query(
//       `INSERT INTO chat_threads (sender_id, receiver_id) 
//        VALUES ($1, $2) RETURNING *`,
//       [sender_id, receiver_id]
//     );

//     res.json({ success: true, message: "Thread created", thread: newThread.rows[0] });

//   } catch (err) {
//     console.error("Create/Get Thread Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// /*
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2️⃣ Send Message (only if swap accepted)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// */
// router.post("/message", async (req, res) => {
//   try {
//     const { thread_id, sender_id, receiver_id, message_text, message_type = "text" } = req.body;

//     if (!thread_id || !sender_id || !receiver_id || !message_text) {
//       return res.status(400).json({ success: false, error: "Missing required fields" });
//     }

//     // 1. Check if thread exists and involves these users
//     const thread = await pool.query(
//       `SELECT * FROM chat_threads 
//        WHERE thread_id = $1 AND deleted_at IS NULL
//          AND ((sender_id = $2 AND receiver_id = $3) OR (sender_id = $3 AND receiver_id = $2))`,
//       [thread_id, sender_id, receiver_id]
//     );

//     if (thread.rowCount === 0) {
//       return res.status(404).json({ success: false, error: "Chat thread not found" });
//     }

//     // 2. Check if swap request is accepted between these users
//     const swapCheck = await pool.query(
//       `SELECT 1 FROM swap_requests
//        WHERE ((sender_user_id = $1 AND receiver_user_id = $2)
//           OR (sender_user_id = $2 AND receiver_user_id = $1))
//          AND status = 'accepted'
//          AND deleted_at IS NULL`,
//       [sender_id, receiver_id]
//     );

//     if (swapCheck.rowCount === 0) {
//       return res.status(400).json({ success: false, error: "Cannot send message before swap is accepted" });
//     }

//     // 3. Insert message
//     const newMessage = await pool.query(
//       `INSERT INTO chat_messages (thread_id, sender_id, receiver_id, message_text, message_type)
//        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
//       [thread_id, sender_id, receiver_id, message_text, message_type]
//     );

//     // 4. Update last message info in thread
//     await pool.query(
//       `UPDATE chat_threads 
//        SET last_message = $1, last_message_time = NOW(), updated_at = NOW()
//        WHERE thread_id = $2`,
//       [message_text, thread_id]
//     );

//     res.json({ success: true, message: "Message sent", data: newMessage.rows[0] });

//   } catch (err) {
//     console.error("Send Message Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// /*
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3️⃣ Get Messages for a Thread
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// */
// router.get("/messages/:thread_id", async (req, res) => {
//   try {
//     const { thread_id } = req.params;

//     const messages = await pool.query(
//       `SELECT * FROM chat_messages 
//        WHERE thread_id = $1 AND deleted_at IS NULL
//        ORDER BY created_at ASC`,
//       [thread_id]
//     );

//     res.json({ success: true, messages: messages.rows });

//   } catch (err) {
//     console.error("Get Messages Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// module.exports = router;








// const express = require("express");
// const router = express.Router();
// const { Pool } = require("pg");
// require("dotenv").config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });

// /*
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1️⃣ Create or Get Chat Thread between two users
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// */
// router.post("/thread", async (req, res) => {
//   try {
//     const { sender_id, receiver_id } = req.body;

//     if (!sender_id || !receiver_id) {
//       return res.status(400).json({ success: false, error: "sender_id and receiver_id required" });
//     }

//     if (sender_id === receiver_id) {
//       return res.status(400).json({ success: false, error: "sender_id and receiver_id cannot be same" });
//     }

//     // Check if thread already exists using generated columns for filtering
//     const user_pair_min = Math.min(sender_id, receiver_id);
//     const user_pair_max = Math.max(sender_id, receiver_id);

//     const existingThread = await pool.query(
//       `SELECT * FROM chat_threads WHERE user_pair_min = $1 AND user_pair_max = $2 AND deleted_at IS NULL`,
//       [user_pair_min, user_pair_max]
//     );

//     if (existingThread.rowCount > 0) {
//       return res.json({ success: true, message: "Thread exists", thread: existingThread.rows[0] });
//     }

//     // Create new thread — DO NOT insert user_pair_min/max (generated columns)
//     const newThread = await pool.query(
//       `INSERT INTO chat_threads (sender_id, receiver_id) 
//        VALUES ($1, $2) RETURNING *`,
//       [sender_id, receiver_id]
//     );

//     res.json({ success: true, message: "Thread created", thread: newThread.rows[0] });

//   } catch (err) {
//     console.error("Create/Get Thread Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// /*
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2️⃣ Send Message (only if swap accepted)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// */
// router.post("/message", async (req, res) => {
//   try {
//     const { thread_id, sender_id, receiver_id, message_text, message_type = "text" } = req.body;

//     if (!thread_id || !sender_id || !receiver_id || !message_text) {
//       return res.status(400).json({ success: false, error: "Missing required fields" });
//     }

//     // 1. Check if thread exists and involves these users
//     const thread = await pool.query(
//       `SELECT * FROM chat_threads 
//        WHERE thread_id = $1 AND deleted_at IS NULL
//          AND ((sender_id = $2 AND receiver_id = $3) OR (sender_id = $3 AND receiver_id = $2))`,
//       [thread_id, sender_id, receiver_id]
//     );

//     if (thread.rowCount === 0) {
//       return res.status(404).json({ success: false, error: "Chat thread not found" });
//     }

//     // 2. Check if swap request is accepted between these users
//     const swapCheck = await pool.query(
//       `SELECT 1 FROM swap_requests
//        WHERE ((sender_user_id = $1 AND receiver_user_id = $2)
//           OR (sender_user_id = $2 AND receiver_user_id = $1))
//          AND status = 'accepted'
//          AND deleted_at IS NULL`,
//       [sender_id, receiver_id]
//     );

//     if (swapCheck.rowCount === 0) {
//       return res.status(400).json({ success: false, error: "Cannot send message before swap is accepted" });
//     }

//     // 3. Insert message
//     const newMessage = await pool.query(
//       `INSERT INTO chat_messages (thread_id, sender_id, receiver_id, message_text, message_type)
//        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
//       [thread_id, sender_id, receiver_id, message_text, message_type]
//     );

//     // 4. Update last message info in thread
//     await pool.query(
//       `UPDATE chat_threads 
//        SET last_message = $1, last_message_time = NOW(), updated_at = NOW()
//        WHERE thread_id = $2`,
//       [message_text, thread_id]
//     );

//     res.json({ success: true, message: "Message sent", data: newMessage.rows[0] });

//   } catch (err) {
//     console.error("Send Message Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// /*
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3️⃣ Get Messages for a Thread
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// */
// router.get("/messages/:thread_id", async (req, res) => {
//   try {
//     const { thread_id } = req.params;

//     const messages = await pool.query(
//       `SELECT * FROM chat_messages 
//        WHERE thread_id = $1 AND deleted_at IS NULL
//        ORDER BY created_at ASC`,
//       [thread_id]
//     );

//     res.json({ success: true, messages: messages.rows });

//   } catch (err) {
//     console.error("Get Messages Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// /*
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4️⃣ Mark Message(s) as Read
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// */
// router.post("/mark-read", async (req, res) => {
//   try {
//     const { message_ids } = req.body; // array of message_ids

//     if (!message_ids || !Array.isArray(message_ids) || message_ids.length === 0) {
//       return res.status(400).json({ success: false, error: "Provide message_ids array" });
//     }

//     const result = await pool.query(
//       `UPDATE chat_messages
//        SET is_read = TRUE, updated_at = NOW()
//        WHERE message_id = ANY($1) AND deleted_at IS NULL
//        RETURNING *`,
//       [message_ids]
//     );

//     res.json({
//       success: true,
//       message: `${result.rowCount} message(s) marked as read`,
//       updated_messages: result.rows
//     });

//   } catch (err) {
//     console.error("Mark Read Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// /*
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5️⃣ Delete Message (Soft Delete)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// */
// router.post("/delete", async (req, res) => {
//   try {
//     const { message_id, user_id } = req.body;

//     if (!message_id || !user_id) {
//       return res.status(400).json({ success: false, error: "Provide message_id and user_id" });
//     }

//     // Ensure user is either sender or receiver
//     const check = await pool.query(
//       `SELECT * FROM chat_messages
//        WHERE message_id = $1 AND deleted_at IS NULL
//          AND (sender_id = $2 OR receiver_id = $2)`,
//       [message_id, user_id]
//     );

//     if (check.rowCount === 0) {
//       return res.status(404).json({ success: false, error: "Message not found or access denied" });
//     }

//     const deleted = await pool.query(
//       `UPDATE chat_messages
//        SET deleted_at = NOW(), updated_at = NOW()
//        WHERE message_id = $1
//        RETURNING *`,
//       [message_id]
//     );

//     res.json({
//       success: true,
//       message: "Message deleted successfully",
//       deleted_message: deleted.rows[0]
//     });

//   } catch (err) {
//     console.error("Delete Message Error:", err);
//     res.status(500).json({ success: false, error: "Internal Server Error" });
//   }
// });

// module.exports = router;
