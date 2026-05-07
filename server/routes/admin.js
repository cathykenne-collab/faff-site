const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

// ========== AUTHENTIFICATION ADMIN ==========
// Utilise la variable d'environnement ADMIN_PASSWORD sur Render
// Par défaut, mot de passe sécurisé (à changer absolument)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'FAFF@dmin2025!';

// Middleware d'authentification
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).json({ error: 'Authentification requise' });
  }

  try {
    const base64 = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    if (username === 'admin' && password === ADMIN_PASSWORD) {
      next();
    } else {
      res.status(403).json({ error: 'Accès non autorisé' });
    }
  } catch (err) {
    res.status(403).json({ error: 'Accès non autorisé' });
  }
}

// Appliquer l'authentification à TOUTES les routes admin
router.use(requireAuth);

// ========== Route de vérification d'authentification ==========
router.get('/check-auth', (req, res) => {
  res.json({ authenticated: true });
});

// ========== Configuration multer pour mémoire (pour les images) ==========
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ========== UPLOAD IMAGES FIXES ==========
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    const { target } = req.body;

    const allowedTargets = [
      // Bannières pages principales
      'hero.png',
      'about-banner.png',
      'programs-banner.png',
      'impact-banner.png',
      'evenements-banner.png',
      'soutenir-banner.png',
      'infolettre-banner.png',
      'contact-banner.png',
      'inscription-banner.png',
      // Pages secondaires
      'accessibilite-banner.png',
      'partenaires-banner.png',
      'terms-banner.png',
      'privacy-banner.png',
      'sitemap-banner.png',
      'ressources-banner.png',
      // Pages recrutement & membres
      'recrutement-banner.png',
      'membres-banner.png',
      // Admin
      'admin-banner.png',
      // Logo
      'logo.png',
      // Images de contenu
      'about.png',
      'football.png',
      'francotalent.png',
      'family.png',
      'fathers.png',
      'mothers.png',
      'school.png'
    ];

    if (!allowedTargets.includes(target)) {
      return res.status(400).json({ error: `Nom de fichier non autorisé: ${target}` });
    }

    const imagePath = path.join(__dirname, '../../public/images', target);
    fs.writeFileSync(imagePath, req.file.buffer);
    res.json({ success: true, message: `Image ${target} mise à jour avec succès` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== GESTION SLIDES (DIAPORAMA) ==========
router.get('/event-slides', (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM event_slides ORDER BY sort_order ASC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/event-slides', upload.single('image'), (req, res) => {
  try {
    const { title, event_label, alt, sort_order } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Aucune image reçue." });
    }

    const ext = path.extname(req.file.originalname);
    const filename = `slide_${Date.now()}${ext}`;
    const imagePath = `/uploads/${filename}`;
    const uploadDir = path.join(__dirname, '../../public/uploads');

    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);

    const stmt = db.prepare(`
      INSERT INTO event_slides (title, image, alt, event_label, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);
    const result = stmt.run(title || null, imagePath, alt || null, event_label || null, Number(sort_order) || 0);

    res.json({
      success: true,
      message: "Slide événement ajouté.",
      id: result.lastInsertRowid,
      image: imagePath
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/event-slides/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM event_slides WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== GESTION ÉVÉNEMENTS (table events) ==========
router.get('/events', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM events
      ORDER BY sort_order ASC, id DESC
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/events', upload.single('image'), (req, res) => {
  try {
    const { title_fr, title_en, details_fr, details_en, date_label_fr, date_label_en, cta_label_fr, cta_label_en, cta_url, sort_order } = req.body;

    let imagePath = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const filename = `event_${Date.now()}${ext}`;
      imagePath = `/uploads/${filename}`;
      const uploadDir = path.join(__dirname, '../../public/uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
    }

    const stmt = db.prepare(`
      INSERT INTO events (
        title_fr, title_en, details_fr, details_en,
        date_label_fr, date_label_en, cta_label_fr, cta_label_en,
        cta_url, sort_order, is_active, image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    const result = stmt.run(
      title_fr || null,
      title_en || title_fr || null,
      details_fr || null,
      details_en || details_fr || null,
      date_label_fr || null,
      date_label_en || date_label_fr || null,
      cta_label_fr || "S'inscrire",
      cta_label_en || "Register",
      cta_url || "/inscription.html",
      Number(sort_order) || 0,
      imagePath
    );

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const stmt = db.prepare(`
      UPDATE events SET is_active = ? WHERE id = ?
    `);
    stmt.run(is_active ? 1 : 0, id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM events WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== GESTION NEWSLETTER ==========
router.get('/newsletter', (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM newsletter ORDER BY created_at DESC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== GESTION INSCRIPTIONS ==========
router.get('/inscriptions', (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM inscriptions ORDER BY created_at DESC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/inscriptions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare("DELETE FROM inscriptions WHERE id = ?").run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Inscription non trouvée" });
    }
    res.json({ success: true, message: "Inscription supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== GESTION MESSAGES DE CONTACT ==========
router.get('/contacts', (req, res) => {
  try {
    const contacts = db.prepare("SELECT * FROM contacts ORDER BY created_at DESC").all();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/contacts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare("DELETE FROM contacts WHERE id = ?").run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Message non trouvé" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== GESTION MEMBRES ==========
router.get('/membres/admin', (req, res) => {
  try {
    const membres = db.prepare("SELECT * FROM membres ORDER BY ordre ASC").all();
    res.json(membres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/membres', upload.single('photo'), (req, res) => {
  try {
    const { nom, prenom, role, description, categorie, ordre, is_active } = req.body;

    let photoPath = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const filename = `membre_${Date.now()}${ext}`;
      photoPath = `/uploads/${filename}`;
      const uploadDir = path.join(__dirname, '../../public/uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
    }

    const stmt = db.prepare(`
      INSERT INTO membres (nom, prenom, role, description, categorie, ordre, photo, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      nom || null,
      prenom || null,
      role || null,
      description || null,
      categorie || null,
      Number(ordre) || 0,
      photoPath,
      is_active ? 1 : 0
    );

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/membres/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const stmt = db.prepare(`
      UPDATE membres SET is_active = ? WHERE id = ?
    `);
    stmt.run(is_active ? 1 : 0, id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/membres/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM membres WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== GESTION RECRUTEMENT ==========
router.get('/recrutement/admin', (req, res) => {
  try {
    const offres = db.prepare("SELECT * FROM recrutement ORDER BY id DESC").all();
    res.json(offres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/recrutement', upload.single('pdf'), (req, res) => {
  try {
    const { titre, description, lieu, type_contrat, date_limite } = req.body;

    let pdfUrl = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const filename = `recrutement_${Date.now()}${ext}`;
      pdfUrl = `/uploads/recrutement/${filename}`;
      const uploadDir = path.join(__dirname, '../../public/uploads/recrutement');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
    }

    const stmt = db.prepare(`
      INSERT INTO recrutement (titre, description, lieu, type_contrat, date_limite, pdf_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    const result = stmt.run(
      titre || null,
      description || null,
      lieu || null,
      type_contrat || null,
      date_limite || null,
      pdfUrl
    );

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/recrutement/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const stmt = db.prepare(`
      UPDATE recrutement SET is_active = ? WHERE id = ?
    `);
    stmt.run(is_active ? 1 : 0, id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/recrutement/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM recrutement WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== GESTION TÉMOIGNAGES ==========
router.get('/temoignages/admin', (req, res) => {
  try {
    const temoignages = db.prepare("SELECT * FROM temoignages ORDER BY ordre ASC").all();
    res.json(temoignages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/temoignages', upload.single('photo'), (req, res) => {
  try {
    const { auteur, role, categorie, contenu, ordre, is_active } = req.body;

    let photoPath = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const filename = `temoignage_${Date.now()}${ext}`;
      photoPath = `/uploads/${filename}`;
      const uploadDir = path.join(__dirname, '../../public/uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);
    }

    const stmt = db.prepare(`
      INSERT INTO temoignages (auteur, role, categorie, contenu, photo, ordre, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      auteur || null,
      role || null,
      categorie || null,
      contenu || null,
      photoPath,
      Number(ordre) || 0,
      is_active ? 1 : 0
    );

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/temoignages/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const stmt = db.prepare(`
      UPDATE temoignages SET is_active = ? WHERE id = ?
    `);
    stmt.run(is_active ? 1 : 0, id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/temoignages/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM temoignages WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;