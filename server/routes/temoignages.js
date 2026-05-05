const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.memoryStorage();
const upload = multer({ storage });

function savePhoto(file) {
  if (!file) return null;

  const ext = path.extname(file.originalname).toLowerCase();
  const filename = `temoignage_${Date.now()}${ext}`;
  const uploadDir = path.join(__dirname, "../../public/uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  fs.writeFileSync(path.join(uploadDir, filename), file.buffer);

  return `/uploads/${filename}`;
}

/* GET public */
router.get("/", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT *
      FROM temoignages
      WHERE is_active = 1
      ORDER BY ordre ASC, created_at DESC
    `).all();

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET admin */
router.get("/admin", (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT *
      FROM temoignages
      ORDER BY ordre ASC, created_at DESC
    `).all();

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* POST */
router.post("/", upload.single("photo"), (req, res) => {
  try {
    const {
      nom,
      prenom,
      auteur,
      email,
      role,
      message,
      contenu,
      categorie,
      ordre,
      note,
      is_approved,
      is_active
    } = req.body;

    const finalNom = nom || auteur;
    const finalMessage = message || contenu;
    const finalCategorie = categorie || "famille";
    const finalOrdre = Number(ordre) || 0;
    const finalNote = Number(note) || 5;

    if (!finalNom || !finalMessage) {
      return res.status(400).json({
        error: "Le nom/auteur et le message/contenu sont obligatoires."
      });
    }

    const photoPath = savePhoto(req.file);

    const result = db.prepare(`
      INSERT INTO temoignages (
        nom,
        prenom,
        auteur,
        email,
        role,
        message,
        contenu,
        categorie,
        note,
        photo,
        photo_url,
        ordre,
        is_approved,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      finalNom,
      prenom || null,
      finalNom,
      email || null,
      role || null,
      finalMessage,
      finalMessage,
      finalCategorie,
      finalNote,
      photoPath,
      photoPath,
      finalOrdre,
      is_approved !== undefined ? Number(is_approved) : 1,
      is_active !== undefined ? Number(is_active) : 1
    );

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: "Témoignage ajouté avec succès."
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* PUT */
router.put("/:id", upload.single("photo"), (req, res) => {
  try {
    const {
      nom,
      prenom,
      auteur,
      email,
      role,
      message,
      contenu,
      categorie,
      ordre,
      note,
      is_approved,
      is_active
    } = req.body;

    const finalNom = nom || auteur;
    const finalMessage = message || contenu;

    if (!finalNom || !finalMessage) {
      return res.status(400).json({
        error: "Le nom/auteur et le message/contenu sont obligatoires."
      });
    }

    const existing = db.prepare(`
      SELECT *
      FROM temoignages
      WHERE id = ?
    `).get(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: "Témoignage introuvable." });
    }

    const photoPath = req.file ? savePhoto(req.file) : (existing.photo_url || existing.photo);

    db.prepare(`
      UPDATE temoignages
      SET
        nom = ?,
        prenom = ?,
        auteur = ?,
        email = ?,
        role = ?,
        message = ?,
        contenu = ?,
        categorie = ?,
        note = ?,
        photo = ?,
        photo_url = ?,
        ordre = ?,
        is_approved = ?,
        is_active = ?
      WHERE id = ?
    `).run(
      finalNom,
      prenom || null,
      finalNom,
      email || null,
      role || null,
      finalMessage,
      finalMessage,
      categorie || existing.categorie || "famille",
      Number(note) || existing.note || 5,
      photoPath,
      photoPath,
      Number(ordre) || existing.ordre || 0,
      is_approved !== undefined ? Number(is_approved) : existing.is_approved,
      is_active !== undefined ? Number(is_active) : existing.is_active,
      req.params.id
    );

    res.json({
      success: true,
      message: "Témoignage mis à jour."
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* DELETE */
router.delete("/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM temoignages WHERE id = ?").run(req.params.id);

    res.json({
      success: true,
      message: "Témoignage supprimé."
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;