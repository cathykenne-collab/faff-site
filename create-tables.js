const db = require('./server/db');

try {
  // Table recrutement
  db.exec(`
    CREATE TABLE IF NOT EXISTS recrutement (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titre TEXT NOT NULL,
      description TEXT NOT NULL,
      lieu TEXT,
      type_contrat TEXT,
      date_limite DATE,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Table recrutement créée');

  // Table membres
  db.exec(`
    CREATE TABLE IF NOT EXISTS membres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      role TEXT NOT NULL,
      description TEXT,
      photo TEXT,
      categorie TEXT DEFAULT 'equipe',
      ordre INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Table membres créée');

  console.log('🎉 Toutes les tables ont été créées avec succès !');
} catch (error) {
  console.error('❌ Erreur:', error.message);
}