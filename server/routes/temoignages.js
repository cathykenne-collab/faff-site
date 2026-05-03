const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET - Récupérer tous les témoignages actifs (pour le site)
router.get("/", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM temoignages 
      WHERE is_active = 1 
      ORDER BY ordre ASC, created_at DESC
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Récupérer tous les témoignages (pour admin)
router.get("/admin", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM temoignages 
      ORDER BY ordre ASC, created_at DESC
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Ajouter un témoignage
router.post("/", upload.single("photo"), (req, res) => {
  try {
    const { auteur, role, contenu, categorie, ordre } = req.body;
    
    if (!auteur || !contenu) {
      return res.status(400).json({ error: "L'auteur et le contenu sont obligatoires" });
    }
    
    let photoPath = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const filename = `temoignage_${Date.now()}${ext}`;
      photoPath = `/uploads/${filename}`;
      const uploadDir = path.join(__dirname, "../../public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
    }
    
    const stmt = db.prepare(`
      INSERT INTO temoignages (auteur, role, contenu, categorie, photo, ordre, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    
    const result = stmt.run(auteur, role || null, contenu, categorie || "famille", photoPath, Number(ordre) || 0);
    
    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Modifier un témoignage
router.put("/:id", upload.single("photo"), (req, res) => {
  try {
    const { id } = req.params;
    const { auteur, role, contenu, categorie, ordre, is_active } = req.body;
    
    let stmt;
    
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const filename = `temoignage_${Date.now()}${ext}`;
      const photoPath = `/uploads/${filename}`;
      const uploadDir = path.join(__dirname, "../../public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
      
      stmt = db.prepare(`
        UPDATE temoignages 
        SET auteur = ?, role = ?, contenu = ?, categorie = ?, photo = ?, ordre = ?, is_active = ?
        WHERE id = ?
      `);
      stmt.run(auteur, role, contenu, categorie, photoPath, Number(ordre) || 0, is_active !== undefined ? is_active : 1, id);
    } else {
      stmt = db.prepare(`
        UPDATE temoignages 
        SET auteur = ?, role = ?, contenu = ?, categorie = ?, ordre = ?, is_active = ?
        WHERE id = ?
      `);
      stmt.run(auteur, role, contenu, categorie, Number(ordre) || 0, is_active !== undefined ? is_active : 1, id);
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Supprimer un témoignage
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM temoignages WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;