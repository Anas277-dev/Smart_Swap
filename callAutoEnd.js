const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// har 1 minute me check
setInterval(async () => {
  try {
    const res = await pool.query(
      `
      UPDATE call_sessions
      SET status = 'ended'
      WHERE status = 'live'
        AND end_time <= NOW()
      RETURNING call_id
      `
    );

    if (res.rowCount > 0) {
      console.log("✅ Calls ended automatically:", res.rows);
    }
  } catch (err) {
    console.error("❌ Auto end error:", err);
  }
}, 60 * 1000);
