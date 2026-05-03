const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM inscriptions ORDER BY created_at DESC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", (req, res) => {
  try {
    const { nom, email, programme, date_souhaitee, infos } = req.body;

    if (!nom || !email || !programme) {
      return res.status(400).json({
        error: "nom, email et programme sont obligatoires"
      });
    }

    const stmt = db.prepare(`
      INSERT INTO inscriptions (nom, email, programme, date_souhaitee, infos)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      nom.trim(),
      email.trim(),
      programme.trim(),
      date_souhaitee || null,
      infos || null
    );

    res.status(201).json({
      success: true,
      message: "Inscription enregistrée",
      id: result.lastInsertRowid
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;