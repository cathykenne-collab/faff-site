const r = require("express").Router();
const db = require("../db");

// GET - Récupérer tous les messages
r.get("/", (req, res) => {
  try {
    const messages = db.prepare("SELECT * FROM contacts ORDER BY created_at DESC").all();
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST - Envoyer un message
r.post("/", (req, res) => {
  try {
    const { nom, email, sujet, message } = req.body;
    
    // Validation
    if (!nom || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: "Le nom, l'email et le message sont obligatoires" 
      });
    }
    
    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: "L'adresse email n'est pas valide" 
      });
    }
    
    // Insertion dans la base de données
    const stmt = db.prepare(`
      INSERT INTO contacts (nom, email, sujet, message, created_at) 
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    
    const result = stmt.run(nom, email, sujet || null, message);
    
    res.status(201).json({ 
      success: true, 
      message: "Message envoyé avec succès.",
      id: result.lastInsertRowid 
    });
    
  } catch (e) {
    console.error("Erreur serveur:", e);
    res.status(500).json({ 
      success: false, 
      error: "Erreur interne du serveur. Veuillez réessayer plus tard." 
    });
  }
});

module.exports = r;