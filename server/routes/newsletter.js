const express = require("express");
const router = express.Router();
const db = require("../db");

// POST - S'inscrire à l'infolettre
router.post("/", (req, res) => {
  try {
    const { nom, email } = req.body;
    
    // Validation
    if (!nom || !email) {
      return res.status(400).json({ 
        success: false, 
        error: "Le nom et l'email sont obligatoires" 
      });
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: "L'adresse email n'est pas valide" 
      });
    }
    
    // Insertion dans la base
    const stmt = db.prepare(`
      INSERT INTO newsletter (nom, email, created_at) 
      VALUES (?, ?, datetime('now'))
    `);
    
    const result = stmt.run(nom, email);
    
    res.status(201).json({ 
      success: true, 
      message: "Inscription à l'infolettre réussie !",
      id: result.lastInsertRowid 
    });
    
  } catch (e) {
    // Gérer l'erreur d'email unique
    if (e.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ 
        success: false, 
        error: "Cet email est déjà inscrit à l'infolettre." 
      });
    }
    console.error("Erreur serveur:", e);
    res.status(500).json({ 
      success: false, 
      error: "Erreur interne du serveur. Veuillez réessayer plus tard." 
    });
  }
});

// GET - Récupérer tous les abonnés (pour admin)
router.get("/", (req, res) => {
  try {
    const subscribers = db.prepare("SELECT * FROM newsletter ORDER BY created_at DESC").all();
    res.json(subscribers);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE - Supprimer un abonné
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare("DELETE FROM newsletter WHERE id = ?").run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Abonné non trouvé" });
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;