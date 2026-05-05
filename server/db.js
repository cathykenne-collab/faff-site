const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "faff.db");
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

function columnExists(table, column) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  return columns.some(c => c.name === column);
}

function addColumn(table, column, definition) {
  if (!columnExists(table, column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`✅ Colonne ajoutée : ${table}.${column}`);
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS inscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    email TEXT,
    programme TEXT,
    date_souhaitee TEXT,
    infos TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    email TEXT,
    sujet TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS event_slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    image TEXT,
    alt TEXT,
    event_label TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

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
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS newsletter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    email TEXT UNIQUE,
    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS recrutement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT,
    description TEXT,
    lieu TEXT,
    type_contrat TEXT,
    date_limite TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS membres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    prenom TEXT,
    role TEXT,
    description TEXT,
    photo TEXT,
    categorie TEXT DEFAULT 'equipe',
    ordre INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS temoignages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT,
    prenom TEXT,
    auteur TEXT,
    email TEXT,
    role TEXT,
    message TEXT,
    contenu TEXT,
    categorie TEXT DEFAULT 'famille',
    note INTEGER DEFAULT 5,
    photo TEXT,
    photo_url TEXT,
    ordre INTEGER DEFAULT 0,
    is_approved INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

/* MIGRATION POUR LA TABLE EVENTS - AJOUT DE LA COLONNE IMAGE */
addColumn("events", "image", "TEXT");

/* MIGRATIONS MEMBRES */
addColumn("membres", "nom", "TEXT");
addColumn("membres", "prenom", "TEXT");
addColumn("membres", "role", "TEXT");
addColumn("membres", "description", "TEXT");
addColumn("membres", "photo", "TEXT");
addColumn("membres", "photo_url", "TEXT");
addColumn("membres", "categorie", "TEXT DEFAULT 'equipe'");
addColumn("membres", "ordre", "INTEGER DEFAULT 0");
addColumn("membres", "sort_order", "INTEGER DEFAULT 0");
addColumn("membres", "fonction", "TEXT");
addColumn("membres", "bio", "TEXT");
addColumn("membres", "is_active", "INTEGER DEFAULT 1");
addColumn("membres", "updated_at", "DATETIME");

/* MIGRATIONS TEMOIGNAGES */
addColumn("temoignages", "nom", "TEXT");
addColumn("temoignages", "prenom", "TEXT");
addColumn("temoignages", "auteur", "TEXT");
addColumn("temoignages", "email", "TEXT");
addColumn("temoignages", "role", "TEXT");
addColumn("temoignages", "message", "TEXT");
addColumn("temoignages", "contenu", "TEXT");
addColumn("temoignages", "categorie", "TEXT DEFAULT 'famille'");
addColumn("temoignages", "note", "INTEGER DEFAULT 5");
addColumn("temoignages", "photo", "TEXT");
addColumn("temoignages", "photo_url", "TEXT");
addColumn("temoignages", "ordre", "INTEGER DEFAULT 0");
addColumn("temoignages", "is_approved", "INTEGER DEFAULT 1");
addColumn("temoignages", "is_active", "INTEGER DEFAULT 1");

/* MIGRATIONS RECRUTEMENT */
addColumn("recrutement", "titre", "TEXT");
addColumn("recrutement", "description", "TEXT");
addColumn("recrutement", "lieu", "TEXT");
addColumn("recrutement", "type_contrat", "TEXT");
addColumn("recrutement", "date_limite", "TEXT");
addColumn("recrutement", "is_active", "INTEGER DEFAULT 1");

console.log("✅ Base de données initialisée et migrée");
console.log(`📁 Base SQLite : ${dbPath}`);

module.exports = db;