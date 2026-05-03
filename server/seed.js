const db = require('./db');

console.log("🌱 Insertion des données...\n");

try {
  // Vider les tables
  db.prepare('DELETE FROM event_slides').run();
  db.prepare('DELETE FROM events').run();
  
  // Insérer les slides
  const insertSlide = db.prepare('INSERT INTO event_slides (title, image, alt, event_label, sort_order, is_active) VALUES (?, ?, ?, ?, ?, 1)');
  insertSlide.run('Atelier familial', '/images/about.png', 'Retour en images sur une activité familiale FAFF.', 'Avril 2026', 1);
  insertSlide.run('Football en Français', '/images/football.png', 'Jeunes réunis autour du sport et de la francophonie.', 'Avril 2026', 2);
  insertSlide.run('FrancÔ Talent', '/images/francotalent.png', 'Expression artistique et leadership jeunesse.', 'Avril 2026', 3);
  
  console.log('✓ 3 slides ajoutés');
  
  // Vérifier
  const slides = db.prepare('SELECT id, title FROM event_slides').all();
  console.log('Slides:', slides);
  
} catch(e) {
  console.error('Erreur:', e.message);
}