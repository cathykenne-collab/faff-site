const db = require("./db"); 
console.log("DÇbut..."); 
try { 
  const events = db.prepare("SELECT COUNT(*) as count FROM events").all(); 
  console.log("êvÇnements:", events[0] ? events[0].count : 0); 
  const contacts = db.prepare("SELECT COUNT(*) as count FROM contacts").all(); 
  console.log("Contacts:", contacts[0] ? contacts[0].count : 0); 
} catch(e) { console.log("Erreur:", e.message); } 
