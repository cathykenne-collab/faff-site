const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuration multer pour l'upload des photos
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET - Récupérer tous les membres (pour site public)
router.get("/", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM membres 
      WHERE is_active = 1 
      ORDER BY categorie, ordre ASC, id ASC
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Récupérer tous les membres (pour admin)
router.get("/admin", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM membres 
      ORDER BY categorie, ordre ASC, id ASC
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Ajouter un membre avec photo
router.post("/", upload.single("photo"), (req, res) => {
  try {
    const { nom, prenom, role, description, categorie, ordre } = req.body;
    
    if (!nom || !prenom || !role) {
      return res.status(400).json({ error: "Le nom, prénom et rôle sont obligatoires" });
    }
    
    let photoPath = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const filename = `membre_${Date.now()}${ext}`;
      photoPath = `/uploads/${filename}`;
      const uploadDir = path.join(__dirname, "../../public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
    }
    
    const stmt = db.prepare(`
      INSERT INTO membres (nom, prenom, role, description, photo, categorie, ordre, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);
    
    const result = stmt.run(nom, prenom, role, description || null, photoPath, categorie || "equipe", Number(ordre) || 0);
    
    res.status(201).json({ success: true, id: result.lastInsertRowid, message: "Membre ajouté avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Modifier un membre
router.put("/:id", upload.single("photo"), (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, role, description, categorie, ordre, is_active } = req.body;
    
    let photoPath = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const filename = `membre_${Date.now()}${ext}`;
      photoPath = `/uploads/${filename}`;
      const uploadDir = path.join(__dirname, "../../public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
    }
    
    let stmt;
    if (photoPath) {
      stmt = db.prepare(`
        UPDATE membres 
        SET nom = ?, prenom = ?, role = ?, description = ?, photo = ?, categorie = ?, ordre = ?, is_active = ?
        WHERE id = ?
      `);
      stmt.run(nom, prenom, role, description, photoPath, categorie, Number(ordre) || 0, is_active !== undefined ? is_active : 1, id);
    } else {
      stmt = db.prepare(`
        UPDATE membres 
        SET nom = ?, prenom = ?, role = ?, description = ?, categorie = ?, ordre = ?, is_active = ?
        WHERE id = ?
      `);
      stmt.run(nom, prenom, role, description, categorie, Number(ordre) || 0, is_active !== undefined ? is_active : 1, id);
    }
    
    res.json({ success: true, message: "Membre mis à jour" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Supprimer un membre
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM membres WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;