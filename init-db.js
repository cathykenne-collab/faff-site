const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
console.log('📁 Chemin de la base :', dbPath);

try {
  const db = new Database(dbPath);
  
  console.log('🔧 Création de la table contacts...\n');
  
  // Créer la table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      email TEXT NOT NULL,
      sujet TEXT,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('✅ Table "contacts" créée avec succès !\n');
  
  // Vérifier les tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('📋 Tables existantes :', tables.map(t => t.name).join(', '));
  
  // Vérifier le nombre de messages
  const count = db.prepare("SELECT COUNT(*) as total FROM contacts").get();
  console.log('📊 Nombre de messages dans la table :', count.total);
  
  db.close();
  console.log('\n✅ Initialisation terminée !');
  
} catch (error) {
  console.error('❌ Erreur :', error.message);
}