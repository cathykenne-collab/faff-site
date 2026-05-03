const db = require('./server/db'); 
console.log('Nettoyage...'); 
db.prepare('DELETE FROM event_slides').run(); 
console.log('Insertion des slides...'); 
const insert = db.prepare('INSERT INTO event_slides (title, image, alt, event_label, sort_order, is_active) VALUES (?, ?, ?, ?, ?, 1)'); 
insert.run('Atelier familial', '/images/about.png', 'Retour en images sur une activit‚ familiale FAFF.', 'Avril 2026', 1); 
insert.run('Football en Fran‡ais', '/images/football.png', 'Jeunes r‚unis autour du sport et de la francophonie.', 'Avril 2026', 2); 
insert.run('Francâ Talent', '/images/francotalent.png', 'Expression artistique et leadership jeunesse.', 'Avril 2026', 3); 
console.log('V 3 slides ajout‚s'); 
