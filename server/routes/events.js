const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  try {
    console.log("📅 API /api/events appelée");
    
    // Vérifier les colonnes existantes dans la table events
    const columns = db.prepare("PRAGMA table_info(events)").all();
    const columnNames = columns.map(c => c.name);
    console.log("📋 Colonnes disponibles:", columnNames);
    
    // Construire la requête dynamiquement selon les colonnes existantes
    let selectFields = ["id", "sort_order", "is_active", "created_at"];
    
    if (columnNames.includes("title_fr")) selectFields.push("title_fr");
    if (columnNames.includes("title_en")) selectFields.push("title_en");
    if (columnNames.includes("details_fr")) selectFields.push("details_fr");
    if (columnNames.includes("details_en")) selectFields.push("details_en");
    if (columnNames.includes("date_label_fr")) selectFields.push("date_label_fr");
    if (columnNames.includes("date_label_en")) selectFields.push("date_label_en");
    if (columnNames.includes("cta_label_fr")) selectFields.push("cta_label_fr");
    if (columnNames.includes("cta_label_en")) selectFields.push("cta_label_en");
    if (columnNames.includes("cta_url")) selectFields.push("cta_url");
    if (columnNames.includes("image")) selectFields.push("image");
    
    const query = `
      SELECT ${selectFields.join(", ")}
      FROM events
      WHERE is_active = 1
      ORDER BY sort_order ASC, id DESC
    `;
    
    console.log("📝 Requête SQL:", query);
    
    const rows = db.prepare(query).all();
    
    console.log(`✅ ${rows.length} événement(s) trouvé(s)`);
    res.json(rows);
    
  } catch (err) {
    console.error("❌ Erreur dans /api/events:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

module.exports = router;