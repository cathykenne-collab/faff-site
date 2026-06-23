const express = require("express");
const router = express.Router();
const db = require("../db");

// Récupérer toutes les inscriptions pour la page d'administration
router.get("/", (req, res) => {
  try {
    const rows = db
      .prepare(`
        SELECT
          id,
          nom,
          email,
          telephone,
          programme,
          ville_residence,
          langue,
          infos,
          created_at
        FROM inscriptions
        ORDER BY created_at DESC
      `)
      .all();

    res.json(rows);
  } catch (err) {
    console.error("Erreur récupération inscriptions :", err);

    res.status(500).json({
      error: "Impossible de récupérer les inscriptions."
    });
  }
});

// Enregistrer une nouvelle inscription
router.post("/", (req, res) => {
  try {
    const {
      nom,
      email,
      telephone,
      programme,
      ville_residence,
      langue,
      infos
    } = req.body;

    if (!nom?.trim() || !email?.trim() || !programme?.trim()) {
      return res.status(400).json({
        error: "Le nom, l’adresse courriel et le programme sont obligatoires."
      });
    }

    const stmt = db.prepare(`
      INSERT INTO inscriptions (
        nom,
        email,
        telephone,
        programme,
        ville_residence,
        langue,
        infos
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      nom.trim(),
      email.trim().toLowerCase(),
      telephone?.trim() || null,
      programme.trim(),
      ville_residence?.trim() || null,
      langue?.trim() || "fr",
      infos?.trim() || null
    );

    res.status(201).json({
      success: true,
      message: "Inscription enregistrée avec succès.",
      id: result.lastInsertRowid
    });
  } catch (err) {
    console.error("Erreur enregistrement inscription :", err);

    res.status(500).json({
      error: "Impossible d’enregistrer l’inscription."
    });
  }
});

module.exports = router;