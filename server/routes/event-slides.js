const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT *
      FROM event_slides
      WHERE is_active = 1
      ORDER BY sort_order ASC, id DESC
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;