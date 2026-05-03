// server/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Détecter si on est sur Render
const isRender = process.env.RENDER === 'true';

let dbPath;
let dataDir;

if (isRender) {
  // Sur Render : utiliser /tmp/data (répertoire temporaire persistant)
  dataDir = '/tmp/data';
  dbPath = path.join(dataDir, 'faff.db');
  console.log('🚀 Mode Render actif - Base dans /tmp/data');
} else {
  // En local : utiliser le dossier data
  dataDir = path.join(__dirname, 'data');
  dbPath = path.join(dataDir, 'faff.db');
  console.log('💻 Mode local actif');
}

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`📁 Dossier créé: ${dataDir}`);
}

console.log(`📁 Base de données: ${dbPath}`);

const db = new sqlite3.Database(dbPath);

// Créer les tables
db.serialize(() => {
  // Table events
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_fr TEXT,
      title_en TEXT,
      details_fr TEXT,
      details_en TEXT,
      date_label_fr TEXT,
      date_label_en TEXT,
      cta_label_fr TEXT,
      cta_label_en TEXT,
      cta_url TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table event_slides (diaporama)
  db.run(`
    CREATE TABLE IF NOT EXISTS event_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_fr TEXT,
      title_en TEXT,
      event_label_fr TEXT,
      event_label_en TEXT,
      alt_fr TEXT,
      alt_en TEXT,
      image TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table inscriptions
  db.run(`
    CREATE TABLE IF NOT EXISTS inscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT,
      email TEXT,
      telephone TEXT,
      programme TEXT,
      infos TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table contacts (si tu l'as)
  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      email TEXT NOT NULL,
      sujet TEXT,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table newsletter (si tu l'as)
  db.run(`
    CREATE TABLE IF NOT EXISTS newsletter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT,
      email TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

console.log('✅ Base de données initialisée avec succès');

module.exports = db;