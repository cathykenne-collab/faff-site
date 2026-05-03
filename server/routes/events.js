const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT 
        id,
        title as title_fr,
        title as title_en,
        alt as details_fr,
        alt as details_en,
        event_label as date_label_fr,
        event_label as date_label_en,
        'S''inscrire' as cta_label_fr,
        'Register' as cta_label_en,
        '/inscription.html' as cta_url,
        sort_order,
        image
      FROM event_slides
      WHERE is_active = 1
      ORDER BY sort_order ASC
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;