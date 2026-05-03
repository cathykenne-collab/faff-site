require('dotenv').config(); // ← DOIT ÊTRE TOUT EN HAUT

const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;
const db = require("./db");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ajout CORS pour Render (optionnel mais recommandé)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Créer le dossier uploads pour Render
const uploadsDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Dossier uploads créé');
}

// Anti-cache pour les images
app.use('/images', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});
app.use('/images', express.static(path.join(__dirname, "../public/images")));

// Fichiers statiques
app.use(express.static(path.join(__dirname, "../public")));
app.use('/uploads', express.static(path.join(__dirname, "../public/uploads")));

// Routes API
app.use("/api/inscriptions", require("./routes/inscriptions"));
app.use("/api/contacts", require("./routes/contacts"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/event-slides", require("./routes/event-slides"));
app.use("/api/events", require("./routes/events"));
app.use("/api/newsletter", require("./routes/newsletter"));
app.use("/api/send-newsletter", require("./routes/send-newsletter"));
app.use("/api/recrutement", require("./routes/recrutement"));
app.use("/api/membres", require("./routes/membres"));
app.use("/api/temoignages", require("./routes/temoignages"));

// Route par défaut
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => console.log(`✅ FAFF app running on http://localhost:${PORT}`));