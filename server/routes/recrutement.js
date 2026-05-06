const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuration multer pour les PDF
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../public/uploads/recrutement");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
    }
  }
});

// GET - Récupérer toutes les offres actives (pour le site public)
router.get("/", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, titre, description, lieu, type_contrat, date_limite, pdf_url
      FROM recrutement 
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

// POST - Ajouter une offre d'emploi avec PDF
router.post("/", upload.single("pdf"), (req, res) => {
  try {
    const { titre, description, lieu, type_contrat, date_limite } = req.body;
    
    if (!titre || !description) {
      return res.status(400).json({ error: "Le titre et la description sont obligatoires" });
    }
    
    let pdfUrl = null;
    if (req.file) {
      pdfUrl = `/uploads/recrutement/${req.file.filename}`;
    }
    
    const stmt = db.prepare(`
      INSERT INTO recrutement (titre, description, lieu, type_contrat, date_limite, pdf_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    
    const result = stmt.run(titre, description, lieu || null, type_contrat || null, date_limite || null, pdfUrl);
    
    res.status(201).json({ success: true, id: result.lastInsertRowid, message: "Offre ajoutée avec succès" });
  } catch (err) {
    console.error("Erreur POST recrutement:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Supprimer une offre
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM recrutement WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err) {
    console.error("Erreur DELETE recrutement:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;