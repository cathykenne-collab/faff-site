const express = require("express");
const router = express.Router();
const db = require("../db");

// GET - Récupérer toutes les offres actives (pour le site public)
router.get("/", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM recrutement 
      WHERE is_active = 1 
      ORDER BY created_at DESC
    `).all();
    res.json(rows);
  } catch (err) {
    console.error("Erreur GET recrutement:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Récupérer toutes les offres (pour l'admin)
router.get("/admin", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM recrutement 
      ORDER BY created_at DESC
    `).all();
    res.json(rows);
  } catch (err) {
    console.error("Erreur GET recrutement/admin:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Ajouter une offre d'emploi
router.post("/", (req, res) => {
  try {
    const { titre, description, lieu, type_contrat, date_limite } = req.body;
    
    if (!titre || !description) {
      return res.status(400).json({ error: "Le titre et la description sont obligatoires" });
    }
    
    const stmt = db.prepare(`
      INSERT INTO recrutement (titre, description, lieu, type_contrat, date_limite, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);
    
    const result = stmt.run(titre, description, lieu || null, type_contrat || null, date_limite || null);
    
    res.status(201).json({ success: true, id: result.lastInsertRowid, message: "Offre ajoutée avec succès" });
  } catch (err) {
    console.error("Erreur POST recrutement:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT - Modifier une offre
router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, lieu, type_contrat, date_limite, is_active } = req.body;
    
    const stmt = db.prepare(`
      UPDATE recrutement 
      SET titre = ?, description = ?, lieu = ?, type_contrat = ?, date_limite = ?, is_active = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(titre, description, lieu, type_contrat, date_limite, is_active !== undefined ? is_active : 1, id);
    
    res.json({ success: true, message: "Offre mise à jour" });
  } catch (err) {
    console.error("Erreur PUT recrutement:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Supprimer une offre
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare("DELETE FROM recrutement WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err) {
    console.error("Erreur DELETE recrutement:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;